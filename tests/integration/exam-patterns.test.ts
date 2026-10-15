import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { examCategories, examSections, exams } from "@db/schema";
import { EXAM_PATTERNS, patternTotals } from "@/lib/exam-patterns";
import { EXAM_TYPES } from "@/lib/validation/schemas";
import { createExamFromPattern } from "@/server/services/exam-service";
import { createTestDb, type TestDb } from "../helpers/db";
import { createAdmin } from "../helpers/fixtures";

describe("exam pattern library", () => {
  it("every pattern is internally consistent", () => {
    const ids = new Set<string>();
    const categoryNames = new Map<string, string>();
    for (const p of EXAM_PATTERNS) {
      // One category slug always means the same category.
      expect(categoryNames.get(p.category.slug) ?? p.category.nameEn, `category ${p.category.slug}`).toBe(p.category.nameEn);
      categoryNames.set(p.category.slug, p.category.nameEn);
      expect(p.id.length).toBeLessThanOrEqual(40);
      expect(ids.has(p.id), `duplicate id ${p.id}`).toBe(false);
      ids.add(p.id);
      expect(EXAM_TYPES).toContain(p.group);
      expect(p.source).toMatch(/^https:\/\//);
      expect(p.sections.length).toBeGreaterThan(0);
      expect(new Set(p.sections.map((s) => s.code)).size, `${p.id}: duplicate section code`).toBe(p.sections.length);
      expect(patternTotals(p).questions).toBeGreaterThan(0);
      // Timed groups must fit in the total duration and have a length.
      const groups = new Map<string, number>();
      for (const s of p.sections) {
        if (s.timerGroup) {
          expect(s.groupMinutes, `${p.id}/${s.code}`).toBeGreaterThan(0);
          groups.set(s.timerGroup, s.groupMinutes!);
        }
      }
      const timed = [...groups.values()].reduce((a, b) => a + b, 0);
      expect(timed, p.id).toBeLessThanOrEqual(p.durationMinutes);
      if (p.timing === "SECTIONAL") expect(timed, `${p.id}: sectional timers must add up to the duration`).toBe(p.durationMinutes);
    }
  });

  describe("create from pattern", () => {
    let t: TestDb;
    let admin: Awaited<ReturnType<typeof createAdmin>>;
    beforeAll(async () => {
      t = await createTestDb();
      admin = await createAdmin();
    });
    afterAll(() => t.close());

    it("creates a draft test with category, duration and sections; codes stay unique", async () => {
      const { id } = await createExamFromPattern(admin, { patternId: "ctet-paper2" });
      const [exam] = await t.db.select().from(exams).where(eq(exams.id, id));
      expect(exam).toMatchObject({ examType: "TEACHING", defaultDurationMinutes: 150, status: "DRAFT", code: "CTET-PAPER2" });
      expect(exam!.instructionsEn).toContain("150 questions");
      const [category] = await t.db.select().from(examCategories).where(eq(examCategories.id, exam!.categoryId!));
      expect(category!.slug).toBe("ctet");
      const sections = await t.db.select().from(examSections).where(eq(examSections.examId, id));
      expect(sections.map((s) => s.code).sort()).toEqual(["CDP", "L1", "L2", "SUBJ"]);
      expect(sections.every((s) => s.marksWrong === 0)).toBe(true);

      // A second test from the same pattern reuses the category and gets a new code.
      const second = await createExamFromPattern(admin, { patternId: "ctet-paper2", titleEn: "CTET Paper II Mock 2" });
      const [exam2] = await t.db.select().from(exams).where(eq(exams.id, second.id));
      expect(exam2).toMatchObject({ code: "CTET-PAPER2-2", titleEn: "CTET Paper II Mock 2", categoryId: exam!.categoryId });
    });

    it("rejects unknown patterns and unauthorised staff", async () => {
      await expect(createExamFromPattern(admin, { patternId: "nope" })).rejects.toMatchObject({ code: "NOT_FOUND" });
      const viewer = await createAdmin("RESULT_VIEWER");
      await expect(createExamFromPattern(viewer, { patternId: "ssc-cgl-tier1" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });
});
