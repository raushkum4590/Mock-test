/**
 * Sectional timing (IBPS / SBI style fixed section timers, SSC CGL Tier-II
 * style separately timed modules).
 *
 * Sections that share a `timerGroup` share one timer of `groupMinutes`.
 * Groups run one after another in section order, measured on the exam's own
 * elapsed time (total duration − remaining), so holds/pauses and late entry
 * behave exactly like the overall timer. A candidate cannot leave a group
 * early or return to a closed one. Sections without a group follow only the
 * overall timer and stay open throughout.
 *
 * Pure functions: used by the server to reject writes and by the exam screen
 * to lock/hide sections.
 */

export type TimedSection = { id: string; timerGroup: string | null; groupMinutes: number | null };

export type TimerGroup = { key: string; startSec: number; endSec: number; sectionIds: string[] };

export type SectionState = "open" | "upcoming" | "closed";

/** Ordered timer groups; empty when the paper has no sectional timing. */
export function timerGroups(sections: TimedSection[]): TimerGroup[] {
  const groups: TimerGroup[] = [];
  const byKey = new Map<string, TimerGroup>();
  let cursor = 0;
  for (const s of sections) {
    if (!s.timerGroup || !s.groupMinutes || s.groupMinutes <= 0) continue;
    let g = byKey.get(s.timerGroup);
    if (!g) {
      g = { key: s.timerGroup, startSec: cursor, endSec: cursor + s.groupMinutes * 60, sectionIds: [] };
      cursor = g.endSec;
      byKey.set(s.timerGroup, g);
      groups.push(g);
    }
    g.sectionIds.push(s.id);
  }
  return groups;
}

export function groupState(g: TimerGroup, elapsedSec: number): SectionState {
  if (elapsedSec < g.startSec) return "upcoming";
  if (elapsedSec >= g.endSec) return "closed";
  return "open";
}

/** State of every section at `elapsedSec` (ungrouped sections are always open). */
export function sectionStates(sections: TimedSection[], elapsedSec: number): Map<string, SectionState> {
  const groups = timerGroups(sections);
  const out = new Map<string, SectionState>();
  for (const s of sections) out.set(s.id, "open");
  for (const g of groups) for (const id of g.sectionIds) out.set(id, groupState(g, elapsedSec));
  return out;
}

/** The group running now, with its seconds left (null when none / not sectional). */
export function currentGroup(sections: TimedSection[], elapsedSec: number): (TimerGroup & { remainingSec: number }) | null {
  const g = timerGroups(sections).find((x) => groupState(x, elapsedSec) === "open");
  return g ? { ...g, remainingSec: Math.max(0, Math.ceil(g.endSec - elapsedSec)) } : null;
}
