import { z } from "zod";
import { VIOLATION_TYPES } from "@db/schema";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { reportViolation } from "@/server/services/proctoring-service";

/** POST { type } — fullscreen exit, hidden tab or camera loss reported by the exam screen. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const p = await requireCandidate(req);
  const { id } = await params;
  const { type } = await parseBody(req, z.object({ type: z.enum(VIOLATION_TYPES) }));
  return json(await reportViolation(p, id, type));
});
