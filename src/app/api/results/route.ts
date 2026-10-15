import { z } from "zod";
import { json, requireAdmin, route } from "@/server/http";
import { listScheduleResults } from "@/server/services/results-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "results.view");
  const scheduleId = z.uuid().parse(req.nextUrl.searchParams.get("scheduleId"));
  return json(await listScheduleResults(scheduleId));
});
