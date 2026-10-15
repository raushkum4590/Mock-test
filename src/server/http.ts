/**
 * Route-handler plumbing: error mapping, CSRF origin check, authentication
 * and authorization from the request cookie. Route handlers stay thin and
 * delegate to services.
 */
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { AppError, isAppError } from "@/lib/errors";
import { hasPermission, type Permission } from "@/lib/permissions";
import { rateLimit } from "@/lib/security/rate-limit";
import type { Actor } from "@/server/services/audit-service";
import {
  resolveAdminSession,
  resolveCandidateSession,
  resolveStudentSession,
  type AdminPrincipal,
  type CandidatePrincipal,
  type StudentPrincipal,
  type RequestMeta,
} from "@/server/services/session-service";
import { ADMIN_COOKIE, CANDIDATE_COOKIE, STUDENT_COOKIE } from "@/lib/auth/cookie-names";

export const WORKSTATION_HEADER = "x-cbt-workstation";

export function requestMeta(req: NextRequest): RequestMeta {
  // On a LAN install the Next.js server is reached directly, so the socket
  // address is not available here; x-forwarded-for is set by Next itself.
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ip = fwd ?? req.headers.get("x-real-ip");
  const ws = req.headers.get(WORKSTATION_HEADER)?.trim().slice(0, 40) || null;
  return { ip, userAgent: req.headers.get("user-agent"), workstationCode: ws };
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Reject cross-site state-changing requests (defence in depth on top of SameSite cookies). */
function checkOrigin(req: NextRequest) {
  if (SAFE_METHODS.has(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients (scripts, tests) send no Origin
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const allowed = new Set(
    (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("FORBIDDEN", "Bad origin.");
  }
  if (originHost !== host && !allowed.has(origin)) throw new AppError("FORBIDDEN", "Cross-site request blocked.");
}

export function errorResponse(err: unknown): NextResponse {
  if (isAppError(err)) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details ?? null } },
      { status: err.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Invalid request.",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 400 },
    );
  }
  console.error("[api] unhandled error:", err);
  return NextResponse.json({ error: { code: "INTERNAL", message: "Internal server error." } }, { status: 500 });
}

export function json(data: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(data, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

type Ctx<P> = { params: Promise<P> };

export function route<P = Record<string, string>>(
  handler: (req: NextRequest, ctx: Ctx<P>) => Promise<Response>,
): (req: NextRequest, ctx: Ctx<P>) => Promise<Response> {
  return async (req, ctx) => {
    try {
      checkOrigin(req);
      return await handler(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("VALIDATION", "Request body must be JSON.");
  }
  return schema.parse(body);
}

export async function requireAdmin(req: NextRequest, permission?: Permission): Promise<AdminPrincipal> {
  const principal = await resolveAdminSession(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!principal) throw new AppError("UNAUTHENTICATED", "Please sign in.");
  if (permission && !hasPermission(principal.role, permission)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.");
  }
  return principal;
}

export async function requireCandidate(req: NextRequest): Promise<CandidatePrincipal> {
  const principal = await resolveCandidateSession(req.cookies.get(CANDIDATE_COOKIE)?.value);
  if (!principal) throw new AppError("UNAUTHENTICATED", "Your session has ended. Please log in again.");
  // Per-session rate limit for exam traffic (autosave bursts are coalesced client-side).
  const rl = rateLimit(`cand:${principal.sessionId}`, 240, 60_000);
  if (!rl.allowed) throw new AppError("RATE_LIMITED", "Too many requests. Please slow down.");
  return principal;
}

export async function requireStudent(req: NextRequest): Promise<StudentPrincipal> {
  const principal = await resolveStudentSession(req.cookies.get(STUDENT_COOKIE)?.value);
  if (!principal) throw new AppError("UNAUTHENTICATED", "Please log in to continue.");
  const rl = rateLimit(`stu:${principal.sessionId}`, 300, 60_000);
  if (!rl.allowed) throw new AppError("RATE_LIMITED", "Too many requests. Please slow down.");
  return principal;
}

export function adminActor(p: AdminPrincipal, req: NextRequest): Actor {
  return { type: "ADMIN", id: p.userId, label: p.username, role: p.role, ip: requestMeta(req).ip };
}

export function cookieSecure(): boolean {
  const mode = process.env.COOKIE_SECURE ?? "auto";
  if (mode === "true") return true;
  if (mode === "false") return false;
  return (process.env.APP_BASE_URL ?? "").startsWith("https://");
}

export function setSessionCookie(res: NextResponse, name: string, token: string, expiresAt: Date) {
  res.cookies.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse, name: string) {
  res.cookies.set(name, "", { httpOnly: true, sameSite: "lax", secure: cookieSecure(), path: "/", maxAge: 0 });
}
