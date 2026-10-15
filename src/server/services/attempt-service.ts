/**
 * Candidate exam runtime. Every function takes the authenticated
 * CandidatePrincipal and scopes every query by principal.candidateId, so a
 * candidate cannot read or write another candidate's data by substituting
 * IDs (they get NOT_FOUND, not FORBIDDEN, to avoid confirming existence).
 */
import { and, asc, eq, inArray, notInArray, sql } from "drizzle-orm";
import {
  candidateAnswers,
  candidateAttempts,
  candidates,
  examAssignments,
  examSchedules,
  exams,
  results,
  workstations,
} from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import {
  evaluateAnswerWrite,
  evaluateEntry,
  lateEntryClosesAt,
  phaseOf,
  remainingSeconds,
  type Phase,
} from "@/lib/exam-engine/policy";
import { sectionStates } from "@/lib/exam-engine/section-timing";
import { now } from "@/lib/time/clock";
import type { AnswerChange, Language } from "@/lib/validation/schemas";
import { recordExamEvent, type Actor } from "./audit-service";
import { loadPaper, type PaperSection } from "./exam-service";
import { reconcileSchedule, type ScheduleRow } from "./schedule-engine";
import { policyOf } from "./proctoring-service";
import type { CandidatePrincipal } from "./session-service";
import { finalizeAttempt } from "./submission-service";

const actorOf = (p: CandidatePrincipal): Actor => ({ type: "CANDIDATE", id: p.candidateId, label: p.rollNumber, ip: p.ip });

export type Timing = {
  serverNow: string;
  status: ScheduleRow["status"];
  phase: Phase;
  loginOpensAt: string;
  startAt: string;
  endAt: string;
  pausedAt: string | null;
  lateEntryClosesAt: string;
  remainingSeconds: number;
  secondsToStart: number;
  /** Official working time (excluding pauses); elapsed = durationSeconds − remaining. */
  durationSeconds: number;
};

export function timingOf(s: ScheduleRow, at: Date): Timing {
  return {
    serverNow: at.toISOString(),
    status: s.status,
    phase: phaseOf(s, at),
    loginOpensAt: s.loginOpensAt.toISOString(),
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    pausedAt: s.pausedAt?.toISOString() ?? null,
    lateEntryClosesAt: lateEntryClosesAt(s).toISOString(),
    remainingSeconds: remainingSeconds(s, at),
    secondsToStart: Math.max(0, Math.ceil((s.startAt.getTime() - at.getTime()) / 1000)),
    durationSeconds: s.durationSeconds,
  };
}

// Short-lived per-process paper cache. Papers are locked (cannot be edited)
// while any schedule using them is published or live, so caching is safe.
const PAPER_TTL_MS = 30_000;
const g = globalThis as unknown as { __cbtPapers?: Map<string, { at: number; paper: PaperSection[] }> };
const paperCache = (g.__cbtPapers ??= new Map());

export async function getPaperCached(examId: string): Promise<PaperSection[]> {
  const hit = paperCache.get(examId);
  if (hit && Date.now() - hit.at < PAPER_TTL_MS) return hit.paper;
  const paper = await loadPaper(getDb(), examId);
  paperCache.set(examId, { at: Date.now(), paper });
  return paper;
}

export function clearPaperCache() {
  paperCache.clear();
}

export const SECTION_CLOSED_MESSAGE = "This section is not open now (sectional timing).";

/** Questions that cannot be answered at `elapsedSec` because their section's timer is not running. */
export function closedQuestions(paper: PaperSection[], elapsedSec: number): Set<string> {
  const states = sectionStates(paper, elapsedSec);
  const out = new Set<string>();
  for (const s of paper) if (states.get(s.id) !== "open") for (const q of s.questions) out.add(q.id);
  return out;
}

// Live timing shared by all SSE connections of a schedule: one reconcile +
// read per schedule per second, however many candidates are connected.
const TIMING_TTL_MS = 1000;
const gt = globalThis as unknown as { __cbtTiming?: Map<string, { at: number; value: Promise<Timing | null> }> };
const timingCache = (gt.__cbtTiming ??= new Map());

export function getScheduleTimingShared(scheduleId: string): Promise<Timing | null> {
  const hit = timingCache.get(scheduleId);
  if (hit && Date.now() - hit.at < TIMING_TTL_MS) return hit.value;
  const value = (async () => {
    const at = now();
    const s = await reconcileSchedule(scheduleId, at);
    return s ? timingOf(s, at) : null;
  })();
  timingCache.set(scheduleId, { at: Date.now(), value });
  value.catch(() => timingCache.delete(scheduleId));
  return value;
}

async function loadAssignment(p: CandidatePrincipal, scheduleId: string) {
  const [row] = await getDb()
    .select({ assignment: examAssignments, workstationCode: workstations.code })
    .from(examAssignments)
    .leftJoin(workstations, eq(workstations.id, examAssignments.workstationId))
    .where(and(eq(examAssignments.scheduleId, scheduleId), eq(examAssignments.candidateId, p.candidateId)));
  if (!row) throw new AppError("NOT_FOUND", "No such exam is assigned to you.");
  return row;
}

function checkWorkstation(p: CandidatePrincipal, schedule: ScheduleRow, assignedCode: string | null) {
  if (!schedule.enforceWorkstation || !assignedCode) return;
  if ((p.workstationCode ?? "").toUpperCase() !== assignedCode.toUpperCase()) {
    throw new AppError(
      "WORKSTATION_MISMATCH",
      `You are assigned to workstation ${assignedCode}. Please log in from that computer.`,
    );
  }
}

async function findAttempt(candidateId: string, scheduleId: string) {
  const [a] = await getDb()
    .select()
    .from(candidateAttempts)
    .where(and(eq(candidateAttempts.scheduleId, scheduleId), eq(candidateAttempts.candidateId, candidateId)));
  return a ?? null;
}

/** If the window is over but this attempt is still open, submit it now. */
async function closeIfExpired(attempt: typeof candidateAttempts.$inferSelect | null, schedule: ScheduleRow, at: Date) {
  if (!attempt || attempt.status !== "IN_PROGRESS") return attempt;
  const phase = phaseOf(schedule, at);
  if (phase !== "ENDED" && phase !== "CANCELLED") return attempt;
  await finalizeAttempt(attempt.id, phase === "CANCELLED" ? "ADMIN" : "DEADLINE", { type: "SYSTEM" }, at);
  return findAttempt(attempt.candidateId, attempt.scheduleId);
}

const VISIBLE: ScheduleRow["status"][] = ["DRAFT", "SCHEDULED"];

export async function getCandidateDashboard(p: CandidatePrincipal) {
  const db = getDb();
  const rows = await db
    .select({ scheduleId: examSchedules.id })
    .from(examAssignments)
    .innerJoin(examSchedules, eq(examSchedules.id, examAssignments.scheduleId))
    .where(and(eq(examAssignments.candidateId, p.candidateId), notInArray(examSchedules.status, VISIBLE)))
    .orderBy(asc(examSchedules.startAt));
  const at = now();
  const out = [];
  for (const r of rows) {
    const s = await reconcileSchedule(r.scheduleId, at);
    if (!s) continue;
    const [exam] = await db.select({ titleEn: exams.titleEn, titleHi: exams.titleHi }).from(exams).where(eq(exams.id, s.examId));
    const attempt = await findAttempt(p.candidateId, s.id);
    out.push({
      scheduleId: s.id,
      title: s.title,
      examTitleEn: exam?.titleEn ?? s.title,
      examTitleHi: exam?.titleHi ?? null,
      timeZone: s.timeZone,
      durationSeconds: s.durationSeconds,
      timing: timingOf(s, at),
      attemptStatus: attempt?.status ?? null,
    });
  }
  return out;
}

export async function getCandidateExamState(p: CandidatePrincipal, scheduleId: string) {
  const { assignment, workstationCode } = await loadAssignment(p, scheduleId);
  const at = now();
  const schedule = await reconcileSchedule(scheduleId, at);
  if (!schedule || VISIBLE.includes(schedule.status)) throw new AppError("NOT_FOUND", "No such exam is assigned to you.");
  const [exam] = await getDb().select().from(exams).where(eq(exams.id, schedule.examId));
  const attempt = await closeIfExpired(await findAttempt(p.candidateId, scheduleId), schedule, at);
  const entry = evaluateEntry(schedule, attempt, at);
  const paper = await getPaperCached(schedule.examId);
  return {
    policy: policyOf(schedule),
    // Marks scheme for the rules page (no question content).
    paper: {
      totalQuestions: paper.reduce((n, s) => n + s.questions.length, 0),
      maxMarks: paper.reduce((n, s) => n + s.questions.reduce((m, q) => m + q.marksCorrect, 0), 0),
      sections: paper.map((s) => ({
        titleEn: s.titleEn,
        titleHi: s.titleHi,
        questions: s.questions.length,
        marksCorrect: s.marksCorrect,
        marksWrong: s.marksWrong,
      })),
    },
    candidate: { rollNumber: p.rollNumber, fullName: p.fullName, workstationCode: p.workstationCode },
    assignment: { id: assignment.id, workstationCode },
    schedule: {
      id: schedule.id,
      title: schedule.title,
      timeZone: schedule.timeZone,
      durationSeconds: schedule.durationSeconds,
      lateEntrySeconds: schedule.lateEntrySeconds,
    },
    exam: {
      titleEn: exam!.titleEn,
      titleHi: exam!.titleHi,
      instructionsEn: exam!.instructionsEn,
      instructionsHi: exam!.instructionsHi,
    },
    timing: timingOf(schedule, at),
    attempt: attempt
      ? { id: attempt.id, status: attempt.status, language: attempt.language, submittedAt: attempt.submittedAt?.toISOString() ?? null }
      : null,
    entry: entry.ok ? { ok: true as const } : { ok: false as const, code: entry.code, message: entry.message },
  };
}

export async function startAttempt(p: CandidatePrincipal, input: { scheduleId: string; language: Language }) {
  const { assignment, workstationCode } = await loadAssignment(p, input.scheduleId);
  const at = now();
  const schedule = await reconcileSchedule(input.scheduleId, at);
  if (!schedule) throw new AppError("NOT_FOUND", "No such exam is assigned to you.");
  checkWorkstation(p, schedule, workstationCode);
  const existing = await closeIfExpired(await findAttempt(p.candidateId, input.scheduleId), schedule, at);
  const decision = evaluateEntry(schedule, existing, at);
  if (!decision.ok) throw new AppError(decision.code, decision.message);

  const db = getDb();
  if (existing) {
    await db
      .update(candidateAttempts)
      .set({ lastSeenAt: at, workstationCode: p.workstationCode, ipAddress: p.ip })
      .where(eq(candidateAttempts.id, existing.id));
    await recordExamEvent(db, {
      scheduleId: schedule.id,
      attemptId: existing.id,
      candidateId: p.candidateId,
      type: "ATTEMPT_RESUMED",
      actor: actorOf(p),
      payload: { workstation: p.workstationCode },
      at,
    });
    return { attemptId: existing.id, resumed: true };
  }

  // The unique (schedule_id, candidate_id) index makes concurrent "start"
  // requests converge on a single attempt.
  const [created] = await db
    .insert(candidateAttempts)
    .values({
      assignmentId: assignment.id,
      scheduleId: schedule.id,
      candidateId: p.candidateId,
      language: input.language,
      startedAt: at,
      lastSeenAt: at,
      workstationCode: p.workstationCode,
      ipAddress: p.ip,
    })
    .onConflictDoNothing()
    .returning({ id: candidateAttempts.id });
  if (!created) {
    const again = await findAttempt(p.candidateId, input.scheduleId);
    return { attemptId: again!.id, resumed: true };
  }
  await recordExamEvent(db, {
    scheduleId: schedule.id,
    attemptId: created.id,
    candidateId: p.candidateId,
    type: "ATTEMPT_STARTED",
    actor: actorOf(p),
    payload: {
      workstation: p.workstationCode,
      lateBySeconds: Math.max(0, Math.round((at.getTime() - schedule.startAt.getTime()) / 1000)),
    },
    at,
  });
  return { attemptId: created.id, resumed: false };
}

async function loadOwnAttempt(p: CandidatePrincipal, attemptId: string) {
  const [a] = await getDb()
    .select()
    .from(candidateAttempts)
    .where(and(eq(candidateAttempts.id, attemptId), eq(candidateAttempts.candidateId, p.candidateId)));
  if (!a) throw new AppError("NOT_FOUND", "Attempt not found.");
  return a;
}

export type AnswerState = { questionId: string; selectedOptionId: string | null; markedForReview: boolean; revision: number };

async function loadAnswers(attemptId: string): Promise<AnswerState[]> {
  return getDb()
    .select({
      questionId: candidateAnswers.questionId,
      selectedOptionId: candidateAnswers.selectedOptionId,
      markedForReview: candidateAnswers.markedForReview,
      revision: candidateAnswers.revision,
    })
    .from(candidateAnswers)
    .where(eq(candidateAnswers.attemptId, attemptId));
}

/** Questions are only delivered once the exam is RUNNING (or on hold). */
export async function getAttemptPaper(p: CandidatePrincipal, attemptId: string) {
  const attempt0 = await loadOwnAttempt(p, attemptId);
  const at = now();
  const schedule = await reconcileSchedule(attempt0.scheduleId, at);
  if (!schedule) throw new AppError("NOT_FOUND", "Attempt not found.");
  const attempt = await closeIfExpired(attempt0, schedule, at);
  if (!attempt || attempt.status !== "IN_PROGRESS") throw new AppError("ATTEMPT_SUBMITTED", "This exam has been submitted.");
  const phase = phaseOf(schedule, at);
  if (phase !== "RUNNING" && phase !== "PAUSED") throw new AppError("EXAM_NOT_STARTED", "The exam is not running.");
  const [exam] = await getDb().select({ titleEn: exams.titleEn, titleHi: exams.titleHi }).from(exams).where(eq(exams.id, schedule.examId));
  return {
    attempt: { id: attempt.id, status: attempt.status, language: attempt.language, violationCount: attempt.violationCount },
    policy: policyOf(schedule),
    exam: exam!,
    candidate: { rollNumber: p.rollNumber, fullName: p.fullName },
    sections: await getPaperCached(schedule.examId),
    answers: await loadAnswers(attempt.id),
    timing: timingOf(schedule, at),
  };
}

export async function getAttemptAnswers(p: CandidatePrincipal, attemptId: string) {
  const attempt = await loadOwnAttempt(p, attemptId);
  const at = now();
  const schedule = await reconcileSchedule(attempt.scheduleId, at);
  return { answers: await loadAnswers(attempt.id), timing: timingOf(schedule!, at), attemptStatus: attempt.status };
}

export type SaveItemResult =
  | { questionId: string; status: "SAVED" | "DUPLICATE"; revision: number }
  | { questionId: string; status: "STALE"; revision: number; server: AnswerState }
  | { questionId: string; status: "INVALID"; message: string };

/**
 * Persist answer changes. Rules:
 *  - The attempt must be IN_PROGRESS and the schedule RUNNING with the
 *    server clock before end_at (the client's timer is never trusted).
 *  - A change is applied only if its revision is greater than the stored
 *    revision. A retry of an already-applied change (same revision and
 *    idempotency key) is acknowledged as DUPLICATE; any other non-newer
 *    change is STALE and the server's current state is returned.
 */
export async function saveAnswers(
  p: CandidatePrincipal,
  input: { attemptId: string; changes: AnswerChange[] },
): Promise<{ results: SaveItemResult[]; timing: Timing }> {
  const attempt = await loadOwnAttempt(p, input.attemptId);
  const at = now();
  const schedule = await reconcileSchedule(attempt.scheduleId, at);
  if (!schedule) throw new AppError("NOT_FOUND", "Attempt not found.");
  const pre = evaluateAnswerWrite(schedule, attempt.status, at);
  if (!pre.ok) throw new AppError(pre.code, pre.message, { timing: timingOf(schedule, at) });

  const paper = await getPaperCached(schedule.examId);
  const validOptions = new Map<string, Set<string>>();
  for (const s of paper) for (const q of s.questions) validOptions.set(q.id, new Set(q.options.map((o) => o.id)));
  // Sectional timing runs on the sitting's elapsed time (pauses excluded).
  const closed = closedQuestions(paper, schedule.durationSeconds - remainingSeconds(schedule, at));

  const db = getDb();
  const out = await db.transaction(async (tx) => {
    // Shared lock: blocks while a submission holds the row and lets us
    // re-check the status after it commits (see submission-service).
    const [locked] = await tx
      .select({ status: candidateAttempts.status })
      .from(candidateAttempts)
      .where(eq(candidateAttempts.id, attempt.id))
      .for("share");
    if (locked?.status !== "IN_PROGRESS") throw new AppError("ATTEMPT_SUBMITTED", "This attempt has been submitted.");
    const [fresh] = await tx.select().from(examSchedules).where(eq(examSchedules.id, schedule.id));
    const recheck = evaluateAnswerWrite(fresh!, "IN_PROGRESS", at);
    if (!recheck.ok) throw new AppError(recheck.code, recheck.message);

    const results: SaveItemResult[] = [];
    for (const c of input.changes) {
      const opts = validOptions.get(c.questionId);
      if (!opts) {
        results.push({ questionId: c.questionId, status: "INVALID", message: "Question is not part of this exam." });
        continue;
      }
      if (c.selectedOptionId && !opts.has(c.selectedOptionId)) {
        results.push({ questionId: c.questionId, status: "INVALID", message: "Option does not belong to the question." });
        continue;
      }
      if (closed.has(c.questionId)) {
        results.push({ questionId: c.questionId, status: "INVALID", message: SECTION_CLOSED_MESSAGE });
        continue;
      }
      const [applied] = await tx
        .insert(candidateAnswers)
        .values({
          attemptId: attempt.id,
          candidateId: p.candidateId,
          questionId: c.questionId,
          selectedOptionId: c.selectedOptionId,
          markedForReview: c.markedForReview,
          visited: true,
          revision: c.revision,
          idempotencyKey: c.idempotencyKey,
          createdAt: at,
          updatedAt: at,
        })
        .onConflictDoUpdate({
          target: [candidateAnswers.attemptId, candidateAnswers.questionId],
          set: {
            selectedOptionId: c.selectedOptionId,
            markedForReview: c.markedForReview,
            revision: c.revision,
            idempotencyKey: c.idempotencyKey,
            updatedAt: at,
          },
          setWhere: sql`${candidateAnswers.revision} < ${c.revision}`,
        })
        .returning({ revision: candidateAnswers.revision });
      if (applied) {
        results.push({ questionId: c.questionId, status: "SAVED", revision: applied.revision });
        continue;
      }
      const [current] = await tx
        .select()
        .from(candidateAnswers)
        .where(and(eq(candidateAnswers.attemptId, attempt.id), eq(candidateAnswers.questionId, c.questionId)));
      if (current && current.revision === c.revision && current.idempotencyKey === c.idempotencyKey) {
        results.push({ questionId: c.questionId, status: "DUPLICATE", revision: current.revision });
      } else {
        results.push({
          questionId: c.questionId,
          status: "STALE",
          revision: current?.revision ?? 0,
          server: {
            questionId: c.questionId,
            selectedOptionId: current?.selectedOptionId ?? null,
            markedForReview: current?.markedForReview ?? false,
            revision: current?.revision ?? 0,
          },
        });
      }
    }
    await tx.update(candidateAttempts).set({ lastSeenAt: at }).where(eq(candidateAttempts.id, attempt.id));
    return results;
  });
  return { results: out, timing: timingOf(schedule, at) };
}

export async function submitAttempt(p: CandidatePrincipal, attemptId: string) {
  const attempt = await loadOwnAttempt(p, attemptId);
  const at = now();
  const schedule = await reconcileSchedule(attempt.scheduleId, at);
  if (!schedule) throw new AppError("NOT_FOUND", "Attempt not found.");
  // Reconciling may already have auto-submitted it at the deadline.
  const phase = phaseOf(schedule, at);
  const reason = phase === "ENDED" || phase === "CANCELLED" ? "DEADLINE" : "CANDIDATE";
  if (phase === "PAUSED") throw new AppError("EXAM_PAUSED", "The exam is on hold. You cannot submit now.");
  const r = await finalizeAttempt(attempt.id, reason, actorOf(p), at);
  const [after] = await getDb()
    .select({ status: candidateAttempts.status, submittedAt: candidateAttempts.submittedAt })
    .from(candidateAttempts)
    .where(eq(candidateAttempts.id, attempt.id));
  return {
    attemptId: attempt.id,
    alreadySubmitted: r.alreadySubmitted,
    status: after!.status,
    submittedAt: after!.submittedAt?.toISOString() ?? null,
  };
}

export async function getSubmissionSummary(p: CandidatePrincipal, scheduleId: string) {
  const attempt = await findAttempt(p.candidateId, scheduleId);
  if (!attempt) throw new AppError("NOT_FOUND", "No attempt found.");
  const db = getDb();
  const [schedule] = await db.select().from(examSchedules).where(eq(examSchedules.id, scheduleId));
  const [exam] = await db.select({ titleEn: exams.titleEn, titleHi: exams.titleHi }).from(exams).where(eq(exams.id, schedule!.examId));
  const [result] =
    attempt.status !== "IN_PROGRESS" ? await db.select().from(results).where(eq(results.attemptId, attempt.id)) : [];
  const released = !!result && schedule!.resultsPublished;
  return {
    exam: exam!,
    policy: policyOf(schedule!),
    attempt: {
      id: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt?.toISOString() ?? null,
      reason: attempt.submitReason,
      violationCount: attempt.violationCount,
    },
    counts: result
      ? { total: result.totalQuestions, answered: result.attempted, notAnswered: result.unanswered, timeTakenSeconds: result.timeTakenSeconds }
      : null,
    // Marks are shown to candidates only once an administrator releases them.
    score: released
      ? {
          finalScore: result.finalScore,
          maxScore: result.maxScore,
          correct: result.correct,
          incorrect: result.incorrect,
          positiveMarks: result.positiveMarks,
          negativeMarks: result.negativeMarks,
          accuracyPct: result.attempted ? Math.round((result.correct / result.attempted) * 1000) / 10 : 0,
          sections: result.sectionScores,
        }
      : null,
  };
}

export async function setPreferredLanguage(p: CandidatePrincipal, language: Language) {
  await getDb().update(candidates).set({ preferredLanguage: language }).where(eq(candidates.id, p.candidateId));
  await getDb()
    .update(candidateAttempts)
    .set({ language })
    .where(and(eq(candidateAttempts.candidateId, p.candidateId), inArray(candidateAttempts.status, ["IN_PROGRESS"])));
}
