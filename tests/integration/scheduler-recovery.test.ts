import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { candidateAttempts, examEvents, examSchedules, results, submissions } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { saveAnswers, startAttempt } from "@/server/services/attempt-service";
import { reconcileSchedule, runSchedulerTick } from "@/server/services/schedule-engine";
import { adminTransition } from "@/server/services/schedule-service";
import { startScheduler } from "@/server/jobs/scheduler";
import { createTestDb, type TestDb } from "../helpers/db";
import { createAdmin, createCandidateLogin, createPublishedSchedule, createSampleExam, key, loginAs } from "../helpers/fixtures";

describe("durable scheduler", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T03:30:00.000Z");

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
  });
  afterAll(() => t.close());

  async function transitions(scheduleId: string) {
    const rows = await t.db
      .select()
      .from(examEvents)
      .where(and(eq(examEvents.scheduleId, scheduleId), eq(examEvents.type, "SCHEDULE_TRANSITION")));
    return rows.filter((r) => r.actor === "SYSTEM");
  }

  it("never starts the same exam twice under concurrent workers", async () => {
    clock.set("2026-10-10T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 5, startsIn: 10 });
    clock.advanceMinutes(10);
    // Ten "workers" race (embedded scheduler, external scheduler, candidate requests...).
    await Promise.all(Array.from({ length: 10 }, () => runSchedulerTick(clock.now())));
    await Promise.all(Array.from({ length: 10 }, () => reconcileSchedule(s.id, clock.now())));
    const tr = await transitions(s.id);
    expect(tr.map((e) => `${e.fromStatus}->${e.toStatus}`)).toEqual(["PUBLISHED->RUNNING"]);
    const [row] = await t.db.select().from(examSchedules).where(eq(examSchedules.id, s.id));
    expect(row!.status).toBe("RUNNING");
    expect(row!.actualStartAt!.toISOString()).toBe(clock.now().toISOString());
  });

  it("recovers after a restart: overdue start keeps the official end time", async () => {
    clock.set("2026-10-11T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), {
      loginOpensIn: 10,
      startsIn: 20,
      durationMinutes: 60,
    });
    // Server is "down" from before login opens until 15 minutes after the start.
    clock.advanceMinutes(35);
    await runSchedulerTick(clock.now()); // first tick after restart
    const [row] = await t.db.select().from(examSchedules).where(eq(examSchedules.id, s.id));
    expect(row!.status).toBe("RUNNING");
    expect(row!.endAt.toISOString()).toBe(s.endAt.toISOString()); // not extended
    const tr = await transitions(s.id);
    // Catch-up goes straight to the state that is due now.
    expect(tr.map((e) => e.toStatus)).toEqual(["RUNNING"]);
    expect(tr[0]!.payload).toMatchObject({ overdue: true, lagSeconds: 15 * 60 });
  });

  it("recovers after a restart past the deadline: auto-submits with the official timestamp", async () => {
    clock.set("2026-10-12T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 1, startsIn: 2, durationMinutes: 30 });
    clock.advanceMinutes(3);
    await runSchedulerTick(clock.now());
    const { principal } = await loginAs(cand);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    const q = exam.questions[0]!;
    await saveAnswers(principal, {
      attemptId,
      changes: [{ questionId: q.id, selectedOptionId: q.correctOptionId, markedForReview: false, revision: 1, idempotencyKey: key() }],
    });
    // Server crashes and comes back 2 hours later.
    clock.advanceMinutes(120);
    await runSchedulerTick(clock.now());
    const [attempt] = await t.db.select().from(candidateAttempts).where(eq(candidateAttempts.id, attemptId));
    expect(attempt!.status).toBe("AUTO_SUBMITTED");
    expect(attempt!.submittedAt!.toISOString()).toBe(s.endAt.toISOString());
    const [res] = await t.db.select().from(results).where(eq(results.attemptId, attemptId));
    expect(res!.finalScore).toBe(2); // the saved answer was preserved
  });

  it("an exam whose whole window was missed completes without starting", async () => {
    clock.set("2026-10-13T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 5, startsIn: 10, durationMinutes: 30 });
    clock.advanceMinutes(300);
    await runSchedulerTick(clock.now());
    const tr = await transitions(s.id);
    expect(tr.map((e) => `${e.toStatus}:${(e.payload as { reason: string }).reason}`)).toEqual(["COMPLETED:MISSED_WINDOW"]);
  });

  it("a cancelled schedule never starts", async () => {
    clock.set("2026-10-14T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 5, startsIn: 10 });
    await adminTransition(admin, s.id, "CANCEL", "venue unavailable");
    clock.advanceMinutes(15);
    await runSchedulerTick(clock.now());
    const [row] = await t.db.select().from(examSchedules).where(eq(examSchedules.id, s.id));
    expect(row!.status).toBe("CANCELLED");
    expect(row!.actualStartAt).toBeNull();
  });

  it("finalizes attempts left open by a crash between completion and submission", async () => {
    clock.set("2026-10-15T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 1, startsIn: 2, durationMinutes: 10 });
    clock.advanceMinutes(3);
    await runSchedulerTick(clock.now());
    const { principal } = await loginAs(cand);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    // Simulate the crash: schedule marked COMPLETED but the attempt still open.
    await t.db.update(examSchedules).set({ status: "COMPLETED" }).where(eq(examSchedules.id, s.id));
    await runSchedulerTick(clock.now());
    const subs = await t.db.select().from(submissions).where(eq(submissions.attemptId, attemptId));
    expect(subs).toHaveLength(1);
  });

  it("the scheduler loop reconciles on startup without waiting for an interval", async () => {
    clock.set("2026-10-16T03:30:00.000Z");
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 1);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 1, startsIn: 2 });
    clock.advanceMinutes(5);
    const handle = startScheduler({ intervalMs: 60_000, label: "test-scheduler" });
    await new Promise((r) => setTimeout(r, 300));
    await handle.stop();
    const [row] = await t.db.select().from(examSchedules).where(eq(examSchedules.id, s.id));
    expect(row!.status).toBe("RUNNING");
  });
});
