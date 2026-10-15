import { describe, expect, it } from "vitest";
import { SCHEDULE_STATUSES } from "@db/schema";
import { ADMIN_ACTION_RULES, ADMIN_ACTIONS, canTransition, nextSystemTransition } from "@/lib/exam-engine/state-machine";

const at = (iso: string) => new Date(iso);
const s = (status: (typeof SCHEDULE_STATUSES)[number]) => ({
  status,
  loginOpensAt: at("2026-10-10T04:00:00Z"),
  startAt: at("2026-10-10T04:30:00Z"),
  endAt: at("2026-10-10T05:30:00Z"),
});

describe("schedule state machine", () => {
  it("terminal states have no exits", () => {
    for (const to of SCHEDULE_STATUSES) {
      expect(canTransition("COMPLETED", to)).toBe(false);
      expect(canTransition("CANCELLED", to)).toBe(false);
    }
  });

  it("a completed or running exam can never go back to waiting/draft", () => {
    expect(canTransition("RUNNING", "WAITING")).toBe(false);
    expect(canTransition("RUNNING", "DRAFT")).toBe(false);
    expect(canTransition("PAUSED", "WAITING")).toBe(false);
  });

  it("every admin action rule is a valid transition", () => {
    for (const a of ADMIN_ACTIONS) {
      const r = ADMIN_ACTION_RULES[a];
      for (const from of r.from) expect(canTransition(from, r.to), `${a}: ${from}->${r.to}`).toBe(true);
    }
  });

  it("admins can never start an exam manually — only the scheduler moves to RUNNING from waiting", () => {
    const toRunning = ADMIN_ACTIONS.filter((a) => ADMIN_ACTION_RULES[a].to === "RUNNING");
    expect(toRunning).toEqual(["RESUME"]);
    expect(ADMIN_ACTION_RULES.RESUME.from).toEqual(["PAUSED"]);
  });

  it("time-driven transitions follow the published times", () => {
    expect(nextSystemTransition(s("PUBLISHED"), at("2026-10-10T03:59:59Z"))).toBeNull();
    expect(nextSystemTransition(s("PUBLISHED"), at("2026-10-10T04:00:00Z"))).toEqual({ to: "WAITING", reason: "LOGIN_OPENED" });
    expect(nextSystemTransition(s("WAITING"), at("2026-10-10T04:29:59.999Z"))).toBeNull();
    expect(nextSystemTransition(s("WAITING"), at("2026-10-10T04:30:00Z"))).toEqual({ to: "RUNNING", reason: "SCHEDULED_START" });
    expect(nextSystemTransition(s("RUNNING"), at("2026-10-10T05:29:59Z"))).toBeNull();
    expect(nextSystemTransition(s("RUNNING"), at("2026-10-10T05:30:00Z"))).toEqual({ to: "COMPLETED", reason: "DEADLINE" });
  });

  it("never auto-transitions draft, scheduled, paused or cancelled schedules", () => {
    const late = at("2027-01-01T00:00:00Z");
    for (const st of ["DRAFT", "SCHEDULED", "PAUSED", "CANCELLED", "COMPLETED"] as const) {
      expect(nextSystemTransition(s(st), late)).toBeNull();
    }
  });

  it("an overdue published exam goes straight to the state that is due", () => {
    expect(nextSystemTransition(s("PUBLISHED"), at("2026-10-10T04:45:00Z"))?.to).toBe("RUNNING");
    expect(nextSystemTransition(s("PUBLISHED"), at("2026-10-10T06:00:00Z"))).toEqual({ to: "COMPLETED", reason: "MISSED_WINDOW" });
  });
});
