import type { Course, Lesson, LearnModule, LessonMcq } from "./types";

/** Attaches each module's test from a { moduleId: questions } map. */
export const withPractice = (modules: LearnModule[], practice: Record<string, LessonMcq[]>): LearnModule[] =>
  modules.map((m) => (practice[m.id] ? { ...m, practice: practice[m.id] } : m));

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
