import { json, requireStudent, route } from "@/server/http";
import { cancelTestSchedule } from "@/server/services/test-schedule-service";

/** DELETE — the student withdraws their own pending or approved request. */
export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  const { id } = await params;
  await cancelTestSchedule(s, id);
  return json({ ok: true });
});
