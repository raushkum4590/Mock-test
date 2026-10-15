import { z } from "zod";
import { DEFAULT_TIME_ZONE, zonedTimeToUtc } from "@/lib/time/zone";
import { localDateTime } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { reviewScheduleRequest } from "@/server/services/test-schedule-service";

/** POST { decision: APPROVE | REJECT, startAt?: "YYYY-MM-DDTHH:mm" (exam time zone), note? (required to reject) } */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "students.manage");
  const { id } = await params;
  const body = await parseBody(
    req,
    z.object({
      decision: z.enum(["APPROVE", "REJECT"]),
      startAt: localDateTime.optional(),
      note: z.string().max(500).optional(),
    }),
  );
  const row = await reviewScheduleRequest(adminActor(admin, req), id, {
    decision: body.decision,
    startAt: body.startAt ? zonedTimeToUtc(body.startAt, DEFAULT_TIME_ZONE) : null,
    note: body.note,
  });
  return json({ id: row.id, status: row.status });
});
