import type { Course } from "./types";
import { CS_COURSE } from "./cs";
import { HISTORY_COURSE } from "./history";
import { GEOGRAPHY_COURSE } from "./geography";
import { POLITY_COURSE } from "./polity";
import { ECONOMY_COURSE } from "./economy";
import { REASONING_COURSE } from "./reasoning";
import { JAVASCRIPT_COURSE } from "./javascript";
import { REACT_COURSE } from "./react";
import { DSA_COURSE } from "./dsa";
import { PYTHON_COURSE } from "./python";
import { STATISTICS_COURSE } from "./statistics";
import { DATA_SCIENCE_COURSE } from "./datascience";
import { PDSH_COURSE } from "./pdsh";
import { ESSENTIAL_MATH_COURSE } from "./emath";
import { HANDS_ON_ML_COURSE } from "./homl";
import { courseLessons, findCourseLesson } from "./util";

/** Every Learn course, in the order shown on the courses page. */
export const COURSES: Course[] = [CS_COURSE, HISTORY_COURSE, GEOGRAPHY_COURSE, POLITY_COURSE, ECONOMY_COURSE, REASONING_COURSE, JAVASCRIPT_COURSE, REACT_COURSE, PYTHON_COURSE, DSA_COURSE, STATISTICS_COURSE, DATA_SCIENCE_COURSE, PDSH_COURSE, ESSENTIAL_MATH_COURSE, HANDS_ON_ML_COURSE];

export const LEARN_BASE = "/study-material/learn";

export const courseHref = (course: Course) => `${LEARN_BASE}/${course.id}`;

export const findCourse = (id: string) => COURSES.find((c) => c.id === id);

export function courseStats(course: Course) {
  const lessons = courseLessons(course);
  return {
    lessons,
    minutes: lessons.reduce((n, r) => n + r.lesson.minutes, 0),
    // Lesson quizzes plus module tests.
    questions:
      lessons.reduce((n, r) => n + (r.lesson.quiz?.length ?? 0), 0) + course.modules.reduce((n, m) => n + (m.practice?.length ?? 0), 0),
  };
}

export function findLessonIn(courseId: string, slug: string) {
  const course = findCourse(courseId);
  const found = course && findCourseLesson(course, slug);
  return course && found ? { course, ...found } : null;
}
