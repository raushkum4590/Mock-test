import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { candidateAnswers, candidateAttempts, examEvents, examPhotos, examSchedules, examViolations, submissions } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { saveAnswers, startAttempt, submitAttempt } from "@/server/services/attempt-service";
import { loginCandidate } from "@/server/services/auth-service";
import { setPhotoUploader } from "@/server/services/photo-storage";
import { capturePreLoginPhoto, captureAttemptPhoto, reportViolation } from "@/server/services/proctoring-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { createTestDb, type TestDb } from "../helpers/db";
import { META, createAdmin, createCandidateLogin, createPublishedSchedule, createSampleExam, loginAs } from "../helpers/fixtures";

// A small but valid-looking JPEG (FF D8 FF header, > 1 KB).
const JPEG = `data:image/jpeg;base64,${Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000, 1)]).toString("base64")}`;
let uploads = 0;

describe("proctoring: photos, violations and auto-submit", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T03:30:00.000Z");
  let admin: Awaited<ReturnType<typeof createAdmin>>;

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
    admin = await createAdmin();
    setPhotoUploader(async (jpeg) => ({ storageKey: `test/${++uploads}`, url: `https://example.invalid/${uploads}.jpg`, bytes: jpeg.length }));
  });
  afterAll(async () => {
    setPhotoUploader(null);
    await t.close();
  });

  async function sitting(policy: Partial<typeof examSchedules.$inferInsert>) {
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const schedule = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 0, startsIn: 1 });
    await t.db.update(examSchedules).set(policy).where(eq(examSchedules.id, schedule.id));
    return { cand, schedule };
  }

  it("rejects non-JPEG uploads", async () => {
    await expect(capturePreLoginPhoto("data:image/png;base64,AAAA", META)).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(capturePreLoginPhoto(`data:image/jpeg;base64,${Buffer.alloc(2000, 1).toString("base64")}`, META)).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("requires a fresh pre-login photo when the sitting needs one, and links it on login (single use)", async () => {
    const { cand, schedule } = await sitting({ requirePhoto: true });
    await expect(loginCandidate(cand, META)).rejects.toMatchObject({ code: "VALIDATION", details: { needPhoto: true } });

    const { captureToken } = await capturePreLoginPhoto(JPEG, META);
    await loginCandidate(cand, META, captureToken);
    const [ph] = await t.db.select().from(examPhotos).where(eq(examPhotos.candidateId, cand.id));
    expect(ph).toMatchObject({ kind: "LOGIN", scheduleId: schedule.id, captureToken: null });

    // The token was consumed: logging in again needs a new photo.
    await expect(loginCandidate(cand, META, captureToken)).rejects.toMatchObject({ details: { needPhoto: true } });

    // A photo older than the allowed window is not accepted.
    const old = await capturePreLoginPhoto(JPEG, META);
    clock.advanceMinutes(31);
    await expect(loginCandidate(cand, META, old.captureToken)).rejects.toMatchObject({ details: { needPhoto: true } });
  });

  it("sittings without the photo rule log in as before", async () => {
    const { cand } = await sitting({ requirePhoto: false });
    await expect(loginCandidate(cand, META)).resolves.toMatchObject({ token: expect.any(String) });
  });

  it("counts violations (deduplicating bursts), alerts at the limit and auto-submits when configured", async () => {
    const { cand, schedule } = await sitting({ requireFullscreen: true, violationLimit: 2, autoSubmitOnViolations: true });
    clock.advanceMinutes(2);
    await runSchedulerTick(clock.now());
    const p = (await loginAs(cand)).principal;
    const { attemptId } = await startAttempt(p, { scheduleId: schedule.id, language: "en" });

    expect(await reportViolation(p, attemptId, "FULLSCREEN_EXIT")).toMatchObject({ counted: true, count: 1, limit: 2, autoSubmitted: false });
    // Same type again within 3 s: not counted twice.
    expect(await reportViolation(p, attemptId, "FULLSCREEN_EXIT")).toMatchObject({ counted: false, count: 1 });
    clock.advanceSeconds(5);
    expect(await reportViolation(p, attemptId, "TAB_HIDDEN")).toMatchObject({ counted: true, count: 2, autoSubmitted: true });

    const [a] = await t.db.select().from(candidateAttempts).where(eq(candidateAttempts.id, attemptId));
    expect(a).toMatchObject({ status: "AUTO_SUBMITTED", submitReason: "VIOLATION", violationCount: 2 });
    const [sub] = await t.db.select().from(submissions).where(eq(submissions.attemptId, attemptId));
    expect(sub!.reason).toBe("VIOLATION");
    const events = await t.db.select().from(examEvents).where(eq(examEvents.attemptId, attemptId));
    expect(events.map((e) => e.type)).toEqual(expect.arrayContaining(["VIOLATION", "VIOLATION_LIMIT_REACHED", "ATTEMPT_AUTO_SUBMITTED"]));
    expect(await t.db.select().from(examViolations).where(eq(examViolations.attemptId, attemptId))).toHaveLength(2);
    // After submission further reports change nothing.
    expect(await reportViolation(p, attemptId, "CAMERA_OFF")).toMatchObject({ counted: false, autoSubmitted: true });
  });

  it("leaving fullscreen restarts the paper: answers are wiped, the attempt and evidence are kept", async () => {
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const schedule = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 0, startsIn: 1 });
    await t.db.update(examSchedules).set({ requireFullscreen: true, violationLimit: 0 }).where(eq(examSchedules.id, schedule.id));
    clock.advanceMinutes(2);
    await runSchedulerTick(clock.now());
    const p = (await loginAs(cand)).principal;
    const { attemptId } = await startAttempt(p, { scheduleId: schedule.id, language: "en" });
    const q = exam.questions[0]!;
    await saveAnswers(p, { attemptId, changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: "fs-1" }] });
    expect(await t.db.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId))).toHaveLength(1);

    expect(await reportViolation(p, attemptId, "FULLSCREEN_EXIT")).toMatchObject({ counted: true, autoSubmitted: false, answersReset: true });
    expect(await t.db.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId))).toHaveLength(0);
    const [a] = await t.db.select().from(candidateAttempts).where(eq(candidateAttempts.id, attemptId));
    expect(a).toMatchObject({ status: "IN_PROGRESS", violationCount: 1 });
    // Resuming gives an empty paper; other violation types do not wipe answers.
    await expect(startAttempt(p, { scheduleId: schedule.id, language: "en" })).resolves.toMatchObject({ attemptId, resumed: true });
    await saveAnswers(p, { attemptId, changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: "fs-2" }] });
    expect(await reportViolation(p, attemptId, "TAB_HIDDEN")).toMatchObject({ counted: true, answersReset: false });
    expect(await t.db.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId))).toHaveLength(1);
  });

  it("alert-only policy keeps the exam running past the limit", async () => {
    const { cand, schedule } = await sitting({ violationLimit: 1, autoSubmitOnViolations: false });
    clock.advanceMinutes(2);
    await runSchedulerTick(clock.now());
    const p = (await loginAs(cand)).principal;
    const { attemptId } = await startAttempt(p, { scheduleId: schedule.id, language: "en" });
    expect(await reportViolation(p, attemptId, "CAMERA_OFF")).toMatchObject({ count: 1, autoSubmitted: false });
    const [a] = await t.db.select().from(candidateAttempts).where(eq(candidateAttempts.id, attemptId));
    expect(a!.status).toBe("IN_PROGRESS");
  });

  it("stores one START photo during the exam and one END photo only after submission", async () => {
    const { cand, schedule } = await sitting({ cameraMonitoring: true });
    clock.advanceMinutes(2);
    await runSchedulerTick(clock.now());
    const p = (await loginAs(cand)).principal;
    const { attemptId } = await startAttempt(p, { scheduleId: schedule.id, language: "en" });

    await expect(captureAttemptPhoto(p, attemptId, "END", JPEG)).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await captureAttemptPhoto(p, attemptId, "START", JPEG)).toMatchObject({ duplicate: false });
    expect(await captureAttemptPhoto(p, attemptId, "START", JPEG)).toMatchObject({ duplicate: true });
    await submitAttempt(p, attemptId);
    await expect(captureAttemptPhoto(p, attemptId, "START", JPEG)).rejects.toMatchObject({ code: "ATTEMPT_SUBMITTED" });
    expect(await captureAttemptPhoto(p, attemptId, "END", JPEG)).toMatchObject({ duplicate: false });

    const photos = await t.db.select().from(examPhotos).where(eq(examPhotos.attemptId, attemptId));
    expect(photos.map((x) => x.kind).sort()).toEqual(["END", "START"]);

    // Another candidate cannot use this attempt id.
    const other = await createCandidateLogin(admin);
    const op = (await loginAs(other)).principal;
    await expect(captureAttemptPhoto(op, attemptId, "END", JPEG)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(reportViolation(op, attemptId, "TAB_HIDDEN")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
