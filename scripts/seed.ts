/**
 * Seed the sample bilingual exam, a demo batch and demo candidates.
 *   npm run db:seed
 *   npm run db:seed -- --demo-schedule 3   (also publish a 10-minute sitting
 *                                           starting in 3 minutes)
 * Idempotent: existing records (by code / roll number) are left alone.
 * Candidate passwords are generated randomly and written to
 * seed-credentials.txt (git-ignored) — there are no built-in passwords.
 */
import "dotenv/config";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { appendFileSync } from "node:fs";
import { candidates, examBatches, examCategories, exams, questions, testSeries } from "@db/schema";
import { closeDb, getDb } from "@/lib/db/client";
import { generatePassword } from "@/lib/auth/password";
import { utcToZonedInput } from "@/lib/time/zone";
import { candidateSchema, examSchema, questionSchema, scheduleSchema, sectionSchema } from "@/lib/validation/schemas";
import { SYSTEM_ACTOR } from "@/server/services/audit-service";
import { ensureRoles } from "@/server/services/auth-service";
import { createBatch, createCandidate } from "@/server/services/candidate-service";
import { addSection, attachQuestions, createExam, setExamStatus } from "@/server/services/exam-service";
import { createQuestion } from "@/server/services/question-service";
import { adminTransition, assignCandidates, createSchedule } from "@/server/services/schedule-service";
import { CATEGORIES, EXPLANATIONS, SAMPLE_EXAM, SAMPLE_SECTIONS } from "./seed-data";

const actor = { ...SYSTEM_ACTOR, label: "seed" };
const TZ = process.env.EXAM_TIME_ZONE || "Asia/Kolkata";

async function seedExam(): Promise<string> {
  const db = getDb();
  const [existing] = await db.select({ id: exams.id }).from(exams).where(eq(exams.code, SAMPLE_EXAM.code));
  if (existing) {
    console.log(`Exam ${SAMPLE_EXAM.code} already exists.`);
    return existing.id;
  }
  const { id: examId } = await createExam(actor, examSchema.parse(SAMPLE_EXAM));
  for (const s of SAMPLE_SECTIONS) {
    const { id: sectionId } = await addSection(actor, examId, sectionSchema.parse(s));
    const ids: string[] = [];
    for (const q of s.questions) {
      const { id } = await createQuestion(
        actor,
        questionSchema.parse({
          code: q.code,
          subject: s.subject,
          topic: q.topic,
          textEn: q.en,
          textHi: q.hi,
          explanationEn: q.explanationEn,
          options: q.options.map(([en, hi], i) => ({ textEn: en, textHi: hi, isCorrect: i === q.correct })),
        }),
      );
      ids.push(id);
    }
    await attachQuestions(actor, sectionId, ids);
  }
  await setExamStatus(actor, examId, "READY");
  console.log(`Created exam ${SAMPLE_EXAM.code} with ${SAMPLE_SECTIONS.reduce((n, s) => n + s.questions.length, 0)} questions.`);
  return examId;
}

async function seedCandidates(): Promise<{ batchId: string; candidateIds: string[] }> {
  const db = getDb();
  let [batch] = await db.select().from(examBatches).where(eq(examBatches.code, "DEMO-BATCH"));
  if (!batch) {
    await createBatch(actor, { code: "DEMO-BATCH", name: "Demo batch", description: "Created by db:seed" });
    [batch] = await db.select().from(examBatches).where(eq(examBatches.code, "DEMO-BATCH"));
  }
  const demo = [
    ["CGL26001", "Aarav Sharma", "hi"],
    ["CGL26002", "Priya Singh", "en"],
    ["CGL26003", "Rahul Verma", "hi"],
    ["CGL26004", "Sneha Patel", "en"],
    ["CGL26005", "Mohammed Irfan", "en"],
  ] as const;
  const existing = await db
    .select({ id: candidates.id, rollNumber: candidates.rollNumber })
    .from(candidates)
    .where(inArray(candidates.rollNumber, demo.map((d) => d[0])));
  const have = new Map(existing.map((e) => [e.rollNumber, e.id]));
  const lines: string[] = [];
  const ids: string[] = [];
  for (const [rollNumber, fullName, lang] of demo) {
    if (have.has(rollNumber)) {
      ids.push(have.get(rollNumber)!);
      continue;
    }
    const password = generatePassword(8);
    const { id } = await createCandidate(
      actor,
      candidateSchema.parse({ rollNumber, fullName, password, batchId: batch!.id, preferredLanguage: lang }),
    );
    ids.push(id);
    lines.push(`${rollNumber}\t${fullName}\t${password}`);
  }
  if (lines.length) {
    appendFileSync("seed-credentials.txt", `# Demo candidates created ${new Date().toISOString()}\n${lines.join("\n")}\n`);
    console.log(`Created ${lines.length} demo candidates. Credentials written to seed-credentials.txt:`);
    for (const l of lines) console.log("  " + l);
  } else {
    console.log("Demo candidates already exist (see seed-credentials.txt).");
  }
  return { batchId: batch!.id, candidateIds: ids };
}

async function seedDemoSchedule(examId: string, batchId: string, candidateIds: string[], startsInMinutes: number) {
  const nowMs = Date.now();
  const start = new Date(Math.ceil((nowMs + startsInMinutes * 60_000) / 60_000) * 60_000);
  const { id } = await createSchedule(
    actor,
    scheduleSchema.parse({
      examId,
      batchId,
      title: `Demo sitting ${utcToZonedInput(start, TZ).replace("T", " ")}`,
      timeZone: TZ,
      loginOpensAt: utcToZonedInput(new Date(nowMs), TZ),
      startAt: utcToZonedInput(start, TZ),
      durationMinutes: 10,
      lateEntryMinutes: 5,
    }),
  );
  await assignCandidates(actor, id, { candidateIds });
  await adminTransition(actor, id, "SCHEDULE", null);
  await adminTransition(actor, id, "PUBLISH", null);
  console.log(`Published demo schedule starting ${start.toISOString()} (10 minutes).`);
}

/** Categories, a free CGL series, explanations, and the sample exam published online. */
async function seedOnline(examId: string) {
  const db = getDb();
  for (const c of CATEGORIES) {
    await db.insert(examCategories).values(c).onConflictDoNothing({ target: examCategories.slug });
  }
  const [cgl] = await db.select().from(examCategories).where(eq(examCategories.slug, "ssc-cgl"));
  await db
    .insert(testSeries)
    .values({
      slug: "ssc-cgl-free-mocks",
      categoryId: cgl!.id,
      titleEn: "SSC CGL Free Mock Series",
      titleHi: "एसएससी सीजीएल निःशुल्क मॉक सीरीज़",
      descriptionEn: "Full-length bilingual mock tests with solutions.",
      accessLevel: "FREE",
      isPublished: true,
    })
    .onConflictDoNothing({ target: testSeries.slug });
  const [series] = await db.select().from(testSeries).where(eq(testSeries.slug, "ssc-cgl-free-mocks"));

  // Explanations only where none exist (keeps edits made by administrators).
  for (const [code, [en, hi]] of Object.entries(EXPLANATIONS)) {
    await db
      .update(questions)
      .set({ explanationEn: en, explanationHi: hi, source: "Original sample content", license: "Project-owned" })
      .where(and(eq(questions.code, code), isNull(questions.explanationHi)));
  }
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam!.slug) {
    await db
      .update(exams)
      .set({
        slug: "ssc-cgl-mock-01",
        categoryId: cgl!.id,
        seriesId: series!.id,
        isPublic: true,
        accessLevel: "FREE",
        testKind: "FULL",
        descriptionEn: "A 20-question bilingual sample mock covering all four SSC CGL Tier-I sections. Score and solutions appear immediately after submission.",
        descriptionHi: "एसएससी सीजीएल टियर-I के चारों खंडों पर आधारित 20 प्रश्नों का द्विभाषी नमूना मॉक। जमा करते ही अंक और हल दिखाई देते हैं।",
      })
      .where(eq(exams.id, examId));
    console.log("Published sample exam online at /tests/ssc-cgl-mock-01.");
  } else {
    console.log(`Sample exam already online at /tests/${exam!.slug}.`);
  }
}

async function main() {
  await ensureRoles();
  const examId = await seedExam();
  await seedOnline(examId);
  const { batchId, candidateIds } = await seedCandidates();
  const i = process.argv.indexOf("--demo-schedule");
  if (i >= 0) await seedDemoSchedule(examId, batchId, candidateIds, Number(process.argv[i + 1] ?? 3));
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
