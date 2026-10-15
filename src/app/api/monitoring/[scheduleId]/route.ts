import { z } from "zod";
import { json, requireAdmin, route } from "@/server/http";
import { getScheduleMonitor } from "@/server/services/monitoring-service";

export const GET = route<{ scheduleId: string }>(async (req, { params }) => {
  await requireAdmin(req, "monitoring.view");
  const scheduleId = z.uuid().parse((await params).scheduleId);
  return json(await getScheduleMonitor(scheduleId));
});
