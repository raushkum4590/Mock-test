import { describe, expect, it } from "vitest";
import { COURSES, findCourse, findLessonIn } from "@/lib/learn/courses";
import { courseLessons, progressKey } from "@/lib/learn/util";
import { shuffleOptions } from "@/lib/learn/shuffle";
import { SUBJECT_GUIDES } from "@/lib/study-material/subject-guides";
import { directionName } from "@/components/learn/lesson-visuals";

describe("Learn courses", () => {
  it("registers each course once, with a matching revision guide", () => {
    expect(COURSES.map((c) => c.id)).toEqual(["computer-science", "history", "geography", "polity", "economy", "reasoning"]);
    for (const c of COURSES) expect(SUBJECT_GUIDES.some((g) => g.id === c.id), c.id).toBe(true);
    expect(findCourse("nope")).toBeUndefined();
  });

  for (const course of COURSES) {
    describe(course.title, () => {
      const lessons = courseLessons(course);

      it("has well-formed lessons", () => {
        expect(course.modules.length).toBeGreaterThanOrEqual(4);
        expect(new Set(lessons.map((l) => l.slug)).size).toBe(lessons.length);
        for (const { lesson, slug } of lessons) {
          expect(slug).toMatch(/^[a-z0-9-]+--[a-z0-9-]+$/);
          expect(lesson.oneLine.length, slug).toBeGreaterThan(20);
          expect(lesson.blocks.length, slug).toBeGreaterThanOrEqual(3);
          expect(lesson.blocks.some((b) => b.t === "recap"), `${slug} recap`).toBe(true);
          for (const b of lesson.blocks) {
            if (b.t === "table") for (const r of b.rows) expect(r.length, `${slug}: ${r.join("|")}`).toBe(b.head.length);
          }
        }
      });

      it("has a valid quiz in every lesson", () => {
        for (const { lesson, slug } of lessons) {
          expect(lesson.quiz?.length, slug).toBeGreaterThanOrEqual(2);
          for (const q of lesson.quiz!) {
            expect(new Set(q.options).size, q.q).toBe(4);
            expect(q.explain.length, q.q).toBeGreaterThan(3);
          }
        }
      });

      it("has an exam-level module test after every module (GS courses)", () => {
        if (course.id === "computer-science") return;
        for (const m of course.modules) {
          expect(m.practice?.length, m.id).toBeGreaterThanOrEqual(10);
          for (const q of m.practice!) {
            expect(new Set(q.options).size, q.q).toBe(4);
            expect(q.explain.length, q.q).toBeGreaterThan(3);
          }
          expect(new Set(m.practice!.map((q) => q.q)).size, m.id).toBe(m.practice!.length);
        }
      });

      it("navigates and keys progress per course", () => {
        const first = findLessonIn(course.id, lessons[0]!.slug)!;
        expect(first.prev).toBeUndefined();
        expect(first.next?.slug).toBe(lessons[1]?.slug);
        expect(findLessonIn(course.id, "nope--nope")).toBeNull();
        const key = progressKey(course, lessons[0]!.slug);
        expect(key).toBe(course.id === "computer-science" ? lessons[0]!.slug : `${course.id}:${lessons[0]!.slug}`);
      });
    });
  }

  it("spot-checks facts that are easy to get wrong", () => {
    const answerOf = (course: string, slug: string, start: string) => {
      const q = findLessonIn(course, slug)!.ref.lesson.quiz!.find((x) => x.q.startsWith(start))!;
      return q.options[q.answer];
    };
    expect(answerOf("polity", "union--president-vp", "The President's pardoning")).toBe("72");
    expect(answerOf("polity", "states-local--federalism-emergency", "Which emergency")).toBe("Financial");
    expect(answerOf("polity", "bodies-amendments--amendments-cases", "The voting age")).toBe("61st Amendment");
    expect(answerOf("geography", "physical--earth-time", "If it is 12 noon")).toBe("2 p.m.");
    expect(answerOf("geography", "india-physical--location-physiography", "The Tropic of Cancer does NOT")).toBe("Bihar");
    expect(answerOf("geography", "india-economic--population", "India's sex ratio")).toBe("943");
    expect(answerOf("economy", "money-banking--money-inflation", "RBI's inflation target")).toBe("4% ± 2%");
    expect(answerOf("economy", "public-finance--budget-deficits", "Primary deficit")).toBe("Fiscal deficit − interest payments");
    expect(answerOf("economy", "development--poverty-schemes", "Under PM-KISAN")).toBe("₹6,000");
    expect(answerOf("history", "modern--acts-governors", "The first Governor-General of India")).toBe("William Bentinck");
    expect(answerOf("history", "culture--literature-philosophy", "Rajatarangini")).toBe("Kalhana");
    expect(answerOf("polity", "union--parliament-working", "Which committee consists")).toBe("Estimates Committee");
    expect(answerOf("geography", "india-physical--passes-lakes-dams", "The largest freshwater")).toBe("Wular");
    expect(answerOf("economy", "money-banking--banks-npa-committees", "A loan is classified")).toBe("90 days");
    expect(answerOf("reasoning", "coding-series--alphanumeric-series", "4, 7, 12, 19")).toBe("39");
    expect(answerOf("reasoning", "relations-direction--direction-distance", "In the evening")).toBe("West");
    expect(answerOf("reasoning", "arrangements--circular-seating", "In the round table")).toBe("C");
    expect(answerOf("reasoning", "critical-ds--data-sufficiency", "What is the speed")).toBe("Either alone is sufficient");
  });

  it("gives every Reasoning lesson a drawn figure with valid data", () => {
    const visual = new Set(["venn", "seats", "path", "tree", "stack", "series", "steps"]);
    for (const { lesson, slug } of courseLessons(findCourse("reasoning")!)) {
      expect(lesson.blocks.some((b) => visual.has(b.t)), slug).toBe(true);
      for (const b of lesson.blocks) {
        if (b.t === "series" && b.gaps) expect(b.gaps.length, slug).toBe(b.terms.length - 1);
        if (b.t === "seats" || b.t === "stack") for (const m of b.mark ?? []) expect(b.t === "seats" ? b.seats : b.items, slug).toContain(m);
        if (b.t === "tree") {
          const ids = b.people.map((p) => p.id);
          for (const [x, y] of b.links) expect(ids, slug).toEqual(expect.arrayContaining([x, y]));
        }
        if (b.t === "venn") for (const c of b.circles) expect(c.x - c.r >= 0 && c.x + c.r <= 200 && c.y - c.r >= 0 && c.y + c.r <= 120, `${slug} ${c.label}`).toBe(true);
      }
    }
  });

  it("names the direction of a walk's end point", () => {
    expect(directionName(-8, 6)).toBe("north-west");
    expect(directionName(4, 0)).toBe("east");
    expect(directionName(0, -5)).toBe("south");
    expect(directionName(0, 0)).toBe("at the start");
  });

  it("spreads shuffled answers over A–D in every course", () => {
    for (const course of COURSES) {
      const answers = courseLessons(course).flatMap(({ slug, lesson }) => lesson.quiz!.map((q, i) => shuffleOptions(q, `${slug}-${i + 1}`).answer));
      for (const k of [0, 1, 2, 3]) expect(answers.filter((a) => a === k).length / answers.length, `${course.id} ${k}`).toBeLessThan(0.45);
    }
  });
});
