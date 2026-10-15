import { sectionSchema } from "@/lib/validation/schemas";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { addSection } from "@/server/services/exam-service";

export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "exams.manage");
  const { id } = await params;
  return json(await addSection(adminActor(admin, req), id, await parseBody(req, sectionSchema)), { status: 201 });
});
