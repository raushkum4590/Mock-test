import { asc, count, eq, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { candidates, roles, users } from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { ROLES, ROLE_CODES, type RoleCode } from "@/lib/permissions";
import { rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { now } from "@/lib/time/clock";
import { audit, authorize, type Actor } from "./audit-service";
import { claimLoginPhoto } from "./proctoring-service";
import {
  createSession,
  revokeCandidateSessions,
  revokeUserSessions,
  type AdminPrincipal,
  type CandidatePrincipal,
  type RequestMeta,
} from "./session-service";

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_LIMIT_PER_IDENTITY = 8;
const LOGIN_LIMIT_PER_IP = 60;

function enforceLoginRateLimit(kind: string, identity: string, ip: string | null) {
  const perIdentity = rateLimit(`login:${kind}:${ip ?? "?"}:${identity.toLowerCase()}`, LOGIN_LIMIT_PER_IDENTITY, LOGIN_WINDOW_MS);
  const perIp = rateLimit(`login:${kind}:ip:${ip ?? "?"}`, LOGIN_LIMIT_PER_IP, LOGIN_WINDOW_MS);
  if (!perIdentity.allowed || !perIp.allowed) {
    throw new AppError(
      "RATE_LIMITED",
      `Too many login attempts. Try again in ${Math.max(perIdentity.retryAfterSeconds, perIp.retryAfterSeconds)} seconds.`,
    );
  }
}

/** Seed the roles table from the in-code role definitions (idempotent). */
export async function ensureRoles(q: Queryable = getDb()): Promise<void> {
  for (const code of ROLE_CODES) {
    const r = ROLES[code];
    await q
      .insert(roles)
      .values({ code, name: r.name, description: r.description, permissions: [...r.permissions] })
      .onConflictDoUpdate({
        target: roles.code,
        set: { name: r.name, description: r.description, permissions: [...r.permissions] },
      });
  }
}

export async function countUsers(): Promise<number> {
  const [row] = await getDb().select({ n: count() }).from(users);
  return row?.n ?? 0;
}

export async function loginAdmin(
  input: { username: string; password: string },
  meta: RequestMeta,
): Promise<{ token: string; expiresAt: Date; principal: Omit<AdminPrincipal, "sessionId"> }> {
  enforceLoginRateLimit("admin", input.username, meta.ip);
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.username}) = lower(${input.username})`)
    .limit(1);
  const ok = user ? await verifyPassword(user.passwordHash, input.password) : await verifyAgainstDummy(input.password);
  if (!user || !ok || !user.isActive) {
    await audit(db, { type: "SYSTEM", ip: meta.ip, label: input.username.slice(0, 64) }, "admin.login_failed", null, {
      reason: !user ? "unknown_user" : !ok ? "bad_password" : "inactive",
    });
    throw new AppError("UNAUTHENTICATED", "Invalid username or password.");
  }
  const { token, expiresAt } = await db.transaction(async (tx) => {
    const s = await createSession(tx, { type: "ADMIN", userId: user.id }, meta);
    await tx.update(users).set({ lastLoginAt: now() }).where(eq(users.id, user.id));
    await audit(tx, { type: "ADMIN", id: user.id, label: user.username, ip: meta.ip }, "admin.login", {
      type: "user",
      id: user.id,
    });
    return s;
  });
  resetRateLimit(`login:admin:${meta.ip ?? "?"}:${input.username.toLowerCase()}`);
  return {
    token,
    expiresAt,
    principal: { kind: "ADMIN", userId: user.id, username: user.username, fullName: user.fullName, role: user.roleCode as RoleCode },
  };
}

export async function loginCandidate(
  input: { rollNumber: string; password: string },
  meta: RequestMeta,
  // Token of the photo captured before login (required when the candidate's sitting requires a photo).
  photoToken: string | null = null,
): Promise<{ token: string; expiresAt: Date; principal: Omit<CandidatePrincipal, "sessionId"> }> {
  enforceLoginRateLimit("candidate", input.rollNumber, meta.ip);
  const db = getDb();
  const [cand] = await db
    .select()
    .from(candidates)
    .where(sql`upper(${candidates.rollNumber}) = upper(${input.rollNumber})`)
    .limit(1);
  const ok = cand ? await verifyPassword(cand.passwordHash, input.password) : await verifyAgainstDummy(input.password);
  if (!cand || !ok) {
    await audit(db, { type: "SYSTEM", ip: meta.ip, label: input.rollNumber.slice(0, 64) }, "candidate.login_failed", null, {
      reason: !cand ? "unknown_roll_number" : "bad_password",
      workstation: meta.workstationCode,
    });
    throw new AppError("UNAUTHENTICATED", "Invalid roll number or password.");
  }
  if (!cand.isActive) {
    throw new AppError("NOT_ELIGIBLE", "This candidate account is not active. Please contact the invigilator.");
  }
  const { token, expiresAt } = await db.transaction(async (tx) => {
    const photoId = await claimLoginPhoto(tx, cand.id, photoToken);
    const replaced = await revokeCandidateSessions(tx, cand.id);
    const s = await createSession(tx, { type: "CANDIDATE", candidateId: cand.id }, meta);
    await tx.update(candidates).set({ lastLoginAt: now() }).where(eq(candidates.id, cand.id));
    await audit(tx, { type: "CANDIDATE", id: cand.id, label: cand.rollNumber, ip: meta.ip }, "candidate.login", {
      type: "candidate",
      id: cand.id,
    }, { workstation: meta.workstationCode, replacedSessions: replaced, photoId });
    return s;
  });
  resetRateLimit(`login:candidate:${meta.ip ?? "?"}:${input.rollNumber.toLowerCase()}`);
  return {
    token,
    expiresAt,
    principal: {
      kind: "CANDIDATE",
      candidateId: cand.id,
      rollNumber: cand.rollNumber,
      fullName: cand.fullName,
      preferredLanguage: cand.preferredLanguage,
      workstationCode: meta.workstationCode,
      ip: meta.ip,
    },
  };
}

function tokensMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * First-run web setup. Only works while no users exist AND the request
 * presents SETUP_TOKEN from the server's environment. The advisory lock
 * makes two simultaneous setup requests create at most one admin.
 */
export async function setupInitialAdmin(
  input: { token: string; username: string; fullName: string; password: string },
  meta: RequestMeta,
): Promise<{ userId: string }> {
  const expected = process.env.SETUP_TOKEN;
  if (!expected) throw new AppError("SETUP_DISABLED", "Web setup is disabled. Use `npm run admin:create`.");
  if (!tokensMatch(input.token, expected)) throw new AppError("FORBIDDEN", "Invalid setup token.");
  const passwordHash = await hashPassword(input.password);
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7340001)`);
    const [{ n } = { n: 0 }] = await tx.select({ n: count() }).from(users);
    if (n > 0) throw new AppError("SETUP_DISABLED", "Setup has already been completed.");
    await ensureRoles(tx);
    const [user] = await tx
      .insert(users)
      .values({ username: input.username, fullName: input.fullName, passwordHash, roleCode: "SUPER_ADMIN" })
      .returning({ id: users.id });
    await audit(tx, { type: "SYSTEM", ip: meta.ip }, "setup.initial_admin", { type: "user", id: user!.id }, {
      username: input.username,
    });
    return { userId: user!.id };
  });
}

export async function createAdminUser(
  actor: Actor,
  input: { username: string; fullName: string; password: string; roleCode: RoleCode },
  q: Queryable = getDb(),
): Promise<{ id: string }> {
  authorize(actor, "users.manage");
  const [existing] = await q
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${input.username})`);
  if (existing) throw new AppError("CONFLICT", "That username is already taken.");
  const passwordHash = await hashPassword(input.password);
  const [user] = await q
    .insert(users)
    .values({ username: input.username, fullName: input.fullName, passwordHash, roleCode: input.roleCode })
    .returning({ id: users.id });
  await audit(q, actor, "user.create", { type: "user", id: user!.id }, { username: input.username, role: input.roleCode });
  return user!;
}

export async function listAdminUsers() {
  return getDb()
    .select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      roleCode: users.roleCode,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.username));
}

export async function setAdminUserActive(actor: Actor & { id: string }, userId: string, isActive: boolean) {
  authorize(actor, "users.manage");
  if (actor.id === userId && !isActive) throw new AppError("VALIDATION", "You cannot deactivate your own account.");
  const db = getDb();
  await db.transaction(async (tx) => {
    const [u] = await tx.update(users).set({ isActive, updatedAt: now() }).where(eq(users.id, userId)).returning({ id: users.id });
    if (!u) throw new AppError("NOT_FOUND", "User not found.");
    if (!isActive) await revokeUserSessions(tx, userId);
    await audit(tx, actor, isActive ? "user.activate" : "user.deactivate", { type: "user", id: userId });
  });
}
