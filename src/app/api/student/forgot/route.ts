import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route } from "@/server/http";
import { requestPasswordReset } from "@/server/services/student-auth-service";

/** Always returns the same response whether or not the email exists. */
export const POST = route(async (req) => {
  const { email } = await parseBody(req, forgotPasswordSchema);
  await requestPasswordReset(email, requestMeta(req));
  return json({ ok: true });
});
