/**
 * Online mock tests (Mode B: self-paced). Each student starts individually;
 * the server fixes the attempt's deadline (started_at + duration) at start
 * and enforces it on every write. Expired attempts are auto-submitted by the
 * durable scheduler tick and lazily on any access.
 *
 * Rules (defaults, documented in docs/architecture.md):
 *  - One active attempt per student per test (unique partial index).
 *  - Interrupted attempts (refresh, closed tab, lost network) resume with
 *    their answers and the remaining time; the clock keeps running.
 *  - Retakes: allowed until `max_attempts` submitted attempts (0 = unlimited).
 *  - Leaderboards use each student's FIRST attempt only.
 *  - Results/solutions: IMMEDIATE after submission, or AT_TIME (hidden until
 *    `result_release_at`).
 */
import { and, asc, count, desc, eq, gt, inArray, isNull, lte, max, ne, or, sql } from "drizzle-orm";
import {
  bookmarks,
  examCategories,
  examSectionQuestions,
  examSections,
  exams,
  practiceAnswers,
  practiceAttempts,
  practiceResults,
  questionOptions,
  questions,
  studentEntitlements,
  students,
  testSeries,
  type TopicScore,
} from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { scoreAttempt } from "@/lib/scoring/score";
import { now } from "@/lib/time/clock";
import type { AnswerChange, Language } from "@/lib/validation/schemas";
import { closedQuestions, getPaperCached, SECTION_CLOSED_MESSAGE, type AnswerState, type SaveItemResult, type Timing } from "./attempt-service";
import { audit } from "./audit-service";
import { loadAnswerKey } from "./exam-service";
import type { StudentPrincipal } from "./session-service";
import { findOpenApproval, getRequireApproval, markRequestUsed } from "./test-schedule-service";

type AttemptRow = typeof practiceAttempts.$inferSelect;
type ExamRow = typeof exams.$inferSelect;

// --- Catalogue ----------------------------------------------------------------------

// Students see every test that is not hidden or archived and has questions
// (no separate approval / publish step).
const PUBLISHED = and(eq(exams.isPublic, true), ne(exams.status, "ARCHIVED"));

export async function listCategories() {
  const db = getDb();
  const cats = await db.select().from(examCategories).where(eq(examCategories.isActive, true)).orderBy(asc(examCategories.position));
  const counts = await db
    .select({ categoryId: exams.categoryId, n: count() })
    .from(exams)
    .where(PUBLISHED)
    .groupBy(exams.categoryId);
  const byId = new Map(counts.map((c) => [c.categoryId, c.n]));
  return cats.map((c) => ({ ...c, testCount: byId.get(c.id) ?? 0 }));
}

export async function getCategoryBySlug(slug: string) {
  const [c] = await getDb().select().from(examCategories).where(eq(examCategories.slug, slug));
  if (!c) throw new AppError("NOT_FOUND", "Exam category not found.");
  return c;
}

export type PublicTest = Awaited<ReturnType<typeof listPublicTests>>[number];

/** Published tests with question counts and maximum marks. */
export async function listPublicTests(filter: { categoryId?: string; seriesId?: string; accessLevel?: "FREE" | "PREMIUM" } = {}) {
  const db = getDb();
  const conds = [PUBLISHED];
  if (filter.categoryId) conds.push(eq(exams.categoryId, filter.categoryId));
  if (filter.seriesId) conds.push(eq(exams.seriesId, filter.seriesId));
  if (filter.accessLevel) conds.push(eq(exams.accessLevel, filter.accessLevel));
  const rows = await db
    .select({
      id: exams.id,
      slug: exams.slug,
      titleEn: exams.titleEn,
      titleHi: exams.titleHi,
      descriptionEn: exams.descriptionEn,
      descriptionHi: exams.descriptionHi,
      testKind: exams.testKind,
      accessLevel: exams.accessLevel,
      timed: exams.timed,
      durationMinutes: exams.defaultDurationMinutes,
      maxAttempts: exams.maxAttempts,
      categorySlug: examCategories.slug,
      categoryName: examCategories.nameEn,
      seriesTitle: testSeries.titleEn,
      questionCount: sql<number>`count(${examSectionQuestions.questionId})`.mapWith(Number),
      maxMarks: sql<number>`coalesce(sum(coalesce(${questions.marksCorrect}, ${examSections.marksCorrect})), 0)`.mapWith(Number),
    })
    .from(exams)
    .leftJoin(examCategories, eq(examCategories.id, exams.categoryId))
    .leftJoin(testSeries, eq(testSeries.id, exams.seriesId))
    .leftJoin(examSections, eq(examSections.examId, exams.id))
    .leftJoin(examSectionQuestions, eq(examSectionQuestions.sectionId, examSections.id))
    .leftJoin(questions, eq(questions.id, examSectionQuestions.questionId))
    .where(and(...conds))
    .groupBy(exams.id, examCategories.id, testSeries.id)
    .orderBy(asc(exams.accessLevel), asc(exams.titleEn));
  return rows.filter((r) => r.slug && r.questionCount > 0);
}

export async function listSeriesForCategory(categoryId: string) {
  return getDb()
    .select()
    .from(testSeries)
    .where(and(eq(testSeries.categoryId, categoryId), eq(testSeries.isPublished, true)))
    .orderBy(asc(testSeries.titleEn));
}

async function getPublishedExamBySlug(slug: string): Promise<ExamRow> {
  const [e] = await getDb().select().from(exams).where(and(eq(exams.slug, slug), PUBLISHED));
  if (!e) throw new AppError("NOT_FOUND", "This mock test is not available.");
  return e;
}

export async function getPublicTestDetail(slug: string) {
  const exam = await getPublishedExamBySlug(slug);
  const db = getDb();
  const paper = await getPaperCached(exam.id);
  const [category] = exam.categoryId ? await db.select().from(examCategories).where(eq(examCategories.id, exam.categoryId)) : [];
  const [series] = exam.seriesId ? await db.select().from(testSeries).where(eq(testSeries.id, exam.seriesId)) : [];
  const hasHindi = paper.some((s) => s.questions.some((q) => !!q.textHi));
  return {
    exam: {
      id: exam.id,
      slug: exam.slug!,
      titleEn: exam.titleEn,
      titleHi: exam.titleHi,
      descriptionEn: exam.descriptionEn,
      descriptionHi: exam.descriptionHi,
      instructionsEn: exam.instructionsEn,
      instructionsHi: exam.instructionsHi,
      testKind: exam.testKind,
      accessLevel: exam.accessLevel,
      timed: exam.timed,
      durationMinutes: exam.defaultDurationMinutes,
      maxAttempts: exam.maxAttempts,
      resultPolicy: exam.resultPolicy,
      resultReleaseAt: exam.resultReleaseAt?.toISOString() ?? null,
    },
    languages: hasHindi ? ["en", "hi"] : ["en"],
    category: category ? { slug: category.slug, nameEn: category.nameEn, nameHi: category.nameHi } : null,
    series: series ? { slug: series.slug, titleEn: series.titleEn } : null,
    sections: paper.map((s) => ({
      titleEn: s.titleEn,
      titleHi: s.titleHi,
      questions: s.questions.length,
      marksCorrect: s.marksCorrect,
      marksWrong: s.marksWrong,
      maxMarks: s.questions.reduce((n, q) => n + q.marksCorrect, 0),
    })),
  };
}

// --- Access -------------------------------------------------------------------------

export async function hasAccess(studentId: string, exam: Pick<ExamRow, "id" | "accessLevel" | "seriesId">): Promise<boolean> {
  if (exam.accessLevel === "FREE") return true;
  const target = exam.seriesId
    ? or(eq(studentEntitlements.examId, exam.id), eq(studentEntitlements.seriesId, exam.seriesId))
    : eq(studentEntitlements.examId, exam.id);
  const [row] = await getDb()
    .select({ id: studentEntitlements.id })
    .from(studentEntitlements)
    .where(
      and(
        eq(studentEntitlements.studentId, studentId),
        target,
        or(isNull(studentEntitlements.expiresAt), gt(studentEntitlements.expiresAt, now())),
      ),
    )
    .limit(1);
  return !!row;
}

// --- Attempt lifecycle ----------------------------------------------------------------

export function practiceTiming(a: AttemptRow, at: Date): Timing & { timed: boolean } {
  const open = a.status === "IN_PROGRESS" && (!a.deadlineAt || at.getTime() < a.deadlineAt.getTime());
  // Untimed attempts get a far-future end so the shared countdown logic works.
  const end = a.deadlineAt ?? new Date(a.startedAt.getTime() + 365 * 24 * 3600 * 1000);
  return {
    serverNow: at.toISOString(),
    status: open ? "RUNNING" : "COMPLETED",
    phase: open ? "RUNNING" : "ENDED",
    loginOpensAt: a.startedAt.toISOString(),
    startAt: a.startedAt.toISOString(),
    endAt: end.toISOString(),
    pausedAt: null,
    lateEntryClosesAt: a.startedAt.toISOString(),
    remainingSeconds: open ? Math.max(0, Math.floor((end.getTime() - at.getTime()) / 1000)) : 0,
    secondsToStart: 0,
    durationSeconds: Math.round((end.getTime() - a.startedAt.getTime()) / 1000),
    timed: !!a.deadlineAt,
  };
}

async function loadOwnAttempt(p: StudentPrincipal, attemptId: string): Promise<AttemptRow> {
  const [a] = await getDb()
    .select()
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.id, attemptId), eq(practiceAttempts.studentId, p.studentId)));
  if (!a) throw new AppError("NOT_FOUND", "Attempt not found.");
  return a;
}

/** Submit an expired attempt (lazy enforcement on access). Returns the fresh row. */
async function closeIfExpired(a: AttemptRow, at: Date): Promise<AttemptRow> {
  if (a.status !== "IN_PROGRESS" || !a.deadlineAt || at.getTime() < a.deadlineAt.getTime()) return a;
  await finalizePracticeAttempt(a.id, "DEADLINE", at);
  const [fresh] = await getDb().select().from(practiceAttempts).where(eq(practiceAttempts.id, a.id));
  return fresh!;
}

export async function startPracticeAttempt(p: StudentPrincipal, input: { slug: string; language: Language }) {
  const exam = await getPublishedExamBySlug(input.slug);
  if (!(await hasAccess(p.studentId, exam))) {
    throw new AppError("FORBIDDEN", "This is a premium test. Your account does not have access to it.");
  }
  const db = getDb();
  const at = now();
  const [active] = await db
    .select()
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.studentId, p.studentId), eq(practiceAttempts.examId, exam.id), eq(practiceAttempts.status, "IN_PROGRESS")));
  if (active) {
    const current = await closeIfExpired(active, at);
    if (current.status === "IN_PROGRESS") return { attemptId: current.id, resumed: true };
  }
  const [{ done } = { done: 0 }] = await db
    .select({ done: count() })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.studentId, p.studentId), eq(practiceAttempts.examId, exam.id), sql`${practiceAttempts.status} <> 'IN_PROGRESS'`));
  if (exam.maxAttempts > 0 && done >= exam.maxAttempts) {
    throw new AppError("CONFLICT", `You have used all ${exam.maxAttempts} attempt(s) allowed for this test.`);
  }
  const paper = await getPaperCached(exam.id);
  if (paper.every((s) => s.questions.length === 0)) throw new AppError("VALIDATION", "This test has no questions yet.");
  // New attempts need an approved schedule whose window is open (only while the setting is on; off by default).
  const approval = (await getRequireApproval(db)) ? await findOpenApproval(p.studentId, exam.id, at) : undefined;
  if (approval === null) {
    throw new AppError("EXAM_NOT_OPEN", "Schedule this test and wait for admin approval. You can start it only during your approved time.");
  }

  const [m] = await db
    .select({ n: max(practiceAttempts.attemptNumber) })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.studentId, p.studentId), eq(practiceAttempts.examId, exam.id)));
  const deadlineAt = exam.timed ? new Date(at.getTime() + exam.defaultDurationMinutes * 60_000) : null;
  const [created] = await db
    .insert(practiceAttempts)
    .values({
      studentId: p.studentId,
      examId: exam.id,
      attemptNumber: (m?.n ?? 0) + 1,
      language: input.language,
      startedAt: at,
      deadlineAt,
      lastSeenAt: at,
    })
    .onConflictDoNothing()
    .returning({ id: practiceAttempts.id });
  if (created) {
    if (approval) await markRequestUsed(approval.id, created.id);
    return { attemptId: created.id, resumed: false };
  }
  // Lost a race with a concurrent start: converge on the attempt that won.
  const [winner] = await db
    .select({ id: practiceAttempts.id })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.studentId, p.studentId), eq(practiceAttempts.examId, exam.id), eq(practiceAttempts.status, "IN_PROGRESS")));
  if (!winner) throw new AppError("CONFLICT", "Could not start the test. Please try again.");
  return { attemptId: winner.id, resumed: true };
}

async function loadPracticeAnswers(attemptId: string): Promise<AnswerState[]> {
  return getDb()
    .select({
      questionId: practiceAnswers.questionId,
      selectedOptionId: practiceAnswers.selectedOptionId,
      markedForReview: practiceAnswers.markedForReview,
      revision: practiceAnswers.revision,
    })
    .from(practiceAnswers)
    .where(eq(practiceAnswers.attemptId, attemptId));
}

/** Same shape as the exam-centre paper so the CBT screen is shared. Never includes answer keys. */
export async function getPracticePaper(p: StudentPrincipal, attemptId: string) {
  const at = now();
  const a = await closeIfExpired(await loadOwnAttempt(p, attemptId), at);
  if (a.status !== "IN_PROGRESS") throw new AppError("ATTEMPT_SUBMITTED", "This attempt has been submitted.");
  const [exam] = await getDb().select({ titleEn: exams.titleEn, titleHi: exams.titleHi }).from(exams).where(eq(exams.id, a.examId));
  return {
    attempt: { id: a.id, status: a.status, language: a.language },
    exam: exam!,
    candidate: { rollNumber: p.email, fullName: p.fullName },
    sections: await getPaperCached(a.examId),
    answers: await loadPracticeAnswers(a.id),
    timing: practiceTiming(a, at),
  };
}

export async function getPracticeState(p: StudentPrincipal, attemptId: string) {
  const at = now();
  const a = await closeIfExpired(await loadOwnAttempt(p, attemptId), at);
  return { attemptStatus: a.status, timing: practiceTiming(a, at), answers: await loadPracticeAnswers(a.id) };
}

/**
 * Revision-checked answer writes, identical in semantics to the exam-centre
 * flow (see attempt-service.saveAnswers): newer revision wins, a retried
 * change is DUPLICATE, an older one is STALE with the server state returned.
 */
export async function savePracticeAnswers(p: StudentPrincipal, input: { attemptId: string; changes: AnswerChange[] }) {
  const at = now();
  const a = await closeIfExpired(await loadOwnAttempt(p, input.attemptId), at);
  if (a.status !== "IN_PROGRESS") throw new AppError("EXAM_ENDED", "Time is over; this attempt has been submitted.", { timing: practiceTiming(a, at) });
  const paper = await getPaperCached(a.examId);
  const validOptions = new Map<string, Set<string>>();
  for (const s of paper) for (const q of s.questions) validOptions.set(q.id, new Set(q.options.map((o) => o.id)));
  // Sectional timing applies to timed tests only, measured from the attempt start.
  const closed = a.deadlineAt ? closedQuestions(paper, (at.getTime() - a.startedAt.getTime()) / 1000) : new Set<string>();

  const results = await getDb().transaction(async (tx) => {
    const [locked] = await tx
      .select({ status: practiceAttempts.status, deadlineAt: practiceAttempts.deadlineAt })
      .from(practiceAttempts)
      .where(eq(practiceAttempts.id, a.id))
      .for("share");
    if (locked?.status !== "IN_PROGRESS") throw new AppError("ATTEMPT_SUBMITTED", "This attempt has been submitted.");
    if (locked.deadlineAt && at.getTime() >= locked.deadlineAt.getTime()) throw new AppError("EXAM_ENDED", "The time for this test is over.");
    const out: SaveItemResult[] = [];
    for (const c of input.changes) {
      const opts = validOptions.get(c.questionId);
      if (!opts) {
        out.push({ questionId: c.questionId, status: "INVALID", message: "Question is not part of this test." });
        continue;
      }
      if (c.selectedOptionId && !opts.has(c.selectedOptionId)) {
        out.push({ questionId: c.questionId, status: "INVALID", message: "Option does not belong to the question." });
        continue;
      }
      if (closed.has(c.questionId)) {
        out.push({ questionId: c.questionId, status: "INVALID", message: SECTION_CLOSED_MESSAGE });
        continue;
      }
      const [applied] = await tx
        .insert(practiceAnswers)
        .values({
          attemptId: a.id,
          questionId: c.questionId,
          selectedOptionId: c.selectedOptionId,
          markedForReview: c.markedForReview,
          revision: c.revision,
          idempotencyKey: c.idempotencyKey,
          createdAt: at,
          updatedAt: at,
        })
        .onConflictDoUpdate({
          target: [practiceAnswers.attemptId, practiceAnswers.questionId],
          set: {
            selectedOptionId: c.selectedOptionId,
            markedForReview: c.markedForReview,
            revision: c.revision,
            idempotencyKey: c.idempotencyKey,
            updatedAt: at,
          },
          setWhere: sql`${practiceAnswers.revision} < ${c.revision}`,
        })
        .returning({ revision: practiceAnswers.revision });
      if (applied) {
        out.push({ questionId: c.questionId, status: "SAVED", revision: applied.revision });
        continue;
      }
      const [cur] = await tx
        .select()
        .from(practiceAnswers)
        .where(and(eq(practiceAnswers.attemptId, a.id), eq(practiceAnswers.questionId, c.questionId)));
      if (cur && cur.revision === c.revision && cur.idempotencyKey === c.idempotencyKey) {
        out.push({ questionId: c.questionId, status: "DUPLICATE", revision: cur.revision });
      } else {
        out.push({
          questionId: c.questionId,
          status: "STALE",
          revision: cur?.revision ?? 0,
          server: {
            questionId: c.questionId,
            selectedOptionId: cur?.selectedOptionId ?? null,
            markedForReview: cur?.markedForReview ?? false,
            revision: cur?.revision ?? 0,
          },
        });
      }
    }
    await tx.update(practiceAttempts).set({ lastSeenAt: at }).where(eq(practiceAttempts.id, a.id));
    return out;
  });
  return { results, timing: practiceTiming(a, at) };
}

/**
 * The only path that ends a practice attempt. Compare-and-set on status
 * guarantees one result per attempt under concurrent submit/auto-submit.
 */
export async function finalizePracticeAttempt(
  attemptId: string,
  reason: "CANDIDATE" | "DEADLINE",
  at: Date = now(),
): Promise<{ alreadySubmitted: boolean }> {
  return getDb().transaction(async (tx) => {
    const [before] = await tx.select().from(practiceAttempts).where(eq(practiceAttempts.id, attemptId));
    if (!before) throw new AppError("NOT_FOUND", "Attempt not found.");
    const submittedAt = reason === "DEADLINE" && before.deadlineAt && at > before.deadlineAt ? before.deadlineAt : at;
    const [a] = await tx
      .update(practiceAttempts)
      .set({ status: reason === "CANDIDATE" ? "SUBMITTED" : "AUTO_SUBMITTED", submittedAt, submitReason: reason })
      .where(and(eq(practiceAttempts.id, attemptId), eq(practiceAttempts.status, "IN_PROGRESS")))
      .returning();
    if (!a) return { alreadySubmitted: true };

    const answers = await tx.select().from(practiceAnswers).where(eq(practiceAnswers.attemptId, attemptId));
    const { sections, key } = await loadAnswerKey(tx, a.examId);
    const keyIds = new Set(key.map((k) => k.questionId));
    const relevant = answers.filter((x) => keyIds.has(x.questionId));
    const score = scoreAttempt(
      sections.map((s) => ({ id: s.id, code: s.code, title: s.titleEn })),
      key,
      relevant.map((x) => ({ questionId: x.questionId, selectedOptionId: x.selectedOptionId })),
    );

    // Topic-wise breakdown for analytics.
    const meta = key.length
      ? await tx.select({ id: questions.id, topic: questions.topic, subject: questions.subject }).from(questions).where(inArray(questions.id, [...keyIds]))
      : [];
    const metaById = new Map(meta.map((m) => [m.id, m]));
    const answerByQ = new Map(relevant.map((x) => [x.questionId, x.selectedOptionId]));
    const topics = new Map<string, TopicScore>();
    for (const k of key) {
      const m = metaById.get(k.questionId);
      const topic = m?.topic || m?.subject || "General";
      const t = topics.get(topic) ?? { topic, subject: m?.subject ?? "", total: 0, attempted: 0, correct: 0, incorrect: 0 };
      t.total++;
      const sel = answerByQ.get(k.questionId) ?? null;
      if (sel) {
        t.attempted++;
        if (k.correctOptionIds.includes(sel)) t.correct++;
        else t.incorrect++;
      }
      topics.set(topic, t);
    }

    await tx.insert(practiceResults).values({
      attemptId,
      studentId: a.studentId,
      examId: a.examId,
      attemptNumber: a.attemptNumber,
      totalQuestions: score.totalQuestions,
      attempted: score.attempted,
      correct: score.correct,
      incorrect: score.incorrect,
      positiveMarks: score.positiveMarks,
      negativeMarks: score.negativeMarks,
      finalScore: score.finalScore,
      maxScore: score.maxScore,
      sectionScores: score.sections,
      topicScores: [...topics.values()],
      timeTakenSeconds: Math.max(0, Math.floor((submittedAt.getTime() - a.startedAt.getTime()) / 1000)),
      submittedAt,
      answersSnapshot: relevant.map((x) => ({ questionId: x.questionId, selectedOptionId: x.selectedOptionId, markedForReview: x.markedForReview })),
    });
    return { alreadySubmitted: false };
  });
}

export async function submitPracticeAttempt(p: StudentPrincipal, attemptId: string) {
  const a = await loadOwnAttempt(p, attemptId);
  const at = now();
  const reason = a.deadlineAt && at >= a.deadlineAt ? "DEADLINE" : "CANDIDATE";
  const r = await finalizePracticeAttempt(a.id, reason, at);
  return { attemptId: a.id, alreadySubmitted: r.alreadySubmitted };
}

/**
 * The student left fullscreen: the in-progress attempt is discarded (answers
 * cascade, no result) and the student must start the test again from the
 * beginning. Returns the test slug for the redirect.
 */
export async function cancelPracticeAttemptForFullscreenExit(p: StudentPrincipal, attemptId: string) {
  const a = await loadOwnAttempt(p, attemptId);
  const db = getDb();
  const [exam] = await db.select({ slug: exams.slug }).from(exams).where(eq(exams.id, a.examId));
  const [deleted] = await db
    .delete(practiceAttempts)
    .where(and(eq(practiceAttempts.id, a.id), eq(practiceAttempts.status, "IN_PROGRESS")))
    .returning({ id: practiceAttempts.id });
  if (!deleted) throw new AppError("ATTEMPT_SUBMITTED", "This attempt has been submitted.");
  await audit(db, { type: "STUDENT", id: p.studentId, label: p.email }, "practice_attempt.cancelled", { type: "practice_attempt", id: a.id }, {
    examId: a.examId,
    attemptNumber: a.attemptNumber,
    reason: "FULLSCREEN_EXIT",
  });
  return { slug: exam?.slug ?? null };
}

/** Scheduler hook: auto-submit every timed attempt whose deadline has passed. */
export async function finalizeExpiredPracticeAttempts(at: Date = now()): Promise<number> {
  const due = await getDb()
    .select({ id: practiceAttempts.id })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.status, "IN_PROGRESS"), lte(practiceAttempts.deadlineAt, at)))
    .limit(500);
  let n = 0;
  for (const d of due) {
    try {
      if (!(await finalizePracticeAttempt(d.id, "DEADLINE", at)).alreadySubmitted) n++;
    } catch (err) {
      console.error(`[practice] auto-submit failed for ${d.id}:`, (err as Error).message);
    }
  }
  return n;
}

// --- Results, solutions, history, analytics, leaderboard -----------------------------

function resultReleased(exam: Pick<ExamRow, "resultPolicy" | "resultReleaseAt">, at: Date): boolean {
  if (exam.resultPolicy === "IMMEDIATE") return true;
  return !!exam.resultReleaseAt && at.getTime() >= exam.resultReleaseAt.getTime();
}

export async function getPracticeResult(p: StudentPrincipal, attemptId: string) {
  const at = now();
  const a = await closeIfExpired(await loadOwnAttempt(p, attemptId), at);
  const db = getDb();
  const [exam] = await db.select().from(exams).where(eq(exams.id, a.examId));
  if (a.status === "IN_PROGRESS") return { status: "IN_PROGRESS" as const, attemptId: a.id, examSlug: exam!.slug };
  const [result] = await db.select().from(practiceResults).where(eq(practiceResults.attemptId, a.id));
  const base = {
    attemptId: a.id,
    attemptNumber: a.attemptNumber,
    exam: { id: exam!.id, slug: exam!.slug, titleEn: exam!.titleEn, titleHi: exam!.titleHi, timed: exam!.timed, durationMinutes: exam!.defaultDurationMinutes },
    submittedAt: a.submittedAt!.toISOString(),
    submitReason: a.submitReason,
  };
  if (!result) return { status: "PROCESSING" as const, ...base };
  if (!resultReleased(exam!, at)) {
    return {
      status: "PENDING_RELEASE" as const,
      ...base,
      releaseAt: exam!.resultReleaseAt?.toISOString() ?? null,
      answered: result.attempted,
      totalQuestions: result.totalQuestions,
    };
  }

  // Released: full solutions with explanations.
  const { sections, key } = await loadAnswerKey(db, a.examId);
  const qIds = key.map((k) => k.questionId);
  const explanations = qIds.length
    ? await db
        .select({ id: questions.id, explanationEn: questions.explanationEn, explanationHi: questions.explanationHi, topic: questions.topic })
        .from(questions)
        .where(inArray(questions.id, qIds))
    : [];
  const expById = new Map(explanations.map((e) => [e.id, e]));
  const keyById = new Map(key.map((k) => [k.questionId, k]));
  const selected = new Map(result.answersSnapshot.map((s) => [s.questionId, s]));
  const marked = qIds.length
    ? await db
        .select({ questionId: bookmarks.questionId })
        .from(bookmarks)
        .where(and(eq(bookmarks.studentId, p.studentId), inArray(bookmarks.questionId, qIds)))
    : [];
  const bookmarked = new Set(marked.map((m) => m.questionId));
  return {
    status: "RELEASED" as const,
    ...base,
    result: {
      totalQuestions: result.totalQuestions,
      attempted: result.attempted,
      unanswered: result.totalQuestions - result.attempted,
      correct: result.correct,
      incorrect: result.incorrect,
      positiveMarks: result.positiveMarks,
      negativeMarks: result.negativeMarks,
      finalScore: result.finalScore,
      maxScore: result.maxScore,
      accuracy: result.attempted ? Math.round((result.correct / result.attempted) * 1000) / 10 : 0,
      timeTakenSeconds: result.timeTakenSeconds,
      sectionScores: result.sectionScores,
      topicScores: result.topicScores,
    },
    solutions: sections.map((s) => ({
      id: s.id,
      titleEn: s.titleEn,
      titleHi: s.titleHi,
      questions: s.questions.map((q) => {
        const sel = selected.get(q.id)?.selectedOptionId ?? null;
        const correct = keyById.get(q.id)?.correctOptionIds ?? [];
        return {
          ...q,
          topic: expById.get(q.id)?.topic ?? null,
          selectedOptionId: sel,
          correctOptionIds: correct,
          outcome: sel === null ? ("UNANSWERED" as const) : correct.includes(sel) ? ("CORRECT" as const) : ("INCORRECT" as const),
          explanationEn: expById.get(q.id)?.explanationEn ?? null,
          explanationHi: expById.get(q.id)?.explanationHi ?? null,
          bookmarked: bookmarked.has(q.id),
        };
      }),
    })),
  };
}

export async function getStudentHistory(p: StudentPrincipal) {
  const at = now();
  const rows = await getDb()
    .select({
      attemptId: practiceAttempts.id,
      attemptNumber: practiceAttempts.attemptNumber,
      status: practiceAttempts.status,
      startedAt: practiceAttempts.startedAt,
      submittedAt: practiceAttempts.submittedAt,
      deadlineAt: practiceAttempts.deadlineAt,
      examSlug: exams.slug,
      titleEn: exams.titleEn,
      titleHi: exams.titleHi,
      resultPolicy: exams.resultPolicy,
      resultReleaseAt: exams.resultReleaseAt,
      finalScore: practiceResults.finalScore,
      maxScore: practiceResults.maxScore,
      correct: practiceResults.correct,
      attempted: practiceResults.attempted,
    })
    .from(practiceAttempts)
    .innerJoin(exams, eq(exams.id, practiceAttempts.examId))
    .leftJoin(practiceResults, eq(practiceResults.attemptId, practiceAttempts.id))
    .where(eq(practiceAttempts.studentId, p.studentId))
    .orderBy(desc(practiceAttempts.startedAt))
    .limit(200);
  // Scores of unreleased results are withheld.
  return rows.map((r) => {
    const released = resultReleased(r, at);
    return { ...r, released, finalScore: released ? r.finalScore : null, maxScore: released ? r.maxScore : null };
  });
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

/**
 * Analytics computed only from this student's stored, released results.
 * Unreleased results are excluded so analytics cannot leak scores early.
 */
export async function getStudentAnalytics(p: StudentPrincipal) {
  const at = now();
  const rows = await getDb()
    .select({ r: practiceResults, titleEn: exams.titleEn, slug: exams.slug, resultPolicy: exams.resultPolicy, resultReleaseAt: exams.resultReleaseAt, durationMinutes: exams.defaultDurationMinutes, timed: exams.timed })
    .from(practiceResults)
    .innerJoin(exams, eq(exams.id, practiceResults.examId))
    .where(eq(practiceResults.studentId, p.studentId))
    .orderBy(asc(practiceResults.submittedAt));
  const released = rows.filter((x) => resultReleased(x, at));

  const trend = released.map((x) => ({
    attemptId: x.r.attemptId,
    date: x.r.submittedAt.toISOString(),
    title: x.titleEn,
    scorePct: pct(x.r.finalScore, x.r.maxScore),
    accuracyPct: pct(x.r.correct, x.r.attempted),
    // Seconds spent per attempted question; lower is faster.
    secondsPerQuestion: x.r.attempted ? Math.round(x.r.timeTakenSeconds / x.r.attempted) : null,
    timeUsedPct: x.timed ? pct(x.r.timeTakenSeconds, x.durationMinutes * 60) : null,
  }));

  const sectionAgg = new Map<string, { section: string; attempted: number; correct: number; score: number; max: number }>();
  const topicAgg = new Map<string, TopicScore>();
  for (const x of released) {
    for (const s of x.r.sectionScores) {
      const cur = sectionAgg.get(s.title) ?? { section: s.title, attempted: 0, correct: 0, score: 0, max: 0 };
      cur.attempted += s.attempted;
      cur.correct += s.correct;
      cur.score += s.score;
      sectionAgg.set(s.title, cur);
    }
    for (const t of x.r.topicScores) {
      const cur = topicAgg.get(t.topic) ?? { ...t, total: 0, attempted: 0, correct: 0, incorrect: 0 };
      cur.total += t.total;
      cur.attempted += t.attempted;
      cur.correct += t.correct;
      cur.incorrect += t.incorrect;
      topicAgg.set(t.topic, cur);
    }
  }
  const topics = [...topicAgg.values()].map((t) => ({ ...t, accuracyPct: pct(t.correct, t.attempted) }));
  // Weak = attempted at least 2 questions in the topic with < 60 % accuracy.
  const weakTopics = topics.filter((t) => t.attempted >= 2 && t.accuracyPct < 60).sort((a, b) => a.accuracyPct - b.accuracyPct);

  const totalCorrect = released.reduce((n, x) => n + x.r.correct, 0);
  const totalAttempted = released.reduce((n, x) => n + x.r.attempted, 0);
  return {
    summary: {
      testsAttempted: released.length,
      averageScorePct: released.length ? Math.round((trend.reduce((n, t) => n + t.scorePct, 0) / released.length) * 10) / 10 : 0,
      bestScorePct: released.length ? Math.max(...trend.map((t) => t.scorePct)) : 0,
      accuracyPct: pct(totalCorrect, totalAttempted),
    },
    trend,
    sections: [...sectionAgg.values()].map((s) => ({ ...s, accuracyPct: pct(s.correct, s.attempted) })),
    topics: topics.sort((a, b) => b.attempted - a.attempted),
    weakTopics,
  };
}

/** Public tests not yet attempted, preferring those covering weak subjects. */
export async function getRecommendations(p: StudentPrincipal, weakSubjects: string[]) {
  const all = await listPublicTests();
  const attempted = await getDb()
    .selectDistinct({ examId: practiceAttempts.examId })
    .from(practiceAttempts)
    .where(eq(practiceAttempts.studentId, p.studentId));
  const done = new Set(attempted.map((a) => a.examId));
  const fresh = all.filter((t) => !done.has(t.id));
  if (!weakSubjects.length || !fresh.length) return fresh.slice(0, 4);
  const subjectsByExam = await getDb()
    .selectDistinct({ examId: examSections.examId, subject: examSections.subject })
    .from(examSections)
    .where(inArray(examSections.examId, fresh.map((t) => t.id)));
  const weak = new Set(weakSubjects.map((s) => s.toLowerCase()));
  const matches = new Set(subjectsByExam.filter((r) => weak.has(r.subject.toLowerCase())).map((r) => r.examId));
  return [...fresh.filter((t) => matches.has(t.id)), ...fresh.filter((t) => !matches.has(t.id))].slice(0, 4);
}

/**
 * Leaderboard methodology: each student's FIRST attempt only; ordered by
 * final score (desc), then time taken (asc). Students tied on both share a
 * rank (1, 2, 2, 4). Students who opted out are counted in the cohort but
 * shown anonymously. Only display names are shown.
 */
export async function getLeaderboard(examId: string, viewerStudentId?: string, limit = 50) {
  const at = now();
  const [exam] = await getDb().select().from(exams).where(eq(exams.id, examId));
  if (!exam) throw new AppError("NOT_FOUND", "Test not found.");
  if (!resultReleased(exam, at)) return { released: false as const, cohort: 0, rows: [], viewer: null };
  const rows = await getDb()
    .select({
      studentId: practiceResults.studentId,
      score: practiceResults.finalScore,
      maxScore: practiceResults.maxScore,
      timeTakenSeconds: practiceResults.timeTakenSeconds,
      displayName: students.displayName,
      show: students.showOnLeaderboard,
    })
    .from(practiceResults)
    .innerJoin(students, eq(students.id, practiceResults.studentId))
    .where(and(eq(practiceResults.examId, examId), eq(practiceResults.attemptNumber, 1)))
    .orderBy(desc(practiceResults.finalScore), asc(practiceResults.timeTakenSeconds));
  let rank = 0;
  let prev: { s: number; t: number } | null = null;
  const ranked = rows.map((r, i) => {
    if (!prev || r.score !== prev.s || r.timeTakenSeconds !== prev.t) rank = i + 1;
    prev = { s: r.score, t: r.timeTakenSeconds };
    return {
      rank,
      name: r.show || r.studentId === viewerStudentId ? r.displayName : "Anonymous",
      score: r.score,
      maxScore: r.maxScore,
      timeTakenSeconds: r.timeTakenSeconds,
      isViewer: r.studentId === viewerStudentId,
    };
  });
  const viewer = ranked.find((r) => r.isViewer) ?? null;
  const cohort = ranked.length;
  return {
    released: true as const,
    cohort,
    rows: ranked.slice(0, limit),
    viewer: viewer ? { ...viewer, percentile: cohort > 1 ? Math.round(((cohort - viewer.rank) / (cohort - 1)) * 1000) / 10 : null } : null,
  };
}

// --- Bookmarks ------------------------------------------------------------------------

export async function toggleBookmark(p: StudentPrincipal, questionId: string): Promise<{ bookmarked: boolean }> {
  const db = getDb();
  // Only questions from tests the student has a result for may be bookmarked.
  const [seen] = await db
    .select({ id: practiceResults.id })
    .from(practiceResults)
    .innerJoin(examSections, eq(examSections.examId, practiceResults.examId))
    .innerJoin(examSectionQuestions, eq(examSectionQuestions.sectionId, examSections.id))
    .where(and(eq(practiceResults.studentId, p.studentId), eq(examSectionQuestions.questionId, questionId)))
    .limit(1);
  if (!seen) throw new AppError("NOT_FOUND", "Question not found.");
  const removed = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.studentId, p.studentId), eq(bookmarks.questionId, questionId)))
    .returning();
  if (removed.length) return { bookmarked: false };
  await db.insert(bookmarks).values({ studentId: p.studentId, questionId }).onConflictDoNothing();
  return { bookmarked: true };
}

export async function listBookmarks(p: StudentPrincipal) {
  const db = getDb();
  const rows = await db
    .select({ q: questions, createdAt: bookmarks.createdAt })
    .from(bookmarks)
    .innerJoin(questions, eq(questions.id, bookmarks.questionId))
    .where(eq(bookmarks.studentId, p.studentId))
    .orderBy(desc(bookmarks.createdAt));
  const ids = rows.map((r) => r.q.id);
  const opts = ids.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, ids)).orderBy(asc(questionOptions.position)) : [];
  return rows.map((r) => ({
    id: r.q.id,
    subject: r.q.subject,
    topic: r.q.topic,
    textEn: r.q.textEn,
    textHi: r.q.textHi,
    explanationEn: r.q.explanationEn,
    explanationHi: r.q.explanationHi,
    options: opts.filter((o) => o.questionId === r.q.id).map((o, i) => ({ label: String.fromCharCode(65 + i), textEn: o.textEn, textHi: o.textHi, isCorrect: o.isCorrect })),
  }));
}

/** Incorrectly answered questions from released results, for "incorrect-answer practice". */
export async function listIncorrectQuestions(p: StudentPrincipal, limit = 50) {
  const analyticsRows = await getDb()
    .select({ snapshot: practiceResults.answersSnapshot, examId: practiceResults.examId, resultPolicy: exams.resultPolicy, resultReleaseAt: exams.resultReleaseAt })
    .from(practiceResults)
    .innerJoin(exams, eq(exams.id, practiceResults.examId))
    .where(eq(practiceResults.studentId, p.studentId))
    .orderBy(desc(practiceResults.submittedAt))
    .limit(20);
  const at = now();
  const chosen = new Map<string, string>();
  for (const r of analyticsRows) {
    if (!resultReleased(r, at)) continue;
    for (const s of r.snapshot) if (s.selectedOptionId && !chosen.has(s.questionId)) chosen.set(s.questionId, s.selectedOptionId);
  }
  if (!chosen.size) return [];
  const correctOpts = await getDb()
    .select({ questionId: questionOptions.questionId, id: questionOptions.id })
    .from(questionOptions)
    .where(and(inArray(questionOptions.questionId, [...chosen.keys()]), eq(questionOptions.isCorrect, true)));
  const wrongIds = correctOpts.filter((c) => chosen.get(c.questionId) !== c.id).map((c) => c.questionId).slice(0, limit);
  if (!wrongIds.length) return [];
  const qs = await getDb().select().from(questions).where(inArray(questions.id, wrongIds));
  const opts = await getDb().select().from(questionOptions).where(inArray(questionOptions.questionId, wrongIds)).orderBy(asc(questionOptions.position));
  return qs.map((q) => ({
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    textEn: q.textEn,
    textHi: q.textHi,
    explanationEn: q.explanationEn,
    explanationHi: q.explanationHi,
    yourOptionId: chosen.get(q.id) ?? null,
    options: opts.filter((o) => o.questionId === q.id).map((o, i) => ({ id: o.id, label: String.fromCharCode(65 + i), textEn: o.textEn, textHi: o.textHi, isCorrect: o.isCorrect })),
  }));
}
