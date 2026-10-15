import { and, asc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { examSchedules, examSectionQuestions, examSections, questionOptions, questions } from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { parseCsv, toCsv } from "@/lib/csv";
import { AppError } from "@/lib/errors";
import { now } from "@/lib/time/clock";
import { questionSchema } from "@/lib/validation/schemas";
import { audit, authorize, type Actor } from "./audit-service";

type QuestionData = z.output<typeof questionSchema>;
const MAX_OPTIONS = 6;

export async function listQuestions(filter: { subject?: string; search?: string; limit?: number; offset?: number } = {}) {
  const where: SQL[] = [];
  if (filter.subject) where.push(eq(questions.subject, filter.subject));
  if (filter.search) {
    const like = `%${filter.search.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    where.push(or(ilike(questions.code, like), ilike(questions.textEn, like), ilike(questions.textHi, like))!);
  }
  return getDb()
    .select({
      id: questions.id,
      code: questions.code,
      subject: questions.subject,
      topic: questions.topic,
      difficulty: questions.difficulty,
      textEn: questions.textEn,
      textHi: questions.textHi,
      isActive: questions.isActive,
    })
    .from(questions)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(questions.code))
    .limit(Math.min(filter.limit ?? 200, 1000))
    .offset(filter.offset ?? 0);
}

export async function listSubjects(): Promise<string[]> {
  const rows = await getDb().selectDistinct({ subject: questions.subject }).from(questions).orderBy(asc(questions.subject));
  return rows.map((r) => r.subject);
}

export async function getQuestion(id: string) {
  const db = getDb();
  const [q] = await db.select().from(questions).where(eq(questions.id, id));
  if (!q) throw new AppError("NOT_FOUND", "Question not found.");
  const options = await db
    .select()
    .from(questionOptions)
    .where(eq(questionOptions.questionId, id))
    .orderBy(asc(questionOptions.position));
  return { ...q, options };
}

async function insertQuestion(tx: Queryable, input: QuestionData): Promise<string> {
  const { options, ...rest } = input;
  const [row] = await tx
    .insert(questions)
    .values({ ...rest, marksCorrect: rest.marksCorrect ?? null, marksWrong: rest.marksWrong ?? null })
    .returning({ id: questions.id });
  await tx.insert(questionOptions).values(
    options.map((o, i) => ({
      questionId: row!.id,
      position: i + 1,
      textEn: o.textEn,
      textHi: o.textHi,
      imageUrl: o.imageUrl,
      isCorrect: o.isCorrect,
    })),
  );
  return row!.id;
}

export async function createQuestion(actor: Actor, input: QuestionData): Promise<{ id: string }> {
  authorize(actor, "questions.manage");
  const db = getDb();
  const [dup] = await db.select({ id: questions.id }).from(questions).where(eq(questions.code, input.code));
  if (dup) throw new AppError("CONFLICT", `Question code ${input.code} already exists.`);
  return db.transaction(async (tx) => {
    const id = await insertQuestion(tx, input);
    await audit(tx, actor, "question.create", { type: "question", id }, { code: input.code });
    return { id };
  });
}

/** Questions used by a published or live schedule cannot be edited. */
async function assertQuestionEditable(q: Queryable, questionId: string) {
  const rows = await q
    .select({ id: examSchedules.id })
    .from(examSectionQuestions)
    .innerJoin(examSections, eq(examSections.id, examSectionQuestions.sectionId))
    .innerJoin(examSchedules, eq(examSchedules.examId, examSections.examId))
    .where(
      and(
        eq(examSectionQuestions.questionId, questionId),
        inArray(examSchedules.status, ["PUBLISHED", "WAITING", "RUNNING", "PAUSED"]),
      ),
    )
    .limit(1);
  if (rows.length) throw new AppError("CONFLICT", "This question belongs to a published or live exam and is locked.");
}

export async function updateQuestion(actor: Actor, id: string, input: QuestionData): Promise<void> {
  authorize(actor, "questions.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    await assertQuestionEditable(tx, id);
    const { options, ...rest } = input;
    const [row] = await tx
      .update(questions)
      .set({ ...rest, marksCorrect: rest.marksCorrect ?? null, marksWrong: rest.marksWrong ?? null, updatedAt: now() })
      .where(eq(questions.id, id))
      .returning({ id: questions.id });
    if (!row) throw new AppError("NOT_FOUND", "Question not found.");
    const existing = await tx.select().from(questionOptions).where(eq(questionOptions.questionId, id));
    for (const [i, o] of options.entries()) {
      const pos = i + 1;
      const current = existing.find((e) => e.position === pos);
      const values = { textEn: o.textEn, textHi: o.textHi, imageUrl: o.imageUrl, isCorrect: o.isCorrect };
      if (current) await tx.update(questionOptions).set(values).where(eq(questionOptions.id, current.id));
      else await tx.insert(questionOptions).values({ ...values, questionId: id, position: pos });
    }
    const extra = existing.filter((e) => e.position > options.length).map((e) => e.id);
    if (extra.length) {
      try {
        await tx.delete(questionOptions).where(inArray(questionOptions.id, extra));
      } catch {
        throw new AppError("CONFLICT", "Options already answered by candidates cannot be removed.");
      }
    }
    await audit(tx, actor, "question.update", { type: "question", id }, { code: input.code });
  });
}

// --- CSV ---------------------------------------------------------------------

export const QUESTION_CSV_COLUMNS = [
  "code",
  "subject",
  "topic",
  "difficulty",
  "text_en",
  "text_hi",
  "image_url",
  ...Array.from({ length: MAX_OPTIONS }, (_, i) => [`option${i + 1}_en`, `option${i + 1}_hi`]).flat(),
  "correct",
  "marks_correct",
  "marks_wrong",
  "explanation_en",
  "explanation_hi",
];

function correctIndex(value: string): number {
  const v = value.trim().toUpperCase();
  if (/^[A-F]$/.test(v)) return v.charCodeAt(0) - 65;
  if (/^[1-6]$/.test(v)) return Number(v) - 1;
  return -1;
}

export type ImportReport = { created: number; errors: { row: number; message: string }[] };

/** All-or-nothing import: if any row is invalid nothing is written. */
export async function importQuestionsCsv(actor: Actor, csvText: string): Promise<ImportReport> {
  authorize(actor, "questions.manage");
  const { rows, errors: parseErrors } = parseCsv(csvText);
  const errors: ImportReport["errors"] = parseErrors.map((m) => ({ row: 0, message: m }));
  const valid: QuestionData[] = [];
  const seen = new Set<string>();

  rows.forEach((r, idx) => {
    const rowNo = idx + 2; // header is row 1
    const correct = correctIndex(r.correct ?? "");
    const options = [];
    for (let i = 1; i <= MAX_OPTIONS; i++) {
      const en = r[`option${i}_en`] ?? "";
      const hi = r[`option${i}_hi`] ?? "";
      if (en || hi) options.push({ textEn: en, textHi: hi, isCorrect: i - 1 === correct });
    }
    if (correct < 0 || correct >= options.length) {
      errors.push({ row: rowNo, message: "Column 'correct' must be A-F or 1-6 and point at a filled option." });
      return;
    }
    const parsed = questionSchema.safeParse({
      code: r.code,
      subject: r.subject,
      topic: r.topic,
      difficulty: (r.difficulty || "MEDIUM").toUpperCase(),
      textEn: r.text_en,
      textHi: r.text_hi,
      imageUrl: r.image_url,
      explanationEn: r.explanation_en,
      explanationHi: r.explanation_hi,
      marksCorrect: r.marks_correct ? Number(r.marks_correct) : null,
      marksWrong: r.marks_wrong ? Number(r.marks_wrong) : null,
      options,
    });
    if (!parsed.success) {
      errors.push({
        row: rowNo,
        message: parsed.error.issues.map((i) => `${i.path.join(".") || "row"}: ${i.message}`).join("; "),
      });
      return;
    }
    if (seen.has(parsed.data.code.toUpperCase())) {
      errors.push({ row: rowNo, message: `Duplicate code ${parsed.data.code} in file.` });
      return;
    }
    seen.add(parsed.data.code.toUpperCase());
    valid.push(parsed.data);
  });

  if (valid.length) {
    const existing = await getDb()
      .select({ code: questions.code })
      .from(questions)
      .where(inArray(sql`upper(${questions.code})`, [...seen]));
    for (const e of existing) errors.push({ row: 0, message: `Question code ${e.code} already exists.` });
  }
  if (errors.length || valid.length === 0) {
    if (!errors.length) errors.push({ row: 0, message: "The file contains no questions." });
    return { created: 0, errors };
  }

  await getDb().transaction(async (tx) => {
    for (const q of valid) await insertQuestion(tx, q);
    await audit(tx, actor, "question.import", null, { count: valid.length });
  });
  return { created: valid.length, errors: [] };
}

export async function exportQuestionsCsv(): Promise<string> {
  const db = getDb();
  const qs = await db.select().from(questions).orderBy(asc(questions.code));
  const opts = await db.select().from(questionOptions).orderBy(asc(questionOptions.position));
  const byQ = new Map<string, typeof opts>();
  for (const o of opts) byQ.set(o.questionId, [...(byQ.get(o.questionId) ?? []), o]);
  const rows = qs.map((q) => {
    const row: Record<string, unknown> = {
      code: q.code,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      text_en: q.textEn,
      text_hi: q.textHi,
      image_url: q.imageUrl,
      marks_correct: q.marksCorrect,
      marks_wrong: q.marksWrong,
      explanation_en: q.explanationEn,
      explanation_hi: q.explanationHi,
    };
    (byQ.get(q.id) ?? []).forEach((o, i) => {
      row[`option${i + 1}_en`] = o.textEn;
      row[`option${i + 1}_hi`] = o.textHi;
      if (o.isCorrect) row.correct = String.fromCharCode(65 + i);
    });
    return row;
  });
  return toCsv(QUESTION_CSV_COLUMNS, rows);
}
