import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { examSections, exams, practiceAttempts, practiceResults, passwordResetTokens } from "@db/schema";
import { clearPaperCache } from "@/server/services/attempt-service";
import { FakeClock } from "@/lib/time/clock";
import { examSchema, categorySchema } from "@/lib/validation/schemas";
import { createCategory, grantEntitlement } from "@/server/services/catalog-service";
import { createExam, getExam, setExamStatus, updateExam } from "@/server/services/exam-service";
import {
  cancelPracticeAttemptForFullscreenExit,
  getLeaderboard,
  getPracticePaper,
  getPracticeResult,
  getPracticeState,
  getStudentAnalytics,
  getStudentHistory,
  listPublicTests,
  savePracticeAnswers,
  startPracticeAttempt,
  submitPracticeAttempt,
  toggleBookmark,
} from "@/server/services/practice-service";
import { setRequireApproval } from "@/server/services/test-schedule-service";
import { loginStudent, registerStudent, requestPasswordReset, resetPassword } from "@/server/services/student-auth-service";
import { resolveStudentSession, type StudentPrincipal } from "@/server/services/session-service";
import { startScheduler } from "@/server/jobs/scheduler";
import { createTestDb, type TestDb } from "../helpers/db";
import { META, createAdmin, createSampleExam, key, type SampleExam } from "../helpers/fixtures";

let seq = 0;
async function student(name = "Test Student"): Promise<StudentPrincipal> {
  const email = `s${++seq}-${Date.now()}@example.com`;
  // Distinct IPs so the per-IP registration rate limit doesn't trip.
  const { token } = await registerStudent({ fullName: name, email, password: "Secret#123", preferredLanguage: "en" }, { ...META, ip: `10.9.0.${seq}` });
  return (await resolveStudentSession(token))!;
}

/** Publish a sample exam as an online mock test. */
async function publish(admin: Awaited<ReturnType<typeof createAdmin>>, exam: SampleExam, extra: Record<string, unknown> = {}) {
  const e = await getExam(exam.examId);
  const slug = `mock-${exam.examId.slice(0, 8)}`;
  await updateExam(
    admin,
    exam.examId,
    examSchema.parse({
      code: e.code,
      examType: e.examType,
      titleEn: e.titleEn,
      titleHi: e.titleHi,
      defaultDurationMinutes: 30,
      slug,
      isPublic: true,
      ...extra,
    }),
  );
  return slug;
}

describe("online mock tests (self-paced)", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T04:30:00.000Z");
  let admin: Awaited<ReturnType<typeof createAdmin>>;

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
    admin = await createAdmin();
    // Start approval is covered in test-schedule.test.ts.
    await setRequireApproval(admin, false);
  });
  afterAll(() => t.close());

  it("student registration, login and single-use password reset", async () => {
    const email = "asha@example.com";
    await registerStudent({ fullName: "Asha Verma", email, password: "Secret#123", preferredLanguage: "hi" }, META);
    await expect(registerStudent({ fullName: "Dup", email: "ASHA@example.com", password: "Secret#123", preferredLanguage: "en" }, META)).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await expect(loginStudent({ email, password: "wrong-pass" }, META)).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    const { token: oldSession } = await loginStudent({ email, password: "Secret#123" }, META);

    // Capture the logged reset link (no mailer configured).
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...a: unknown[]) => void logs.push(a.join(" "));
    await requestPasswordReset(email, META);
    await requestPasswordReset("nobody@example.com", META); // silent, no enumeration
    console.log = orig;
    const link = logs.find((l) => l.includes("reset-password?token="))!;
    const resetToken = link.split("token=")[1]!.trim();
    await resetPassword({ token: resetToken, password: "NewSecret#456" }, META);
    await expect(resetPassword({ token: resetToken, password: "Again#789xx" }, META)).rejects.toMatchObject({ code: "VALIDATION" });
    expect(await resolveStudentSession(oldSession)).toBeNull(); // sessions revoked on reset
    await expect(loginStudent({ email, password: "NewSecret#456" }, META)).resolves.toBeTruthy();
    expect((await t.db.select().from(passwordResetTokens)).every((r) => r.id.length === 64)).toBe(true); // only hashes stored
  });

  it("full flow: start → refresh/resume → autosave → submit → score with explanations → history", async () => {
    const exam = await createSampleExam(admin, 2);
    const slug = await publish(admin, exam);
    expect((await listPublicTests()).some((x) => x.slug === slug)).toBe(true);
    const s = await student();

    const { attemptId, resumed } = await startPracticeAttempt(s, { slug, language: "hi" });
    expect(resumed).toBe(false);
    const paper = await getPracticePaper(s, attemptId);
    expect(paper.timing.remainingSeconds).toBe(30 * 60);
    expect(JSON.stringify(paper)).not.toMatch(/isCorrect|correctOptionIds|explanation/i);

    const [q1, q2, q3] = exam.questions;
    await savePracticeAnswers(s, {
      attemptId,
      changes: [
        { questionId: q1!.id, selectedOptionId: q1!.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() },
        { questionId: q2!.id, selectedOptionId: q2!.wrongOptionId, markedForReview: true, revision: 1, idempotencyKey: key() },
      ],
    });

    // Refresh 10 minutes later: same attempt, answers restored, clock kept running.
    clock.advanceMinutes(10);
    const again = await startPracticeAttempt(s, { slug, language: "en" });
    expect(again).toEqual({ attemptId, resumed: true });
    const state = await getPracticeState(s, attemptId);
    expect(state.timing.remainingSeconds).toBe(20 * 60);
    expect(state.answers).toHaveLength(2);

    await savePracticeAnswers(s, {
      attemptId,
      changes: [{ questionId: q3!.id, selectedOptionId: q3!.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
    });
    const [a, b] = await Promise.all([submitPracticeAttempt(s, attemptId), submitPracticeAttempt(s, attemptId)]);
    expect([a.alreadySubmitted, b.alreadySubmitted].sort()).toEqual([false, true]);
    expect(await t.db.select().from(practiceResults).where(eq(practiceResults.attemptId, attemptId))).toHaveLength(1);

    const result = await getPracticeResult(s, attemptId);
    expect(result.status).toBe("RELEASED");
    if (result.status !== "RELEASED") return;
    // +2 (GI) −0.5 (GI) +1 (GA) = 2.5 / 6
    expect(result.result).toMatchObject({ correct: 2, incorrect: 1, unanswered: 1, finalScore: 2.5, maxScore: 6, accuracy: 66.7 });
    const reviewed = result.solutions.flatMap((x) => x.questions);
    expect(reviewed.find((q) => q.id === q2!.id)).toMatchObject({ outcome: "INCORRECT", correctOptionIds: [q2!.correctOptionId] });

    const history = await getStudentHistory(s);
    expect(history[0]).toMatchObject({ attemptId, status: "SUBMITTED", finalScore: 2.5 });

    // Bookmark a reviewed question.
    expect(await toggleBookmark(s, q2!.id)).toEqual({ bookmarked: true });
    expect(await toggleBookmark(s, q2!.id)).toEqual({ bookmarked: false });
  });

  it("the timer is server-enforced: late saves rejected, durable auto-submit at the deadline", async () => {
    const exam = await createSampleExam(admin, 1);
    const slug = await publish(admin, exam);
    const s = await student();
    const { attemptId } = await startPracticeAttempt(s, { slug, language: "en" });
    const q = exam.questions[0]!;
    await savePracticeAnswers(s, {
      attemptId,
      changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
    });
    clock.advanceMinutes(31);
    // The scheduler loop finalises it without any student request.
    const h = startScheduler({ intervalMs: 60_000, label: "test" });
    await new Promise((r) => setTimeout(r, 300));
    await h.stop();
    const [row] = await t.db.select().from(practiceAttempts).where(eq(practiceAttempts.id, attemptId));
    expect(row).toMatchObject({ status: "AUTO_SUBMITTED", submitReason: "DEADLINE" });
    expect(row!.submittedAt!.toISOString()).toBe(row!.deadlineAt!.toISOString());
    await expect(
      savePracticeAnswers(s, {
        attemptId,
        changes: [{ questionId: q.id, selectedOptionId: q.wrongOptionId, markedForReview: false, revision: 2, idempotencyKey: key() }],
      }),
    ).rejects.toMatchObject({ code: "EXAM_ENDED" });
    const r = await getPracticeResult(s, attemptId);
    expect(r.status === "RELEASED" && r.result.finalScore).toBe(2);
  });

  it("enforces retake limits and one active attempt; concurrent starts converge", async () => {
    const exam = await createSampleExam(admin, 1);
    const slug = await publish(admin, exam, { maxAttempts: 1 });
    const s = await student();
    const starts = await Promise.all(Array.from({ length: 5 }, () => startPracticeAttempt(s, { slug, language: "en" })));
    expect(new Set(starts.map((x) => x.attemptId)).size).toBe(1);
    await submitPracticeAttempt(s, starts[0]!.attemptId);
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("sectional timing: each timed section accepts answers only inside its own window", async () => {
    const exam = await createSampleExam(admin, 1);
    // Section 1 then section 2, 10 minutes each (test duration is 30 min).
    await t.db.update(examSections).set({ timerGroup: "S1", groupMinutes: 10 }).where(eq(examSections.id, exam.sectionIds[0]!));
    await t.db.update(examSections).set({ timerGroup: "S2", groupMinutes: 10 }).where(eq(examSections.id, exam.sectionIds[1]!));
    clearPaperCache();
    const slug = await publish(admin, exam);
    const s = await student();
    const { attemptId } = await startPracticeAttempt(s, { slug, language: "en" });
    const paper = await getPracticePaper(s, attemptId);
    expect(paper.sections.map((x) => [x.timerGroup, x.groupMinutes])).toEqual([
      ["S1", 10],
      ["S2", 10],
    ]);
    const [q1, q2] = [exam.questions.find((q) => q.sectionIndex === 0)!, exam.questions.find((q) => q.sectionIndex === 1)!];
    const save = (q: typeof q1, rev: number) =>
      savePracticeAnswers(s, { attemptId, changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: rev, idempotencyKey: key() }] });

    // Minute 0-10: only section 1 is open.
    expect((await save(q1, 1)).results[0]!.status).toBe("SAVED");
    expect((await save(q2, 1)).results[0]).toMatchObject({ status: "INVALID" });
    // Minute 10-20: section 1 is closed for good, section 2 is open.
    clock.advanceMinutes(11);
    expect((await save(q1, 2)).results[0]).toMatchObject({ status: "INVALID" });
    expect((await save(q2, 2)).results[0]!.status).toBe("SAVED");
    clock.advanceMinutes(10);
    expect((await save(q2, 3)).results[0]).toMatchObject({ status: "INVALID" });
    await submitPracticeAttempt(s, attemptId);
  });

  it("leaving fullscreen cancels the attempt (no result, no used retake) and the test starts afresh", async () => {
    const exam = await createSampleExam(admin, 1);
    const slug = await publish(admin, exam, { maxAttempts: 1 });
    const s = await student();
    const first = await startPracticeAttempt(s, { slug, language: "en" });
    await expect(cancelPracticeAttemptForFullscreenExit(s, first.attemptId)).resolves.toEqual({ slug });
    expect(await t.db.select().from(practiceAttempts).where(eq(practiceAttempts.id, first.attemptId))).toHaveLength(0);
    // A cancelled attempt does not use up the single allowed attempt.
    const second = await startPracticeAttempt(s, { slug, language: "en" });
    expect(second).toMatchObject({ resumed: false });
    expect(second.attemptId).not.toBe(first.attemptId);
    // Submitted attempts and other students' attempts cannot be cancelled.
    await expect(cancelPracticeAttemptForFullscreenExit(await student(), second.attemptId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await submitPracticeAttempt(s, second.attemptId);
    await expect(cancelPracticeAttemptForFullscreenExit(s, second.attemptId)).rejects.toMatchObject({ code: "ATTEMPT_SUBMITTED" });
  });

  it("delayed result release hides scores and solutions until the release time", async () => {
    const exam = await createSampleExam(admin, 1);
    const release = new Date(clock.now().getTime() + 2 * 3600_000);
    const ist = new Date(release.getTime() + 5.5 * 3600_000).toISOString().slice(0, 16);
    const slug = await publish(admin, exam, { resultPolicy: "AT_TIME", resultReleaseAt: ist });
    const s = await student();
    const { attemptId } = await startPracticeAttempt(s, { slug, language: "en" });
    await submitPracticeAttempt(s, attemptId);
    const before = await getPracticeResult(s, attemptId);
    expect(before.status).toBe("PENDING_RELEASE");
    expect(JSON.stringify(before)).not.toMatch(/finalScore|correctOptionIds|explanation/);
    expect((await getStudentAnalytics(s)).summary.testsAttempted).toBe(0); // not leaked via analytics
    expect((await getLeaderboard(exam.examId)).released).toBe(false);
    clock.advanceMinutes(121);
    expect((await getPracticeResult(s, attemptId)).status).toBe("RELEASED");
  });

  it("premium tests require an entitlement", async () => {
    const exam = await createSampleExam(admin, 1);
    const slug = await publish(admin, exam, { accessLevel: "PREMIUM" });
    const s = await student();
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await grantEntitlement(admin, { email: s.email, examId: exam.examId, seriesId: null, validDays: 30 });
    await expect(startPracticeAttempt(s, { slug, language: "en" })).resolves.toMatchObject({ resumed: false });
    // Unpublished tests are invisible.
    await t.db.update(exams).set({ isPublic: false }).where(eq(exams.id, exam.examId));
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("leaderboard ranks first attempts by score then time, with shared ranks for exact ties", async () => {
    const exam = await createSampleExam(admin, 1); // 2 questions: +2/−0.5 and +1/−0.25
    const slug = await publish(admin, exam);
    const [q1, q2] = exam.questions;
    const run = async (s: StudentPrincipal, picks: (string | null)[], minutes: number) => {
      const { attemptId } = await startPracticeAttempt(s, { slug, language: "en" });
      const changes = [q1!, q2!].map((q, i) => ({ questionId: q.id, selectedOptionId: picks[i]!, markedForReview: false, revision: 1, idempotencyKey: key() }));
      await savePracticeAnswers(s, { attemptId, changes });
      clock.advanceMinutes(minutes);
      await submitPracticeAttempt(s, attemptId);
      clock.advanceMinutes(-minutes);
    };
    const [a, b, c, d] = [await student("A"), await student("B"), await student("C"), await student("D")];
    await run(a, [q1!.correctOptionId, q2!.correctOptionId], 10); // 3, 10 min
    await run(b, [q1!.correctOptionId, q2!.correctOptionId], 5); // 3, 5 min  -> rank 1
    await run(c, [q1!.correctOptionId, q2!.correctOptionId], 10); // 3, 10 min -> ties with A
    await run(d, [q1!.wrongOptionId, null], 1); // −0.5
    await run(d, [q1!.correctOptionId, q2!.correctOptionId], 1); // 2nd attempt ignored
    const lb = await getLeaderboard(exam.examId, a.studentId);
    expect(lb.cohort).toBe(4);
    expect(lb.rows.map((r) => [r.rank, r.score])).toEqual([
      [1, 3],
      [2, 3],
      [2, 3],
      [4, -0.5],
    ]);
    expect(lb.viewer).toMatchObject({ rank: 2, isViewer: true });
  });

  it("analytics are computed from stored results: averages, accuracy and weak topics", async () => {
    const exam = await createSampleExam(admin, 2);
    const slug = await publish(admin, exam);
    const s = await student();
    const { attemptId } = await startPracticeAttempt(s, { slug, language: "en" });
    // Reasoning section: both wrong; GA section: both right.
    const changes = exam.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: q.sectionIndex === 0 ? q.wrongOptionId : q.correctOptionId,
      markedForReview: false,
      revision: 1,
      idempotencyKey: key(),
    }));
    await savePracticeAnswers(s, { attemptId, changes });
    await submitPracticeAttempt(s, attemptId);
    const an = await getStudentAnalytics(s);
    // score: −0.5 −0.5 +1 +1 = 1 of 6 → 16.7 %
    expect(an.summary).toMatchObject({ testsAttempted: 1, averageScorePct: 16.7, bestScorePct: 16.7, accuracyPct: 50 });
    expect(an.weakTopics.map((w) => w.topic)).toEqual(["Reasoning"]);
    expect(an.sections.find((x) => x.section === "General Awareness")?.accuracyPct).toBe(100);
  });

  it("no publish step: a new exam is visible to students as soon as it has questions", async () => {
    const empty = await createExam(admin, examSchema.parse({ code: `AUTO-${Date.now()}`, examType: "SSC_CGL", titleEn: "SSC CGL Auto Mock", defaultDurationMinutes: 20 }));
    const e = await getExam(empty.id);
    expect(e.slug).toMatch(/^ssc-cgl-auto-mock(-\d+)?$/); // generated from the title
    expect(e.isPublic).toBe(true);
    expect((await listPublicTests()).some((x) => x.id === empty.id)).toBe(false); // no questions yet

    const exam = await createSampleExam(admin, 1); // fixture marks READY; set back to DRAFT to prove READY is not required
    await setExamStatus(admin, exam.examId, "DRAFT");
    const listed = (await listPublicTests()).find((x) => x.id === exam.examId);
    expect(listed).toBeTruthy();
    const s = await student();
    await expect(startPracticeAttempt(s, { slug: listed!.slug!, language: "en" })).resolves.toMatchObject({ resumed: false });

    await setExamStatus(admin, exam.examId, "ARCHIVED");
    expect((await listPublicTests()).some((x) => x.id === exam.examId)).toBe(false);
  });

  it("categories are configurable", async () => {
    await createCategory(admin, categorySchema.parse({ slug: "ssc-gd", nameEn: "SSC GD", nameHi: "एसएससी जीडी" }));
    await expect(createCategory(admin, categorySchema.parse({ slug: "ssc-gd", nameEn: "dup" }))).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
