import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { testScheduleRequests } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { examSchema } from "@/lib/validation/schemas";
import { getExam, updateExam } from "@/server/services/exam-service";
import { startPracticeAttempt } from "@/server/services/practice-service";
import { registerStudent } from "@/server/services/student-auth-service";
import { resolveStudentSession, type StudentPrincipal } from "@/server/services/session-service";
import {
  cancelTestSchedule,
  getRequireApproval,
  getStudentRequestForExam,
  listScheduleRequests,
  requestTestSchedule,
  reviewScheduleRequest,
  setRequireApproval,
  START_WINDOW_MINUTES,
} from "@/server/services/test-schedule-service";
import { createTestDb, type TestDb } from "../helpers/db";
import { META, createAdmin, createSampleExam } from "../helpers/fixtures";

let seq = 0;
async function student(): Promise<StudentPrincipal> {
  const { token } = await registerStudent(
    { fullName: "Sched Student", email: `sched${++seq}@example.com`, password: "Secret#123", preferredLanguage: "en" },
    { ...META, ip: `10.8.0.${seq}` },
  );
  return (await resolveStudentSession(token))!;
}

describe("student-scheduled tests need admin approval to start", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T04:30:00.000Z");
  let admin: Awaited<ReturnType<typeof createAdmin>>;
  let examId: string;
  let slug: string;

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
    admin = await createAdmin();
    const exam = await createSampleExam(admin, 2);
    const e = await getExam(exam.examId);
    examId = exam.examId;
    slug = `sched-${examId.slice(0, 8)}`;
    await updateExam(admin, examId, examSchema.parse({ code: e.code, examType: e.examType, titleEn: e.titleEn, titleHi: e.titleHi, defaultDurationMinutes: 30, slug, isPublic: true }));
  });
  afterAll(() => t.close());

  const inMinutes = (m: number) => new Date(clock.now().getTime() + m * 60_000);

  it("approval is off by default; once turned on, starting without it is refused", async () => {
    expect(await getRequireApproval()).toBe(false);
    await setRequireApproval(admin, true);
    expect(await getRequireApproval()).toBe(true);
    const s = await student();
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "EXAM_NOT_OPEN" });
  });

  it("pending → approved (moved time) → start only inside the window → USED", async () => {
    const s = await student();
    const req = await requestTestSchedule(s, { examId, startAt: inMinutes(60), note: "after class" });
    expect(req.status).toBe("PENDING");
    // One open request per test.
    await expect(requestTestSchedule(s, { examId, startAt: inMinutes(90) })).rejects.toMatchObject({ code: "CONFLICT" });
    // Pending is not enough.
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "EXAM_NOT_OPEN" });
    expect((await listScheduleRequests({ status: "PENDING" })).some((r) => r.id === req.id)).toBe(true);

    const approved = await reviewScheduleRequest(admin, req.id, { decision: "APPROVE", startAt: inMinutes(30) });
    expect(approved.status).toBe("APPROVED");
    await expect(reviewScheduleRequest(admin, req.id, { decision: "REJECT", note: "x" })).rejects.toMatchObject({ code: "CONFLICT" });

    // Before the approved time: still refused.
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "EXAM_NOT_OPEN" });
    clock.advanceMinutes(31);
    const { attemptId, resumed } = await startPracticeAttempt(s, { slug, language: "en" });
    expect(resumed).toBe(false);
    const [row] = await t.db.select().from(testScheduleRequests).where(eq(testScheduleRequests.id, req.id));
    expect(row).toMatchObject({ status: "USED", attemptId });
    // Resuming the running attempt needs no new approval.
    await expect(startPracticeAttempt(s, { slug, language: "en" })).resolves.toEqual({ attemptId, resumed: true });
  });

  it("an approval that is not used in time expires and the student can schedule again", async () => {
    const s = await student();
    const req = await requestTestSchedule(s, { examId, startAt: inMinutes(10) });
    await reviewScheduleRequest(admin, req.id, { decision: "APPROVE" });
    clock.advanceMinutes(10 + START_WINDOW_MINUTES + 1);
    await expect(startPracticeAttempt(s, { slug, language: "en" })).rejects.toMatchObject({ code: "EXAM_NOT_OPEN" });
    expect((await getStudentRequestForExam(s.studentId, examId))?.status).toBe("EXPIRED");
    await expect(requestTestSchedule(s, { examId, startAt: inMinutes(5) })).resolves.toMatchObject({ status: "PENDING" });
  });

  it("rejection needs a reason; students can cancel; past times are refused", async () => {
    const s = await student();
    await expect(requestTestSchedule(s, { examId, startAt: inMinutes(-60) })).rejects.toMatchObject({ code: "VALIDATION" });
    const req = await requestTestSchedule(s, { examId, startAt: inMinutes(15) });
    await expect(reviewScheduleRequest(admin, req.id, { decision: "REJECT" })).rejects.toMatchObject({ code: "VALIDATION" });
    await reviewScheduleRequest(admin, req.id, { decision: "REJECT", note: "Slot full, pick tomorrow" });
    expect((await getStudentRequestForExam(s.studentId, examId))).toMatchObject({ status: "REJECTED", adminNote: "Slot full, pick tomorrow" });

    const again = await requestTestSchedule(s, { examId, startAt: inMinutes(20) });
    await cancelTestSchedule(s, again.id);
    await expect(cancelTestSchedule(s, again.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("only staff with students.manage can review or change the rule; turning it off allows direct starts", async () => {
    const viewer = await createAdmin("RESULT_VIEWER");
    const s = await student();
    const req = await requestTestSchedule(s, { examId, startAt: inMinutes(15) });
    await expect(reviewScheduleRequest(viewer, req.id, { decision: "APPROVE" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(setRequireApproval(viewer, false)).rejects.toMatchObject({ code: "FORBIDDEN" });

    await setRequireApproval(admin, false);
    await expect(startPracticeAttempt(s, { slug, language: "en" })).resolves.toMatchObject({ resumed: false });
    await setRequireApproval(admin, true);
  });
});
