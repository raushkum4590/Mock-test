import { asc, eq, ilike, inArray, or, sql, and, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { candidates, examBatches, examCentres, workstations } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { parseCsv } from "@/lib/csv";
import { AppError } from "@/lib/errors";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { now } from "@/lib/time/clock";
import { batchSchema, candidateSchema, workstationSchema, type candidateUpdateSchema } from "@/lib/validation/schemas";
import { audit, authorize, type Actor } from "./audit-service";
import { revokeCandidateSessions } from "./session-service";

type CandidateData = z.output<typeof candidateSchema>;

// --- Batches -------------------------------------------------------------------

export async function listBatches() {
  return getDb().select().from(examBatches).orderBy(asc(examBatches.code));
}

export async function createBatch(actor: Actor, input: z.output<typeof batchSchema>) {
  authorize(actor, "candidates.manage");
  const db = getDb();
  const [dup] = await db.select({ id: examBatches.id }).from(examBatches).where(eq(examBatches.code, input.code));
  if (dup) throw new AppError("CONFLICT", `Batch code ${input.code} already exists.`);
  const [row] = await db.insert(examBatches).values(input).returning({ id: examBatches.id });
  await audit(db, actor, "batch.create", { type: "batch", id: row!.id }, { code: input.code });
  return row!;
}

// --- Workstations -------------------------------------------------------------

export async function listWorkstations() {
  return getDb().select().from(workstations).orderBy(asc(workstations.code));
}

export async function createWorkstation(actor: Actor, input: z.output<typeof workstationSchema>) {
  authorize(actor, "candidates.manage");
  const db = getDb();
  const [dup] = await db.select({ id: workstations.id }).from(workstations).where(eq(workstations.code, input.code));
  if (dup) throw new AppError("CONFLICT", `Workstation ${input.code} already exists.`);
  const [row] = await db.insert(workstations).values(input).returning({ id: workstations.id });
  await audit(db, actor, "workstation.create", { type: "workstation", id: row!.id }, { code: input.code });
  return row!;
}

export async function touchWorkstation(code: string | null, ip: string | null): Promise<void> {
  if (!code) return;
  await getDb().update(workstations).set({ lastSeenAt: now(), ipAddress: ip }).where(eq(workstations.code, code));
}

// --- Candidates ---------------------------------------------------------------

export async function listCandidates(filter: { batchId?: string; centreId?: string; search?: string; limit?: number } = {}) {
  const where: SQL[] = [];
  if (filter.batchId) where.push(eq(candidates.batchId, filter.batchId));
  if (filter.centreId) where.push(eq(candidates.centreId, filter.centreId));
  if (filter.search) {
    const like = `%${filter.search.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    where.push(or(ilike(candidates.rollNumber, like), ilike(candidates.fullName, like))!);
  }
  return getDb()
    .select({
      id: candidates.id,
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      photoUrl: candidates.photoUrl,
      isActive: candidates.isActive,
      lastLoginAt: candidates.lastLoginAt,
      batchId: candidates.batchId,
      batchCode: examBatches.code,
      centreId: candidates.centreId,
      centreCode: examCentres.code,
      preferredLanguage: candidates.preferredLanguage,
    })
    .from(candidates)
    .leftJoin(examBatches, eq(examBatches.id, candidates.batchId))
    .leftJoin(examCentres, eq(examCentres.id, candidates.centreId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(candidates.rollNumber))
    .limit(Math.min(filter.limit ?? 500, 5000));
}

async function assertRollNumbersFree(rollNumbers: string[]) {
  if (!rollNumbers.length) return [];
  const rows = await getDb()
    .select({ rollNumber: candidates.rollNumber })
    .from(candidates)
    .where(inArray(sql`upper(${candidates.rollNumber})`, rollNumbers.map((r) => r.toUpperCase())));
  return rows.map((r) => r.rollNumber);
}

/** Returns the generated password when none was supplied (shown once to the admin). */
export async function createCandidate(
  actor: Actor,
  input: CandidateData,
): Promise<{ id: string; generatedPassword: string | null }> {
  authorize(actor, "candidates.manage");
  const taken = await assertRollNumbersFree([input.rollNumber]);
  if (taken.length) throw new AppError("CONFLICT", `Roll number ${input.rollNumber} already exists.`);
  const generatedPassword = input.password ? null : generatePassword(8);
  const passwordHash = await hashPassword(input.password ?? generatedPassword!);
  const db = getDb();
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(candidates)
      .values({
        rollNumber: input.rollNumber,
        fullName: input.fullName,
        passwordHash,
        batchId: input.batchId ?? null,
        centreId: input.centreId ?? null,
        photoUrl: input.photoUrl,
        preferredLanguage: input.preferredLanguage,
      })
      .returning({ id: candidates.id });
    await audit(tx, actor, "candidate.create", { type: "candidate", id: row!.id }, { rollNumber: input.rollNumber });
    return { id: row!.id, generatedPassword };
  });
}

export async function updateCandidate(
  actor: Actor,
  candidateId: string,
  input: z.output<typeof candidateUpdateSchema>,
): Promise<{ generatedPassword: string | null }> {
  authorize(actor, "candidates.manage");
  const db = getDb();
  let generatedPassword: string | null = null;
  let passwordHash: string | undefined;
  if (input.resetPassword || input.newPassword) {
    generatedPassword = input.newPassword ? null : generatePassword(8);
    passwordHash = await hashPassword(input.newPassword ?? generatedPassword!);
  }
  await db.transaction(async (tx) => {
    const set: Partial<typeof candidates.$inferInsert> = { updatedAt: now() };
    if (input.fullName !== undefined) set.fullName = input.fullName;
    if (input.isActive !== undefined) set.isActive = input.isActive;
    if (input.batchId !== undefined) set.batchId = input.batchId;
    if (input.centreId !== undefined) set.centreId = input.centreId;
    if (passwordHash) set.passwordHash = passwordHash;
    const [row] = await tx.update(candidates).set(set).where(eq(candidates.id, candidateId)).returning({ id: candidates.id });
    if (!row) throw new AppError("NOT_FOUND", "Candidate not found.");
    // Deactivation or a password reset ends existing sessions immediately.
    if (input.isActive === false || passwordHash) await revokeCandidateSessions(tx, candidateId);
    await audit(tx, actor, "candidate.update", { type: "candidate", id: candidateId }, {
      fields: Object.keys(input).filter((k) => k !== "newPassword"),
    });
  });
  return { generatedPassword };
}

export type CandidateImportReport = {
  created: number;
  errors: { row: number; message: string }[];
  credentials: { rollNumber: string; fullName: string; password: string }[];
};

/**
 * CSV columns: roll_number, full_name, password (optional), batch_code
 * (optional), centre_code (optional), photo_url (optional), language (optional en/hi).
 * All-or-nothing: any invalid row aborts the import with a full error list.
 */
export async function importCandidatesCsv(actor: Actor, csvText: string): Promise<CandidateImportReport> {
  authorize(actor, "candidates.manage");
  const { rows, errors: parseErrors } = parseCsv(csvText);
  const errors: CandidateImportReport["errors"] = parseErrors.map((m) => ({ row: 0, message: m }));
  const batches = await listBatches();
  const batchByCode = new Map(batches.map((b) => [b.code.toUpperCase(), b.id]));
  const centres = await getDb().select({ id: examCentres.id, code: examCentres.code }).from(examCentres);
  const centreByCode = new Map(centres.map((c) => [c.code.toUpperCase(), c.id]));
  const valid: (CandidateData & { rowNo: number })[] = [];
  const seen = new Set<string>();

  rows.forEach((r, idx) => {
    const rowNo = idx + 2;
    const batchCode = (r.batch_code ?? "").toUpperCase();
    if (batchCode && !batchByCode.has(batchCode)) {
      errors.push({ row: rowNo, message: `Unknown batch_code ${r.batch_code}.` });
      return;
    }
    const centreCode = (r.centre_code ?? "").toUpperCase();
    if (centreCode && !centreByCode.has(centreCode)) {
      errors.push({ row: rowNo, message: `Unknown centre_code ${r.centre_code}.` });
      return;
    }
    const parsed = candidateSchema.safeParse({
      rollNumber: r.roll_number,
      fullName: r.full_name,
      password: r.password || null,
      batchId: batchCode ? batchByCode.get(batchCode) : null,
      centreId: centreCode ? centreByCode.get(centreCode) : null,
      photoUrl: r.photo_url || null,
      preferredLanguage: r.language === "hi" ? "hi" : "en",
    });
    if (!parsed.success) {
      errors.push({ row: rowNo, message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
      return;
    }
    const key = parsed.data.rollNumber.toUpperCase();
    if (seen.has(key)) {
      errors.push({ row: rowNo, message: `Duplicate roll number ${parsed.data.rollNumber} in file.` });
      return;
    }
    seen.add(key);
    valid.push({ ...parsed.data, rowNo });
  });

  const taken = await assertRollNumbersFree(valid.map((v) => v.rollNumber));
  for (const t of taken) errors.push({ row: 0, message: `Roll number ${t} already exists.` });
  if (errors.length || valid.length === 0) {
    if (!errors.length) errors.push({ row: 0, message: "The file contains no candidates." });
    return { created: 0, errors, credentials: [] };
  }

  const prepared = await Promise.all(
    valid.map(async (v) => {
      const generated = v.password ? null : generatePassword(8);
      return { v, generated, hash: await hashPassword(v.password ?? generated!) };
    }),
  );
  await getDb().transaction(async (tx) => {
    for (const p of prepared) {
      await tx.insert(candidates).values({
        rollNumber: p.v.rollNumber,
        fullName: p.v.fullName,
        passwordHash: p.hash,
        batchId: p.v.batchId ?? null,
        centreId: p.v.centreId ?? null,
        photoUrl: p.v.photoUrl,
        preferredLanguage: p.v.preferredLanguage,
      });
    }
    await audit(tx, actor, "candidate.import", null, { count: prepared.length });
  });
  return {
    created: prepared.length,
    errors: [],
    credentials: prepared.filter((p) => p.generated).map((p) => ({ rollNumber: p.v.rollNumber, fullName: p.v.fullName, password: p.generated! })),
  };
}
