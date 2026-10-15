import { workstationSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createWorkstation, listWorkstations } from "@/server/services/candidate-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "candidates.manage");
  return json({ workstations: await listWorkstations() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "candidates.manage");
  return json(await createWorkstation(adminActor(admin, req), await parseBody(req, workstationSchema)), { status: 201 });
});
