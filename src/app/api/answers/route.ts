import { saveAnswersSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { saveAnswers } from "@/server/services/attempt-service";

/**
 * POST { attemptId, changes: [{ questionId, selectedOptionId|null,
 *        markedForReview, revision, idempotencyKey }] }
 * Per-item result: SAVED | DUPLICATE (retry of an applied change) |
 * STALE (server has a newer revision; its state is returned) | INVALID.
 */
export const POST = route(async (req) => {
  const p = await requireCandidate(req);
  return json(await saveAnswers(p, await parseBody(req, saveAnswersSchema)));
});
