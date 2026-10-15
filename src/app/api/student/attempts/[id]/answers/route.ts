import { z } from "zod";
import { answerChangeSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireStudent, route } from "@/server/http";
import { savePracticeAnswers } from "@/server/services/practice-service";

/** POST { changes: [...] } — per-item SAVED | DUPLICATE | STALE | INVALID. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  const attemptId = z.uuid().parse((await params).id);
  const { changes } = await parseBody(req, z.object({ changes: z.array(answerChangeSchema).min(1).max(50) }));
  return json(await savePracticeAnswers(s, { attemptId, changes }));
});
