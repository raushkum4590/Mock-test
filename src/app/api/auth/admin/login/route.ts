import { ADMIN_COOKIE } from "@/lib/auth/cookie-names";
import { adminLoginSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { loginAdmin } from "@/server/services/auth-service";

export const POST = route(async (req) => {
  const input = await parseBody(req, adminLoginSchema);
  const { token, expiresAt, principal } = await loginAdmin(input, requestMeta(req));
  const res = json({ user: { username: principal.username, fullName: principal.fullName, role: principal.role } });
  setSessionCookie(res, ADMIN_COOKIE, token, expiresAt);
  return res;
});
