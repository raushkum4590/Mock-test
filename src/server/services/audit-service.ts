import { and, desc, eq, type SQL } from "drizzle-orm";
import { auditLogs, examEvents } from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { hasPermission, type Permission, type RoleCode } from "@/lib/permissions";
import { now } from "@/lib/time/clock";

export type Actor = {
  type: "ADMIN" | "CANDIDATE" | "STUDENT" | "SYSTEM";
  id?: string;
  label?: string;
  ip?: string | null;
  /** Required for ADMIN actors; checked by `authorize`. */
  role?: RoleCode;
};

export const SYSTEM_ACTOR: Actor = { type: "SYSTEM", label: "system" };

/**
 * Service-level authorization. Route handlers check permissions too, but
 * services re-check so no caller (route, script, future API) can bypass it.
 */
export function authorize(actor: Actor, permission: Permission): void {
  if (actor.type === "SYSTEM") return;
  if (actor.type !== "ADMIN" || !actor.role || !hasPermission(actor.role, permission)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.");
  }
}

export function actorString(actor: Actor): string {
  return actor.type === "SYSTEM" ? "SYSTEM" : `${actor.type}:${actor.id ?? "?"}`;
}

export async function audit(
  q: Queryable,
  actor: Actor,
  action: string,
  entity?: { type: string; id: string } | null,
  details?: Record<string, unknown>,
): Promise<void> {
  await q.insert(auditLogs).values({
    actorType: actor.type,
    actorId: actor.id ?? null,
    actorLabel: actor.label ?? null,
    action,
    entityType: entity?.type ?? null,
    entityId: entity?.id ?? null,
    details: details ?? null,
    ipAddress: actor.ip ?? null,
    createdAt: now(),
  });
}

export async function recordExamEvent(
  q: Queryable,
  event: {
    scheduleId?: string | null;
    attemptId?: string | null;
    candidateId?: string | null;
    type: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    actor: Actor;
    payload?: Record<string, unknown>;
    at?: Date;
  },
): Promise<void> {
  await q.insert(examEvents).values({
    scheduleId: event.scheduleId ?? null,
    attemptId: event.attemptId ?? null,
    candidateId: event.candidateId ?? null,
    type: event.type,
    fromStatus: event.fromStatus ?? null,
    toStatus: event.toStatus ?? null,
    actor: actorString(event.actor),
    payload: event.payload ?? null,
    createdAt: event.at ?? now(),
  });
}

export async function listAuditLogs(opts: { limit?: number; offset?: number; entityType?: string; action?: string } = {}) {
  const where: SQL[] = [];
  if (opts.entityType) where.push(eq(auditLogs.entityType, opts.entityType));
  if (opts.action) where.push(eq(auditLogs.action, opts.action));
  return getDb()
    .select()
    .from(auditLogs)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(auditLogs.id))
    .limit(Math.min(opts.limit ?? 100, 500))
    .offset(opts.offset ?? 0);
}

export async function listScheduleEvents(scheduleId: string, limit = 200) {
  return getDb()
    .select()
    .from(examEvents)
    .where(eq(examEvents.scheduleId, scheduleId))
    .orderBy(desc(examEvents.id))
    .limit(limit);
}
