import { json, requireCandidate, route } from "@/server/http";
import { getCandidateDashboard } from "@/server/services/attempt-service";

export const GET = route(async (req) => {
  const p = await requireCandidate(req);
  return json({
    candidate: { rollNumber: p.rollNumber, fullName: p.fullName, preferredLanguage: p.preferredLanguage },
    exams: await getCandidateDashboard(p),
  });
});
