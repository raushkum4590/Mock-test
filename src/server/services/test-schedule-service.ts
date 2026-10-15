/**
 * Student-scheduled online tests. A student asks to sit a test at a chosen
 * time; an administrator approves (optionally moving the time) or rejects.
 * While the `online.requireStartApproval` setting is on (off by default), a new
 * attempt can only start inside an approved request's window:
 *
 *   PENDING ──approve──▶ APPROVED ──start──▶ USED
 *      │ └──reject──▶ REJECTED     └─(window passed)─▶ EXPIRED
 *      └──cancel (student)──▶ CANCELLED
 *
 * Resuming an attempt that is already in progress never needs approval.
 */
import { cache } from "react";
import { and, asc, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { applicationSettings, exams, students, testScheduleRequests, type TestRequestStatus } from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { now } from "@/lib/time/clock";
import { audit, authorize, type Actor } from "./audit-service";
import type { StudentPrincipal } from "./session-service";

export const REQUIRE_APPROVAL_KEY = "online.requireStartApproval";
/** How long after the approved start time the student may still begin. */
export const START_WINDOW_MINUTES = 120;
const MAX_DAYS_AHEAD = 90;

type RequestRow = typeof testScheduleRequests.$inferSelect;

// --- Setting --------------------------------------------------------------------------

export async function getRequireApproval(q: Queryable = getDb()): Promise<boolean> {
  const [row] = await q.select({ value: applicationSettings.value }).from(applicationSettings).where(eq(applicationSettings.key, REQUIRE_APPROVAL_KEY));
  return row ? row.value === true : false;
}

/** Per-request cached read for rendering (e.g. one lookup for a whole grid of test cards). */
export const getRequireApprovalForRender = cache(() => getRequireApproval());

export async function setRequireApproval(actor: Actor, required: boolean): Promise<void> {
  authorize(actor, "students.manage");
  const db = getDb();
  await db
    .insert(applicationSettings)
    .values({ key: REQUIRE_APPROVAL_KEY, value: required, updatedBy: actor.id ?? null })
    .onConflictDoUpdate({ target: applicationSettings.key, set: { value: required, updatedAt: now(), updatedBy: actor.id ?? null } });
  await audit(db, actor, "test_request.setting", null, { requireStartApproval: required });
}

// --- Expiry ---------------------------------------------------------------------------

/** Approved requests whose window has passed become EXPIRED (frees the open slot). */
async function expireStale(q: Queryable, where?: ReturnType<typeof and>): Promise<void> {
  await q
    .update(testScheduleRequests)
    .set({ status: "EXPIRED", updatedAt: now() })
    .where(and(eq(testScheduleRequests.status, "APPROVED"), lt(testScheduleRequests.windowEndsAt, now()), where));
}

// --- Student side ---------------------------------------------------------------------

function validateStart(startAt: Date) {
  const t = startAt.getTime();
  if (Number.isNaN(t)) throw new AppError("VALIDATION", "Choose a valid date and time.");
  // A few minutes of slack for clock differences and form-filling time.
  if (t < now().getTime() - 5 * 60_000) throw new AppError("VALIDATION", "Choose a time in the future.");
  if (t > now().getTime() + MAX_DAYS_AHEAD * 86_400_000) throw new AppError("VALIDATION", `Choose a time within the next ${MAX_DAYS_AHEAD} days.`);
}

export async function requestTestSchedule(p: StudentPrincipal, input: { examId: string; startAt: Date; note?: string | null }) {
  validateStart(input.startAt);
  const db = getDb();
  await expireStale(db, and(eq(testScheduleRequests.studentId, p.studentId), eq(testScheduleRequests.examId, input.examId)));
  const [created] = await db
    .insert(testScheduleRequests)
    .values({
      studentId: p.studentId,
      examId: input.examId,
      requestedStartAt: input.startAt,
      studentNote: input.note?.trim() || null,
    })
    .onConflictDoNothing()
    .returning();
  if (!created) throw new AppError("CONFLICT", "You already have a pending or approved schedule for this test.");
  await audit(db, { type: "STUDENT", id: p.studentId, label: p.email }, "test_request.create", { type: "test_schedule_request", id: created.id }, {
    examId: input.examId,
    requestedStartAt: input.startAt,
  });
  return created;
}

export async function cancelTestSchedule(p: StudentPrincipal, requestId: string): Promise<void> {
  const db = getDb();
  const [row] = await db
    .update(testScheduleRequests)
    .set({ status: "CANCELLED", updatedAt: now() })
    .where(
      and(
        eq(testScheduleRequests.id, requestId),
        eq(testScheduleRequests.studentId, p.studentId),
        inArray(testScheduleRequests.status, ["PENDING", "APPROVED"]),
      ),
    )
    .returning({ id: testScheduleRequests.id });
  if (!row) throw new AppError("NOT_FOUND", "No open schedule request found.");
}

/** The student's latest request for one test, or null. */
export async function getStudentRequestForExam(studentId: string, examId: string): Promise<RequestRow | null> {
  const db = getDb();
  await expireStale(db, and(eq(testScheduleRequests.studentId, studentId), eq(testScheduleRequests.examId, examId)));
  const [row] = await db
    .select()
    .from(testScheduleRequests)
    .where(and(eq(testScheduleRequests.studentId, studentId), eq(testScheduleRequests.examId, examId)))
    .orderBy(desc(testScheduleRequests.createdAt))
    .limit(1);
  return row ?? null;
}

export async function listStudentRequests(p: StudentPrincipal) {
  const db = getDb();
  await expireStale(db, eq(testScheduleRequests.studentId, p.studentId));
  return db
    .select({
      id: testScheduleRequests.id,
      status: testScheduleRequests.status,
      requestedStartAt: testScheduleRequests.requestedStartAt,
      startAt: testScheduleRequests.startAt,
      windowEndsAt: testScheduleRequests.windowEndsAt,
      adminNote: testScheduleRequests.adminNote,
      createdAt: testScheduleRequests.createdAt,
      slug: exams.slug,
      titleEn: exams.titleEn,
      titleHi: exams.titleHi,
    })
    .from(testScheduleRequests)
    .innerJoin(exams, eq(exams.id, testScheduleRequests.examId))
    .where(eq(testScheduleRequests.studentId, p.studentId))
    .orderBy(desc(testScheduleRequests.createdAt))
    .limit(100);
}

/**
 * The approved request whose window is open at `at`, or null. Called by
 * startPracticeAttempt before creating a new attempt.
 */
export async function findOpenApproval(studentId: string, examId: string, at: Date): Promise<RequestRow | null> {
  const [row] = await getDb()
    .select()
    .from(testScheduleRequests)
    .where(
      and(
        eq(testScheduleRequests.studentId, studentId),
        eq(testScheduleRequests.examId, examId),
        eq(testScheduleRequests.status, "APPROVED"),
        sql`${testScheduleRequests.startAt} <= ${at}`,
        sql`${testScheduleRequests.windowEndsAt} > ${at}`,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function markRequestUsed(requestId: string, attemptId: string): Promise<void> {
  await getDb()
    .update(testScheduleRequests)
    .set({ status: "USED", attemptId, updatedAt: now() })
    .where(and(eq(testScheduleRequests.id, requestId), eq(testScheduleRequests.status, "APPROVED")));
}

// --- Admin side -----------------------------------------------------------------------

export async function listScheduleRequests(filter: { status?: TestRequestStatus } = {}) {
  const db = getDb();
  await expireStale(db);
  return db
    .select({
      id: testScheduleRequests.id,
      status: testScheduleRequests.status,
      requestedStartAt: testScheduleRequests.requestedStartAt,
      studentNote: testScheduleRequests.studentNote,
      startAt: testScheduleRequests.startAt,
      windowEndsAt: testScheduleRequests.windowEndsAt,
      adminNote: testScheduleRequests.adminNote,
      reviewedAt: testScheduleRequests.reviewedAt,
      createdAt: testScheduleRequests.createdAt,
      studentEmail: students.email,
      studentName: students.fullName,
      examCode: exams.code,
      examTitle: exams.titleEn,
    })
    .from(testScheduleRequests)
    .innerJoin(students, eq(students.id, testScheduleRequests.studentId))
    .innerJoin(exams, eq(exams.id, testScheduleRequests.examId))
    .where(filter.status ? eq(testScheduleRequests.status, filter.status) : undefined)
    .orderBy(filter.status === "PENDING" ? asc(testScheduleRequests.requestedStartAt) : desc(testScheduleRequests.updatedAt))
    .limit(300);
}

export async function reviewScheduleRequest(
  actor: Actor,
  requestId: string,
  input: { decision: "APPROVE" | "REJECT"; startAt?: Date | null; note?: string | null },
) {
  authorize(actor, "students.manage");
  const db = getDb();
  const [req] = await db.select().from(testScheduleRequests).where(eq(testScheduleRequests.id, requestId));
  if (!req) throw new AppError("NOT_FOUND", "Request not found.");
  if (req.status !== "PENDING") throw new AppError("CONFLICT", `This request is already ${req.status.toLowerCase()}.`);
  const at = now();
  const note = input.note?.trim() || null;
  let set: Partial<RequestRow>;
  if (input.decision === "APPROVE") {
    const startAt = input.startAt ?? req.requestedStartAt;
    if (Number.isNaN(startAt.getTime())) throw new AppError("VALIDATION", "Invalid start time.");
    const windowEndsAt = new Date(startAt.getTime() + START_WINDOW_MINUTES * 60_000);
    if (windowEndsAt.getTime() <= at.getTime()) throw new AppError("VALIDATION", "That time has already passed. Choose a new start time to approve.");
    set = { status: "APPROVED", startAt, windowEndsAt };
  } else {
    if (!note) throw new AppError("VALIDATION", "Give a reason for rejecting.");
    set = { status: "REJECTED" };
  }
  const [row] = await db
    .update(testScheduleRequests)
    .set({ ...set, adminNote: note, reviewedBy: actor.id ?? null, reviewedAt: at, updatedAt: at })
    .where(and(eq(testScheduleRequests.id, requestId), eq(testScheduleRequests.status, "PENDING")))
    .returning();
  if (!row) throw new AppError("CONFLICT", "This request was changed by someone else. Refresh and try again.");
  await audit(db, actor, input.decision === "APPROVE" ? "test_request.approve" : "test_request.reject", { type: "test_schedule_request", id: row.id }, {
    startAt: row.startAt,
    note,
  });
  return row;
}
