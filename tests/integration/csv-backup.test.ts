import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { count } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { candidates, questionOptions, questions, results } from "@db/schema";
import { FakeClock } from "@/lib/time/clock";
import { parseCsv } from "@/lib/csv";
import { loginCandidate } from "@/server/services/auth-service";
import { importCandidatesCsv, createBatch } from "@/server/services/candidate-service";
import { exportQuestionsCsv, importQuestionsCsv } from "@/server/services/question-service";
import { createBackup, restoreBackup } from "@/server/services/backup-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { startAttempt, submitAttempt } from "@/server/services/attempt-service";
import { batchSchema } from "@/lib/validation/schemas";
import { createTestDb, type TestDb } from "../helpers/db";
import { META, createAdmin, createCandidateLogin, createPublishedSchedule, createSampleExam, loginAs } from "../helpers/fixtures";

describe("CSV import/export", () => {
  let t: TestDb;
  beforeAll(async () => {
    t = await createTestDb();
  });
  afterAll(() => t.close());

  it("imports bilingual questions and round-trips them through export", async () => {
    const admin = await createAdmin();
    const csv = [
      "code,subject,topic,difficulty,text_en,text_hi,option1_en,option1_hi,option2_en,option2_hi,option3_en,option3_hi,option4_en,option4_hi,correct,marks_correct,marks_wrong",
      'CSV-1,Quantitative Aptitude,Percentages,EASY,"What is 10% of 250?","250 का 10% क्या है?",15,15,25,25,35,35,45,45,B,2,0.5',
      'CSV-2,General Awareness,,MEDIUM,"Capital of India?","भारत की राजधानी?",Mumbai,मुंबई,New Delhi,नई दिल्ली,Kolkata,कोलकाता,Chennai,चेन्नई,2,,',
    ].join("\n");
    const report = await importQuestionsCsv(admin, csv);
    expect(report).toEqual({ created: 2, errors: [] });
    const exported = parseCsv(await exportQuestionsCsv()).rows;
    const row = exported.find((r) => r.code === "CSV-1")!;
    expect(row).toMatchObject({ text_hi: "250 का 10% क्या है?", correct: "B", option2_en: "25", marks_correct: "2" });
  });

  it("reports every invalid row and imports nothing (all-or-nothing)", async () => {
    const admin = await createAdmin();
    const [{ n: before } = { n: 0 }] = await t.db.select({ n: count() }).from(questions);
    const csv = [
      "code,subject,text_en,option1_en,option2_en,correct",
      "BAD-1,Reasoning,Fine question,A,B,A",
      "BAD-2,Reasoning,No correct answer,A,B,Z",
      "BAD-3,,Missing subject,A,B,A",
      "CSV-1,Reasoning,Duplicate of existing,A,B,A",
    ].join("\n");
    const report = await importQuestionsCsv(admin, csv);
    expect(report.created).toBe(0);
    expect(report.errors.map((e) => e.row)).toEqual(expect.arrayContaining([3, 4]));
    expect(report.errors.some((e) => /CSV-1 already exists/.test(e.message))).toBe(true);
    const [{ n: after } = { n: 0 }] = await t.db.select({ n: count() }).from(questions);
    expect(after).toBe(before);
  });

  it("imports candidates, generating passwords when none is given", async () => {
    const admin = await createAdmin();
    await createBatch(admin, batchSchema.parse({ code: "B-MORNING", name: "Morning batch" }));
    const csv = [
      "roll_number,full_name,password,batch_code,language",
      "CGL1001,Asha Verma,Secret#1,B-MORNING,hi",
      "CGL1002,Ravi Kumar,,B-MORNING,en",
    ].join("\n");
    const report = await importCandidatesCsv(admin, csv);
    expect(report.created).toBe(2);
    expect(report.credentials).toHaveLength(1);
    expect(report.credentials[0]!.rollNumber).toBe("CGL1002");
    await expect(loginCandidate({ rollNumber: "CGL1002", password: report.credentials[0]!.password }, META)).resolves.toBeTruthy();

    const dup = await importCandidatesCsv(admin, "roll_number,full_name\ncgl1001,Someone Else\nX9,Bad,\n");
    expect(dup.created).toBe(0);
    expect(dup.errors.some((e) => /already exists/.test(e.message))).toBe(true);
  });

  it("imports the sample CSV files shipped in samples/", async () => {
    const admin = await createAdmin();
    const q = await importQuestionsCsv(admin, readFileSync("samples/questions-sample.csv", "utf8"));
    expect(q).toEqual({ created: 4, errors: [] });
    await createBatch(admin, batchSchema.parse({ code: "DEMO-BATCH", name: "Demo" }));
    const c = await importCandidatesCsv(admin, readFileSync("samples/candidates-sample.csv", "utf8"));
    expect(c.errors).toEqual([]);
    expect(c.created).toBe(3);
    expect(c.credentials).toHaveLength(2);
  });

  it("neutralises spreadsheet formula injection in exports", async () => {
    const { toCsv } = await import("@/lib/csv");
    const csv = toCsv(["a", "b"], [{ a: "=HYPERLINK(\"x\")", b: "-0.5" }]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("-0.5");
    expect(csv).not.toContain("'-0.5");
  });
});

describe("backup and restore", () => {
  it("restores a complete database (including results) into an empty database", async () => {
    const source = await createTestDb();
    const clock = new FakeClock("2026-10-10T03:30:00.000Z").install();
    const admin = await createAdmin();
    const exam = await createSampleExam(admin, 2);
    const cand = await createCandidateLogin(admin);
    const s = await createPublishedSchedule(admin, exam.examId, [cand.id], clock.now(), { loginOpensIn: 1, startsIn: 2 });
    clock.advanceMinutes(2);
    await runSchedulerTick(clock.now());
    const { principal } = await loginAs(cand);
    const { attemptId } = await startAttempt(principal, { scheduleId: s.id, language: "en" });
    await submitAttempt(principal, attemptId);
    const backup = JSON.parse(JSON.stringify(await createBackup())); // through JSON like a real file
    const counts = Object.fromEntries(Object.entries(backup.tables).map(([k, v]) => [k, (v as unknown[]).length]));
    await source.close();

    const target = await createTestDb();
    await restoreBackup(backup, "replace");
    const again = await createBackup();
    for (const [table, n] of Object.entries(counts)) expect([table, again.tables[table]!.length]).toEqual([table, n]);
    const [{ n: r } = { n: 0 }] = await target.db.select({ n: count() }).from(results);
    expect(r).toBe(1);
    const [{ n: o } = { n: 0 }] = await target.db.select({ n: count() }).from(questionOptions);
    expect(o).toBe(16);
    // Restored credentials work.
    await expect(loginCandidate({ rollNumber: cand.rollNumber, password: cand.password }, META)).resolves.toBeTruthy();

    // Merge mode is idempotent (offline centre -> Neon sync re-run).
    await restoreBackup(backup, "merge");
    await restoreBackup(backup, "merge");
    const [{ n: c } = { n: 0 }] = await target.db.select({ n: count() }).from(candidates);
    expect(c).toBe(counts.candidates);
    await target.close();
  });
});
