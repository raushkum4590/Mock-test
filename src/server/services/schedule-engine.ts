/**
 * Durable, server-controlled schedule engine.
 *
 * Nothing here depends on in-memory timers for correctness: the schedule
 * rows (login_opens_at / start_at / end_at + status) ARE the persisted job
 * queue. `runSchedulerTick` finds every schedule whose next transition is
 * due and applies it; `reconcileSchedule` is also called on every candidate
 * request, so state is correct even if the scheduler loop is late or down.
 *
 * Every transition is a compare-and-set
 *   UPDATE exam_schedules SET status = :to WHERE id = :id AND status = :from
 * inside a transaction, so concurrent workers (embedded + external scheduler,
 * or many candidate requests) can never apply the same transition twice.
 */
import { and, eq, inArray, lte, or } from "drizzle-orm";
import { hostname } from "node:os";
import { applicationSettings, candidateAttempts, examSchedules, type ScheduleStatus } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { canTransition, nextSystemTransition } from "@/lib/exam-engine/state-machine";
import { now } from "@/lib/time/clock";
import { audit, recordExamEvent, SYSTEM_ACTOR, type Actor } from "./audit-service";
import { finalizeScheduleAttempts } from "./submission-service";

export type ScheduleRow = typeof examSchedules.$inferSelect;

export async function applyTransition(
  row: ScheduleRow,
  to: ScheduleStatus,
  opts: { actor: Actor; at: Date; reason?: string; details?: Record<string, unknown> },
): Promise<ScheduleRow | null> {
  if (!canTransition(row.status, to)) {
    throw new AppError("INVALID_TRANSITION", `Cannot change a ${row.status} exam to ${to}.`);
  }
  const { at } = opts;
  const patch: Partial<typeof examSchedules.$inferInsert> = { status: to, updatedAt: at };
  if (to === "RUNNING" && row.status !== "PAUSED") patch.actualStartAt = at;
  if (to === "PAUSED") patch.pausedAt = at;
  if (to === "RUNNING" && row.status === "PAUSED") {
    const pausedSeconds = row.pausedAt ? Math.max(0, Math.ceil((at.getTime() - row.pausedAt.getTime()) / 1000)) : 0;
    patch.endAt = new Date(row.endAt.getTime() + pausedSeconds * 1000);
    patch.totalPausedSeconds = row.totalPausedSeconds + pausedSeconds;
    patch.pausedAt = null;
  }
  if (to === "COMPLETED" || to === "CANCELLED") {
    patch.actualEndAt = at;
    patch.pausedAt = null;
  }
  if (to === "PUBLISHED") {
    patch.publishedAt = at;
    patch.publishedBy = opts.actor.type === "ADMIN" ? (opts.actor.id ?? null) : null;
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(examSchedules)
      .set(patch)
      .where(and(eq(examSchedules.id, row.id), eq(examSchedules.status, row.status)))
      .returning();
    if (!updated) return null; // another worker got there first
    await recordExamEvent(tx, {
      scheduleId: row.id,
      type: "SCHEDULE_TRANSITION",
      fromStatus: row.status,
      toStatus: to,
      actor: opts.actor,
      payload: { reason: opts.reason ?? null, ...opts.details },
      at,
    });
    if (opts.actor.type === "ADMIN") {
      await audit(tx, opts.actor, "schedule.transition", { type: "schedule", id: row.id }, {
        from: row.status,
        to,
        reason: opts.reason ?? null,
      });
    }
    return updated;
  });
}

function dueInstant(row: ScheduleRow, reason: string): Date {
  if (reason === "LOGIN_OPENED") return row.loginOpensAt;
  if (reason === "SCHEDULED_START") return row.startAt;
  return row.endAt;
}

/**
 * Bring one schedule up to date with the clock. Applies due transitions in
 * order and auto-submits attempts when the schedule completes. Returns the
 * current row.
 */
export async function reconcileSchedule(scheduleId: string, at: Date = now()): Promise<ScheduleRow | null> {
  const db = getDb();
  for (let i = 0; i < 6; i++) {
    const [row] = await db.select().from(examSchedules).where(eq(examSchedules.id, scheduleId));
    if (!row) return null;
    const t = nextSystemTransition(row, at);
    if (!t) return row;
    const lagSeconds = Math.max(0, Math.round((at.getTime() - dueInstant(row, t.reason).getTime()) / 1000));
    const updated = await applyTransition(row, t.to, {
      actor: SYSTEM_ACTOR,
      at,
      reason: t.reason,
      // `overdue` marks transitions applied late, e.g. after a server restart.
      details: { lagSeconds, overdue: lagSeconds > 5 },
    });
    if (updated?.status === "COMPLETED") {
      await finalizeScheduleAttempts(scheduleId, "DEADLINE", SYSTEM_ACTOR, at);
    }
  }
  const [row] = await db.select().from(examSchedules).where(eq(examSchedules.id, scheduleId));
  return row ?? null;
}

export type TickSummary = { checked: number; finalizedStragglers: number };

const g = globalThis as unknown as { __cbtLastHeartbeat?: number };

/** One pass of the scheduler. Safe to run from several processes at once. */
export async function runSchedulerTick(at: Date = now()): Promise<TickSummary> {
  const db = getDb();
  const due = await db
    .select({ id: examSchedules.id })
    .from(examSchedules)
    .where(
      or(
        and(eq(examSchedules.status, "PUBLISHED"), lte(examSchedules.loginOpensAt, at)),
        and(eq(examSchedules.status, "WAITING"), lte(examSchedules.startAt, at)),
        and(eq(examSchedules.status, "RUNNING"), lte(examSchedules.endAt, at)),
      ),
    );
  for (const { id } of due) await reconcileSchedule(id, at);

  // Recovery: attempts left open on a finished schedule (e.g. the process
  // died between completing the schedule and submitting every attempt).
  const stragglers = await db
    .selectDistinct({ scheduleId: candidateAttempts.scheduleId, status: examSchedules.status })
    .from(candidateAttempts)
    .innerJoin(examSchedules, eq(examSchedules.id, candidateAttempts.scheduleId))
    .where(and(eq(candidateAttempts.status, "IN_PROGRESS"), inArray(examSchedules.status, ["COMPLETED", "CANCELLED"])));
  let finalizedStragglers = 0;
  for (const s of stragglers) {
    finalizedStragglers += await finalizeScheduleAttempts(
      s.scheduleId,
      s.status === "CANCELLED" ? "ADMIN" : "DEADLINE",
      SYSTEM_ACTOR,
      at,
    );
  }

  // Heartbeat for the admin dashboard, throttled to limit writes (and so an
  // idle Neon compute can still scale down between exams).
  const wall = Date.now();
  if (!g.__cbtLastHeartbeat || wall - g.__cbtLastHeartbeat > 10_000) {
    g.__cbtLastHeartbeat = wall;
    const value = { at: new Date().toISOString(), host: hostname(), pid: process.pid };
    await db
      .insert(applicationSettings)
      .values({ key: "scheduler.heartbeat", value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: applicationSettings.key, set: { value, updatedAt: new Date() } });
  }
  return { checked: due.length, finalizedStragglers };
}

export async function getSchedulerHeartbeat(): Promise<{ at: string; host: string; pid: number; ageSeconds: number } | null> {
  const [row] = await getDb()
    .select()
    .from(applicationSettings)
    .where(eq(applicationSettings.key, "scheduler.heartbeat"));
  const hb = row?.value as { at: string; host: string; pid: number } | undefined;
  if (!hb) return null;
  // Wall-clock age (the heartbeat is written with the real clock).
  return { ...hb, ageSeconds: Math.round((Date.now() - new Date(hb.at).getTime()) / 1000) };
}
