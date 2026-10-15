import { centreSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createCentre, listCentres } from "@/server/services/centre-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "candidates.manage");
  return json({ centres: await listCentres() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "candidates.manage");
  return json(await createCentre(adminActor(admin, req), await parseBody(req, centreSchema)), { status: 201 });
});
