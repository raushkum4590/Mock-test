import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  candidateAnswers,
  candidateAttempts,
  candidates,
  examAssignments,
  examEvents,
  examSchedules,
  exams,
  workstations,
} from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { now } from "@/lib/time/clock";
import { timingOf } from "./attempt-service";
import { listScheduleProctoring } from "./proctoring-service";
import { reconcileSchedule } from "./schedule-engine";
import { onlineCandidateIds } from "./session-service";

export async function getScheduleMonitor(scheduleId: string) {
  const at = now();
  const schedule = await reconcileSchedule(scheduleId, at);
  if (!schedule) throw new AppError("NOT_FOUND", "Schedule not found.");
  const db = getDb();
  const [exam] = await db.select({ titleEn: exams.titleEn, code: exams.code }).from(exams).where(eq(exams.id, schedule.examId));
  const rows = await db
    .select({
      candidateId: candidates.id,
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      lastLoginAt: candidates.lastLoginAt,
      workstationCode: workstations.code,
      attemptId: candidateAttempts.id,
      attemptStatus: candidateAttempts.status,
      startedAt: candidateAttempts.startedAt,
      lastSeenAt: candidateAttempts.lastSeenAt,
      submittedAt: candidateAttempts.submittedAt,
      actualWorkstation: candidateAttempts.workstationCode,
      violationCount: candidateAttempts.violationCount,
    })
    .from(examAssignments)
    .innerJoin(candidates, eq(candidates.id, examAssignments.candidateId))
    .leftJoin(workstations, eq(workstations.id, examAssignments.workstationId))
    .leftJoin(candidateAttempts, eq(candidateAttempts.assignmentId, examAssignments.id))
    .where(eq(examAssignments.scheduleId, scheduleId))
    .orderBy(asc(candidates.rollNumber));

  const attemptIds = rows.map((r) => r.attemptId).filter((v): v is string => !!v);
  const progress = attemptIds.length
    ? await db
        .select({
          attemptId: candidateAnswers.attemptId,
          answered: sql<number>`count(*) filter (where ${candidateAnswers.selectedOptionId} is not null)`.mapWith(Number),
          marked: sql<number>`count(*) filter (where ${candidateAnswers.markedForReview})`.mapWith(Number),
          lastAnswerAt: sql<Date | null>`max(${candidateAnswers.updatedAt})`,
        })
        .from(candidateAnswers)
        .where(inArray(candidateAnswers.attemptId, attemptIds))
        .groupBy(candidateAnswers.attemptId)
    : [];
  const progressBy = new Map(progress.map((p) => [p.attemptId, p]));
  const online = await onlineCandidateIds(rows.map((r) => r.candidateId));
  const { photosBy, violationsBy } = await listScheduleProctoring(scheduleId);

  const candidatesOut = rows.map((r) => {
    const v = violationsBy.get(r.candidateId) ?? [];
    return {
      ...r,
      online: online.has(r.candidateId),
      answered: r.attemptId ? (progressBy.get(r.attemptId)?.answered ?? 0) : 0,
      marked: r.attemptId ? (progressBy.get(r.attemptId)?.marked ?? 0) : 0,
      violations: r.violationCount ?? 0,
      lastViolation: v.length ? { type: v[v.length - 1]!.type, at: v[v.length - 1]!.occurredAt.toISOString() } : null,
      photos: (photosBy.get(r.candidateId) ?? []).map((ph) => ({ id: ph.id, kind: ph.kind, capturedAt: ph.capturedAt.toISOString() })),
    };
  });
  const events = await db
    .select()
    .from(examEvents)
    .where(eq(examEvents.scheduleId, scheduleId))
    .orderBy(desc(examEvents.id))
    .limit(40);

  return {
    schedule: {
      id: schedule.id,
      title: schedule.title,
      status: schedule.status,
      timeZone: schedule.timeZone,
      allowPause: schedule.allowPause,
      violationLimit: schedule.violationLimit,
    },
    exam: exam!,
    timing: timingOf(schedule, at),
    summary: {
      assigned: rows.length,
      online: candidatesOut.filter((c) => c.online).length,
      notStarted: rows.filter((r) => !r.attemptStatus).length,
      inProgress: rows.filter((r) => r.attemptStatus === "IN_PROGRESS").length,
      submitted: rows.filter((r) => r.attemptStatus === "SUBMITTED" || r.attemptStatus === "AUTO_SUBMITTED").length,
    },
    candidates: candidatesOut,
    events: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  };
}

export async function getDashboardStats() {
  const db = getDb();
  const [c] = await db.select({ n: count() }).from(candidates);
  const [e] = await db.select({ n: count() }).from(exams);
  const byStatus = await db
    .select({ status: examSchedules.status, n: count() })
    .from(examSchedules)
    .groupBy(examSchedules.status);
  const upcoming = await db
    .select({ id: examSchedules.id, title: examSchedules.title, status: examSchedules.status, startAt: examSchedules.startAt, timeZone: examSchedules.timeZone })
    .from(examSchedules)
    .where(inArray(examSchedules.status, ["SCHEDULED", "PUBLISHED", "WAITING", "RUNNING", "PAUSED"]))
    .orderBy(asc(examSchedules.startAt))
    .limit(10);
  return {
    candidates: c?.n ?? 0,
    exams: e?.n ?? 0,
    schedulesByStatus: Object.fromEntries(byStatus.map((b) => [b.status, b.n])) as Record<string, number>,
    upcoming,
  };
}
