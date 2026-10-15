import { assignmentSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { assignCandidates, listAssignments } from "@/server/services/schedule-service";

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  await requireAdmin(req, "monitoring.view");
  const { id } = await params;
  return json({ assignments: await listAssignments(id) });
});

/** POST { candidateIds?: uuid[], fromBatch?: boolean } */
export const POST = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "schedules.manage");
  const { id } = await params;
  return json(await assignCandidates(adminActor(admin, req), id, await parseBody(req, assignmentSchema)));
});
