import { STUDENT_COOKIE } from "@/lib/auth/cookie-names";
import { studentRegisterSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { registerStudent } from "@/server/services/student-auth-service";

export const POST = route(async (req) => {
  const input = await parseBody(req, studentRegisterSchema);
  const { token, expiresAt } = await registerStudent(input, requestMeta(req));
  const res = json({ ok: true }, { status: 201 });
  setSessionCookie(res, STUDENT_COOKIE, token, expiresAt);
  return res;
});
