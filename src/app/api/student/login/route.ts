import { STUDENT_COOKIE } from "@/lib/auth/cookie-names";
import { studentLoginSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { loginStudent } from "@/server/services/student-auth-service";

export const POST = route(async (req) => {
  const { token, expiresAt } = await loginStudent(await parseBody(req, studentLoginSchema), requestMeta(req));
  const res = json({ ok: true });
  setSessionCookie(res, STUDENT_COOKIE, token, expiresAt);
  return res;
});
