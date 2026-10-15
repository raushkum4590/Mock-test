import { questionSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { getQuestion, updateQuestion } from "@/server/services/question-service";

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  await requireAdmin(req, "questions.manage");
  const { id } = await params;
  return json(await getQuestion(id));
});

export const PUT = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "questions.manage");
  const { id } = await params;
  await updateQuestion(adminActor(admin, req), id, await parseBody(req, questionSchema));
  return json({ ok: true });
});
