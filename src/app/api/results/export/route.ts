import { z } from "zod";
import { csvResponse } from "@/lib/csv";
import { adminActor, requireAdmin, route } from "@/server/http";
import { exportScheduleResultsCsv } from "@/server/services/results-service";

export const GET = route(async (req) => {
  const admin = await requireAdmin(req, "results.export");
  const scheduleId = z.uuid().parse(req.nextUrl.searchParams.get("scheduleId"));
  const { filename, csv } = await exportScheduleResultsCsv(adminActor(admin, req), scheduleId);
  return csvResponse(filename, csv);
});
