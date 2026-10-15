import { z } from "zod";
import { json, requireStudent, route } from "@/server/http";
import { submitPracticeAttempt } from "@/server/services/practice-service";

/** Idempotent: a repeat returns alreadySubmitted: true. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  return json(await submitPracticeAttempt(s, z.uuid().parse((await params).id)));
});
