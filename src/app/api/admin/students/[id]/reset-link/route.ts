import { adminActor, json, requireAdmin, route } from "@/server/http";
import { adminCreateResetLink } from "@/server/services/student-auth-service";

/** Returns a single-use, 30-minute reset link to hand to the student. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req, "students.manage");
  return json({ url: await adminCreateResetLink(adminActor(admin, req), (await params).id) });
});
