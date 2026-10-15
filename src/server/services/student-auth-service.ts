/**
 * Student accounts for the online mock-test platform: self-registration,
 * login, password reset and profile.
 */
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { passwordResetTokens, students } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { hashSessionToken } from "@/lib/auth/tokens";
import { rateLimit } from "@/lib/security/rate-limit";
import { now } from "@/lib/time/clock";
import { audit, authorize, type Actor } from "./audit-service";
import { createSession, revokeStudentSessions, type RequestMeta } from "./session-service";

const RESET_TTL_MS = 30 * 60 * 1000;

function limit(key: string, max: number, windowMs: number) {
  const r = rateLimit(key, max, windowMs);
  if (!r.allowed) throw new AppError("RATE_LIMITED", `Too many attempts. Try again in ${r.retryAfterSeconds} seconds.`);
}

const studentActor = (id: string, email: string, ip: string | null): Actor => ({ type: "STUDENT", id, label: email, ip });

async function findByEmail(email: string) {
  const [s] = await getDb().select().from(students).where(sql`lower(${students.email}) = lower(${email})`).limit(1);
  return s ?? null;
}

export async function registerStudent(
  input: { fullName: string; email: string; password: string; preferredLanguage: "en" | "hi" },
  meta: RequestMeta,
): Promise<{ token: string; expiresAt: Date; studentId: string }> {
  limit(`register:${meta.ip ?? "?"}`, 10, 60 * 60 * 1000);
  if (await findByEmail(input.email)) {
    throw new AppError("CONFLICT", "An account with this email already exists. Please log in.");
  }
  const passwordHash = await hashPassword(input.password);
  const displayName = input.fullName.split(/\s+/)[0]!.slice(0, 40);
  return getDb().transaction(async (tx) => {
    const [s] = await tx
      .insert(students)
      .values({ email: input.email, fullName: input.fullName, displayName, passwordHash, preferredLanguage: input.preferredLanguage })
      .onConflictDoNothing()
      .returning({ id: students.id });
    if (!s) throw new AppError("CONFLICT", "An account with this email already exists. Please log in.");
    const session = await createSession(tx, { type: "STUDENT", studentId: s.id }, meta);
    await audit(tx, studentActor(s.id, input.email, meta.ip), "student.register", { type: "student", id: s.id });
    return { ...session, studentId: s.id };
  });
}

export async function loginStudent(input: { email: string; password: string }, meta: RequestMeta) {
  limit(`login:student:${meta.ip ?? "?"}:${input.email}`, 8, 5 * 60 * 1000);
  limit(`login:student:ip:${meta.ip ?? "?"}`, 60, 5 * 60 * 1000);
  const s = await findByEmail(input.email);
  const ok = s ? await verifyPassword(s.passwordHash, input.password) : await verifyAgainstDummy(input.password);
  if (!s || !ok) throw new AppError("UNAUTHENTICATED", "Invalid email or password.");
  if (!s.isActive) throw new AppError("NOT_ELIGIBLE", "This account has been deactivated.");
  return getDb().transaction(async (tx) => {
    const session = await createSession(tx, { type: "STUDENT", studentId: s.id }, meta);
    await tx.update(students).set({ lastLoginAt: now() }).where(eq(students.id, s.id));
    await audit(tx, studentActor(s.id, s.email, meta.ip), "student.login", { type: "student", id: s.id });
    return session;
  });
}

function resetUrl(token: string): string {
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/student/reset-password?token=${token}`;
}

async function issueResetToken(studentId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await getDb()
    .insert(passwordResetTokens)
    .values({ id: hashSessionToken(`reset:${token}`), studentId, expiresAt: new Date(now().getTime() + RESET_TTL_MS) });
  return token;
}

/**
 * Always succeeds from the caller's point of view (no account enumeration).
 * No email provider is configured, so the link is written to the server log;
 * plug a mailer in here when one is available (docs/deployment.md).
 */
export async function requestPasswordReset(email: string, meta: RequestMeta): Promise<void> {
  limit(`forgot:${meta.ip ?? "?"}`, 5, 15 * 60 * 1000);
  const s = await findByEmail(email);
  if (!s || !s.isActive) return;
  const token = await issueResetToken(s.id);
  console.log(`[password-reset] link for ${s.email} (valid 30 min): ${resetUrl(token)}`);
  await audit(getDb(), studentActor(s.id, s.email, meta.ip), "student.password_reset_requested", { type: "student", id: s.id });
}

/** Admin-generated reset link (e.g. a student contacts support). */
export async function adminCreateResetLink(actor: Actor, studentId: string): Promise<string> {
  authorize(actor, "students.manage");
  const [s] = await getDb().select({ id: students.id }).from(students).where(eq(students.id, studentId));
  if (!s) throw new AppError("NOT_FOUND", "Student not found.");
  const token = await issueResetToken(studentId);
  await audit(getDb(), actor, "student.reset_link", { type: "student", id: studentId });
  return resetUrl(token);
}

export async function resetPassword(input: { token: string; password: string }, meta: RequestMeta): Promise<void> {
  limit(`reset:${meta.ip ?? "?"}`, 10, 15 * 60 * 1000);
  const id = hashSessionToken(`reset:${input.token}`);
  const passwordHash = await hashPassword(input.password);
  await getDb().transaction(async (tx) => {
    // Single use: consuming the token is a compare-and-set.
    const [t] = await tx
      .update(passwordResetTokens)
      .set({ usedAt: now() })
      .where(and(eq(passwordResetTokens.id, id), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, now())))
      .returning();
    if (!t) throw new AppError("VALIDATION", "This reset link is invalid or has expired. Please request a new one.");
    await tx.update(students).set({ passwordHash, updatedAt: now() }).where(eq(students.id, t.studentId));
    await revokeStudentSessions(tx, t.studentId);
    await audit(tx, { type: "SYSTEM", ip: meta.ip }, "student.password_reset", { type: "student", id: t.studentId });
  });
}

export async function updateStudentProfile(
  studentId: string,
  input: { fullName: string; displayName: string; preferredLanguage: "en" | "hi"; showOnLeaderboard: boolean },
) {
  await getDb().update(students).set({ ...input, updatedAt: now() }).where(eq(students.id, studentId));
}

export async function setStudentLanguage(studentId: string, language: "en" | "hi") {
  await getDb().update(students).set({ preferredLanguage: language }).where(eq(students.id, studentId));
}

export async function getStudentProfile(studentId: string) {
  const [s] = await getDb()
    .select({
      email: students.email,
      fullName: students.fullName,
      displayName: students.displayName,
      preferredLanguage: students.preferredLanguage,
      showOnLeaderboard: students.showOnLeaderboard,
      createdAt: students.createdAt,
    })
    .from(students)
    .where(eq(students.id, studentId));
  if (!s) throw new AppError("NOT_FOUND", "Student not found.");
  return s;
}

// --- Admin student management ------------------------------------------------------

export async function listStudents(search?: string) {
  const db = getDb();
  const like = search ? `%${search.replace(/[%_\\]/g, (m) => `\\${m}`)}%` : null;
  return db
    .select({
      id: students.id,
      email: students.email,
      fullName: students.fullName,
      displayName: students.displayName,
      isActive: students.isActive,
      lastLoginAt: students.lastLoginAt,
      createdAt: students.createdAt,
    })
    .from(students)
    .where(like ? sql`${students.email} ilike ${like} or ${students.fullName} ilike ${like}` : undefined)
    .orderBy(sql`${students.createdAt} desc`)
    .limit(500);
}

export async function setStudentActive(actor: Actor, studentId: string, isActive: boolean) {
  authorize(actor, "students.manage");
  await getDb().transaction(async (tx) => {
    const [s] = await tx.update(students).set({ isActive, updatedAt: now() }).where(eq(students.id, studentId)).returning({ id: students.id });
    if (!s) throw new AppError("NOT_FOUND", "Student not found.");
    if (!isActive) await revokeStudentSessions(tx, studentId);
    await audit(tx, actor, isActive ? "student.activate" : "student.deactivate", { type: "student", id: studentId });
  });
}
