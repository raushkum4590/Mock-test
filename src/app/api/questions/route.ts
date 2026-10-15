import { questionSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { createQuestion, listQuestions } from "@/server/services/question-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "questions.manage");
  const sp = req.nextUrl.searchParams;
  return json({
    questions: await listQuestions({
      subject: sp.get("subject") ?? undefined,
      search: sp.get("q") ?? undefined,
      limit: Number(sp.get("limit") ?? 200),
    }),
  });
});

export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "questions.manage");
  return json(await createQuestion(adminActor(admin, req), await parseBody(req, questionSchema)), { status: 201 });
});
