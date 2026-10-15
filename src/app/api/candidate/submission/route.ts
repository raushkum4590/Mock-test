import { z } from "zod";
import { json, requireCandidate, route } from "@/server/http";
import { getSubmissionSummary } from "@/server/services/attempt-service";

export const GET = route(async (req) => {
  const p = await requireCandidate(req);
  const scheduleId = z.uuid().parse(req.nextUrl.searchParams.get("scheduleId"));
  return json(await getSubmissionSummary(p, scheduleId));
});
