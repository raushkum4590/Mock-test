import { batchSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createBatch, listBatches } from "@/server/services/candidate-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "candidates.manage");
  return json({ batches: await listBatches() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "candidates.manage");
  return json(await createBatch(adminActor(admin, req), await parseBody(req, batchSchema)), { status: 201 });
});
