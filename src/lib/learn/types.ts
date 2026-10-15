/**
 * Original lessons for the Learn section. Text supports two inline marks:
 * **bold** and `code`. Content is written for EdQity (not copied).
 */

export type Block =
  /** A paragraph. */
  | { t: "p"; text: string }
  /** "Think of it like…" — an everyday picture of the idea. */
  | { t: "analogy"; text: string }
  /** Short key points. */
  | { t: "points"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  /** Code (C, C++, Python, SQL…) with optional output. */
  | { t: "code"; lang: string; code: string; output?: string; note?: string }
  /** A solved example, step by step. */
  | { t: "example"; title: string; steps: string[]; answer: string }
  /** A common mistake / exam trap. */
  | { t: "trap"; text: string }
  /** A memory trick. */
  | { t: "trick"; text: string }
  /** Formulas to remember: [name, formula]. */
  | { t: "formula"; items: [string, string][] }
  /** Monospace diagram. */
  | { t: "diagram"; text: string; caption?: string }
  /** "How exams ask this": the fact patterns that keep coming back in papers. */
  | { t: "exam"; items: string[] }
  /** End-of-lesson summary: what to remember in 30 seconds. */
  | { t: "recap"; items: string[] }
  // ---- Drawn figures (SVG), used mainly by the Reasoning course ----
  /** Venn diagram: circles in a 200 × 120 box. */
  | { t: "venn"; circles: { label: string; x: number; y: number; r: number }[]; caption?: string }
  /** People in a row (left → right) or around a circle (clockwise from the top). */
  | { t: "seats"; shape: "row" | "circle"; seats: string[]; facing: "north" | "south" | "in" | "out"; mark?: string[]; caption?: string }
  /** A walk drawn on a grid with the straight-line distance back to the start. */
  | { t: "path"; moves: { dir: CompassDir; dist: number }[]; caption?: string }
  /** Family tree: generation 0 at the top; links are [from, to, kind]. */
  | { t: "tree"; people: { id: string; sex: "m" | "f" | "?"; gen: number; note?: string }[]; links: [string, string, "child" | "spouse" | "sibling"][]; caption?: string }
  /** Floors or stacked boxes, listed bottom first. */
  | { t: "stack"; items: string[]; label?: string; mark?: string[]; caption?: string }
  /** Terms with the step between each pair (+3, ×2, >, ≥ …). */
  | { t: "series"; terms: string[]; gaps?: string[]; caption?: string }
  /** Step-by-step rearrangement; `moved` items are highlighted. */
  | { t: "steps"; rows: { label: string; items: string[]; moved?: string[] }[]; caption?: string };

export type CompassDir = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type LessonMcq = { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; explain: string };

export type Lesson = {
  id: string;
  title: string;
  /** The big idea in one line. */
  oneLine: string;
  minutes: number;
  blocks: Block[];
  quiz?: LessonMcq[];
};

export type LearnModule = {
  id: string;
  title: string;
  titleHi: string;
  blurb: string;
  lessons: Lesson[];
  /** Exam-level module test, shown after the module's last lesson. */
  practice?: LessonMcq[];
};

export type CourseLink = { title: string; titleHi: string; sub: string; subHi: string; href: string };

export type Course = {
  id: string;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  /** Exams this course prepares for (shown on the cover). */
  tagline: string;
  /** Short card label, e.g. "History". */
  short: string;
  shortHi: string;
  modules: LearnModule[];
  /** Extra links at the bottom of the course page (mocks, kits, PDFs). */
  links?: CourseLink[];
};
