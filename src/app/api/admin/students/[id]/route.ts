import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setStudentActive } from "@/server/services/student-auth-service";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "students.manage");
  const { isActive } = await parseBody(req, z.object({ isActive: z.boolean() }));
  await setStudentActive(adminActor(admin, req), (await params).id, isActive);
  return json({ ok: true });
});
