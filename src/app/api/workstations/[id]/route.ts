import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setWorkstationCentre } from "@/server/services/centre-service";

/** PATCH { centreId: uuid | null } */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "candidates.manage");
  const { centreId } = await parseBody(req, z.object({ centreId: z.uuid().nullable() }));
  await setWorkstationCentre(adminActor(admin, req), (await params).id, centreId);
  return json({ ok: true });
});
