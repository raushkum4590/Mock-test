import { z } from "zod";
import { attachQuestionsSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { attachQuestions, detachQuestion } from "@/server/services/exam-service";

type P = { id: string };

/** POST { questionIds: uuid[] } — attach bank questions to the section. */
export const POST = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  const { questionIds } = await parseBody(req, attachQuestionsSchema);
  return json(await attachQuestions(adminActor(admin, req), id, questionIds));
});

/** DELETE ?questionId=uuid */
export const DELETE = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  const questionId = z.uuid().parse(req.nextUrl.searchParams.get("questionId"));
  await detachQuestion(adminActor(admin, req), id, questionId);
  return json({ ok: true });
});
