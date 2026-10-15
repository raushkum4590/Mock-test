import { z } from "zod";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { captureAttemptPhoto } from "@/server/services/proctoring-service";

/** POST { kind: START | END, image: JPEG data URL } */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const p = await requireCandidate(req);
  const { id } = await params;
  const { kind, image } = await parseBody(req, z.object({ kind: z.enum(["START", "END"]), image: z.string().max(2_100_000) }));
  return json(await captureAttemptPhoto(p, id, kind, image), { status: 201 });
});
