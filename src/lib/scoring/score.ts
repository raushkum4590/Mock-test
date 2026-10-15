/**
 * Scoring (pure). Final score = total positive marks − total negative marks.
 * Arithmetic is done in integer hundredths to avoid floating-point drift
 * (e.g. 3 × 0.33 negative marks).
 */
import type { SectionScore } from "@db/schema";

export type ScoringSection = { id: string; code: string; title: string };
export type ScoringQuestion = {
  questionId: string;
  sectionId: string;
  correctOptionIds: readonly string[];
  marksCorrect: number;
  marksWrong: number; // positive magnitude
};
export type ScoringAnswer = { questionId: string; selectedOptionId: string | null };

export type ScoreResult = {
  totalQuestions: number;
  attempted: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  positiveMarks: number;
  negativeMarks: number;
  finalScore: number;
  maxScore: number;
  sections: SectionScore[];
};

const toH = (n: number) => Math.round(n * 100);
const fromH = (h: number) => h / 100;

export function scoreAttempt(
  sections: readonly ScoringSection[],
  questions: readonly ScoringQuestion[],
  answers: readonly ScoringAnswer[],
): ScoreResult {
  const answerByQ = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));
  const acc = new Map(
    sections.map((s) => [
      s.id,
      { section: s, total: 0, attempted: 0, correct: 0, incorrect: 0, posH: 0, negH: 0, maxH: 0 },
    ]),
  );

  for (const q of questions) {
    const a = acc.get(q.sectionId);
    if (!a) throw new Error(`Question ${q.questionId} references unknown section ${q.sectionId}`);
    a.total++;
    a.maxH += toH(q.marksCorrect);
    const selected = answerByQ.get(q.questionId) ?? null;
    if (selected === null) continue;
    a.attempted++;
    if (q.correctOptionIds.includes(selected)) {
      a.correct++;
      a.posH += toH(q.marksCorrect);
    } else {
      a.incorrect++;
      a.negH += toH(q.marksWrong);
    }
  }

  const sectionScores: SectionScore[] = [];
  let posH = 0;
  let negH = 0;
  let maxH = 0;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  for (const a of acc.values()) {
    posH += a.posH;
    negH += a.negH;
    maxH += a.maxH;
    attempted += a.attempted;
    correct += a.correct;
    incorrect += a.incorrect;
    sectionScores.push({
      sectionId: a.section.id,
      code: a.section.code,
      title: a.section.title,
      total: a.total,
      attempted: a.attempted,
      correct: a.correct,
      incorrect: a.incorrect,
      positive: fromH(a.posH),
      negative: fromH(a.negH),
      score: fromH(a.posH - a.negH),
    });
  }

  return {
    totalQuestions: questions.length,
    attempted,
    unanswered: questions.length - attempted,
    correct,
    incorrect,
    positiveMarks: fromH(posH),
    negativeMarks: fromH(negH),
    finalScore: fromH(posH - negH),
    maxScore: fromH(maxH),
    sections: sectionScores,
  };
}
