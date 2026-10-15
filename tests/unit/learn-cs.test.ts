import { describe, expect, it } from "vitest";
import { CS_COURSE, CS_LESSONS, findLesson } from "@/lib/learn/cs";
import { shuffleOptions } from "@/lib/learn/shuffle";

describe("Computer Science course", () => {
  it("covers the whole syllabus in well-formed lessons", () => {
    expect(CS_COURSE.modules.length).toBe(12);
    expect(CS_LESSONS.length).toBeGreaterThanOrEqual(35);
    expect(new Set(CS_LESSONS.map((l) => l.slug)).size).toBe(CS_LESSONS.length);
    for (const { lesson, slug } of CS_LESSONS) {
      expect(slug).toMatch(/^[a-z0-9-]+--[a-z0-9-]+$/);
      expect(lesson.oneLine.length, slug).toBeGreaterThan(20);
      expect(lesson.blocks.length, slug).toBeGreaterThanOrEqual(3);
      expect(lesson.minutes).toBeGreaterThan(0);
      // Every lesson teaches with at least one example, table, code sample or formula.
      expect(lesson.blocks.some((b) => ["example", "table", "code", "formula", "diagram"].includes(b.t)), slug).toBe(true);
      for (const b of lesson.blocks) {
        if (b.t === "table") for (const r of b.rows) expect(r.length, `${slug}: ${r.join("|")}`).toBe(b.head.length);
      }
    }
  });

  it("has a quiz in every lesson with valid questions", () => {
    for (const { lesson, slug } of CS_LESSONS) {
      expect(lesson.quiz?.length, slug).toBeGreaterThanOrEqual(2);
      for (const q of lesson.quiz!) {
        expect(new Set(q.options).size, q.q).toBe(4);
        expect(q.explain.length, q.q).toBeGreaterThan(3);
      }
    }
  });

  it("navigates lesson to lesson", () => {
    const first = findLesson(CS_LESSONS[0]!.slug)!;
    expect(first.prev).toBeUndefined();
    expect(first.next?.slug).toBe(CS_LESSONS[1]!.slug);
    const last = findLesson(CS_LESSONS.at(-1)!.slug)!;
    expect(last.next).toBeUndefined();
    expect(findLesson("nope--nope")).toBeNull();
  });

  it("spot-checks answers that are easy to get wrong", () => {
    const quizOf = (slug: string) => findLesson(slug)!.ref.lesson.quiz!;
    const answerOf = (slug: string, start: string) => {
      const q = quizOf(slug).find((x) => x.q.startsWith(start))!;
      return q.options[q.answer];
    };
    expect(answerOf("digital--number-systems", "(1101)")).toBe("13");
    expect(answerOf("digital--conversions", "(2F)")).toBe("47");
    expect(answerOf("digital--conversions", "13 in binary")).toBe("1101");
    expect(answerOf("digital--conversions", "(101110)")).toBe("56");
    expect(answerOf("digital--binary-arithmetic", "The 2's complement of 1100")).toBe("0100");
    expect(answerOf("programming--python-essentials", "print(-7 // 2)")).toBe("-4");
    expect(answerOf("operating-systems--deadlock", "3 processes each need 2")).toBe("4");
    expect(answerOf("networks--ip-subnetting", "Usable hosts in a /28")).toBe("14");
    expect(answerOf("networks--datalink-security", "With a 3-bit sequence number")).toBe("7");
    expect(answerOf("software-engineering--testing-metrics", "Cyclomatic complexity of a graph with 10 edges")).toBe("4");
  });
});

describe("option shuffling", () => {
  it("keeps the correct answer and is deterministic", () => {
    const q = { options: ["a", "b", "c", "d"], answer: 1 };
    const s1 = shuffleOptions(q, "seed-1");
    expect(s1.options[s1.answer]).toBe("b");
    expect([...s1.options].sort()).toEqual(["a", "b", "c", "d"]);
    expect(shuffleOptions(q, "seed-1")).toEqual(s1);
  });

  it("spreads lesson-quiz answers over A–D", () => {
    const answers = CS_LESSONS.flatMap(({ slug, lesson }) => lesson.quiz!.map((q, i) => shuffleOptions(q, `${slug}-${i + 1}`).answer));
    for (const k of [0, 1, 2, 3]) expect(answers.filter((a) => a === k).length / answers.length).toBeLessThan(0.4);
  });
});
