import { candidateUpdateSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { updateCandidate } from "@/server/services/candidate-service";

/** PATCH { fullName?, isActive?, batchId?, resetPassword?, newPassword? } */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "candidates.manage");
  const { id } = await params;
  return json(await updateCandidate(adminActor(admin, req), id, await parseBody(req, candidateUpdateSchema)));
});
