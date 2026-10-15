/**
 * Submission and scoring. `finalizeAttempt` is the only code path that ends
 * an attempt — candidate submit, deadline auto-submit and admin end all go
 * through it — and it is idempotent: the compare-and-set on
 * candidate_attempts.status guarantees one submission and one result per
 * attempt even if several workers/requests race.
 */
import { and, eq, inArray } from "drizzle-orm";
import { candidateAnswers, candidateAttempts, examSchedules, results, submissions } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { scoreAttempt } from "@/lib/scoring/score";
import { now } from "@/lib/time/clock";
import { recordExamEvent, type Actor } from "./audit-service";
import { loadAnswerKey } from "./exam-service";

/** VIOLATION = auto-submitted because the proctoring violation limit was reached. */
export type SubmitReason = "CANDIDATE" | "DEADLINE" | "ADMIN" | "VIOLATION";

export type FinalizeResult = { submissionId: string | null; alreadySubmitted: boolean };

export async function finalizeAttempt(
  attemptId: string,
  reason: SubmitReason,
  actor: Actor,
  at: Date = now(),
): Promise<FinalizeResult> {
  return getDb().transaction(async (tx) => {
    const [current] = await tx
      .select({ scheduleId: candidateAttempts.scheduleId })
      .from(candidateAttempts)
      .where(eq(candidateAttempts.id, attemptId));
    if (!current) return { submissionId: null, alreadySubmitted: false };
    const [schedule] = await tx.select().from(examSchedules).where(eq(examSchedules.id, current.scheduleId));
    if (!schedule) return { submissionId: null, alreadySubmitted: false };

    // A deadline submission is stamped at the official end even if the
    // server processes it a little later (e.g. after a restart).
    const submittedAt =
      reason === "DEADLINE" && at.getTime() > schedule.endAt.getTime() ? schedule.endAt : at;

    // Compare-and-set: only one caller can move IN_PROGRESS -> submitted.
    // This UPDATE also takes the row lock that answer saves wait on (they
    // read the attempt FOR SHARE), so no answer can slip in after the
    // snapshot below is taken.
    const [attempt] = await tx
      .update(candidateAttempts)
      .set({
        status: reason === "CANDIDATE" ? "SUBMITTED" : "AUTO_SUBMITTED",
        submittedAt,
        submitReason: reason,
      })
      .where(and(eq(candidateAttempts.id, attemptId), eq(candidateAttempts.status, "IN_PROGRESS")))
      .returning();
    if (!attempt) {
      const [existing] = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.attemptId, attemptId));
      return { submissionId: existing?.id ?? null, alreadySubmitted: true };
    }

    const answers = await tx.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId));
    const { sections, key } = await loadAnswerKey(tx, schedule.examId);
    const keyIds = new Set(key.map((k) => k.questionId));
    const relevant = answers.filter((a) => keyIds.has(a.questionId));
    const answered = relevant.filter((a) => a.selectedOptionId !== null);

    const [submission] = await tx
      .insert(submissions)
      .values({
        attemptId,
        scheduleId: attempt.scheduleId,
        candidateId: attempt.candidateId,
        reason,
        submittedAt,
        answeredCount: answered.length,
        markedCount: relevant.filter((a) => a.markedForReview).length,
        notAnsweredCount: key.length - answered.length,
        answersSnapshot: relevant.map((a) => ({
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
          markedForReview: a.markedForReview,
          revision: a.revision,
        })),
        createdAt: at,
      })
      .returning({ id: submissions.id });

    const score = scoreAttempt(
      sections.map((s) => ({ id: s.id, code: s.code, title: s.titleEn })),
      key,
      relevant.map((a) => ({ questionId: a.questionId, selectedOptionId: a.selectedOptionId })),
    );
    const pausedDuringAttempt = attempt.startedAt.getTime() <= (schedule.actualStartAt ?? schedule.startAt).getTime()
      ? schedule.totalPausedSeconds
      : 0;
    const timeTakenSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000) - pausedDuringAttempt,
    );

    await tx.insert(results).values({
      attemptId,
      submissionId: submission!.id,
      scheduleId: attempt.scheduleId,
      candidateId: attempt.candidateId,
      totalQuestions: score.totalQuestions,
      attempted: score.attempted,
      unanswered: score.unanswered,
      correct: score.correct,
      incorrect: score.incorrect,
      positiveMarks: score.positiveMarks,
      negativeMarks: score.negativeMarks,
      finalScore: score.finalScore,
      maxScore: score.maxScore,
      sectionScores: score.sections,
      timeTakenSeconds,
      computedAt: at,
    });

    await recordExamEvent(tx, {
      scheduleId: attempt.scheduleId,
      attemptId,
      candidateId: attempt.candidateId,
      type: reason === "CANDIDATE" ? "ATTEMPT_SUBMITTED" : "ATTEMPT_AUTO_SUBMITTED",
      actor,
      payload: { reason, submittedAt: submittedAt.toISOString(), processedAt: at.toISOString(), score: score.finalScore },
      at,
    });
    return { submissionId: submission!.id, alreadySubmitted: false };
  });
}

/** Submit every unsubmitted attempt of a schedule (deadline, admin end or cancel). */
export async function finalizeScheduleAttempts(
  scheduleId: string,
  reason: SubmitReason,
  actor: Actor,
  at: Date = now(),
): Promise<number> {
  const open = await getDb()
    .select({ id: candidateAttempts.id })
    .from(candidateAttempts)
    .where(and(eq(candidateAttempts.scheduleId, scheduleId), inArray(candidateAttempts.status, ["IN_PROGRESS"])));
  let finalized = 0;
  for (const a of open) {
    try {
      const r = await finalizeAttempt(a.id, reason, actor, at);
      if (!r.alreadySubmitted) finalized++;
    } catch (err) {
      // Keep going; the next scheduler tick retries anything left IN_PROGRESS.
      console.error(`[submission] failed to finalize attempt ${a.id}:`, err);
      await recordExamEvent(getDb(), {
        scheduleId,
        attemptId: a.id,
        type: "AUTO_SUBMIT_FAILED",
        actor,
        payload: { error: (err as Error).message },
        at,
      }).catch(() => {});
    }
  }
  return finalized;
}
