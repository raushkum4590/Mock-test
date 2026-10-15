import { examSchema, examStatusSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { getExamDetail, setExamStatus, updateExam } from "@/server/services/exam-service";

type P = { id: string };

export const GET = route<P>(async (req, { params }) => {
  await requireAdmin(req, "exams.manage");
  const { id } = await params;
  return json(await getExamDetail(id));
});

export const PUT = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  await updateExam(adminActor(admin, req), id, await parseBody(req, examSchema));
  return json({ ok: true });
});

/** PATCH { status: DRAFT | READY | ARCHIVED } */
export const PATCH = route<P>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  const { status } = await parseBody(req, examStatusSchema);
  await setExamStatus(adminActor(admin, req), id, status);
  return json({ ok: true });
});
