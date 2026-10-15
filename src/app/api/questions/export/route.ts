import { csvResponse } from "@/lib/csv";
import { adminActor, requireAdmin, route } from "@/server/http";
import { audit } from "@/server/services/audit-service";
import { exportQuestionsCsv } from "@/server/services/question-service";
import { getDb } from "@/lib/db/client";

// Contains correct answers: restricted to question managers and audited.
export const GET = route(async (req) => {
  const admin = await requireAdmin(req, "questions.manage");
  const csv = await exportQuestionsCsv();
  await audit(getDb(), adminActor(admin, req), "question.export");
  return csvResponse("question-bank.csv", csv);
});
