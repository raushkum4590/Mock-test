/**
 * Exam centres (venues) and centre-wise attendance for CBT schedules.
 *
 * A candidate's centre for a sitting is the centre of the workstation they
 * are seated at, falling back to the centre they are allotted to.
 */
import { asc, count, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { candidateAttempts, candidates, examAssignments, examCentres, examSchedules, workstations } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import type { centreSchema } from "@/lib/validation/schemas";
import { audit, authorize, type Actor } from "./audit-service";

export async function listCentres() {
  const db = getDb();
  const [rows, ws, cand] = await Promise.all([
    db.select().from(examCentres).orderBy(asc(examCentres.code)),
    db.select({ centreId: workstations.centreId, n: count() }).from(workstations).groupBy(workstations.centreId),
    db.select({ centreId: candidates.centreId, n: count() }).from(candidates).groupBy(candidates.centreId),
  ]);
  const wsBy = new Map(ws.map((r) => [r.centreId, r.n]));
  const candBy = new Map(cand.map((r) => [r.centreId, r.n]));
  return rows.map((c) => ({ ...c, workstations: wsBy.get(c.id) ?? 0, candidates: candBy.get(c.id) ?? 0 }));
}

export async function createCentre(actor: Actor, input: z.output<typeof centreSchema>) {
  authorize(actor, "candidates.manage");
  const db = getDb();
  const [dup] = await db.select({ id: examCentres.id }).from(examCentres).where(sql`upper(${examCentres.code}) = upper(${input.code})`);
  if (dup) throw new AppError("CONFLICT", `Centre code ${input.code} already exists.`);
  const [row] = await db.insert(examCentres).values(input).returning({ id: examCentres.id });
  await audit(db, actor, "centre.create", { type: "centre", id: row!.id }, { code: input.code });
  return row!;
}

export async function setCentreActive(actor: Actor, centreId: string, isActive: boolean) {
  authorize(actor, "candidates.manage");
  const db = getDb();
  const [row] = await db.update(examCentres).set({ isActive }).where(eq(examCentres.id, centreId)).returning({ id: examCentres.id });
  if (!row) throw new AppError("NOT_FOUND", "Centre not found.");
  await audit(db, actor, isActive ? "centre.activate" : "centre.deactivate", { type: "centre", id: centreId });
}

export async function setWorkstationCentre(actor: Actor, workstationId: string, centreId: string | null) {
  authorize(actor, "candidates.manage");
  const db = getDb();
  const [row] = await db.update(workstations).set({ centreId }).where(eq(workstations.id, workstationId)).returning({ id: workstations.id });
  if (!row) throw new AppError("NOT_FOUND", "Workstation not found.");
  await audit(db, actor, "workstation.centre", { type: "workstation", id: workstationId }, { centreId });
}

// --- Attendance ------------------------------------------------------------------------

export type AttendanceStatus = "ABSENT" | "PRESENT" | "SUBMITTED";

export type AttendanceRow = {
  rollNumber: string;
  fullName: string;
  centreCode: string | null;
  centreName: string | null;
  workstationCode: string | null;
  status: AttendanceStatus;
  startedAt: Date | null;
  submittedAt: Date | null;
  submitReason: string | null;
};

export type CentreSummary = {
  centreCode: string | null;
  centreName: string | null;
  assigned: number;
  present: number;
  absent: number;
  submitted: number;
  attendancePct: number;
};

export async function getAttendance(scheduleId: string): Promise<{ title: string; rows: AttendanceRow[]; centres: CentreSummary[] }> {
  const db = getDb();
  const [schedule] = await db.select({ title: examSchedules.title }).from(examSchedules).where(eq(examSchedules.id, scheduleId));
  if (!schedule) throw new AppError("NOT_FOUND", "Schedule not found.");
  const raw = await db
    .select({
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      workstationCode: sql<string | null>`coalesce(${candidateAttempts.workstationCode}, ${workstations.code})`,
      centreId: sql<string | null>`coalesce(${workstations.centreId}, ${candidates.centreId})`,
      attemptStatus: candidateAttempts.status,
      startedAt: candidateAttempts.startedAt,
      submittedAt: candidateAttempts.submittedAt,
      submitReason: candidateAttempts.submitReason,
    })
    .from(examAssignments)
    .innerJoin(candidates, eq(candidates.id, examAssignments.candidateId))
    .leftJoin(workstations, eq(workstations.id, examAssignments.workstationId))
    .leftJoin(candidateAttempts, eq(candidateAttempts.assignmentId, examAssignments.id))
    .where(eq(examAssignments.scheduleId, scheduleId))
    .orderBy(asc(candidates.rollNumber));
  const centreList = await db.select().from(examCentres);
  const centreById = new Map(centreList.map((c) => [c.id, c]));

  const rows: AttendanceRow[] = raw.map((r) => {
    const c = r.centreId ? centreById.get(r.centreId) : undefined;
    return {
      rollNumber: r.rollNumber,
      fullName: r.fullName,
      centreCode: c?.code ?? null,
      centreName: c?.name ?? null,
      workstationCode: r.workstationCode,
      status: !r.attemptStatus ? "ABSENT" : r.attemptStatus === "IN_PROGRESS" ? "PRESENT" : "SUBMITTED",
      startedAt: r.attemptStatus ? r.startedAt : null,
      submittedAt: r.submittedAt,
      submitReason: r.submitReason,
    };
  });

  const byCentre = new Map<string, CentreSummary>();
  for (const r of rows) {
    const key = r.centreCode ?? "";
    let s = byCentre.get(key);
    if (!s) {
      s = { centreCode: r.centreCode, centreName: r.centreName, assigned: 0, present: 0, absent: 0, submitted: 0, attendancePct: 0 };
      byCentre.set(key, s);
    }
    s.assigned++;
    // "Present" counts everyone who started, including those who have submitted.
    if (r.status === "ABSENT") s.absent++;
    else s.present++;
    if (r.status === "SUBMITTED") s.submitted++;
  }
  const centres = [...byCentre.values()]
    .map((s) => ({ ...s, attendancePct: s.assigned ? Math.round((s.present / s.assigned) * 1000) / 10 : 0 }))
    // Candidates with no centre are listed last.
    .sort((a, b) => (a.centreCode === null ? 1 : b.centreCode === null ? -1 : a.centreCode.localeCompare(b.centreCode)));
  return { title: schedule.title, rows, centres };
}
