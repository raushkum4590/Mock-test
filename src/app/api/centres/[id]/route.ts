import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setCentreActive } from "@/server/services/centre-service";

/** PATCH { isActive } */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "candidates.manage");
  const { isActive } = await parseBody(req, z.object({ isActive: z.boolean() }));
  await setCentreActive(adminActor(admin, req), (await params).id, isActive);
  return json({ ok: true });
});
