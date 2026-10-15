import { adminActor, json, requireAdmin, route } from "@/server/http";
import { deleteSection } from "@/server/services/exam-service";

export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  await deleteSection(adminActor(admin, req), id);
  return json({ ok: true });
});
