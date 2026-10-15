/**
 * Exam proctoring: identity photos (before login, at exam start, at the end)
 * and violation tracking (fullscreen exit, hidden tab, camera loss).
 *
 * Policy is per schedule (exam_schedules.require_photo, camera_monitoring,
 * require_fullscreen, violation_limit, auto_submit_on_violations). The
 * browser reports events; the server counts them, alerts the invigilator
 * when the limit is reached and, only if the schedule says so, submits.
 *
 * A normal browser cannot stop Alt+Tab or other OS shortcuts; the Windows
 * kiosk client (desktop/) is the stronger control at exam centres.
 */
import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, gt, inArray, isNull, notInArray, sql } from "drizzle-orm";
import {
  candidateAnswers,
  candidateAttempts,
  examAssignments,
  examPhotos,
  examSchedules,
  examViolations,
  type PhotoKind,
  type ViolationType,
} from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { now } from "@/lib/time/clock";
import { recordExamEvent, type Actor } from "./audit-service";
import { decodeJpegDataUrl, uploadPhoto } from "./photo-storage";
import type { CandidatePrincipal, RequestMeta } from "./session-service";
import { finalizeAttempt } from "./submission-service";

/** A pre-login photo must be used for a login within this time. */
export const LOGIN_PHOTO_TTL_MS = 30 * 60_000;
/** Repeated reports of the same violation type within this window count once (e.g. event storms). */
const VIOLATION_DEDUPE_MS = 3000;

export type ProctoringPolicy = {
  requirePhoto: boolean;
  cameraMonitoring: boolean;
  requireFullscreen: boolean;
  violationLimit: number;
  autoSubmitOnViolations: boolean;
};

export function policyOf(s: typeof examSchedules.$inferSelect): ProctoringPolicy {
  return {
    requirePhoto: s.requirePhoto,
    cameraMonitoring: s.cameraMonitoring,
    requireFullscreen: s.requireFullscreen,
    violationLimit: s.violationLimit,
    autoSubmitOnViolations: s.autoSubmitOnViolations,
  };
}

const actorOf = (p: CandidatePrincipal): Actor => ({ type: "CANDIDATE", id: p.candidateId, label: p.rollNumber, ip: p.ip });

// --- Pre-login photo ---------------------------------------------------------------

/** Upload the photo taken before login. Returns the capture token to keep in a cookie. */
export async function capturePreLoginPhoto(imageDataUrl: string, meta: RequestMeta): Promise<{ captureToken: string; expiresAt: Date }> {
  const rl = rateLimit(`photo:prelogin:${meta.ip ?? "?"}`, 20, 10 * 60_000);
  if (!rl.allowed) throw new AppError("RATE_LIMITED", `Too many photos. Try again in ${rl.retryAfterSeconds} seconds.`);
  const jpeg = decodeJpegDataUrl(imageDataUrl);
  const stored = await uploadPhoto(jpeg);
  const captureToken = randomBytes(24).toString("hex");
  const at = now();
  await getDb().insert(examPhotos).values({
    kind: "LOGIN",
    captureToken,
    ...stored,
    ipAddress: meta.ip,
    workstationCode: meta.workstationCode,
    capturedAt: at,
  });
  return { captureToken, expiresAt: new Date(at.getTime() + LOGIN_PHOTO_TTL_MS) };
}

const CLOSED = ["DRAFT", "COMPLETED", "CANCELLED"] as const;

/** The candidate's current/upcoming sitting that requires a photo, if any. */
export async function photoRequiredSchedule(q: Queryable, candidateId: string): Promise<string | null> {
  const [row] = await q
    .select({ id: examSchedules.id })
    .from(examAssignments)
    .innerJoin(examSchedules, eq(examSchedules.id, examAssignments.scheduleId))
    .where(
      and(
        eq(examAssignments.candidateId, candidateId),
        eq(examSchedules.requirePhoto, true),
        notInArray(examSchedules.status, [...CLOSED]),
      ),
    )
    .orderBy(asc(examSchedules.startAt))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Called inside the login transaction once the password is verified. Links
 * the pre-login photo to the candidate; refuses the login if a sitting
 * requires a photo and there is no fresh, unused one.
 */
export async function claimLoginPhoto(tx: Queryable, candidateId: string, captureToken: string | null): Promise<string | null> {
  const requiredFor = await photoRequiredSchedule(tx, candidateId);
  if (captureToken) {
    const [claimed] = await tx
      .update(examPhotos)
      .set({ candidateId, scheduleId: requiredFor, captureToken: null })
      .where(
        and(
          eq(examPhotos.captureToken, captureToken),
          eq(examPhotos.kind, "LOGIN"),
          isNull(examPhotos.candidateId),
          gt(examPhotos.capturedAt, new Date(now().getTime() - LOGIN_PHOTO_TTL_MS)),
        ),
      )
      .returning({ id: examPhotos.id });
    if (claimed) return claimed.id;
  }
  if (requiredFor) {
    throw new AppError("VALIDATION", "Your photo is required before login. Go back and capture your photo.", { needPhoto: true });
  }
  return null;
}

// --- In-exam photos ----------------------------------------------------------------

async function loadOwnAttemptWithSchedule(p: CandidatePrincipal, attemptId: string) {
  const [row] = await getDb()
    .select({ attempt: candidateAttempts, schedule: examSchedules })
    .from(candidateAttempts)
    .innerJoin(examSchedules, eq(examSchedules.id, candidateAttempts.scheduleId))
    .where(and(eq(candidateAttempts.id, attemptId), eq(candidateAttempts.candidateId, p.candidateId)));
  if (!row) throw new AppError("NOT_FOUND", "Attempt not found.");
  return row;
}

/** START photo while the attempt is in progress; END photo up to 30 minutes after submission. */
export async function captureAttemptPhoto(p: CandidatePrincipal, attemptId: string, kind: Exclude<PhotoKind, "LOGIN">, imageDataUrl: string) {
  const { attempt, schedule } = await loadOwnAttemptWithSchedule(p, attemptId);
  const at = now();
  if (kind === "START" && attempt.status !== "IN_PROGRESS") throw new AppError("ATTEMPT_SUBMITTED", "This exam has been submitted.");
  if (kind === "END" && (attempt.status === "IN_PROGRESS" || !attempt.submittedAt || at.getTime() - attempt.submittedAt.getTime() > 30 * 60_000)) {
    throw new AppError("CONFLICT", "The end-of-exam photo can only be taken right after submission.");
  }
  const [dup] = await getDb()
    .select({ id: examPhotos.id })
    .from(examPhotos)
    .where(and(eq(examPhotos.attemptId, attemptId), eq(examPhotos.kind, kind)))
    .limit(1);
  if (dup) return { id: dup.id, duplicate: true };
  // Counted only for real uploads, so repeated START calls cannot use up the END photo's allowance.
  const rl = rateLimit(`photo:attempt:${attemptId}`, 10, 10 * 60_000);
  if (!rl.allowed) throw new AppError("RATE_LIMITED", "Too many photos.");
  const stored = await uploadPhoto(decodeJpegDataUrl(imageDataUrl));
  const [row] = await getDb()
    .insert(examPhotos)
    .values({
      kind,
      candidateId: p.candidateId,
      scheduleId: schedule.id,
      attemptId,
      ...stored,
      ipAddress: p.ip,
      workstationCode: p.workstationCode,
      capturedAt: at,
    })
    .returning({ id: examPhotos.id });
  await recordExamEvent(getDb(), {
    scheduleId: schedule.id,
    attemptId,
    candidateId: p.candidateId,
    type: kind === "START" ? "PHOTO_START" : "PHOTO_END",
    actor: actorOf(p),
    at,
  });
  return { id: row!.id, duplicate: false };
}

// --- Violations --------------------------------------------------------------------

export type ViolationResult = { counted: boolean; count: number; limit: number; autoSubmitted: boolean; answersReset?: boolean };

export async function reportViolation(p: CandidatePrincipal, attemptId: string, type: ViolationType): Promise<ViolationResult> {
  const { attempt, schedule } = await loadOwnAttemptWithSchedule(p, attemptId);
  const limit = schedule.violationLimit;
  if (attempt.status !== "IN_PROGRESS") return { counted: false, count: attempt.violationCount, limit, autoSubmitted: attempt.submitReason === "VIOLATION" };
  const at = now();
  const db = getDb();

  const [last] = await db
    .select({ occurredAt: examViolations.occurredAt })
    .from(examViolations)
    .where(and(eq(examViolations.attemptId, attemptId), eq(examViolations.type, type)))
    .orderBy(desc(examViolations.occurredAt))
    .limit(1);
  if (last && at.getTime() - last.occurredAt.getTime() < VIOLATION_DEDUPE_MS) {
    return { counted: false, count: attempt.violationCount, limit, autoSubmitted: false };
  }

  const [updated] = await db
    .update(candidateAttempts)
    .set({ violationCount: sql`${candidateAttempts.violationCount} + 1` })
    .where(and(eq(candidateAttempts.id, attemptId), eq(candidateAttempts.status, "IN_PROGRESS")))
    .returning({ violationCount: candidateAttempts.violationCount });
  if (!updated) return { counted: false, count: attempt.violationCount, limit, autoSubmitted: false };
  const count = updated.violationCount;

  await db.insert(examViolations).values({ attemptId, scheduleId: schedule.id, candidateId: p.candidateId, type, countAfter: count, occurredAt: at });
  await recordExamEvent(db, {
    scheduleId: schedule.id,
    attemptId,
    candidateId: p.candidateId,
    type: "VIOLATION",
    actor: actorOf(p),
    // A FULLSCREEN_EXIT also discards the answers (below) unless it ends the exam.
    payload: { type, count, limit },
    at,
  });

  let autoSubmitted = false;
  if (limit > 0 && count >= limit) {
    if (count === limit) {
      // Shown in red on Live Monitoring so the invigilator can act.
      await recordExamEvent(db, {
        scheduleId: schedule.id,
        attemptId,
        candidateId: p.candidateId,
        type: "VIOLATION_LIMIT_REACHED",
        actor: actorOf(p),
        payload: { count, limit, rollNumber: p.rollNumber },
        at,
      });
    }
    if (schedule.autoSubmitOnViolations) {
      const r = await finalizeAttempt(attemptId, "VIOLATION", { type: "SYSTEM", label: "violation-limit" }, at);
      autoSubmitted = !r.alreadySubmitted;
    }
  }

  // Leaving fullscreen restarts the paper: every answer so far is discarded.
  // The attempt itself (and its photos/violations) is kept as evidence, and
  // the schedule's clock keeps running; it cannot be reset for one candidate.
  let answersReset = false;
  if (type === "FULLSCREEN_EXIT" && !autoSubmitted) {
    await db.delete(candidateAnswers).where(eq(candidateAnswers.attemptId, attemptId));
    answersReset = true;
  }
  return { counted: true, count, limit, autoSubmitted, answersReset };
}

// --- Staff views -------------------------------------------------------------------

export async function listScheduleProctoring(scheduleId: string) {
  const db = getDb();
  const [photos, violations] = await Promise.all([
    db
      .select({ id: examPhotos.id, kind: examPhotos.kind, candidateId: examPhotos.candidateId, capturedAt: examPhotos.capturedAt })
      .from(examPhotos)
      .where(
        // LOGIN photos are linked to the candidate (and to the sitting that required them).
        inArray(
          examPhotos.candidateId,
          db.select({ id: examAssignments.candidateId }).from(examAssignments).where(eq(examAssignments.scheduleId, scheduleId)),
        ),
      )
      .orderBy(desc(examPhotos.capturedAt)),
    db
      .select({ candidateId: examViolations.candidateId, type: examViolations.type, occurredAt: examViolations.occurredAt, countAfter: examViolations.countAfter })
      .from(examViolations)
      .where(eq(examViolations.scheduleId, scheduleId))
      .orderBy(asc(examViolations.occurredAt)),
  ]);
  const photosBy = new Map<string, { id: string; kind: PhotoKind; capturedAt: Date }[]>();
  for (const ph of photos) {
    if (!ph.candidateId) continue;
    const list = photosBy.get(ph.candidateId) ?? [];
    // Latest photo of each kind only.
    if (!list.some((x) => x.kind === ph.kind)) list.push({ id: ph.id, kind: ph.kind, capturedAt: ph.capturedAt });
    photosBy.set(ph.candidateId, list);
  }
  const violationsBy = new Map<string, typeof violations>();
  for (const v of violations) violationsBy.set(v.candidateId, [...(violationsBy.get(v.candidateId) ?? []), v]);
  return { photosBy, violationsBy };
}

/** Photo bytes for staff (served through our server so Cloudinary URLs are never handed out). */
export async function getPhotoForStaff(photoId: string): Promise<{ body: ArrayBuffer; contentType: string }> {
  const [ph] = await getDb().select({ url: examPhotos.url }).from(examPhotos).where(eq(examPhotos.id, photoId));
  if (!ph) throw new AppError("NOT_FOUND", "Photo not found.");
  const res = await fetch(ph.url);
  if (!res.ok) throw new AppError("NOT_FOUND", "Photo is no longer available.");
  return { body: await res.arrayBuffer(), contentType: res.headers.get("content-type") ?? "image/jpeg" };
}
