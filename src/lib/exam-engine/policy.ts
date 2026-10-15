/**
 * Candidate access and timing policy (pure). The server calls these after
 * reconciling the schedule so decisions are made on up-to-date state.
 *
 * Timing policy ("fixed window", the default for every schedule):
 *  - Everyone shares the official window [start_at, end_at).
 *  - A late or reconnecting candidate receives only the remaining time.
 *  - New attempts may start until start_at + late_entry_seconds.
 *  - An existing, unsubmitted attempt may resume any time before end_at.
 *  - An authorised pause freezes the clock; resuming extends end_at.
 */
import type { AttemptStatus, ScheduleStatus } from "@db/schema";
import type { ErrorCode } from "@/lib/errors";

export type PolicySchedule = {
  status: ScheduleStatus;
  loginOpensAt: Date;
  startAt: Date;
  endAt: Date;
  pausedAt: Date | null;
  lateEntrySeconds: number;
};

export type Phase = "NOT_AVAILABLE" | "UPCOMING" | "WAITING" | "RUNNING" | "PAUSED" | "ENDED" | "CANCELLED";

export function phaseOf(s: PolicySchedule, now: Date): Phase {
  switch (s.status) {
    case "DRAFT":
    case "SCHEDULED":
      return "NOT_AVAILABLE";
    case "PUBLISHED":
      return "UPCOMING";
    case "WAITING":
      return "WAITING";
    case "RUNNING":
      return now.getTime() >= s.endAt.getTime() ? "ENDED" : "RUNNING";
    case "PAUSED":
      return "PAUSED";
    case "COMPLETED":
      return "ENDED";
    case "CANCELLED":
      return "CANCELLED";
  }
}

/** Official remaining time in seconds (frozen while paused). */
export function remainingSeconds(s: PolicySchedule, now: Date): number {
  if (s.status === "RUNNING") return Math.max(0, Math.floor((s.endAt.getTime() - now.getTime()) / 1000));
  if (s.status === "PAUSED" && s.pausedAt) {
    return Math.max(0, Math.floor((s.endAt.getTime() - s.pausedAt.getTime()) / 1000));
  }
  if (s.status === "PUBLISHED" || s.status === "WAITING") {
    return Math.floor((s.endAt.getTime() - s.startAt.getTime()) / 1000);
  }
  return 0;
}

export function lateEntryClosesAt(s: PolicySchedule): Date {
  const close = s.startAt.getTime() + s.lateEntrySeconds * 1000;
  return new Date(Math.min(close, s.endAt.getTime()));
}

export type Decision = { ok: true } | { ok: false; code: ErrorCode; message: string };

const deny = (code: ErrorCode, message: string): Decision => ({ ok: false, code, message });

/** May the candidate open (start or resume) the exam screen now? */
export function evaluateEntry(
  s: PolicySchedule,
  attempt: { status: AttemptStatus } | null,
  now: Date,
): Decision {
  const phase = phaseOf(s, now);
  if (phase === "CANCELLED") return deny("NOT_ELIGIBLE", "This exam has been cancelled.");
  if (phase === "NOT_AVAILABLE") return deny("NOT_ELIGIBLE", "This exam is not published.");
  if (attempt && attempt.status !== "IN_PROGRESS") return deny("ATTEMPT_SUBMITTED", "You have already submitted this exam.");
  if (phase === "UPCOMING" || phase === "WAITING") return deny("EXAM_NOT_STARTED", "The exam has not started yet.");
  if (phase === "ENDED") return deny("EXAM_ENDED", "The exam has ended.");
  if (attempt) return { ok: true }; // reconnect / resume (also allowed during a hold)
  if (phase === "PAUSED") return deny("EXAM_PAUSED", "The exam is on hold. Please wait.");
  if (now.getTime() > lateEntryClosesAt(s).getTime()) {
    return deny("LATE_ENTRY_CLOSED", "The late entry window for this exam has closed.");
  }
  return { ok: true };
}

/** May an answer arriving at `now` be accepted? */
export function evaluateAnswerWrite(s: PolicySchedule, attemptStatus: AttemptStatus, now: Date): Decision {
  if (attemptStatus !== "IN_PROGRESS") return deny("ATTEMPT_SUBMITTED", "This attempt has been submitted.");
  if (s.status === "PAUSED") return deny("EXAM_PAUSED", "The exam is on hold. Answers cannot be changed.");
  if (s.status !== "RUNNING") return deny("EXAM_ENDED", "The exam is not running.");
  if (now.getTime() >= s.endAt.getTime()) return deny("EXAM_ENDED", "The official time is over.");
  return { ok: true };
}
