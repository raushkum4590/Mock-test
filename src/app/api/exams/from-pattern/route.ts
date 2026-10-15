import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createExamFromPattern } from "@/server/services/exam-service";

const bodySchema = z.object({ patternId: z.string().min(1).max(80), titleEn: z.string().trim().max(200).optional().nullable() });

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "exams.manage");
  const input = await parseBody(req, bodySchema);
  return json(await createExamFromPattern(adminActor(admin, req), input), { status: 201 });
});
