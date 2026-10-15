import { transitionSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { adminTransition } from "@/server/services/schedule-service";

/**
 * POST { action, reason? }
 * action: SCHEDULE | UNSCHEDULE | PUBLISH | UNPUBLISH | PAUSE | RESUME | END | CANCEL
 * Starting and finishing are never admin actions: the server does them at
 * the published times. The permission for each action is enforced in the
 * service (ADMIN_ACTION_RULES).
 */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req);
  const { id } = await params;
  const { action, reason } = await parseBody(req, transitionSchema);
  const schedule = await adminTransition(adminActor(admin, req), id, action, reason);
  return json({ schedule: { id: schedule.id, status: schedule.status, endAt: schedule.endAt.toISOString() } });
});
