import { setupSchema } from "@/lib/validation/schemas";
import { json, parseBody, requestMeta, route } from "@/server/http";
import { setupInitialAdmin } from "@/server/services/auth-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { AppError } from "@/lib/errors";

export const POST = route(async (req) => {
  const meta = requestMeta(req);
  if (!rateLimit(`setup:${meta.ip ?? "?"}`, 10, 10 * 60_000).allowed) {
    throw new AppError("RATE_LIMITED", "Too many attempts.");
  }
  const input = await parseBody(req, setupSchema);
  const { userId } = await setupInitialAdmin(input, meta);
  return json({ ok: true, userId }, { status: 201 });
});
