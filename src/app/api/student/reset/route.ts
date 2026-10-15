import { resetPasswordSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route } from "@/server/http";
import { resetPassword } from "@/server/services/student-auth-service";

export const POST = route(async (req) => {
  await resetPassword(await parseBody(req, resetPasswordSchema), requestMeta(req));
  return json({ ok: true });
});
