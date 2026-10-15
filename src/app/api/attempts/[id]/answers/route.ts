import { z } from "zod";
import { json, requireCandidate, route } from "@/server/http";
import { getAttemptAnswers } from "@/server/services/attempt-service";

/** Server-side answer state, used by the client for periodic reconciliation. */
export const GET = route<{ id: string }>(async (req, { params }) => {
  const p = await requireCandidate(req);
  const id = z.uuid().parse((await params).id);
  return json(await getAttemptAnswers(p, id));
});
