import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setAdminUserActive } from "@/server/services/auth-service";

/** PATCH { isActive } */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "users.manage");
  const { id } = await params;
  const { isActive } = await parseBody(req, z.object({ isActive: z.boolean() }));
  await setAdminUserActive({ ...adminActor(admin, req), id: admin.userId }, id, isActive);
  return json({ ok: true });
});
