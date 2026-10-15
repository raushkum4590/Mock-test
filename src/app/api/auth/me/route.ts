import { ADMIN_COOKIE, CANDIDATE_COOKIE } from "@/lib/auth/cookie-names";
import { json, route } from "@/server/http";
import { resolveAdminSession, resolveCandidateSession } from "@/server/services/session-service";

export const GET = route(async (req) => {
  const admin = await resolveAdminSession(req.cookies.get(ADMIN_COOKIE)?.value);
  const candidate = await resolveCandidateSession(req.cookies.get(CANDIDATE_COOKIE)?.value);
  return json({
    admin: admin ? { username: admin.username, fullName: admin.fullName, role: admin.role } : null,
    candidate: candidate ? { rollNumber: candidate.rollNumber, fullName: candidate.fullName } : null,
  });
});
