/**
 * Exam schedule state machine. Pure functions only — persistence and
 * concurrency control live in src/server/services/schedule-engine.ts.
 *
 *   DRAFT ──schedule──▶ SCHEDULED ──publish──▶ PUBLISHED
 *     ▲                    │  ▲                   │ (login_opens_at)
 *     └────unschedule──────┘  └────unpublish──────┤
 *                                                 ▼
 *                       (start_at)            WAITING
 *            PUBLISHED/WAITING ─────────────▶ RUNNING ◀──resume──┐
 *                                                │  └──pause──▶ PAUSED
 *                                     (end_at) / end            │ end
 *                                                ▼              ▼
 *                                            COMPLETED ◀────────┘
 *   Any non-terminal state ──cancel──▶ CANCELLED
 */
import type { ScheduleStatus } from "@db/schema";
import type { Permission } from "@/lib/permissions";

export const TERMINAL_STATUSES: readonly ScheduleStatus[] = ["COMPLETED", "CANCELLED"];

const VALID: Record<ScheduleStatus, readonly ScheduleStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["DRAFT", "PUBLISHED", "CANCELLED"],
  // PUBLISHED/WAITING -> COMPLETED only when the whole window was missed
  // (server offline from before start until after the official end).
  PUBLISHED: ["SCHEDULED", "WAITING", "RUNNING", "COMPLETED", "CANCELLED"],
  WAITING: ["RUNNING", "COMPLETED", "CANCELLED"],
  RUNNING: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["RUNNING", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: ScheduleStatus, to: ScheduleStatus): boolean {
  return VALID[from].includes(to);
}

export const ADMIN_ACTIONS = ["SCHEDULE", "UNSCHEDULE", "PUBLISH", "UNPUBLISH", "PAUSE", "RESUME", "END", "CANCEL"] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export const ADMIN_ACTION_RULES: Record<
  AdminAction,
  { from: readonly ScheduleStatus[]; to: ScheduleStatus; permission: Permission; label: string }
> = {
  SCHEDULE: { from: ["DRAFT"], to: "SCHEDULED", permission: "schedules.manage", label: "Lock schedule" },
  UNSCHEDULE: { from: ["SCHEDULED"], to: "DRAFT", permission: "schedules.manage", label: "Back to draft" },
  PUBLISH: { from: ["SCHEDULED"], to: "PUBLISHED", permission: "schedules.publish", label: "Publish" },
  UNPUBLISH: { from: ["PUBLISHED"], to: "SCHEDULED", permission: "schedules.publish", label: "Unpublish" },
  PAUSE: { from: ["RUNNING"], to: "PAUSED", permission: "schedules.hold", label: "Emergency hold" },
  RESUME: { from: ["PAUSED"], to: "RUNNING", permission: "schedules.hold", label: "Resume" },
  END: { from: ["RUNNING", "PAUSED"], to: "COMPLETED", permission: "schedules.end", label: "End exam now" },
  CANCEL: {
    from: ["DRAFT", "SCHEDULED", "PUBLISHED", "WAITING", "RUNNING", "PAUSED"],
    to: "CANCELLED",
    permission: "schedules.end",
    label: "Cancel",
  },
};

export type TimedSchedule = {
  status: ScheduleStatus;
  loginOpensAt: Date;
  startAt: Date;
  endAt: Date;
};

export type SystemTransition = {
  to: ScheduleStatus;
  reason: "LOGIN_OPENED" | "SCHEDULED_START" | "DEADLINE" | "MISSED_WINDOW";
};

/**
 * The next transition the scheduler must apply at `now`, or null.
 * Applied repeatedly until null, so an overdue schedule catches up in order
 * (e.g. PUBLISHED -> RUNNING -> COMPLETED after a long outage).
 */
export function nextSystemTransition(s: TimedSchedule, now: Date): SystemTransition | null {
  const t = now.getTime();
  switch (s.status) {
    case "PUBLISHED":
      if (t >= s.endAt.getTime()) return { to: "COMPLETED", reason: "MISSED_WINDOW" };
      if (t >= s.startAt.getTime()) return { to: "RUNNING", reason: "SCHEDULED_START" };
      if (t >= s.loginOpensAt.getTime()) return { to: "WAITING", reason: "LOGIN_OPENED" };
      return null;
    case "WAITING":
      if (t >= s.endAt.getTime()) return { to: "COMPLETED", reason: "MISSED_WINDOW" };
      if (t >= s.startAt.getTime()) return { to: "RUNNING", reason: "SCHEDULED_START" };
      return null;
    case "RUNNING":
      if (t >= s.endAt.getTime()) return { to: "COMPLETED", reason: "DEADLINE" };
      return null;
    // PAUSED never completes on its own: end_at is extended when resumed.
    default:
      return null;
  }
}
