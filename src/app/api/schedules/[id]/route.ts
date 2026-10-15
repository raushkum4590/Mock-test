import { scheduleSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { getScheduleDetail, updateSchedule } from "@/server/services/schedule-service";

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  await requireAdmin(req, "monitoring.view");
  const { id } = await params;
  return json(await getScheduleDetail(id));
});

export const PUT = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "schedules.manage");
  const { id } = await params;
  await updateSchedule(adminActor(admin, req), id, await parseBody(req, scheduleSchema));
  return json({ ok: true });
});
