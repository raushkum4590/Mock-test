import { z } from "zod";
import { json, parseBody, requireStudent, route } from "@/server/http";
import { toggleBookmark } from "@/server/services/practice-service";

export const POST = route(async (req) => {
  const s = await requireStudent(req);
  const { questionId } = await parseBody(req, z.object({ questionId: z.uuid() }));
  return json(await toggleBookmark(s, questionId));
});
