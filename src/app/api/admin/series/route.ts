import { seriesSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createSeries } from "@/server/services/catalog-service";

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "exams.manage");
  return json(await createSeries(adminActor(admin, req), await parseBody(req, seriesSchema)), { status: 201 });
});
