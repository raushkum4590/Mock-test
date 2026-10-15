import { entitlementSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { grantEntitlement } from "@/server/services/catalog-service";

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "students.manage");
  return json(await grantEntitlement(adminActor(admin, req), await parseBody(req, entitlementSchema)), { status: 201 });
});
