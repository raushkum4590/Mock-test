import { describe, expect, it } from "vitest";
import { scoreAttempt } from "@/lib/scoring/score";

const sections = [
  { id: "s1", code: "QA", title: "Quant" },
  { id: "s2", code: "GA", title: "GA" },
];

describe("scoring with negative marking", () => {
  it("final score = positive − negative, with per-section breakdown", () => {
    const qs = [
      { questionId: "q1", sectionId: "s1", correctOptionIds: ["a"], marksCorrect: 2, marksWrong: 0.5 },
      { questionId: "q2", sectionId: "s1", correctOptionIds: ["b"], marksCorrect: 2, marksWrong: 0.5 },
      { questionId: "q3", sectionId: "s2", correctOptionIds: ["c"], marksCorrect: 1, marksWrong: 0.25 },
      { questionId: "q4", sectionId: "s2", correctOptionIds: ["d"], marksCorrect: 1, marksWrong: 0.25 },
    ];
    const r = scoreAttempt(sections, qs, [
      { questionId: "q1", selectedOptionId: "a" }, // +2
      { questionId: "q2", selectedOptionId: "x" }, // −0.5
      { questionId: "q3", selectedOptionId: "x" }, // −0.25
      { questionId: "q4", selectedOptionId: null }, // 0
    ]);
    expect(r).toMatchObject({
      totalQuestions: 4,
      attempted: 3,
      unanswered: 1,
      correct: 1,
      incorrect: 2,
      positiveMarks: 2,
      negativeMarks: 0.75,
      finalScore: 1.25,
      maxScore: 6,
    });
    expect(r.sections.map((s) => [s.code, s.score])).toEqual([
      ["QA", 1.5],
      ["GA", -0.25],
    ]);
  });

  it("has no floating-point drift with fractional negative marks", () => {
    const qs = Array.from({ length: 3 }, (_, i) => ({ questionId: `q${i}`, sectionId: "s1", correctOptionIds: ["ok"], marksCorrect: 1, marksWrong: 0.33 }));
    const r = scoreAttempt(sections, qs, qs.map((q) => ({ questionId: q.questionId, selectedOptionId: "bad" })));
    expect(r.negativeMarks).toBe(0.99);
    expect(r.finalScore).toBe(-0.99);
  });

  it("scores can be negative and unanswered questions cost nothing", () => {
    const qs = [{ questionId: "q1", sectionId: "s1", correctOptionIds: ["a"], marksCorrect: 2, marksWrong: 0.5 }];
    expect(scoreAttempt(sections, qs, []).finalScore).toBe(0);
    expect(scoreAttempt(sections, qs, [{ questionId: "q1", selectedOptionId: "z" }]).finalScore).toBe(-0.5);
  });
});
