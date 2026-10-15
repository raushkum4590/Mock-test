import { startAttemptSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { startAttempt } from "@/server/services/attempt-service";

/** POST { scheduleId, language } — idempotent: returns the existing attempt on reconnect. */
export const POST = route(async (req) => {
  const p = await requireCandidate(req);
  return json(await startAttempt(p, await parseBody(req, startAttemptSchema)));
});
