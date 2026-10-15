import { z } from "zod";
import { json, parseBody, requireStudent, route } from "@/server/http";
import { startPracticeAttempt } from "@/server/services/practice-service";

/** POST { language } — creates the attempt (server fixes the deadline) or resumes the active one. */
export const POST = route<{ slug: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  const { slug } = await params;
  const { language } = await parseBody(req, z.object({ language: z.enum(["en", "hi"]).default("en") }));
  return json(await startPracticeAttempt(s, { slug, language }));
});
