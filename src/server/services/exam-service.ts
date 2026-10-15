import { and, asc, count, countDistinct, eq, inArray, max } from "drizzle-orm";
import {
  examCategories,
  examSchedules,
  examSectionQuestions,
  examSections,
  exams,
  practiceAttempts,
  questionOptions,
  questions,
} from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { findPattern, patternInstructions } from "@/lib/exam-patterns";
import { now } from "@/lib/time/clock";
import { DEFAULT_TIME_ZONE, zonedTimeToUtc } from "@/lib/time/zone";
import type { examSchema, sectionSchema } from "@/lib/validation/schemas";
import type { z } from "zod";
import { audit, authorize, type Actor } from "./audit-service";

const LIVE_STATUSES = ["PUBLISHED", "WAITING", "RUNNING", "PAUSED"] as const;

/** The paper must not change while candidates or students could be sitting it. */
export async function assertExamEditable(q: Queryable, examId: string): Promise<void> {
  const [active] = await q
    .select({ n: count() })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.examId, examId), eq(practiceAttempts.status, "IN_PROGRESS")));
  if ((active?.n ?? 0) > 0) throw new AppError("CONFLICT", "Students are currently attempting this test; its paper is locked.");
  const [row] = await q
    .select({ n: count() })
    .from(examSchedules)
    .where(and(eq(examSchedules.examId, examId), inArray(examSchedules.status, [...LIVE_STATUSES])));
  if ((row?.n ?? 0) > 0) {
    throw new AppError("CONFLICT", "This exam has a published or live schedule; its paper is locked.");
  }
}

export async function listExams() {
  const db = getDb();
  const rows = await db
    .select({
      id: exams.id,
      code: exams.code,
      examType: exams.examType,
      titleEn: exams.titleEn,
      titleHi: exams.titleHi,
      status: exams.status,
      defaultDurationMinutes: exams.defaultDurationMinutes,
      createdAt: exams.createdAt,
      sections: countDistinct(examSections.id),
      questions: countDistinct(examSectionQuestions.questionId),
    })
    .from(exams)
    .leftJoin(examSections, eq(examSections.examId, exams.id))
    .leftJoin(examSectionQuestions, eq(examSectionQuestions.sectionId, examSections.id))
    .groupBy(exams.id)
    .orderBy(asc(exams.code));
  return rows;
}

export async function getExam(examId: string) {
  const [exam] = await getDb().select().from(exams).where(eq(exams.id, examId));
  if (!exam) throw new AppError("NOT_FOUND", "Exam not found.");
  return exam;
}

export type PaperOption = { id: string; label: string; textEn: string | null; textHi: string | null; imageUrl: string | null };
export type PaperQuestion = {
  id: string;
  number: number;
  code: string;
  textEn: string | null;
  textHi: string | null;
  imageUrl: string | null;
  marksCorrect: number;
  marksWrong: number;
  options: PaperOption[];
};
export type PaperSection = {
  id: string;
  code: string;
  titleEn: string;
  titleHi: string | null;
  subject: string;
  marksCorrect: number;
  marksWrong: number;
  timerGroup: string | null;
  groupMinutes: number | null;
  questions: PaperQuestion[];
};
export type AnswerKeyEntry = { questionId: string; sectionId: string; correctOptionIds: string[]; marksCorrect: number; marksWrong: number };

const LABELS = ["A", "B", "C", "D", "E", "F"];

/**
 * Load an exam paper in display order. The candidate variant never selects
 * `is_correct` or explanations, so they cannot leak into a response.
 */
export async function loadPaper(q: Queryable, examId: string): Promise<PaperSection[]> {
  const sectionRows = await q
    .select()
    .from(examSections)
    .where(eq(examSections.examId, examId))
    .orderBy(asc(examSections.position));
  if (sectionRows.length === 0) return [];
  const qRows = await q
    .select({
      sectionId: examSectionQuestions.sectionId,
      position: examSectionQuestions.position,
      id: questions.id,
      code: questions.code,
      textEn: questions.textEn,
      textHi: questions.textHi,
      imageUrl: questions.imageUrl,
      marksCorrect: questions.marksCorrect,
      marksWrong: questions.marksWrong,
    })
    .from(examSectionQuestions)
    .innerJoin(questions, eq(questions.id, examSectionQuestions.questionId))
    .where(
      inArray(
        examSectionQuestions.sectionId,
        sectionRows.map((s) => s.id),
      ),
    )
    .orderBy(asc(examSectionQuestions.position));
  const optRows = qRows.length
    ? await q
        .select({
          id: questionOptions.id,
          questionId: questionOptions.questionId,
          position: questionOptions.position,
          textEn: questionOptions.textEn,
          textHi: questionOptions.textHi,
          imageUrl: questionOptions.imageUrl,
        })
        .from(questionOptions)
        .where(
          inArray(
            questionOptions.questionId,
            qRows.map((r) => r.id),
          ),
        )
        .orderBy(asc(questionOptions.position))
    : [];
  const optsByQ = new Map<string, PaperOption[]>();
  for (const o of optRows) {
    const list = optsByQ.get(o.questionId) ?? [];
    list.push({ id: o.id, label: LABELS[list.length] ?? String(list.length + 1), textEn: o.textEn, textHi: o.textHi, imageUrl: o.imageUrl });
    optsByQ.set(o.questionId, list);
  }
  let number = 0;
  return sectionRows.map((s) => ({
    id: s.id,
    code: s.code,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    subject: s.subject,
    marksCorrect: s.marksCorrect,
    marksWrong: s.marksWrong,
    timerGroup: s.timerGroup,
    groupMinutes: s.groupMinutes,
    questions: qRows
      .filter((r) => r.sectionId === s.id)
      .map((r) => ({
        id: r.id,
        number: ++number,
        code: r.code,
        textEn: r.textEn,
        textHi: r.textHi,
        imageUrl: r.imageUrl,
        marksCorrect: r.marksCorrect ?? s.marksCorrect,
        marksWrong: r.marksWrong ?? s.marksWrong,
        options: optsByQ.get(r.id) ?? [],
      })),
  }));
}

/** Server-only answer key used for scoring and admin review. */
export async function loadAnswerKey(q: Queryable, examId: string): Promise<{ sections: PaperSection[]; key: AnswerKeyEntry[] }> {
  const sections = await loadPaper(q, examId);
  const questionIds = sections.flatMap((s) => s.questions.map((qq) => qq.id));
  const correct = questionIds.length
    ? await q
        .select({ id: questionOptions.id, questionId: questionOptions.questionId })
        .from(questionOptions)
        .where(and(inArray(questionOptions.questionId, questionIds), eq(questionOptions.isCorrect, true)))
    : [];
  const correctByQ = new Map<string, string[]>();
  for (const c of correct) correctByQ.set(c.questionId, [...(correctByQ.get(c.questionId) ?? []), c.id]);
  const key = sections.flatMap((s) =>
    s.questions.map((qq) => ({
      questionId: qq.id,
      sectionId: s.id,
      correctOptionIds: correctByQ.get(qq.id) ?? [],
      marksCorrect: qq.marksCorrect,
      marksWrong: qq.marksWrong,
    })),
  );
  return { sections, key };
}

export async function getExamDetail(examId: string) {
  const db = getDb();
  const exam = await getExam(examId);
  const { sections, key } = await loadAnswerKey(db, examId);
  const correctById = new Map(key.map((k) => [k.questionId, k.correctOptionIds]));
  return {
    exam,
    sections: sections.map((s) => ({
      ...s,
      questions: s.questions.map((qq) => ({ ...qq, correctOptionIds: correctById.get(qq.id) ?? [] })),
    })),
  };
}

type ExamData = z.output<typeof examSchema>;
type SectionData = z.output<typeof sectionSchema>;

/** Form values -> row values (result release time is wall-clock in the exam time zone). */
function examRow(input: ExamData) {
  return {
    ...input,
    resultReleaseAt: input.resultReleaseAt ? zonedTimeToUtc(input.resultReleaseAt, DEFAULT_TIME_ZONE) : null,
  };
}

/** "SSC CGL Mock 02" -> "ssc-cgl-mock-02" (ASCII only; Hindi titles fall back to the code). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function uniqueSlug(q: Queryable, base: string, examId?: string): Promise<string> {
  const root = base || "mock-test";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const [dup] = await q.select({ id: exams.id }).from(exams).where(eq(exams.slug, candidate));
    if (!dup || dup.id === examId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

async function assertSlugFree(q: Queryable, slug: string | null | undefined, examId?: string) {
  if (!slug) return;
  const [dup] = await q.select({ id: exams.id }).from(exams).where(eq(exams.slug, slug));
  if (dup && dup.id !== examId) throw new AppError("CONFLICT", `The URL slug "${slug}" is already used by another test.`);
}

export async function createExam(actor: Actor, input: ExamData): Promise<{ id: string }> {
  authorize(actor, "exams.manage");
  const db = getDb();
  const [dup] = await db.select({ id: exams.id }).from(exams).where(eq(exams.code, input.code));
  if (dup) throw new AppError("CONFLICT", `Exam code ${input.code} already exists.`);
  if (!input.slug) input = { ...input, slug: await uniqueSlug(db, slugify(input.titleEn) || slugify(input.code)) };
  await assertSlugFree(db, input.slug);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(exams)
      .values({ ...examRow(input), createdBy: actor.type === "ADMIN" ? actor.id : null })
      .returning({ id: exams.id });
    await audit(tx, actor, "exam.create", { type: "exam", id: row!.id }, { code: input.code });
    return row!;
  });
}

/**
 * Create a draft test from a pattern in the exam-pattern library: category
 * (created if missing), duration, instructions and sections with marking.
 * Questions are attached afterwards as usual.
 */
export async function createExamFromPattern(actor: Actor, input: { patternId: string; titleEn?: string | null }): Promise<{ id: string }> {
  authorize(actor, "exams.manage");
  const p = findPattern(input.patternId);
  if (!p) throw new AppError("NOT_FOUND", "Unknown exam pattern.");
  const db = getDb();
  const titleEn = input.titleEn?.trim() || `${p.nameEn} Mock Test`;
  const base = p.id.toUpperCase().slice(0, 30);
  let code = base;
  for (let i = 2; ; i++) {
    const [dup] = await db.select({ id: exams.id }).from(exams).where(eq(exams.code, code));
    if (!dup) break;
    code = `${base}-${i}`;
  }
  const slug = await uniqueSlug(db, slugify(titleEn) || slugify(code));
  const text = patternInstructions(p);
  return db.transaction(async (tx) => {
    await tx
      .insert(examCategories)
      .values({ slug: p.category.slug, nameEn: p.category.nameEn, nameHi: p.category.nameHi })
      .onConflictDoNothing({ target: examCategories.slug });
    const [category] = await tx.select({ id: examCategories.id }).from(examCategories).where(eq(examCategories.slug, p.category.slug));
    const [row] = await tx
      .insert(exams)
      .values({
        code,
        examType: p.group,
        titleEn,
        titleHi: `${p.nameHi} मॉक टेस्ट`,
        instructionsEn: text.en,
        instructionsHi: text.hi,
        defaultDurationMinutes: p.durationMinutes,
        slug,
        descriptionEn: `${p.stage} · ${p.authority}`,
        categoryId: category?.id ?? null,
        testKind: "FULL",
        createdBy: actor.type === "ADMIN" ? actor.id : null,
      })
      .returning({ id: exams.id });
    await tx.insert(examSections).values(
      p.sections.map((s, i) => ({
        examId: row!.id,
        code: s.code,
        titleEn: s.titleEn,
        titleHi: s.titleHi ?? null,
        subject: s.subject,
        position: i + 1,
        marksCorrect: s.marksCorrect,
        marksWrong: s.marksWrong,
        timerGroup: s.timerGroup ?? null,
        groupMinutes: s.groupMinutes ?? null,
      })),
    );
    await audit(tx, actor, "exam.create", { type: "exam", id: row!.id }, { code, pattern: p.id });
    return row!;
  });
}

export async function updateExam(actor: Actor, examId: string, input: ExamData): Promise<void> {
  authorize(actor, "exams.manage");
  const db = getDb();
  if (!input.slug) input = { ...input, slug: await uniqueSlug(db, slugify(input.titleEn) || slugify(input.code), examId) };
  await assertSlugFree(db, input.slug, examId);
  await db.transaction(async (tx) => {
    const [row] = await tx
      .update(exams)
      .set({ ...examRow(input), updatedAt: now() })
      .where(eq(exams.id, examId))
      .returning({ id: exams.id });
    if (!row) throw new AppError("NOT_FOUND", "Exam not found.");
    await audit(tx, actor, "exam.update", { type: "exam", id: examId });
  });
}

export async function setExamStatus(actor: Actor, examId: string, status: "DRAFT" | "READY" | "ARCHIVED") {
  authorize(actor, "exams.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    if (status === "READY") {
      const sections = await loadPaper(tx, examId);
      const total = sections.reduce((n, s) => n + s.questions.length, 0);
      if (total === 0) throw new AppError("VALIDATION", "Add at least one question before marking the exam ready.");
    }
    const [row] = await tx.update(exams).set({ status, updatedAt: now() }).where(eq(exams.id, examId)).returning({ id: exams.id });
    if (!row) throw new AppError("NOT_FOUND", "Exam not found.");
    await audit(tx, actor, "exam.status", { type: "exam", id: examId }, { status });
  });
}

export async function addSection(actor: Actor, examId: string, input: SectionData): Promise<{ id: string }> {
  authorize(actor, "exams.manage");
  const db = getDb();
  return db.transaction(async (tx) => {
    const [exam] = await tx.select({ id: exams.id }).from(exams).where(eq(exams.id, examId));
    if (!exam) throw new AppError("NOT_FOUND", "Exam not found.");
    await assertExamEditable(tx, examId);
    const [dup] = await tx
      .select({ id: examSections.id })
      .from(examSections)
      .where(and(eq(examSections.examId, examId), eq(examSections.code, input.code)));
    if (dup) throw new AppError("CONFLICT", `Section code ${input.code} already exists in this exam.`);
    const [m] = await tx.select({ p: max(examSections.position) }).from(examSections).where(eq(examSections.examId, examId));
    const [row] = await tx
      .insert(examSections)
      .values({ ...input, examId, position: (m?.p ?? 0) + 1 })
      .returning({ id: examSections.id });
    await audit(tx, actor, "exam.section.add", { type: "exam", id: examId }, { section: input.code });
    return row!;
  });
}

export async function deleteSection(actor: Actor, sectionId: string): Promise<void> {
  authorize(actor, "exams.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    const [s] = await tx.select().from(examSections).where(eq(examSections.id, sectionId));
    if (!s) throw new AppError("NOT_FOUND", "Section not found.");
    await assertExamEditable(tx, s.examId);
    await tx.delete(examSections).where(eq(examSections.id, sectionId));
    await audit(tx, actor, "exam.section.delete", { type: "exam", id: s.examId }, { section: s.code });
  });
}

export async function attachQuestions(actor: Actor, sectionId: string, questionIds: string[]): Promise<{ added: number }> {
  authorize(actor, "exams.manage");
  const db = getDb();
  return db.transaction(async (tx) => {
    const [s] = await tx.select().from(examSections).where(eq(examSections.id, sectionId));
    if (!s) throw new AppError("NOT_FOUND", "Section not found.");
    await assertExamEditable(tx, s.examId);
    const found = await tx.select({ id: questions.id }).from(questions).where(inArray(questions.id, questionIds));
    if (found.length !== new Set(questionIds).size) throw new AppError("VALIDATION", "Some questions do not exist.");
    // A question may appear only once per exam.
    const inExam = await tx
      .select({ id: examSectionQuestions.questionId })
      .from(examSectionQuestions)
      .innerJoin(examSections, eq(examSections.id, examSectionQuestions.sectionId))
      .where(and(eq(examSections.examId, s.examId), inArray(examSectionQuestions.questionId, questionIds)));
    const skip = new Set(inExam.map((r) => r.id));
    const toAdd = [...new Set(questionIds)].filter((id) => !skip.has(id));
    if (toAdd.length === 0) return { added: 0 };
    const [m] = await tx
      .select({ p: max(examSectionQuestions.position) })
      .from(examSectionQuestions)
      .where(eq(examSectionQuestions.sectionId, sectionId));
    let pos = m?.p ?? 0;
    await tx.insert(examSectionQuestions).values(toAdd.map((questionId) => ({ sectionId, questionId, position: ++pos })));
    await audit(tx, actor, "exam.questions.attach", { type: "exam", id: s.examId }, { section: s.code, count: toAdd.length });
    return { added: toAdd.length };
  });
}

export async function detachQuestion(actor: Actor, sectionId: string, questionId: string): Promise<void> {
  authorize(actor, "exams.manage");
  const db = getDb();
  await db.transaction(async (tx) => {
    const [s] = await tx.select().from(examSections).where(eq(examSections.id, sectionId));
    if (!s) throw new AppError("NOT_FOUND", "Section not found.");
    await assertExamEditable(tx, s.examId);
    await tx
      .delete(examSectionQuestions)
      .where(and(eq(examSectionQuestions.sectionId, sectionId), eq(examSectionQuestions.questionId, questionId)));
    await audit(tx, actor, "exam.questions.detach", { type: "exam", id: s.examId }, { section: s.code, questionId });
  });
}
