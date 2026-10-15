import { z } from "zod";
import { studentProfileSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireStudent, route } from "@/server/http";
import { getStudentProfile, setStudentLanguage, updateStudentProfile } from "@/server/services/student-auth-service";

export const GET = route(async (req) => {
  const s = await requireStudent(req);
  return json(await getStudentProfile(s.studentId));
});

export const PUT = route(async (req) => {
  const s = await requireStudent(req);
  await updateStudentProfile(s.studentId, await parseBody(req, studentProfileSchema));
  return json({ ok: true });
});

/** PATCH { language } — preference only; never affects answers. */
export const PATCH = route(async (req) => {
  const s = await requireStudent(req);
  const { language } = await parseBody(req, z.object({ language: z.enum(["en", "hi"]) }));
  await setStudentLanguage(s.studentId, language);
  return json({ ok: true });
});
