/**
 * Exam-style MCQs generated from the monthly fact tables. Wrong options are
 * real answers of the same kind from the year (other appointees, other
 * partner countries, other days' dates…), the way SSC/Banking papers build
 * them. Deterministic: the same data always yields the same questions.
 */
import { countriesIn } from "./countries";
import type { MonthFacts, Ref } from "./extract";

export type McqKind = "appointment" | "exercise" | "award" | "day" | "summit" | "agreement" | "sports";
export type Mcq = { id: string; kind: McqKind; q: string; options: string[]; answer: number; url: string; date: string };

/** Answers of each kind across the whole year, used as distractors. */
export type Pools = { people: string[]; countries: string[]; venues: string[]; winners: string[]; dates: string[]; athletes: string[] };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const dayMonth = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle<T>(r: () => number, a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Rough "shape" of an answer, so distractors look like plausible answers (person ↔ person, country ↔ country). */
const shape = (s: string) => {
  const isPlace = countriesIn(s).length > 0 || s === "India";
  const n = s.split(/\s+/).length;
  return `${isPlace ? "place" : "other"}-${n <= 1 ? 1 : n <= 3 ? 2 : 3}`;
};

/** Four options (answer + 3 distractors from `pool`), or null when the pool is too small. */
function options(r: () => number, answer: string, pool: string[]): { options: string[]; answer: number } | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = shape(answer);
  const pick = (candidates: string[], seen: Set<string>, wrong: string[]) => {
    for (const p of candidates) {
      if (wrong.length === 3) break;
      if (seen.has(norm(p)) || p.length > 60) continue;
      seen.add(norm(p));
      wrong.push(p);
    }
  };
  const seen = new Set([norm(answer)]);
  const wrong: string[] = [];
  const shuffled = shuffle(r, pool);
  pick(shuffled.filter((p) => shape(p) === want), seen, wrong);
  // Same kind of thing (place vs not) is required; length may differ.
  if (wrong.length < 3) pick(shuffled.filter((p) => shape(p).split("-")[0] === want.split("-")[0]), seen, wrong);
  if (wrong.length < 3) return null;
  const opts = shuffle(r, [answer, ...wrong]);
  return { options: opts, answer: opts.indexOf(answer) };
}

const LIMITS: Record<McqKind, number> = { appointment: 6, exercise: 4, award: 4, day: 5, summit: 4, agreement: 3, sports: 4 };

/** Rows that are fine in a table but too messy to show as an option. */
const MESSY = /[:&;]|\bto(?: be)?$|\bto\b|^\d|^(?:Two|Three|Four|Five|Several|Many|Veteran|Indian|India’s)\b|\b(?:Minister|Ministry|personalities|officers?)\b/i;

export function buildPools(months: MonthFacts[]): Pools {
  const uniq = (a: string[]) => [...new Set(a.filter((s) => s && !MESSY.test(s)))];
  return {
    people: uniq(months.flatMap((m) => m.appointments.filter((a) => !countriesIn(a.who).length).map((a) => a.who))),
    countries: uniq([...months.flatMap((m) => [...m.exercises.flatMap((e) => e.partners), ...m.agreements.map((a) => a.country)]), "France", "Japan", "Russia", "USA", "Australia", "Egypt", "Vietnam", "Oman"]),
    venues: uniq(months.flatMap((m) => [...m.summits.map((s) => s.venue), ...m.exercises.map((e) => e.venue ?? "")])),
    winners: uniq(months.flatMap((m) => m.awards.map((a) => a.winner))),
    dates: uniq(months.flatMap((m) => m.days.map((d) => d.observed ?? ""))),
    athletes: uniq(months.flatMap((m) => m.sports.map((s) => s.who))),
  };
}

export function buildQuiz(ym: string, f: MonthFacts, pools: Pools): Mcq[] {
  const r = rng(ym);
  const month = monthLabel(ym);
  const out: Mcq[] = [];
  const count: Partial<Record<McqKind, number>> = {};
  const add = (kind: McqKind, src: Ref, q: string, answer: string, pool: string[]) => {
    if ((count[kind] ?? 0) >= LIMITS[kind]) return;
    const o = options(r, answer, pool);
    if (!o) return;
    count[kind] = (count[kind] ?? 0) + 1;
    out.push({ id: `${ym}-${out.length + 1}`, kind, q, ...o, url: src.url, date: src.date });
  };

  for (const a of f.appointments) {
    if (countriesIn(a.who).length || a.who === "India") continue;
    const verb = a.verb === "sworn" ? "was sworn in as" : a.verb === "elected" ? "was elected as" : a.verb === "appointed" ? "was appointed as" : "took charge as";
    add("appointment", a, `Who ${verb} ${a.post} in ${month}?`, a.who, pools.people);
  }
  for (const e of f.exercises) {
    if (e.partners.length === 1) add("exercise", e, `Exercise ${e.name} (${month}) was held between India and which country?`, e.partners[0]!, pools.countries);
    else if (!e.partners.length && e.venue) add("exercise", e, `Where was Exercise ${e.name} held in ${month}?`, e.venue, pools.venues);
  }
  // "2025 Nobel Prize" without a field is ambiguous (there are six).
  for (const a of f.awards) if (!MESSY.test(a.winner) && !/^(?:20\d\d\s+)?Nobel Prize$/i.test(a.award)) add("award", a, `Who won the ${a.award}?`, a.winner, pools.winners);
  // Only days with a known fixed date: a report date can be a day off.
  for (const d of f.days) if (d.observed) add("day", d, `${d.day} is observed on which date?`, d.observed, pools.dates);
  for (const s of f.summits) add("summit", s, `Where was the ${s.event} held?`, s.venue, pools.venues);
  for (const a of f.agreements) add("agreement", a, `India signed an MoU/agreement on “${a.area}” with which country in ${month}?`, a.country, pools.countries);
  for (const s of f.sports) if (s.event && !MESSY.test(s.who)) add("sports", s, `Who won ${/^(?:gold|silver|bronze)/i.test(s.feat) ? s.feat.toLowerCase() : `the ${s.feat}`}${s.event ? ` at ${s.event}` : ""} in ${month}?`, s.who, pools.athletes);

  // Mix kinds so the quiz does not read like a list.
  return shuffle(r, out).map((m, i) => ({ ...m, id: `${ym}-${i + 1}` }));
}
