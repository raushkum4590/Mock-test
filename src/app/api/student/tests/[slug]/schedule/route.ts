import { eq } from "drizzle-orm";
import { z } from "zod";
import { exams } from "@db/schema";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { DEFAULT_TIME_ZONE, zonedTimeToUtc } from "@/lib/time/zone";
import { localDateTime } from "@/lib/validation/schemas";
import { json, parseBody, requireStudent, route } from "@/server/http";
import { getPublicTestDetail, hasAccess } from "@/server/services/practice-service";
import { requestTestSchedule } from "@/server/services/test-schedule-service";

/** POST { startAt: "YYYY-MM-DDTHH:mm" (exam time zone), note? } — asks an admin to approve sitting this test then. */
export const POST = route<{ slug: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  const { slug } = await params;
  const body = await parseBody(req, z.object({ startAt: localDateTime, note: z.string().max(500).optional() }));
  const { exam } = await getPublicTestDetail(slug);
  const [row] = await getDb().select({ id: exams.id, accessLevel: exams.accessLevel, seriesId: exams.seriesId }).from(exams).where(eq(exams.id, exam.id));
  if (!(await hasAccess(s.studentId, row!))) {
    throw new AppError("FORBIDDEN", "This is a premium test. Your account does not have access to it.");
  }
  const created = await requestTestSchedule(s, { examId: exam.id, startAt: zonedTimeToUtc(body.startAt, DEFAULT_TIME_ZONE), note: body.note });
  return json({ id: created.id, status: created.status }, { status: 201 });
});
