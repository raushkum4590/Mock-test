import { describe, expect, it } from "vitest";
import { currentGroup, sectionStates, timerGroups } from "@/lib/exam-engine/section-timing";

// IBPS-style: three 20-minute sections, plus an untimed section.
const sections = [
  { id: "eng", timerGroup: "ENG", groupMinutes: 20 },
  { id: "qa", timerGroup: "QA", groupMinutes: 20 },
  { id: "reas", timerGroup: "REAS", groupMinutes: 20 },
  { id: "free", timerGroup: null, groupMinutes: null },
];

describe("sectional timing", () => {
  it("builds consecutive windows in section order", () => {
    expect(timerGroups(sections).map((g) => [g.key, g.startSec, g.endSec])).toEqual([
      ["ENG", 0, 1200],
      ["QA", 1200, 2400],
      ["REAS", 2400, 3600],
    ]);
  });

  it("opens one group at a time; ungrouped sections stay open", () => {
    const at = (sec: number) => Object.fromEntries(sectionStates(sections, sec));
    expect(at(0)).toEqual({ eng: "open", qa: "upcoming", reas: "upcoming", free: "open" });
    expect(at(1199)).toMatchObject({ eng: "open", qa: "upcoming" });
    expect(at(1200)).toMatchObject({ eng: "closed", qa: "open", reas: "upcoming" });
    expect(at(3600)).toMatchObject({ eng: "closed", qa: "closed", reas: "closed", free: "open" });
  });

  it("sections sharing a group share one timer (separately timed modules)", () => {
    const modules = [
      { id: "math", timerGroup: "S1", groupMinutes: 60 },
      { id: "reas", timerGroup: "S1", groupMinutes: 60 },
      { id: "eng", timerGroup: "S2", groupMinutes: 60 },
    ];
    expect(timerGroups(modules)).toHaveLength(2);
    expect(Object.fromEntries(sectionStates(modules, 3000))).toEqual({ math: "open", reas: "open", eng: "upcoming" });
    expect(currentGroup(modules, 3000)).toMatchObject({ key: "S1", remainingSec: 600 });
    expect(currentGroup(modules, 7200)).toBeNull();
  });

  it("papers without timer groups are not sectional", () => {
    expect(timerGroups([{ id: "a", timerGroup: null, groupMinutes: null }])).toEqual([]);
    expect(currentGroup([{ id: "a", timerGroup: null, groupMinutes: null }], 10)).toBeNull();
  });
});
