import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { candidateAttempts, examEvents, results, submissions } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { AppError } from "@/lib/errors";
import {
  getAttemptPaper,
  getCandidateExamState,
  saveAnswers,
  startAttempt,
  submitAttempt,
} from "@/server/services/attempt-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { listScheduleResults } from "@/server/services/results-service";
import { createTestDb, type TestDb } from "../helpers/db";
import {
  createAdmin,
  createCandidateLogin,
  createPublishedSchedule,
  createSampleExam,
  key,
  loginAs,
} from "../helpers/fixtures";

/**
 * The mandatory milestone flow, end to end through the service layer:
 * admin creates exam -> publishes schedule -> candidate logs in and waits ->
 * server starts the exam at the scheduled time -> candidate answers ->
 * answers saved -> official time expires -> server auto-submits -> result.
 *
 * Schedule (IST): login opens 09:30, start 10:00, duration 60 min, end 11:00.
 */
describe("scheduled exam end-to-end (service level)", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T03:30:00.000Z"); // 09:00 IST

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
  });
  afterAll(() => t.close());

  it("runs the full flow with server-controlled start and auto-submit", async () => {
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 2); // 4 questions
    const cand = await createCandidateLogin(admin);
    const schedule = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), {
      loginOpensIn: 30,
      startsIn: 60,
      durationMinutes: 60,
    });
    expect(schedule.status).toBe("PUBLISHED");
    expect(schedule.startAt.toISOString()).toBe("2026-10-10T04:30:00.000Z"); // 10:00 IST
    expect(schedule.endAt.toISOString()).toBe("2026-10-10T05:30:00.000Z"); // 11:00 IST

    // 09:35 — login window open; candidate logs in and waits.
    clock.set("2026-10-10T04:05:00.000Z");
    await runSchedulerTick(clock.now());
    const { principal } = await loginAs(cand);
    let state = await getCandidateExamState(principal, schedule.id);
    expect(state.timing.status).toBe("WAITING");
    expect(state.entry).toMatchObject({ ok: false, code: "EXAM_NOT_STARTED" });
    expect(state.timing.secondsToStart).toBe(25 * 60);

    // Questions cannot be obtained before the start.
    await expect(startAttempt(principal, { scheduleId: schedule.id, language: "en" })).rejects.toMatchObject({
      code: "EXAM_NOT_STARTED",
    });

    // 10:00:00 — the scheduler starts the exam; no admin action involved.
    clock.set("2026-10-10T04:30:00.000Z");
    await runSchedulerTick(clock.now());
    state = await getCandidateExamState(principal, schedule.id);
    expect(state.timing.status).toBe("RUNNING");
    expect(state.timing.remainingSeconds).toBe(3600);
    expect(state.entry.ok).toBe(true);

    // 10:01 — candidate opens the exam (Hindi).
    clock.set("2026-10-10T04:31:00.000Z");
    const { attemptId } = await startAttempt(principal, { scheduleId: schedule.id, language: "hi" });
    const paper = await getAttemptPaper(principal, attemptId);
    expect(paper.sections).toHaveLength(2);
    expect(paper.timing.remainingSeconds).toBe(59 * 60);
    // The candidate payload never carries answer keys.
    const serialized = JSON.stringify(paper);
    expect(serialized).not.toMatch(/isCorrect|correctOptionIds|explanation/i);
    expect(paper.sections[0]!.questions[0]!.textHi).toContain("प्रश्न");

    // Answers: Q1 correct (+2), Q2 wrong (−0.5), Q3 correct (+1), Q4 unanswered but marked.
    const [q1, q2, q3, q4] = exam.questions;
    const r = await saveAnswers(principal, {
      attemptId,
      changes: [
        { questionId: q1!.id, selectedOptionId: q1!.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() },
        { questionId: q2!.id, selectedOptionId: q2!.wrongOptionId, markedForReview: false, revision: 1, idempotencyKey: key() },
        { questionId: q3!.id, selectedOptionId: q3!.correctOptionId, markedForReview: true, revision: 1, idempotencyKey: key() },
        { questionId: q4!.id, selectedOptionId: null, markedForReview: true, revision: 1, idempotencyKey: key() },
      ],
    });
    expect(r.results.map((x) => x.status)).toEqual(["SAVED", "SAVED", "SAVED", "SAVED"]);

    // 11:00:00 — official deadline. The scheduler completes and auto-submits.
    clock.set("2026-10-10T05:30:00.000Z");
    await runSchedulerTick(clock.now());

    const [attempt] = await t.db.select().from(candidateAttempts).where(eq(candidateAttempts.id, attemptId));
    expect(attempt!.status).toBe("AUTO_SUBMITTED");
    expect(attempt!.submitReason).toBe("DEADLINE");
    expect(attempt!.submittedAt!.toISOString()).toBe("2026-10-10T05:30:00.000Z");

    // Writes after the deadline are rejected by the server.
    await expect(
      saveAnswers(principal, {
        attemptId,
        changes: [{ questionId: q4!.id, selectedOptionId: q4!.correctOptionId, markedForReview: false, revision: 2, idempotencyKey: key() }],
      }),
    ).rejects.toBeInstanceOf(AppError);

    // Result: +2 +1 positive, −0.5 negative => 2.5 out of max 6.
    const [res] = await t.db.select().from(results).where(eq(results.attemptId, attemptId));
    expect(res).toMatchObject({
      totalQuestions: 4,
      attempted: 3,
      unanswered: 1,
      correct: 2,
      incorrect: 1,
      positiveMarks: 3,
      negativeMarks: 0.5,
      finalScore: 2.5,
      maxScore: 6,
      timeTakenSeconds: 59 * 60,
    });
    expect(res!.sectionScores.map((s) => s.score)).toEqual([1.5, 1]);

    // Visible in the admin results view, ranked.
    const view = await listScheduleResults(schedule.id);
    expect(view.rows[0]).toMatchObject({ rollNumber: cand.rollNumber, rank: 1, attemptStatus: "AUTO_SUBMITTED" });

    // Event trail records every automatic transition.
    const events = await t.db.select().from(examEvents).where(eq(examEvents.scheduleId, schedule.id));
    const transitions = events.filter((e) => e.type === "SCHEDULE_TRANSITION").map((e) => `${e.fromStatus}->${e.toStatus}:${e.actor}`);
    expect(transitions).toEqual([
      "DRAFT->SCHEDULED:ADMIN:" + admin.id,
      "SCHEDULED->PUBLISHED:ADMIN:" + admin.id,
      "PUBLISHED->WAITING:SYSTEM",
      "WAITING->RUNNING:SYSTEM",
      "RUNNING->COMPLETED:SYSTEM",
    ]);
  });

  it("candidate submission is idempotent and a second submit changes nothing", async () => {
    clock.set("2026-10-11T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const schedule = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 1, startsIn: 2 });
    clock.advanceMinutes(2);
    const { principal } = await loginAs(cand);
    const { attemptId } = await startAttempt(principal, { scheduleId: schedule.id, language: "en" });

    const [a, b] = await Promise.all([submitAttempt(principal, attemptId), submitAttempt(principal, attemptId)]);
    expect([a.alreadySubmitted, b.alreadySubmitted].sort()).toEqual([false, true]);
    const subs = await t.db.select().from(submissions).where(eq(submissions.attemptId, attemptId));
    expect(subs).toHaveLength(1);
    expect(a.status).toBe("SUBMITTED");

    // A submitted attempt cannot be reopened.
    await expect(startAttempt(principal, { scheduleId: schedule.id, language: "en" })).rejects.toMatchObject({
      code: "ATTEMPT_SUBMITTED",
    });
    // Deadline processing later does not create a second submission.
    clock.advanceMinutes(120);
    await runSchedulerTick(clock.now());
    expect(await t.db.select().from(submissions).where(eq(submissions.attemptId, attemptId))).toHaveLength(1);
  });
});
