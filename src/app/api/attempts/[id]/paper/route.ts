import { z } from "zod";
import { json, requireCandidate, route } from "@/server/http";
import { getAttemptPaper } from "@/server/services/attempt-service";

// Never includes correct answers or explanations.
export const GET = route<{ id: string }>(async (req, { params }) => {
  const p = await requireCandidate(req);
  const id = z.uuid().parse((await params).id);
  return json(await getAttemptPaper(p, id));
});
