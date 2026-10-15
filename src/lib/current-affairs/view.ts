/**
 * What a capsule page shows: one month, or the whole year combined.
 * Rows carry their month so the yearly edition can say when it happened.
 */
import { CAPSULE_MONTHS } from "@/data/current-affairs";
import type { CapsuleMonth } from "./capsule";
import type { MonthFacts } from "./extract";
import type { Mcq } from "./quiz";

type WithMonth<T> = T & { month: string };
export type Highlight = { kind: string; main: string; detail: string; url: string };

export type CapsuleView = {
  id: string; // "2025-10" or "year"
  title: string;
  period: string;
  partial: boolean;
  months: CapsuleMonth[];
  facts: { [K in keyof MonthFacts]: WithMonth<MonthFacts[K][number]>[] };
  quiz: Mcq[];
  highlights: Highlight[];
  headlines: number;
};

export const YEAR_ID = "year";

export function capsuleMonths(): CapsuleMonth[] {
  return CAPSULE_MONTHS;
}

const NOTABLE_POST = /\b(?:Chief Justice|Governor|Chief of|Chief Election|Chief Minister|Prime Minister|President|Ambassador|Secretary|Director General|Chairman|Chairperson|Commissioner|Chief Executive|Vice Chief)\b/;
const BIG_AWARD = /\b(?:Nobel|Bharat Ratna|Padma|Booker|Jnanpith|Dadasaheb|Khel Ratna|Arjuna|Sahitya|Pulitzer|Magsaysay|Grammy|Oscar)\b/i;

function highlights(f: CapsuleView["facts"], limit: number): Highlight[] {
  const lists: Highlight[][] = [
    f.summits.filter((s) => !/^(?:New Delhi|Delhi)$/.test(s.venue)).map((s) => ({ kind: "Summit", main: s.event, detail: s.venue, url: s.url })),
    f.exercises.filter((e) => e.partners.length).map((e) => ({ kind: "Exercise", main: e.name, detail: `India × ${e.partners.join(" × ")}${e.venue ? ` · ${e.venue}` : ""}`, url: e.url })),
    f.appointments.filter((a) => NOTABLE_POST.test(a.post)).map((a) => ({ kind: "Appointed", main: a.who, detail: a.post, url: a.url })),
    f.awards.filter((a) => BIG_AWARD.test(a.award) && !/^(?:20\d\d\s+)?Nobel Prize$/i.test(a.award)).map((a) => ({ kind: "Award", main: a.award, detail: a.winner, url: a.url })),
    f.sports.filter((s) => /gold|title|trophy|cup/i.test(s.feat) && s.event).map((s) => ({ kind: "Sports", main: s.who, detail: `${s.feat} · ${s.event}`, url: s.url })),
    f.days.filter((d) => d.theme && d.observed).map((d) => ({ kind: "Day", main: `${d.day} (${d.observed})`, detail: `Theme: ${d.theme}`, url: d.url })),
    f.agreements.map((a) => ({ kind: "MoU", main: `India × ${a.country}`, detail: a.area, url: a.url })),
  ];
  const out: Highlight[] = [];
  for (let i = 0; out.length < limit && lists.some((l) => l.length > i); i++) {
    for (const l of lists) if (l[i] && out.length < limit) out.push(l[i]!);
  }
  return out;
}

function combine(months: CapsuleMonth[]): CapsuleView["facts"] {
  const keys = Object.keys(months[0]!.facts) as (keyof MonthFacts)[];
  const out = {} as Record<keyof MonthFacts, unknown[]>;
  for (const k of keys) out[k] = months.flatMap((m) => (m.facts[k] as object[]).map((row) => ({ ...row, month: m.month })));
  return out as CapsuleView["facts"];
}

export function getCapsule(id: string): CapsuleView | null {
  const all = capsuleMonths();
  if (!all.length) return null;
  if (id === YEAR_ID) {
    const months = [...all].reverse(); // oldest first
    const facts = combine(months);
    // ~6 questions from every month, months interleaved.
    const perMonth = months.map((m) => m.quiz.slice(0, 6));
    const quiz: Mcq[] = [];
    for (let i = 0; i < 6; i++) for (const q of perMonth) if (q[i]) quiz.push(q[i]!);
    return {
      id,
      title: "Yearly Current Affairs Capsule",
      period: `${months[0]!.label} – ${months.at(-1)!.label}`,
      partial: months.some((m) => m.partial),
      months,
      facts,
      quiz,
      highlights: highlights(facts, 20),
      headlines: months.reduce((n, m) => n + m.headlines.PIB + m.headlines.RBI + m.headlines.AIR, 0),
    };
  }
  const month = all.find((m) => m.month === id);
  if (!month) return null;
  const facts = combine([month]);
  return {
    id,
    title: "Monthly Current Affairs Capsule",
    period: month.label,
    partial: month.partial,
    months: [month],
    facts,
    quiz: month.quiz,
    highlights: highlights(facts, 10),
    headlines: month.headlines.PIB + month.headlines.RBI + month.headlines.AIR,
  };
}
