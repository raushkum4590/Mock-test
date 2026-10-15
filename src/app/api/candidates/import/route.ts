import { AppError } from "@/lib/errors";
import { adminActor, json, requireAdmin, route } from "@/server/http";
import { importCandidatesCsv } from "@/server/services/candidate-service";

/** POST raw CSV text. Columns: roll_number, full_name, password, batch_code, photo_url, language */
export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "candidates.manage");
  const text = await req.text();
  if (text.length > 5 * 1024 * 1024) throw new AppError("VALIDATION", "CSV file is larger than 5 MB.");
  const report = await importCandidatesCsv(adminActor(admin, req), text);
  return json(report, { status: report.errors.length ? 422 : 201 });
});
