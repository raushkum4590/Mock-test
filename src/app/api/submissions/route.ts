import { submitSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { submitAttempt } from "@/server/services/attempt-service";

/** POST { attemptId } — idempotent; a repeat returns alreadySubmitted: true. */
export const POST = route(async (req) => {
  const p = await requireCandidate(req);
  const { attemptId } = await parseBody(req, submitSchema);
  return json(await submitAttempt(p, attemptId));
});
