/**
 * Create full-length generated mock tests.
 *
 *   npm run mock:series -- --series imd   --tests 50 [--dry-run] [--sample out.json]
 *   npm run mock:series -- --series dsssb --tests 50
 *
 * Series: imd   = SSC Scientific Assistant (IMD) – Computer Science (200 Q, 2 h)
 *         dsssb = DSSSB TGT Computer Science (200 Q, 2 h)
 *
 * Idempotent: a test whose exam code already exists is skipped, so the
 * command can be re-run (e.g. with a larger --tests) safely. --dry-run builds
 * and validates every question without touching the database.
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { examCategories, examSectionQuestions, examSections, exams, questionOptions, questions } from "@db/schema";
import { findPattern, patternInstructions } from "@/lib/exam-patterns";
import { closeDb, getDb } from "@/lib/db/client";
import { audit, SYSTEM_ACTOR } from "@/server/services/audit-service";
import { SERIES, buildSeries, validate, type BuiltTest, type SeriesDef } from "./mock-series/series";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function writeTest(def: SeriesDef, t: BuiltTest, categoryId: string) {
  const n = String(t.number).padStart(2, "0");
  const code = `${def.codePrefix}-${n}`;
  const db = getDb();
  const [exists] = await db.select({ id: exams.id }).from(exams).where(eq(exams.code, code));
  if (exists) return "skipped" as const;
  const pattern = findPattern(def.patternId);
  const text = pattern ? patternInstructions(pattern) : { en: null, hi: null };
  await db.transaction(async (tx) => {
    const [exam] = await tx
      .insert(exams)
      .values({
        code,
        examType: def.examType,
        titleEn: def.titleEn(n),
        titleHi: def.titleHi(n),
        instructionsEn: text.en,
        instructionsHi: text.hi,
        defaultDurationMinutes: def.durationMinutes,
        status: "READY",
        slug: `${def.slugPrefix}-${n}`,
        descriptionEn: "Full-length mock test with explanations for computed questions.",
        categoryId,
        testKind: "FULL",
        isPublic: true,
        accessLevel: "FREE",
        timed: true,
      })
      .returning({ id: exams.id });
    for (const [si, s] of t.sections.entries()) {
      const [section] = await tx
        .insert(examSections)
        .values({ examId: exam!.id, code: s.def.code, titleEn: s.def.titleEn, titleHi: s.def.titleHi, subject: s.def.subject, position: si + 1, marksCorrect: s.def.marksCorrect, marksWrong: s.def.marksWrong })
        .returning({ id: examSections.id });
      const qRows = await tx
        .insert(questions)
        .values(
          s.questions.map((q, qi) => ({
            code: `${code}-${s.def.code}-${String(qi + 1).padStart(3, "0")}`,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            textEn: q.en,
            textHi: q.hi ?? null,
            explanationEn: q.explanationEn ?? null,
            explanationHi: q.explanationHi ?? null,
            source: `EdQity generated series (${def.id})`,
            license: "Original",
          })),
        )
        .returning({ id: questions.id });
      await tx.insert(questionOptions).values(
        s.questions.flatMap((q, qi) =>
          q.options.map((o, oi) => ({ questionId: qRows[qi]!.id, position: oi + 1, textEn: o, textHi: q.optionsHi?.[oi] ?? null, isCorrect: oi === q.correct })),
        ),
      );
      await tx.insert(examSectionQuestions).values(qRows.map((row, qi) => ({ sectionId: section!.id, questionId: row.id, position: qi + 1 })));
    }
    await audit(tx, { ...SYSTEM_ACTOR, label: "mock-series" }, "exam.create", { type: "exam", id: exam!.id }, { code, generated: def.id });
  });
  return "created" as const;
}

async function main() {
  const def = SERIES[arg("series") ?? ""];
  if (!def) throw new Error(`Usage: --series ${Object.keys(SERIES).join("|")} --tests N [--dry-run] [--sample file.json]`);
  const count = Number(arg("tests") ?? 50);
  const dry = process.argv.includes("--dry-run");

  const { tests, poolSizes, repeats } = buildSeries(def, count);
  let total = 0;
  const problems: string[] = [];
  for (const t of tests) {
    for (const s of t.sections) {
      for (const q of s.questions) {
        total++;
        const p = validate(q);
        if (p.length) problems.push(`test ${t.number} ${s.def.code} ${q.key}: ${p.join(", ")}`);
      }
    }
  }
  console.log(`${def.id}: ${tests.length} tests, ${total} questions, fact pools ${JSON.stringify(poolSizes)}, times each pool was used ${JSON.stringify(repeats)}`);
  if (problems.length) {
    console.error(problems.slice(0, 20).join("\n"));
    throw new Error(`${problems.length} invalid questions`);
  }
  const sample = arg("sample");
  if (sample) {
    const t = tests[0]!;
    writeFileSync(sample, JSON.stringify(t.sections.map((s) => ({ section: s.def.code, questions: s.questions })), null, 2));
    console.log(`Wrote test 1 to ${sample}`);
  }
  if (dry) return;

  const db = getDb();
  await db.insert(examCategories).values(def.category).onConflictDoNothing({ target: examCategories.slug });
  const [category] = await db.select({ id: examCategories.id }).from(examCategories).where(eq(examCategories.slug, def.category.slug));
  let created = 0, skipped = 0;
  for (const t of tests) {
    const r = await writeTest(def, t, category!.id);
    if (r === "created") created++;
    else skipped++;
    process.stdout.write(`\r${def.id}: ${created} created, ${skipped} skipped`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
