import type { Block, Course, Lesson, LearnModule, LessonMcq } from "./types";

/** Attaches each module's test from a { moduleId: questions } map. */
export const withPractice = (modules: LearnModule[], practice: Record<string, LessonMcq[]>): LearnModule[] =>
  modules.map((m) => (practice[m.id] ? { ...m, practice: practice[m.id] } : m));

/** Adds extra blocks to lessons from a { "<module>--<lesson>": blocks } map, just before each lesson's recap. */
export const withExtraBlocks = (modules: LearnModule[], extra: Record<string, Block[]>): LearnModule[] =>
  modules.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => {
      const add = extra[lessonSlug(m, l)];
      if (!add) return l;
      const at = l.blocks.findIndex((b) => b.t === "recap");
      const blocks = at < 0 ? [...l.blocks, ...add] : [...l.blocks.slice(0, at), ...add, ...l.blocks.slice(at)];
      return { ...l, blocks };
    }),
  }));

/** The source the Try it editor opens for a block (the JavaScript version of a multicode block). */
export function tryItCodeOf(block: Block): string | undefined {
  if (block.t === "multicode") return block.code.javascript;
  if (block.t === "code") return block.code;
  return undefined;
}

/**
 * Which "Try it Yourself" runner a block gets, if any. Self-contained JavaScript
 * blocks with a known output run as plain JS; anything that imports modules doesn't.
 */
export function tryItModeOf(block: Block): "react" | "js" | undefined {
  if (block.t === "multicode") return "js"; // the JavaScript version runs in the browser
  if (block.t !== "code") return undefined;
  if (block.tryIt) return block.tryIt;
  const selfContained = !/^\s*(import|export)\b|require\(|\bReact\.|createRoot/m.test(block.code);
  return block.lang === "javascript" && block.output !== undefined && selfContained ? "js" : undefined;
}

export type LessonRef = { module: LearnModule; moduleIndex: number; lesson: Lesson; lessonIndex: number; slug: string };

/** Lesson URL slug: "<module>--<lesson>". */
export const lessonSlug = (m: LearnModule, l: Lesson) => `${m.id}--${l.id}`;

/** Every lesson of a course in order. */
export function courseLessons(course: Course): LessonRef[] {
  return course.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({ module, moduleIndex, lesson, lessonIndex, slug: lessonSlug(module, lesson) })),
  );
}

export function findCourseLesson(course: Course, slug: string): { ref: LessonRef; prev?: LessonRef; next?: LessonRef } | null {
  const all = courseLessons(course);
  const i = all.findIndex((r) => r.slug === slug);
  if (i < 0) return null;
  return { ref: all[i]!, prev: all[i - 1], next: all[i + 1] };
}

/**
 * Key used to remember a finished lesson in the browser. Computer Science keeps
 * its original plain slugs so earlier progress is not lost.
 */
export const progressKey = (course: Course, slug: string) => (course.id === "computer-science" ? slug : `${course.id}:${slug}`);
