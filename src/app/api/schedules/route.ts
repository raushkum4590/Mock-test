import { scheduleSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createSchedule, listSchedules } from "@/server/services/schedule-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "monitoring.view");
  return json({ schedules: await listSchedules() });
});

/**
 * POST { examId, batchId?, title, timeZone, loginOpensAt, startAt,
 *        durationMinutes, lateEntryMinutes, enforceWorkstation, allowPause }
 * loginOpensAt/startAt are wall-clock "YYYY-MM-DDTHH:mm" in `timeZone`.
 */
export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "schedules.manage");
  return json(await createSchedule(adminActor(admin, req), await parseBody(req, scheduleSchema)), { status: 201 });
});
