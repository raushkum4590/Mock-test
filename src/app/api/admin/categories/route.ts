import { categorySchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createCategory } from "@/server/services/catalog-service";

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "exams.manage");
  return json(await createCategory(adminActor(admin, req), await parseBody(req, categorySchema)), { status: 201 });
});
