/**
 * Server-side sessions. The browser holds an opaque random token in an
 * HttpOnly cookie; the database holds HMAC(token). Every request resolves
 * the session from the database, so revocation and deactivation take
 * effect immediately.
 */
import { and, eq, gte, inArray, isNull, lt, or } from "drizzle-orm";
import { candidates, sessions, students, users } from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/tokens";
import { isRoleCode, type RoleCode } from "@/lib/permissions";
import { now } from "@/lib/time/clock";

export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
export const ADMIN_IDLE_TIMEOUT_SECONDS = 60 * 60;
export const CANDIDATE_SESSION_TTL_SECONDS = 12 * 60 * 60;
const TOUCH_INTERVAL_MS = 15_000;

export type RequestMeta = { ip: string | null; userAgent: string | null; workstationCode: string | null };

export type AdminPrincipal = {
  kind: "ADMIN";
  sessionId: string;
  userId: string;
  username: string;
  fullName: string;
  role: RoleCode;
};

export type CandidatePrincipal = {
  kind: "CANDIDATE";
  sessionId: string;
  candidateId: string;
  rollNumber: string;
  fullName: string;
  preferredLanguage: string;
  workstationCode: string | null;
  ip: string | null;
};

export const STUDENT_SESSION_TTL_SECONDS = 14 * 24 * 60 * 60;

export type StudentPrincipal = {
  kind: "STUDENT";
  sessionId: string;
  studentId: string;
  email: string;
  fullName: string;
  displayName: string;
  preferredLanguage: string;
};

export async function createSession(
  q: Queryable,
  subject: { type: "ADMIN"; userId: string } | { type: "CANDIDATE"; candidateId: string } | { type: "STUDENT"; studentId: string },
  meta: RequestMeta,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const at = now();
  const ttl =
    subject.type === "ADMIN" ? ADMIN_SESSION_TTL_SECONDS : subject.type === "STUDENT" ? STUDENT_SESSION_TTL_SECONDS : CANDIDATE_SESSION_TTL_SECONDS;
  const expiresAt = new Date(at.getTime() + ttl * 1000);
  await q.insert(sessions).values({
    id: hashSessionToken(token),
    subjectType: subject.type,
    userId: subject.type === "ADMIN" ? subject.userId : null,
    candidateId: subject.type === "CANDIDATE" ? subject.candidateId : null,
    studentId: subject.type === "STUDENT" ? subject.studentId : null,
    workstationCode: meta.workstationCode,
    ipAddress: meta.ip,
    userAgent: meta.userAgent?.slice(0, 500) ?? null,
    createdAt: at,
    lastSeenAt: at,
    expiresAt,
  });
  return { token, expiresAt };
}

async function touch(sessionId: string, lastSeenAt: Date, at: Date) {
  if (at.getTime() - lastSeenAt.getTime() < TOUCH_INTERVAL_MS) return;
  await getDb().update(sessions).set({ lastSeenAt: at }).where(eq(sessions.id, sessionId));
}

export async function resolveAdminSession(token: string | undefined | null): Promise<AdminPrincipal | null> {
  if (!token) return null;
  const id = hashSessionToken(token);
  const at = now();
  const [row] = await getDb()
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
      revokedAt: sessions.revokedAt,
      userId: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.roleCode,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), eq(sessions.subjectType, "ADMIN")))
    .limit(1);
  if (!row || row.revokedAt || !row.isActive || !isRoleCode(row.role)) return null;
  if (row.expiresAt.getTime() <= at.getTime()) return null;
  if (at.getTime() - row.lastSeenAt.getTime() > ADMIN_IDLE_TIMEOUT_SECONDS * 1000) return null;
  await touch(row.sessionId, row.lastSeenAt, at);
  return {
    kind: "ADMIN",
    sessionId: row.sessionId,
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    role: row.role,
  };
}

export async function resolveCandidateSession(token: string | undefined | null): Promise<CandidatePrincipal | null> {
  if (!token) return null;
  const id = hashSessionToken(token);
  const at = now();
  const [row] = await getDb()
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
      revokedAt: sessions.revokedAt,
      workstationCode: sessions.workstationCode,
      ip: sessions.ipAddress,
      candidateId: candidates.id,
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      preferredLanguage: candidates.preferredLanguage,
      isActive: candidates.isActive,
    })
    .from(sessions)
    .innerJoin(candidates, eq(candidates.id, sessions.candidateId))
    .where(and(eq(sessions.id, id), eq(sessions.subjectType, "CANDIDATE")))
    .limit(1);
  if (!row || row.revokedAt || !row.isActive) return null;
  if (row.expiresAt.getTime() <= at.getTime()) return null;
  await touch(row.sessionId, row.lastSeenAt, at);
  return {
    kind: "CANDIDATE",
    sessionId: row.sessionId,
    candidateId: row.candidateId,
    rollNumber: row.rollNumber,
    fullName: row.fullName,
    preferredLanguage: row.preferredLanguage,
    workstationCode: row.workstationCode,
    ip: row.ip,
  };
}

export async function resolveStudentSession(token: string | undefined | null): Promise<StudentPrincipal | null> {
  if (!token) return null;
  const id = hashSessionToken(token);
  const at = now();
  const [row] = await getDb()
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
      revokedAt: sessions.revokedAt,
      studentId: students.id,
      email: students.email,
      fullName: students.fullName,
      displayName: students.displayName,
      preferredLanguage: students.preferredLanguage,
      isActive: students.isActive,
    })
    .from(sessions)
    .innerJoin(students, eq(students.id, sessions.studentId))
    .where(and(eq(sessions.id, id), eq(sessions.subjectType, "STUDENT")))
    .limit(1);
  if (!row || row.revokedAt || !row.isActive) return null;
  if (row.expiresAt.getTime() <= at.getTime()) return null;
  await touch(row.sessionId, row.lastSeenAt, at);
  return {
    kind: "STUDENT",
    sessionId: row.sessionId,
    studentId: row.studentId,
    email: row.email,
    fullName: row.fullName,
    displayName: row.displayName,
    preferredLanguage: row.preferredLanguage,
  };
}

export async function revokeStudentSessions(q: Queryable, studentId: string): Promise<void> {
  await q
    .update(sessions)
    .set({ revokedAt: now() })
    .where(and(eq(sessions.studentId, studentId), isNull(sessions.revokedAt)));
}

export async function revokeSessionByToken(token: string): Promise<void> {
  await getDb()
    .update(sessions)
    .set({ revokedAt: now() })
    .where(and(eq(sessions.id, hashSessionToken(token)), isNull(sessions.revokedAt)));
}

/** One active session per candidate: a new login (e.g. after moving PC) ends the old one. */
export async function revokeCandidateSessions(q: Queryable, candidateId: string): Promise<number> {
  const rows = await q
    .update(sessions)
    .set({ revokedAt: now() })
    .where(and(eq(sessions.candidateId, candidateId), isNull(sessions.revokedAt)))
    .returning({ id: sessions.id });
  return rows.length;
}

export async function revokeUserSessions(q: Queryable, userId: string): Promise<void> {
  await q
    .update(sessions)
    .set({ revokedAt: now() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/** Housekeeping: drop sessions that expired or were revoked over a day ago. */
export async function purgeOldSessions(at: Date = now()): Promise<number> {
  const cutoff = new Date(at.getTime() - 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .delete(sessions)
    .where(or(lt(sessions.expiresAt, cutoff), lt(sessions.revokedAt, cutoff)))
    .returning({ id: sessions.id });
  return rows.length;
}

/** Candidate IDs with a session active in the last `withinSeconds` (for monitoring). */
export async function onlineCandidateIds(candidateIds: string[], withinSeconds = 45): Promise<Set<string>> {
  if (candidateIds.length === 0) return new Set();
  const since = new Date(now().getTime() - withinSeconds * 1000);
  const rows = await getDb()
    .select({ candidateId: sessions.candidateId })
    .from(sessions)
    .where(
      and(
        eq(sessions.subjectType, "CANDIDATE"),
        isNull(sessions.revokedAt),
        gte(sessions.lastSeenAt, since),
        inArray(sessions.candidateId, candidateIds),
      ),
    );
  return new Set(rows.map((r) => r.candidateId).filter((v): v is string => !!v));
}
