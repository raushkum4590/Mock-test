import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { candidateAnswers, examSchedules } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import {
  getAttemptAnswers,
  getAttemptPaper,
  getCandidateExamState,
  saveAnswers,
  startAttempt,
  submitAttempt,
} from "@/server/services/attempt-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { adminTransition, setAssignmentWorkstation, listAssignments } from "@/server/services/schedule-service";
import { createWorkstation } from "@/server/services/candidate-service";
import { workstationSchema } from "@/lib/validation/schemas";
import { resolveCandidateSession } from "@/server/services/session-service";
import { createTestDb, type TestDb } from "../helpers/db";
import { createAdmin, createCandidateLogin, createPublishedSchedule, createSampleExam, key, loginAs } from "../helpers/fixtures";

describe("candidate runtime", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T03:30:00.000Z");
  let day = 0;

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
  });
  afterAll(() => t.close());

  /** Fresh running exam with `n` candidates, 10:00 IST start, 60 min, 15 min late entry. */
  async function runningExam(n = 1, opts: { allowPause?: boolean } = {}) {
    clock.set(new Date(Date.UTC(2026, 9, 20 + day++, 3, 30)));
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 2);
    const cands = [];
    for (let i = 0; i < n; i++) cands.push(await createCandidateLogin(admin));
    const s = await createPublishedSchedule(admin, exam.examId, cands.map((c) => c.id), clock.now(), {
      loginOpensIn: 10,
      startsIn: 30,
      durationMinutes: 60,
      lateEntryMinutes: 15,
      ...opts,
    });
    clock.advanceMinutes(30);
    await runSchedulerTick(clock.now());
    return { admin, exam, cands, s };
  }

  it("late arrival: allowed inside the window with only the remaining time, refused after", async () => {
    const { s, cands } = await runningExam(2);
    clock.advanceMinutes(10); // 10 minutes late
    const late = await loginAs(cands[0]!);
    const { attemptId } = await startAttempt(late.principal, { scheduleId: s.id, language: "en" });
    const paper = await getAttemptPaper(late.principal, attemptId);
    expect(paper.timing.remainingSeconds).toBe(50 * 60); // not a fresh 60 minutes

    clock.advanceMinutes(6); // 16 minutes after start: window closed
    const tooLate = await loginAs(cands[1]!);
    await expect(startAttempt(tooLate.principal, { scheduleId: s.id, language: "en" })).rejects.toMatchObject({
      code: "LATE_ENTRY_CLOSED",
    });
  });

  it("reconnect: an existing attempt resumes after the late window with answers intact", async () => {
    const { s, cands, exam } = await runningExam(1);
    const first = await loginAs(cands[0]!);
    const { attemptId } = await startAttempt(first.principal, { scheduleId: s.id, language: "en" });
    const q = exam.questions[0]!;
    await saveAnswers(first.principal, {
      attemptId,
      changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
    });
    clock.advanceMinutes(40); // PC failure; candidate moves to another PC
    const second = await loginAs(cands[0]!);
    const again = await startAttempt(second.principal, { scheduleId: s.id, language: "en" });
    expect(again).toEqual({ attemptId, resumed: true });
    const paper = await getAttemptPaper(second.principal, attemptId);
    expect(paper.answers).toEqual([{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1 }]);
    expect(paper.timing.remainingSeconds).toBe(20 * 60);
  });

  it("concurrent start requests create a single attempt", async () => {
    const { s, cands } = await runningExam(1);
    const { principal } = await loginAs(cands[0]!);
    const all = await Promise.all(Array.from({ length: 5 }, () => startAttempt(principal, { scheduleId: s.id, language: "en" })));
    expect(new Set(all.map((a) => a.attemptId)).size).toBe(1);
  });

  it("answer revisions: duplicates are acknowledged, stale writes are rejected with server state", async () => {
    const { s, cands, exam } = await runningExam(1);
    const { principal } = await loginAs(cands[0]!);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    const q = exam.questions[0]!;
    const k1 = key();
    const change1 = { questionId: q.id, selectedOptionId: q.wrongOptionId, markedForReview: false, revision: 1, idempotencyKey: k1 };
    expect((await saveAnswers(principal, { attemptId, changes: [change1] })).results[0]!.status).toBe("SAVED");
    // Network retry of the same request.
    expect((await saveAnswers(principal, { attemptId, changes: [change1] })).results[0]!.status).toBe("DUPLICATE");
    // Newer revision wins.
    const change2 = { ...change1, selectedOptionId: q.correctOptionId, revision: 2, idempotencyKey: key() };
    expect((await saveAnswers(principal, { attemptId, changes: [change2] })).results[0]!.status).toBe("SAVED");
    // An older change arriving late (out-of-order retry) must not overwrite it.
    const late = await saveAnswers(principal, { attemptId, changes: [{ ...change1, idempotencyKey: key() }] });
    expect(late.results[0]).toMatchObject({ status: "STALE", server: { selectedOptionId: q.correctOptionId, revision: 2 } });
    const rows = await t.db.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.selectedOptionId).toBe(q.correctOptionId);
    // Clear response.
    await saveAnswers(principal, { attemptId, changes: [{ ...change2, selectedOptionId: null, revision: 3, idempotencyKey: key() }] });
    const state = await getAttemptAnswers(principal, attemptId);
    expect(state.answers[0]).toMatchObject({ selectedOptionId: null, revision: 3 });
  });

  it("rejects options from other questions and questions from other exams", async () => {
    const { s, cands, exam } = await runningExam(1);
    const { principal } = await loginAs(cands[0]!);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    const [q1, q2] = exam.questions;
    const r = await saveAnswers(principal, {
      attemptId,
      changes: [
        { questionId: q1!.id, selectedOptionId: q2!.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() },
        { questionId: "00000000-0000-4000-8000-000000000000", selectedOptionId: null, markedForReview: false, revision: 1, idempotencyKey: key() },
      ],
    });
    expect(r.results.map((x) => x.status)).toEqual(["INVALID", "INVALID"]);
  });

  it("prevents candidate ID substitution: another candidate's attempt and schedule are invisible", async () => {
    const { s, cands, exam } = await runningExam(2);
    const a = await loginAs(cands[0]!);
    const b = await loginAs(cands[1]!);
    const { attemptId } = await startAttempt(a.principal, { scheduleId: s.id, language: "en" });
    await expect(getAttemptPaper(b.principal, attemptId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(submitAttempt(b.principal, attemptId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    const q = exam.questions[0]!;
    await expect(
      saveAnswers(b.principal, {
        attemptId,
        changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    // A candidate not assigned to a schedule cannot see it at all.
    const other = await runningExam(1);
    const outsider = await loginAs(other.cands[0]!);
    await expect(getCandidateExamState(outsider.principal, s.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("emergency hold freezes the clock, blocks answers and extends the deadline on resume", async () => {
    const { s, cands, exam, admin } = await runningExam(1, { allowPause: true });
    const { principal } = await loginAs(cands[0]!);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    clock.advanceMinutes(20);
    await adminTransition(admin, s.id, "PAUSE", "power failure in lab 2");
    const q = exam.questions[0]!;
    await expect(
      saveAnswers(principal, {
        attemptId,
        changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
      }),
    ).rejects.toMatchObject({ code: "EXAM_PAUSED" });

    clock.advanceMinutes(10);
    let state = await getCandidateExamState(principal, s.id);
    expect(state.timing.status).toBe("PAUSED");
    expect(state.timing.remainingSeconds).toBe(40 * 60); // frozen
    // The original deadline passes while paused: the exam must NOT complete.
    clock.advanceMinutes(40);
    await runSchedulerTick(clock.now());
    state = await getCandidateExamState(principal, s.id);
    expect(state.timing.status).toBe("PAUSED");

    await adminTransition(admin, s.id, "RESUME", null);
    const [row] = await t.db.select().from(examSchedules).where(eq(examSchedules.id, s.id));
    expect(row!.totalPausedSeconds).toBe(50 * 60);
    expect(row!.endAt.getTime() - s.endAt.getTime()).toBe(50 * 60 * 1000);
    state = await getCandidateExamState(principal, s.id);
    expect(state.timing.remainingSeconds).toBe(40 * 60);
  });

  it("an invigilator cannot pause when the schedule disallows it, and needs a reason", async () => {
    const { s, admin } = await runningExam(1, { allowPause: false });
    await expect(adminTransition(admin, s.id, "PAUSE", "x")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(adminTransition(admin, s.id, "END", null)).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("workstation enforcement: login from the wrong PC cannot start the exam", async () => {
    const { s, cands, admin } = await runningExam(1);
    const ws = await createWorkstation(admin, workstationSchema.parse({ code: `PC-${Date.now()}` }));
    await t.db.update(examSchedules).set({ enforceWorkstation: true }).where(eq(examSchedules.id, s.id));
    const [assignment] = await listAssignments(s.id);
    await setAssignmentWorkstation(admin, assignment!.id, ws.id);
    const wrong = await loginAs(cands[0]!, "PC-OTHER");
    await expect(startAttempt(wrong.principal, { scheduleId: s.id, language: "en" })).rejects.toMatchObject({
      code: "WORKSTATION_MISMATCH",
    });
    const wsCode = (await listAssignments(s.id))[0]!.workstationCode!;
    const right = await loginAs(cands[0]!, wsCode);
    await expect(startAttempt(right.principal, { scheduleId: s.id, language: "en" })).resolves.toMatchObject({ resumed: false });
  });

  it("a new login ends the previous session (one active session per candidate)", async () => {
    const { cands } = await runningExam(1);
    const first = await loginAs(cands[0]!);
    await loginAs(cands[0]!);
    expect(await resolveCandidateSession(first.token)).toBeNull();
  });
});
