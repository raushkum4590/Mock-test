import { examSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createExam, listExams } from "@/server/services/exam-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "exams.manage");
  return json({ exams: await listExams() });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "exams.manage");
  const input = await parseBody(req, examSchema);
  return json(await createExam(adminActor(admin, req), input), { status: 201 });
});
