import { ADMIN_COOKIE, CANDIDATE_COOKIE, STUDENT_COOKIE } from "@/lib/auth/cookie-names";
import { clearSessionCookie, json, route } from "@/server/http";
import { revokeSessionByToken } from "@/server/services/session-service";

/** POST /api/auth/logout?who=admin|candidate|student */
export const POST = route(async (req) => {
  const who = req.nextUrl.searchParams.get("who");
  const name = who === "candidate" ? CANDIDATE_COOKIE : who === "student" ? STUDENT_COOKIE : ADMIN_COOKIE;
  const token = req.cookies.get(name)?.value;
  if (token) await revokeSessionByToken(token);
  const res = json({ ok: true });
  clearSessionCookie(res, name);
  return res;
});
