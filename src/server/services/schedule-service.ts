import { and, asc, count, desc, eq, inArray, ne } from "drizzle-orm";
import type { z } from "zod";
import {
  candidateAttempts,
  candidates,
  examAssignments,
  examBatches,
  examSchedules,
  exams,
  workstations,
} from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { ADMIN_ACTION_RULES, type AdminAction } from "@/lib/exam-engine/state-machine";
import { now } from "@/lib/time/clock";
import { isValidTimeZone, zonedTimeToUtc } from "@/lib/time/zone";
import type { scheduleSchema } from "@/lib/validation/schemas";
import { audit, authorize, SYSTEM_ACTOR, type Actor } from "./audit-service";
import { loadPaper } from "./exam-service";
import { applyTransition, reconcileSchedule, type ScheduleRow } from "./schedule-engine";
import { finalizeScheduleAttempts } from "./submission-service";

type ScheduleData = z.output<typeof scheduleSchema>;

function computeTimes(input: ScheduleData) {
  if (!isValidTimeZone(input.timeZone)) throw new AppError("VALIDATION", `Unknown time zone ${input.timeZone}.`);
  const loginOpensAt = zonedTimeToUtc(input.loginOpensAt, input.timeZone);
  const startAt = zonedTimeToUtc(input.startAt, input.timeZone);
  const durationSeconds = input.durationMinutes * 60;
  const endAt = new Date(startAt.getTime() + durationSeconds * 1000);
  if (loginOpensAt.getTime() > startAt.getTime()) {
    throw new AppError("VALIDATION", "Login must open at or before the scheduled start.");
  }
  return { loginOpensAt, startAt, durationSeconds, endAt, lateEntrySeconds: input.lateEntryMinutes * 60 };
}

export async function createSchedule(actor: Actor, input: ScheduleData): Promise<{ id: string }> {
  authorize(actor, "schedules.manage");
  const db = getDb();
  const [exam] = await db.select().from(exams).where(eq(exams.id, input.examId));
  if (!exam) throw new AppError("NOT_FOUND", "Exam not found.");
  if (exam.status === "ARCHIVED") throw new AppError("VALIDATION", "Archived exams cannot be scheduled.");
  const times = computeTimes(input);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(examSchedules)
      .values({
        examId: input.examId,
        batchId: input.batchId ?? null,
        title: input.title,
        timeZone: input.timeZone,
        ...times,
        enforceWorkstation: input.enforceWorkstation,
        allowPause: input.allowPause,
        requirePhoto: input.requirePhoto,
        cameraMonitoring: input.cameraMonitoring,
        requireFullscreen: input.requireFullscreen,
        violationLimit: input.violationLimit,
        autoSubmitOnViolations: input.autoSubmitOnViolations,
        createdBy: actor.id ?? null,
      })
      .returning({ id: examSchedules.id });
    await audit(tx, actor, "schedule.create", { type: "schedule", id: row!.id }, {
      title: input.title,
      startAt: times.startAt.toISOString(),
    });
    return row!;
  });
}

export async function updateSchedule(actor: Actor, scheduleId: string, input: ScheduleData): Promise<void> {
  authorize(actor, "schedules.manage");
  const db = getDb();
  const times = computeTimes(input);
  await db.transaction(async (tx) => {
    // Only editable before it is locked/published; status is part of the WHERE
    // so a concurrent publish cannot be overwritten.
    const [row] = await tx
      .update(examSchedules)
      .set({
        examId: input.examId,
        batchId: input.batchId ?? null,
        title: input.title,
        timeZone: input.timeZone,
        ...times,
        enforceWorkstation: input.enforceWorkstation,
        allowPause: input.allowPause,
        requirePhoto: input.requirePhoto,
        cameraMonitoring: input.cameraMonitoring,
        requireFullscreen: input.requireFullscreen,
        violationLimit: input.violationLimit,
        autoSubmitOnViolations: input.autoSubmitOnViolations,
        updatedAt: now(),
      })
      .where(and(eq(examSchedules.id, scheduleId), eq(examSchedules.status, "DRAFT")))
      .returning({ id: examSchedules.id });
    if (!row) throw new AppError("CONFLICT", "Only DRAFT schedules can be edited. Move it back to draft first.");
    await audit(tx, actor, "schedule.update", { type: "schedule", id: scheduleId });
  });
}

export async function listSchedules() {
  const db = getDb();
  const rows = await db
    .select({
      id: examSchedules.id,
      title: examSchedules.title,
      status: examSchedules.status,
      loginOpensAt: examSchedules.loginOpensAt,
      startAt: examSchedules.startAt,
      endAt: examSchedules.endAt,
      timeZone: examSchedules.timeZone,
      examCode: exams.code,
      examTitle: exams.titleEn,
      batchCode: examBatches.code,
    })
    .from(examSchedules)
    .innerJoin(exams, eq(exams.id, examSchedules.examId))
    .leftJoin(examBatches, eq(examBatches.id, examSchedules.batchId))
    .orderBy(desc(examSchedules.startAt));
  const counts = await db
    .select({ scheduleId: examAssignments.scheduleId, n: count() })
    .from(examAssignments)
    .groupBy(examAssignments.scheduleId);
  const byId = new Map(counts.map((c) => [c.scheduleId, c.n]));
  return rows.map((r) => ({ ...r, assigned: byId.get(r.id) ?? 0 }));
}

export async function getSchedule(scheduleId: string): Promise<ScheduleRow> {
  const row = await reconcileSchedule(scheduleId);
  if (!row) throw new AppError("NOT_FOUND", "Schedule not found.");
  return row;
}

export async function getScheduleDetail(scheduleId: string) {
  const schedule = await getSchedule(scheduleId);
  const db = getDb();
  const [exam] = await db.select().from(exams).where(eq(exams.id, schedule.examId));
  const [batch] = schedule.batchId ? await db.select().from(examBatches).where(eq(examBatches.id, schedule.batchId)) : [];
  const assignments = await listAssignments(scheduleId);
  return { schedule, exam: exam!, batch: batch ?? null, assignments };
}

/** Admin-initiated state change, with per-action permission and business rules. */
export async function adminTransition(
  actor: Actor,
  scheduleId: string,
  action: AdminAction,
  reason: string | null,
): Promise<ScheduleRow> {
  const rule = ADMIN_ACTION_RULES[action];
  authorize(actor, rule.permission);
  const at = now();
  const row = await reconcileSchedule(scheduleId, at);
  if (!row) throw new AppError("NOT_FOUND", "Schedule not found.");
  if (!rule.from.includes(row.status)) {
    throw new AppError("INVALID_TRANSITION", `Cannot ${rule.label.toLowerCase()} a schedule that is ${row.status}.`);
  }

  if (action === "SCHEDULE" || action === "PUBLISH") {
    const db = getDb();
    const [exam] = await db.select().from(exams).where(eq(exams.id, row.examId));
    if (!exam || exam.status !== "READY") throw new AppError("VALIDATION", "The exam must be marked READY first.");
    const paper = await loadPaper(db, row.examId);
    if (paper.every((s) => s.questions.length === 0)) throw new AppError("VALIDATION", "The exam has no questions.");
    if (row.startAt.getTime() <= at.getTime()) {
      throw new AppError("VALIDATION", "The scheduled start time is in the past. Edit the schedule first.");
    }
    if (action === "PUBLISH") {
      const [c] = await db.select({ n: count() }).from(examAssignments).where(eq(examAssignments.scheduleId, scheduleId));
      if (!c?.n) throw new AppError("VALIDATION", "Assign at least one candidate before publishing.");
    }
  }
  if (action === "UNPUBLISH" && at.getTime() >= row.loginOpensAt.getTime()) {
    throw new AppError("INVALID_TRANSITION", "Login has already opened; cancel the exam instead.");
  }
  if (action === "PAUSE" && !row.allowPause) {
    throw new AppError("FORBIDDEN", "Emergency hold is disabled for this schedule.");
  }
  // Overrides that affect candidates must be justified in the audit trail.
  const affectsCandidates =
    action === "PAUSE" ||
    action === "END" ||
    (action === "CANCEL" && ["PUBLISHED", "WAITING", "RUNNING", "PAUSED"].includes(row.status));
  if (affectsCandidates && !reason) throw new AppError("VALIDATION", "A reason is required for this action.");

  const updated = await applyTransition(row, rule.to, { actor, at, reason: reason ?? action });
  if (!updated) throw new AppError("CONFLICT", "The schedule changed at the same moment. Refresh and try again.");
  if (updated.status === "COMPLETED" || updated.status === "CANCELLED") {
    await finalizeScheduleAttempts(scheduleId, "ADMIN", actor.type === "ADMIN" ? actor : SYSTEM_ACTOR, at);
  }
  return updated;
}

// --- Assignments --------------------------------------------------------------

export async function listAssignments(scheduleId: string) {
  return getDb()
    .select({
      id: examAssignments.id,
      candidateId: candidates.id,
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      isActive: candidates.isActive,
      workstationId: examAssignments.workstationId,
      workstationCode: workstations.code,
      attemptStatus: candidateAttempts.status,
    })
    .from(examAssignments)
    .innerJoin(candidates, eq(candidates.id, examAssignments.candidateId))
    .leftJoin(workstations, eq(workstations.id, examAssignments.workstationId))
    .leftJoin(candidateAttempts, eq(candidateAttempts.assignmentId, examAssignments.id))
    .where(eq(examAssignments.scheduleId, scheduleId))
    .orderBy(asc(candidates.rollNumber));
}

export async function assignCandidates(
  actor: Actor,
  scheduleId: string,
  input: { candidateIds?: string[]; fromBatch?: boolean },
): Promise<{ added: number }> {
  authorize(actor, "schedules.manage");
  const db = getDb();
  const [schedule] = await db.select().from(examSchedules).where(eq(examSchedules.id, scheduleId));
  if (!schedule) throw new AppError("NOT_FOUND", "Schedule not found.");
  if (schedule.status === "COMPLETED" || schedule.status === "CANCELLED") {
    throw new AppError("CONFLICT", "Candidates cannot be assigned to a finished schedule.");
  }
  let ids = input.candidateIds ?? [];
  if (input.fromBatch) {
    if (!schedule.batchId) throw new AppError("VALIDATION", "This schedule has no batch.");
    const rows = await db
      .select({ id: candidates.id })
      .from(candidates)
      .where(and(eq(candidates.batchId, schedule.batchId), eq(candidates.isActive, true)));
    ids = [...ids, ...rows.map((r) => r.id)];
  }
  ids = [...new Set(ids)];
  if (ids.length === 0) return { added: 0 };
  const found = await db.select({ id: candidates.id }).from(candidates).where(inArray(candidates.id, ids));
  if (found.length !== ids.length) throw new AppError("VALIDATION", "Some candidates do not exist.");
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(examAssignments)
      .values(ids.map((candidateId) => ({ scheduleId, candidateId })))
      .onConflictDoNothing()
      .returning({ id: examAssignments.id });
    await audit(tx, actor, "schedule.assign", { type: "schedule", id: scheduleId }, { added: inserted.length });
    return { added: inserted.length };
  });
}

export async function removeAssignment(actor: Actor, assignmentId: string): Promise<void> {
  authorize(actor, "schedules.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    const [att] = await tx
      .select({ id: candidateAttempts.id })
      .from(candidateAttempts)
      .where(eq(candidateAttempts.assignmentId, assignmentId));
    if (att) throw new AppError("CONFLICT", "This candidate has already started; the assignment cannot be removed.");
    const [row] = await tx.delete(examAssignments).where(eq(examAssignments.id, assignmentId)).returning();
    if (!row) throw new AppError("NOT_FOUND", "Assignment not found.");
    await audit(tx, actor, "schedule.unassign", { type: "schedule", id: row.scheduleId }, { candidateId: row.candidateId });
  });
}

export async function setAssignmentWorkstation(actor: Actor, assignmentId: string, workstationId: string | null) {
  authorize(actor, "schedules.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    const [a] = await tx.select().from(examAssignments).where(eq(examAssignments.id, assignmentId));
    if (!a) throw new AppError("NOT_FOUND", "Assignment not found.");
    if (workstationId) {
      const [clash] = await tx
        .select({ id: examAssignments.id })
        .from(examAssignments)
        .where(
          and(
            eq(examAssignments.scheduleId, a.scheduleId),
            eq(examAssignments.workstationId, workstationId),
            ne(examAssignments.id, assignmentId),
          ),
        );
      if (clash) throw new AppError("CONFLICT", "That workstation is already assigned to another candidate in this schedule.");
    }
    await tx.update(examAssignments).set({ workstationId }).where(eq(examAssignments.id, assignmentId));
    await audit(tx, actor, "schedule.workstation", { type: "schedule", id: a.scheduleId }, {
      candidateId: a.candidateId,
      workstationId,
    });
  });
}
