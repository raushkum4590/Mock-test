/** Mock-series definitions and the assembler that deals questions into tests. */
import { ARITHMETIC_GENERATORS } from "./arithmetic";
import { allBiharQuestions } from "./bihar-gk";
import { allCsFactQuestions } from "./cs-facts";
import { CS_GENERATORS } from "./cs-generated";
import { rng, shuffle, type GenQuestion, type Rng } from "./core";
import { allEnglishQuestions } from "./english";
import { allGaFactQuestions } from "./ga-facts";
import { SCIENCE_GENERATORS } from "./ga-science";
import { allHindiQuestions } from "./hindi";
import { REASONING_GENERATORS } from "./reasoning";

type Generator = (r: Rng) => GenQuestion | null;
/** A section is filled from computed generators and/or a fact pool. */
type Source = { generators?: Generator[]; pool?: "csFacts" | "gaFacts" | "english" | "hindi" | "bihar"; count: number };

export type SectionDef = { code: string; titleEn: string; titleHi: string; subject: string; marksCorrect: number; marksWrong: number; sources: Source[] };
export type SeriesDef = {
  id: string;
  patternId: string;
  codePrefix: string;
  slugPrefix: string;
  titleEn: (n: string) => string;
  titleHi: (n: string) => string;
  category: { slug: string; nameEn: string; nameHi: string };
  examType: string;
  durationMinutes: number;
  sections: SectionDef[];
  seed: number;
};

export const SERIES: Record<string, SeriesDef> = {
  imd: {
    id: "imd",
    patternId: "ssc-imd-sa-cs",
    codePrefix: "SSC-IMD-CS",
    slugPrefix: "ssc-imd-computer-science-mock",
    titleEn: (n) => `SSC Scientific Assistant (IMD) Computer Science – Mock Test ${n}`,
    titleHi: (n) => `एसएससी वैज्ञानिक सहायक (आईएमडी) कंप्यूटर विज्ञान – मॉक टेस्ट ${n}`,
    category: { slug: "ssc-imd-sa", nameEn: "SSC Scientific Assistant (IMD)", nameHi: "एसएससी वैज्ञानिक सहायक (आईएमडी)" },
    examType: "SSC",
    durationMinutes: 120,
    seed: 20261010,
    sections: [
      { code: "GIR", titleEn: "General Intelligence and Reasoning", titleHi: "सामान्य बुद्धि एवं तर्क", subject: "General Intelligence and Reasoning", marksCorrect: 1, marksWrong: 0.25, sources: [{ generators: REASONING_GENERATORS, count: 50 }] },
      { code: "GA", titleEn: "General Awareness", titleHi: "सामान्य जागरूकता", subject: "General Awareness", marksCorrect: 1, marksWrong: 0.25, sources: [{ pool: "gaFacts", count: 25 }, { generators: SCIENCE_GENERATORS, count: 25 }] },
      { code: "CS", titleEn: "Computer Science and IT", titleHi: "कंप्यूटर विज्ञान एवं आईटी", subject: "Computer Science and IT", marksCorrect: 1, marksWrong: 0.25, sources: [{ generators: CS_GENERATORS, count: 60 }, { pool: "csFacts", count: 40 }] },
    ],
  },
  dsssb: {
    id: "dsssb",
    patternId: "dsssb-tgt",
    codePrefix: "DSSSB-TGT-CS",
    slugPrefix: "dsssb-tgt-computer-science-mock",
    titleEn: (n) => `DSSSB TGT Computer Science – Mock Test ${n}`,
    titleHi: (n) => `डीएसएसएसबी टीजीटी कंप्यूटर विज्ञान – मॉक टेस्ट ${n}`,
    category: { slug: "dsssb", nameEn: "DSSSB", nameHi: "डीएसएसएसबी" },
    examType: "TEACHING",
    durationMinutes: 120,
    seed: 20261011,
    sections: [
      { code: "GA", titleEn: "General Awareness", titleHi: "सामान्य जागरूकता", subject: "General Awareness", marksCorrect: 1, marksWrong: 0.25, sources: [{ pool: "gaFacts", count: 12 }, { generators: SCIENCE_GENERATORS, count: 8 }] },
      { code: "GIR", titleEn: "General Intelligence and Reasoning", titleHi: "सामान्य बुद्धि एवं तर्क", subject: "General Intelligence and Reasoning", marksCorrect: 1, marksWrong: 0.25, sources: [{ generators: REASONING_GENERATORS, count: 20 }] },
      { code: "ARITH", titleEn: "Arithmetical and Numerical Ability", titleHi: "अंकगणितीय एवं संख्यात्मक क्षमता", subject: "Arithmetical and Numerical Ability", marksCorrect: 1, marksWrong: 0.25, sources: [{ generators: ARITHMETIC_GENERATORS, count: 20 }] },
      { code: "HIN", titleEn: "Hindi Language and Comprehension", titleHi: "हिंदी भाषा एवं बोध", subject: "Hindi Language and Comprehension", marksCorrect: 1, marksWrong: 0.25, sources: [{ pool: "hindi", count: 20 }] },
      { code: "ENG", titleEn: "English Language and Comprehension", titleHi: "अंग्रेज़ी भाषा एवं बोध", subject: "English Language and Comprehension", marksCorrect: 1, marksWrong: 0.25, sources: [{ pool: "english", count: 20 }] },
      { code: "CS", titleEn: "Computer Science (Subject Concerned)", titleHi: "कंप्यूटर विज्ञान (संबंधित विषय)", subject: "Computer Science and IT", marksCorrect: 1, marksWrong: 0.25, sources: [{ generators: CS_GENERATORS, count: 60 }, { pool: "csFacts", count: 40 }] },
    ],
  },
  bpsc: {
    id: "bpsc",
    patternId: "bpsc-tre",
    codePrefix: "BPSC-TRE4-CS",
    slugPrefix: "bpsc-tre-4-computer-science-mock",
    titleEn: (n) => `BPSC TRE 4.0 Computer Science (Class 11–12) – Mock Test ${n}`,
    titleHi: (n) => `बीपीएससी टीआरई 4.0 कंप्यूटर विज्ञान (कक्षा 11–12) – मॉक टेस्ट ${n}`,
    category: { slug: "bpsc-tre", nameEn: "BPSC TRE", nameHi: "बीपीएससी टीआरई" },
    examType: "TEACHING",
    durationMinutes: 150,
    seed: 20261012,
    sections: [
      // Part I is qualifying (30%); Hindi and English language questions.
      { code: "LANG", titleEn: "Part I – Language (Qualifying)", titleHi: "भाग I – भाषा (अर्हक)", subject: "Language", marksCorrect: 1, marksWrong: 0.33, sources: [{ pool: "hindi", count: 15 }, { pool: "english", count: 15 }] },
      {
        code: "GS",
        titleEn: "Part II – General Studies",
        titleHi: "भाग II – सामान्य अध्ययन",
        subject: "General Studies",
        marksCorrect: 1,
        marksWrong: 0.33,
        sources: [{ pool: "bihar", count: 2 }, { pool: "gaFacts", count: 18 }, { generators: SCIENCE_GENERATORS, count: 6 }, { generators: REASONING_GENERATORS, count: 7 }, { generators: ARITHMETIC_GENERATORS, count: 7 }],
      },
      { code: "CS", titleEn: "Part III – Computer Science", titleHi: "भाग III – कंप्यूटर विज्ञान", subject: "Computer Science and IT", marksCorrect: 1, marksWrong: 0.33, sources: [{ generators: CS_GENERATORS, count: 45 }, { pool: "csFacts", count: 35 }] },
    ],
  },
};

export type BuiltTest = { number: number; sections: { def: SectionDef; questions: GenQuestion[] }[] };

/**
 * Deal questions into `tests` tests. Computed questions are unique across the
 * whole series (by key); fact pools are shuffled once and dealt in order, so a
 * fact repeats only after the whole pool has been used.
 */
export function buildSeries(def: SeriesDef, tests: number): { tests: BuiltTest[]; poolSizes: Record<string, number>; repeats: Record<string, number> } {
  const r = rng(def.seed);
  const pools: Record<string, GenQuestion[]> = {
    csFacts: shuffle(r, allCsFactQuestions(r)),
    gaFacts: shuffle(r, allGaFactQuestions(r)),
    english: shuffle(r, allEnglishQuestions(r)),
    hindi: shuffle(r, allHindiQuestions(r)),
    bihar: shuffle(r, allBiharQuestions(r)),
  };
  const cursor: Record<string, number> = { csFacts: 0, gaFacts: 0, english: 0, hindi: 0, bihar: 0 };
  const used = new Set<string>();
  const built: BuiltTest[] = [];

  for (let t = 1; t <= tests; t++) {
    const inTest = new Set<string>();
    const sections = def.sections.map((s) => {
      const qs: GenQuestion[] = [];
      for (const src of s.sources) {
        if (src.pool) {
          const pool = pools[src.pool]!;
          let added = 0, guard = 0;
          while (added < src.count && guard++ < pool.length * 2) {
            const q = pool[cursor[src.pool]! % pool.length]!;
            cursor[src.pool]!++;
            if (inTest.has(q.key)) continue;
            inTest.add(q.key);
            qs.push(q);
            added++;
          }
        } else if (src.generators) {
          // Round-robin over a shuffled generator list keeps topics balanced.
          const gens = shuffle(r, src.generators);
          let i = 0, added = 0, guard = 0;
          while (added < src.count && guard++ < src.count * 200) {
            const q = gens[i++ % gens.length]!(r);
            if (!q || used.has(q.key)) continue;
            used.add(q.key);
            inTest.add(q.key);
            qs.push(q);
            added++;
          }
          if (added < src.count) throw new Error(`${def.id} test ${t} ${s.code}: only ${added}/${src.count} unique computed questions`);
        }
      }
      return { def: s, questions: shuffle(r, qs) };
    });
    built.push({ number: t, sections });
  }
  const poolSizes = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length]));
  const repeats = Object.fromEntries(Object.entries(cursor).map(([k, v]) => [k, pools[k]!.length ? Math.round((v / pools[k]!.length) * 10) / 10 : 0]));
  return { tests: built, poolSizes, repeats };
}

/** Structural checks on every question. Returns problems (empty = OK). */
export function validate(q: GenQuestion): string[] {
  const p: string[] = [];
  if (!q.en?.trim()) p.push("empty text");
  if (q.options.length !== 4) p.push(`${q.options.length} options`);
  if (new Set(q.options).size !== q.options.length) p.push("duplicate options");
  if (q.options.some((o) => !o?.trim())) p.push("empty option");
  if (!(q.correct >= 0 && q.correct < q.options.length)) p.push("bad correct index");
  if (q.optionsHi && q.optionsHi.length !== q.options.length) p.push("Hindi options mismatch");
  return p;
}
