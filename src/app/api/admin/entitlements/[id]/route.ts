import { adminActor, json, requireAdmin, route } from "@/server/http";
import { revokeEntitlement } from "@/server/services/catalog-service";

export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "students.manage");
  await revokeEntitlement(adminActor(admin, req), (await params).id);
  return json({ ok: true });
});
