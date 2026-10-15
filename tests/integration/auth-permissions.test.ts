import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { FakeClock, setClock } from "@/lib/time/clock";
import { clearAllRateLimits } from "@/lib/security/rate-limit";
import { examSchema } from "@/lib/validation/schemas";
import { createAdminUser, loginAdmin, loginCandidate, setupInitialAdmin, countUsers } from "@/server/services/auth-service";
import { updateCandidate } from "@/server/services/candidate-service";
import { createExam } from "@/server/services/exam-service";
import { exportScheduleResultsCsv } from "@/server/services/results-service";
import { createBackupAudited } from "@/server/services/backup-service";
import { resolveAdminSession, resolveCandidateSession, ADMIN_IDLE_TIMEOUT_SECONDS } from "@/server/services/session-service";
import { createTestDb, type TestDb } from "../helpers/db";
import { META, createAdmin, createCandidateLogin } from "../helpers/fixtures";

describe("authentication and authorization", () => {
  let t: TestDb;
  beforeAll(async () => {
    t = await createTestDb();
  });
  afterAll(() => t.close());
  afterEach(() => {
    setClock(null);
    clearAllRateLimits();
  });

  it("initial setup requires the setup token and works only once", async () => {
    process.env.SETUP_TOKEN = "one-time-setup-token";
    expect(await countUsers()).toBe(0);
    await expect(
      setupInitialAdmin({ token: "wrong", username: "root", fullName: "Root", password: "Sup3rSecret!" }, META),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await setupInitialAdmin({ token: "one-time-setup-token", username: "root", fullName: "Root", password: "Sup3rSecret!" }, META);
    await expect(
      setupInitialAdmin({ token: "one-time-setup-token", username: "root2", fullName: "Root", password: "Sup3rSecret!" }, META),
    ).rejects.toMatchObject({ code: "SETUP_DISABLED" });
    delete process.env.SETUP_TOKEN;
  });

  it("admin login succeeds with the right password and resolves a session", async () => {
    const { token } = await loginAdmin({ username: "ROOT", password: "Sup3rSecret!" }, META);
    const p = await resolveAdminSession(token);
    expect(p).toMatchObject({ username: "root", role: "SUPER_ADMIN" });
  });

  it("admin login rejects bad passwords and rate-limits brute force", async () => {
    for (let i = 0; i < 8; i++) {
      await expect(loginAdmin({ username: "root", password: "nope" }, META)).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    }
    await expect(loginAdmin({ username: "root", password: "Sup3rSecret!" }, META)).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });

  it("admin sessions expire after idle timeout", async () => {
    const clock = new FakeClock("2026-10-10T03:30:00.000Z").install();
    const { token } = await loginAdmin({ username: "root", password: "Sup3rSecret!" }, META);
    expect(await resolveAdminSession(token)).not.toBeNull();
    clock.advanceSeconds(ADMIN_IDLE_TIMEOUT_SECONDS + 1);
    expect(await resolveAdminSession(token)).toBeNull();
  });

  it("deactivated candidates cannot log in and lose existing sessions", async () => {
    const admin = await createAdmin();
    const c = await createCandidateLogin(admin);
    const { token } = await loginCandidate({ rollNumber: c.rollNumber.toLowerCase(), password: c.password }, META);
    expect(await resolveCandidateSession(token)).not.toBeNull();
    await updateCandidate(admin, c.id, { isActive: false });
    expect(await resolveCandidateSession(token)).toBeNull();
    await expect(loginCandidate({ rollNumber: c.rollNumber, password: c.password }, META)).rejects.toMatchObject({
      code: "NOT_ELIGIBLE",
    });
  });

  it("password reset generates a new password and invalidates the old one", async () => {
    const admin = await createAdmin();
    const c = await createCandidateLogin(admin);
    const { generatedPassword } = await updateCandidate(admin, c.id, { resetPassword: true });
    expect(generatedPassword).toMatch(/^[A-Za-z0-9]{8}$/);
    await expect(loginCandidate({ rollNumber: c.rollNumber, password: c.password }, META)).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
    await expect(loginCandidate({ rollNumber: c.rollNumber, password: generatedPassword! }, META)).resolves.toBeTruthy();
  });

  it("services enforce role permissions regardless of the caller", async () => {
    const invigilator = await createAdmin("INVIGILATOR");
    const viewer = await createAdmin("RESULT_VIEWER");
    const examAdmin = await createAdmin("EXAM_ADMIN");
    const exam = examSchema.parse({ code: "PERM1", examType: "SSC_CGL", titleEn: "P", defaultDurationMinutes: 60 });

    await expect(createExam(invigilator, exam)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(createExam(viewer, exam)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(createExam(examAdmin, exam)).resolves.toBeTruthy();
    await expect(createBackupAudited(examAdmin)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      createAdminUser(examAdmin, { username: "x1", fullName: "X", password: "Long-enough-1", roleCode: "SUPER_ADMIN" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    // Candidates are never authorized for admin operations.
    await expect(createExam({ type: "CANDIDATE", id: "c" }, exam)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(exportScheduleResultsCsv(invigilator, "00000000-0000-4000-8000-000000000000")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
