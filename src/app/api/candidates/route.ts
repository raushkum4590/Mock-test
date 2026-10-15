import { candidateSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createCandidate, listCandidates } from "@/server/services/candidate-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "candidates.manage");
  const sp = req.nextUrl.searchParams;
  return json({
    candidates: await listCandidates({ batchId: sp.get("batchId") ?? undefined, search: sp.get("q") ?? undefined }),
  });
});

/** Returns `generatedPassword` once when no password was supplied. */
export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "candidates.manage");
  return json(await createCandidate(adminActor(admin, req), await parseBody(req, candidateSchema)), { status: 201 });
});
