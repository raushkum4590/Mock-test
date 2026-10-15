import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { removeAssignment, setAssignmentWorkstation } from "@/server/services/schedule-service";

type P = { id: string };

/** PATCH { workstationId: uuid | null } */
export const PATCH = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "schedules.manage");
  const { id } = await params;
  const { workstationId } = await parseBody(req, z.object({ workstationId: z.uuid().nullable() }));
  await setAssignmentWorkstation(adminActor(admin, req), id, workstationId);
  return json({ ok: true });
});

export const DELETE = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "schedules.manage");
  const { id } = await params;
  await removeAssignment(adminActor(admin, req), id);
  return json({ ok: true });
});
