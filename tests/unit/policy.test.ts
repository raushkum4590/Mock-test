import { describe, expect, it } from "vitest";
import { evaluateAnswerWrite, evaluateEntry, lateEntryClosesAt, phaseOf, remainingSeconds, type PolicySchedule } from "@/lib/exam-engine/policy";

const base: PolicySchedule = {
  status: "RUNNING",
  loginOpensAt: new Date("2026-10-10T04:00:00Z"),
  startAt: new Date("2026-10-10T04:30:00Z"),
  endAt: new Date("2026-10-10T05:30:00Z"),
  pausedAt: null,
  lateEntrySeconds: 900,
};
const t = (iso: string) => new Date(iso);

describe("entry policy", () => {
  it("blocks entry before the start and shows the waiting state", () => {
    expect(evaluateEntry({ ...base, status: "WAITING" }, null, t("2026-10-10T04:10:00Z"))).toMatchObject({ ok: false, code: "EXAM_NOT_STARTED" });
  });

  it("allows a new attempt until the late-entry window closes", () => {
    expect(evaluateEntry(base, null, t("2026-10-10T04:45:00Z"))).toEqual({ ok: true });
    expect(evaluateEntry(base, null, t("2026-10-10T04:45:01Z"))).toMatchObject({ ok: false, code: "LATE_ENTRY_CLOSED" });
  });

  it("always allows an unsubmitted attempt to reconnect before the deadline", () => {
    expect(evaluateEntry(base, { status: "IN_PROGRESS" }, t("2026-10-10T05:29:00Z"))).toEqual({ ok: true });
    expect(evaluateEntry({ ...base, status: "PAUSED" }, { status: "IN_PROGRESS" }, t("2026-10-10T05:00:00Z"))).toEqual({ ok: true });
  });

  it("refuses after the deadline and for submitted attempts", () => {
    expect(evaluateEntry(base, { status: "IN_PROGRESS" }, t("2026-10-10T05:30:00Z"))).toMatchObject({ code: "EXAM_ENDED" });
    expect(evaluateEntry(base, { status: "SUBMITTED" }, t("2026-10-10T05:00:00Z"))).toMatchObject({ code: "ATTEMPT_SUBMITTED" });
    expect(evaluateEntry({ ...base, status: "CANCELLED" }, null, t("2026-10-10T05:00:00Z"))).toMatchObject({ code: "NOT_ELIGIBLE" });
  });

  it("late entry never extends past the official end", () => {
    expect(lateEntryClosesAt({ ...base, lateEntrySeconds: 99_999 }).toISOString()).toBe(base.endAt.toISOString());
  });
});

describe("timer and answer policy", () => {
  it("remaining time is server-derived and frozen while paused", () => {
    expect(remainingSeconds(base, t("2026-10-10T05:00:00Z"))).toBe(1800);
    const paused = { ...base, status: "PAUSED" as const, pausedAt: t("2026-10-10T05:10:00Z") };
    expect(remainingSeconds(paused, t("2026-10-10T05:10:00Z"))).toBe(1200);
    expect(remainingSeconds(paused, t("2026-10-10T07:00:00Z"))).toBe(1200);
  });

  it("rejects answer writes at or after the deadline, while paused, or after submission", () => {
    expect(evaluateAnswerWrite(base, "IN_PROGRESS", t("2026-10-10T05:29:59Z"))).toEqual({ ok: true });
    expect(evaluateAnswerWrite(base, "IN_PROGRESS", t("2026-10-10T05:30:00Z"))).toMatchObject({ code: "EXAM_ENDED" });
    expect(evaluateAnswerWrite({ ...base, status: "PAUSED" }, "IN_PROGRESS", t("2026-10-10T05:00:00Z"))).toMatchObject({ code: "EXAM_PAUSED" });
    expect(evaluateAnswerWrite(base, "AUTO_SUBMITTED", t("2026-10-10T05:00:00Z"))).toMatchObject({ code: "ATTEMPT_SUBMITTED" });
  });

  it("a RUNNING row past its end is already treated as ended", () => {
    expect(phaseOf(base, t("2026-10-10T05:30:00Z"))).toBe("ENDED");
  });
});
