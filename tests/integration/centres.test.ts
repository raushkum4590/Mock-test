import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { examAssignments, workstations } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { centreSchema, workstationSchema } from "@/lib/validation/schemas";
import { startAttempt, submitAttempt } from "@/server/services/attempt-service";
import { createWorkstation, importCandidatesCsv, listCandidates, updateCandidate } from "@/server/services/candidate-service";
import { createCentre, getAttendance, listCentres, setCentreActive, setWorkstationCentre } from "@/server/services/centre-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { createTestDb, type TestDb } from "../helpers/db";
import { createAdmin, createCandidateLogin, createPublishedSchedule, createSampleExam, loginAs } from "../helpers/fixtures";

describe("exam centres and centre-wise attendance", () => {
  let t: TestDb;
  const clock = new FakeClock("2026-10-10T03:30:00.000Z");
  let admin: Awaited<ReturnType<typeof createAdmin>>;

  beforeAll(async () => {
    t = await createTestDb();
    clock.install();
    admin = await createAdmin();
  });
  afterAll(() => t.close());

  it("creates centres, rejects duplicate codes and needs candidates.manage", async () => {
    await createCentre(admin, centreSchema.parse({ code: "DEL-01", name: "Delhi Centre 1", city: "Delhi" }));
    await expect(createCentre(admin, centreSchema.parse({ code: "del-01", name: "Dup" }))).rejects.toMatchObject({ code: "CONFLICT" });
    const viewer = await createAdmin("RESULT_VIEWER");
    await expect(createCentre(viewer, centreSchema.parse({ code: "X-1", name: "X" }))).rejects.toMatchObject({ code: "FORBIDDEN" });
    const [c] = await listCentres();
    await setCentreActive(admin, c!.id, false);
    expect((await listCentres())[0]!.isActive).toBe(false);
    await setCentreActive(admin, c!.id, true);
  });

  it("imports candidates with centre_code and refuses unknown centres", async () => {
    const bad = await importCandidatesCsv(admin, "roll_number,full_name,centre_code\nR-IMP-1,Asha,NOPE-9\n");
    expect(bad.created).toBe(0);
    expect(bad.errors[0]!.message).toMatch(/Unknown centre_code/);
    const ok = await importCandidatesCsv(admin, "roll_number,full_name,centre_code\nR-IMP-2,Ravi,del-01\n");
    expect(ok.created).toBe(1);
    const [cand] = await listCandidates({ search: "R-IMP-2" });
    expect(cand!.centreCode).toBe("DEL-01");
  });

  it("reports present / absent / submitted per centre (workstation centre wins over allotted centre)", async () => {
    const { id: patna } = await createCentre(admin, centreSchema.parse({ code: "PAT-01", name: "Patna Centre" }));
    const [del] = (await listCentres()).filter((c) => c.code === "DEL-01");
    const exam = await createSampleExam(admin, 1);
    const a = await createCandidateLogin(admin); // Delhi, sits and submits
    const b = await createCandidateLogin(admin); // Delhi, absent
    const c = await createCandidateLogin(admin); // allotted Delhi but seated at a Patna workstation, started
    const d = await createCandidateLogin(admin); // no centre, absent
    for (const x of [a, b, c]) await updateCandidate(admin, x.id, { centreId: del!.id });
    const { id: wsId } = await createWorkstation(admin, workstationSchema.parse({ code: "PAT-PC01" }));
    await setWorkstationCentre(admin, wsId, patna);
    expect((await t.db.select().from(workstations).where(eq(workstations.id, wsId)))[0]!.centreId).toBe(patna);

    const schedule = await createPublishedSchedule(admin, exam.examId, [a.id, b.id, c.id, d.id], clock.now(), { loginOpensIn: 5, startsIn: 10 });
    await t.db.update(examAssignments).set({ workstationId: wsId }).where(eq(examAssignments.candidateId, c.id));

    clock.advanceMinutes(11);
    await runSchedulerTick(clock.now());
    const pa = (await loginAs(a)).principal;
    const { attemptId } = await startAttempt(pa, { scheduleId: schedule.id, language: "en" });
    await submitAttempt(pa, attemptId);
    await startAttempt((await loginAs(c)).principal, { scheduleId: schedule.id, language: "en" });

    const report = await getAttendance(schedule.id);
    expect(report.rows).toHaveLength(4);
    const byRoll = new Map(report.rows.map((r) => [r.rollNumber, r]));
    expect(byRoll.get(a.rollNumber)).toMatchObject({ status: "SUBMITTED", centreCode: "DEL-01" });
    expect(byRoll.get(b.rollNumber)).toMatchObject({ status: "ABSENT", centreCode: "DEL-01", startedAt: null });
    expect(byRoll.get(c.rollNumber)).toMatchObject({ status: "PRESENT", centreCode: "PAT-01", workstationCode: "PAT-PC01" });
    expect(byRoll.get(d.rollNumber)).toMatchObject({ status: "ABSENT", centreCode: null });

    expect(report.centres).toEqual([
      { centreCode: "DEL-01", centreName: "Delhi Centre 1", assigned: 2, present: 1, absent: 1, submitted: 1, attendancePct: 50 },
      { centreCode: "PAT-01", centreName: "Patna Centre", assigned: 1, present: 1, absent: 0, submitted: 0, attendancePct: 100 },
      { centreCode: null, centreName: null, assigned: 1, present: 0, absent: 1, submitted: 0, attendancePct: 0 },
    ]);
  });
});
