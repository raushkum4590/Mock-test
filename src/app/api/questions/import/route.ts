import { AppError } from "@/lib/errors";
import { adminActor, json, requireAdmin, route } from "@/server/http";
import { importQuestionsCsv } from "@/server/services/question-service";

const MAX_BYTES = 5 * 1024 * 1024;

/** POST raw CSV text (Content-Type: text/csv). */
export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "questions.manage");
  const text = await req.text();
  if (text.length > MAX_BYTES) throw new AppError("VALIDATION", "CSV file is larger than 5 MB.");
  const report = await importQuestionsCsv(adminActor(admin, req), text);
  return json(report, { status: report.errors.length ? 422 : 201 });
});
