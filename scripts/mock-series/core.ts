/**
 * Shared building blocks for the generated mock-test series.
 *
 * Every question is either computed (the answer is calculated by the code, so
 * the key cannot be wrong) or built from a reviewed fact table. A seeded RNG
 * makes every run reproducible.
 */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type GenQuestion = {
  /** Uniqueness key: two questions with the same key are the same question. */
  key: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  en: string;
  hi?: string;
  /** Exactly 4 options; `optionsHi` (if given) is parallel to `options`. */
  options: string[];
  optionsHi?: string[];
  correct: number;
  explanationEn?: string;
  explanationHi?: string;
};

export type Rng = () => number;

/** mulberry32 — small, fast, seedable. */
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;

export function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function sample<T>(r: Rng, xs: readonly T[], n: number): T[] {
  return shuffle(r, xs).slice(0, n);
}

/**
 * Build a 4-option MCQ: the correct answer plus 3 distinct distractors,
 * shuffled. Distractors equal to the answer (or to each other) are dropped;
 * returns null when 3 distinct distractors are not available.
 */
export function mcq(
  r: Rng,
  base: Omit<GenQuestion, "options" | "optionsHi" | "correct">,
  answer: string,
  distractors: string[],
  hi?: { answer: string; distractors: string[] },
): GenQuestion | null {
  const seen = new Set([answer]);
  const picked: number[] = [];
  distractors.forEach((d, i) => {
    if (picked.length < 3 && !seen.has(d)) {
      seen.add(d);
      picked.push(i);
    }
  });
  if (picked.length < 3) return null;
  const entries = [
    { en: answer, hi: hi?.answer, ok: true },
    ...picked.map((i) => ({ en: distractors[i]!, hi: hi?.distractors[i], ok: false })),
  ];
  const order = shuffle(r, entries);
  return {
    ...base,
    options: order.map((o) => o.en),
    optionsHi: hi ? order.map((o) => o.hi ?? o.en) : undefined,
    correct: order.findIndex((o) => o.ok),
  };
}

/** Numeric distractors near the answer (distinct, positive unless allowNegative). */
export function nearNumbers(r: Rng, answer: number, opts: { spread?: number; step?: number; allowNegative?: boolean } = {}): number[] {
  const step = opts.step ?? 1;
  const spread = opts.spread ?? 5;
  const out = new Set<number>();
  let guard = 0;
  while (out.size < 6 && guard++ < 200) {
    const d = int(r, 1, spread) * step * (r() < 0.5 ? -1 : 1);
    const v = Math.round((answer + d) * 1000) / 1000;
    if (v === answer) continue;
    if (!opts.allowNegative && (v < 0 || (v === 0 && answer > 0))) continue;
    out.add(v);
  }
  return [...out];
}

/** 1 → "1st", 2 → "2nd", 13 → "13th", 22 → "22nd". */
export const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
};

export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/** A fact-table question: "column A → column B", distractors from other rows' B values. */
export function factQuestion<T>(
  r: Rng,
  rows: readonly T[],
  row: T,
  spec: {
    key: (row: T) => string;
    subject: string;
    topic: string;
    difficulty?: Difficulty;
    en: (row: T) => string;
    hi?: (row: T) => string;
    answer: (row: T) => string;
    answerHi?: (row: T) => string;
    explanationEn?: (row: T) => string;
  },
): GenQuestion | null {
  const answer = spec.answer(row);
  const others = shuffle(
    r,
    rows.filter((x) => spec.answer(x) !== answer),
  );
  return mcq(
    r,
    {
      key: spec.key(row),
      subject: spec.subject,
      topic: spec.topic,
      difficulty: spec.difficulty ?? "MEDIUM",
      en: spec.en(row),
      hi: spec.hi?.(row),
      explanationEn: spec.explanationEn?.(row),
    },
    answer,
    others.map((x) => spec.answer(x)),
    spec.answerHi ? { answer: spec.answerHi(row), distractors: others.map((x) => spec.answerHi!(x)) } : undefined,
  );
}
