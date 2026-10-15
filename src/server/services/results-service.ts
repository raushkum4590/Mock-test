import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  candidateAnswers,
  candidateAttempts,
  candidates,
  examAssignments,
  examSchedules,
  exams,
  results,
  submissions,
} from "@db/schema";
import { getDb } from "@/lib/db/client";
import { toCsv } from "@/lib/csv";
import { AppError } from "@/lib/errors";
import { formatDateTime } from "@/lib/time/zone";
import { audit, authorize, type Actor } from "./audit-service";
import { loadAnswerKey } from "./exam-service";

export type ResultRow = Awaited<ReturnType<typeof listScheduleResults>>["rows"][number];

/** Results for every assigned candidate, ranked by final score (1,2,2,4 ranking). */
export async function listScheduleResults(scheduleId: string) {
  const db = getDb();
  const [schedule] = await db
    .select({ s: examSchedules, examTitle: exams.titleEn, examCode: exams.code })
    .from(examSchedules)
    .innerJoin(exams, eq(exams.id, examSchedules.examId))
    .where(eq(examSchedules.id, scheduleId));
  if (!schedule) throw new AppError("NOT_FOUND", "Schedule not found.");
  const rows = await db
    .select({
      candidateId: candidates.id,
      rollNumber: candidates.rollNumber,
      fullName: candidates.fullName,
      attemptId: candidateAttempts.id,
      attemptStatus: candidateAttempts.status,
      startedAt: candidateAttempts.startedAt,
      submittedAt: candidateAttempts.submittedAt,
      submitReason: candidateAttempts.submitReason,
      result: results,
    })
    .from(examAssignments)
    .innerJoin(candidates, eq(candidates.id, examAssignments.candidateId))
    .leftJoin(candidateAttempts, eq(candidateAttempts.assignmentId, examAssignments.id))
    .leftJoin(results, eq(results.attemptId, candidateAttempts.id))
    .where(eq(examAssignments.scheduleId, scheduleId))
    .orderBy(desc(results.finalScore), asc(candidates.rollNumber));

  let rank = 0;
  let lastScore: number | null = null;
  let seen = 0;
  const ranked = rows.map((r) => {
    if (!r.result) return { ...r, rank: null as number | null };
    seen++;
    if (lastScore === null || r.result.finalScore !== lastScore) {
      rank = seen;
      lastScore = r.result.finalScore;
    }
    return { ...r, rank };
  });
  return { schedule: schedule.s, examTitle: schedule.examTitle, examCode: schedule.examCode, rows: ranked };
}

export async function exportScheduleResultsCsv(actor: Actor, scheduleId: string): Promise<{ filename: string; csv: string }> {
  authorize(actor, "results.export");
  const { schedule, examCode, rows } = await listScheduleResults(scheduleId);
  const sectionCodes = [...new Set(rows.flatMap((r) => r.result?.sectionScores.map((s) => s.code) ?? []))];
  const columns = [
    "rank",
    "roll_number",
    "name",
    "status",
    "submitted_at",
    "submit_reason",
    "total_questions",
    "attempted",
    "unanswered",
    "correct",
    "incorrect",
    "positive_marks",
    "negative_marks",
    "final_score",
    "max_score",
    "time_taken_seconds",
    ...sectionCodes.map((c) => `section_${c}`),
    "note",
  ];
  const data = rows.map((r) => {
    const base: Record<string, unknown> = {
      rank: r.rank ?? "",
      roll_number: r.rollNumber,
      name: r.fullName,
      status: r.attemptStatus ?? "ABSENT",
      submitted_at: r.submittedAt ? formatDateTime(r.submittedAt, schedule.timeZone) : "",
      submit_reason: r.submitReason ?? "",
      total_questions: r.result?.totalQuestions ?? "",
      attempted: r.result?.attempted ?? "",
      unanswered: r.result?.unanswered ?? "",
      correct: r.result?.correct ?? "",
      incorrect: r.result?.incorrect ?? "",
      positive_marks: r.result?.positiveMarks ?? "",
      negative_marks: r.result?.negativeMarks ?? "",
      final_score: r.result?.finalScore ?? "",
      max_score: r.result?.maxScore ?? "",
      time_taken_seconds: r.result?.timeTakenSeconds ?? "",
      note: "Mock examination result - not an official SSC result",
    };
    for (const c of sectionCodes) base[`section_${c}`] = r.result?.sectionScores.find((s) => s.code === c)?.score ?? "";
    return base;
  });
  await audit(getDb(), actor, "results.export", { type: "schedule", id: scheduleId }, { rows: data.length });
  return { filename: `results-${examCode}-${schedule.id.slice(0, 8)}.csv`, csv: toCsv(columns, data) };
}

export async function setResultsPublished(actor: Actor, scheduleId: string, published: boolean) {
  authorize(actor, "schedules.publish");
  const db = getDb();
  const [row] = await db
    .update(examSchedules)
    .set({ resultsPublished: published })
    .where(and(eq(examSchedules.id, scheduleId), inArray(examSchedules.status, ["COMPLETED"])))
    .returning({ id: examSchedules.id });
  if (!row) throw new AppError("CONFLICT", "Results can be released only after the exam has completed.");
  await audit(db, actor, published ? "results.release" : "results.withhold", { type: "schedule", id: scheduleId });
}

/** Printable result sheet with per-question review (admin only). */
export async function getResultSheet(scheduleId: string, candidateId: string) {
  const db = getDb();
  const [row] = await db
    .select({ attempt: candidateAttempts, candidate: candidates, result: results, submission: submissions })
    .from(candidateAttempts)
    .innerJoin(candidates, eq(candidates.id, candidateAttempts.candidateId))
    .innerJoin(results, eq(results.attemptId, candidateAttempts.id))
    .innerJoin(submissions, eq(submissions.attemptId, candidateAttempts.id))
    .where(and(eq(candidateAttempts.scheduleId, scheduleId), eq(candidateAttempts.candidateId, candidateId)));
  if (!row) throw new AppError("NOT_FOUND", "No result for this candidate.");
  const [schedule] = await db.select().from(examSchedules).where(eq(examSchedules.id, scheduleId));
  const [exam] = await db.select().from(exams).where(eq(exams.id, schedule!.examId));
  const { sections, key } = await loadAnswerKey(db, schedule!.examId);
  const answers = await db.select().from(candidateAnswers).where(eq(candidateAnswers.attemptId, row.attempt.id));
  const answerByQ = new Map(answers.map((a) => [a.questionId, a]));
  const keyByQ = new Map(key.map((k) => [k.questionId, k]));
  return {
    ...row,
    schedule: schedule!,
    exam: exam!,
    review: sections.map((s) => ({
      section: s,
      questions: s.questions.map((q) => {
        const sel = answerByQ.get(q.id)?.selectedOptionId ?? null;
        const correct = keyByQ.get(q.id)?.correctOptionIds ?? [];
        return {
          question: q,
          selectedOptionId: sel,
          correctOptionIds: correct,
          outcome: sel === null ? "UNANSWERED" : correct.includes(sel) ? "CORRECT" : "INCORRECT",
        };
      }),
    })),
  };
}
