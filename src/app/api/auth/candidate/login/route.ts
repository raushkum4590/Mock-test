import { CANDIDATE_COOKIE, PHOTO_COOKIE } from "@/lib/auth/cookie-names";
import { candidateLoginSchema } from "@/lib/validation/schemas";
import { clearSessionCookie, json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { loginCandidate } from "@/server/services/auth-service";
import { touchWorkstation } from "@/server/services/candidate-service";

export const POST = route(async (req) => {
  const input = await parseBody(req, candidateLoginSchema);
  const meta = requestMeta(req);
  const { token, expiresAt, principal } = await loginCandidate(input, meta, req.cookies.get(PHOTO_COOKIE)?.value ?? null);
  await touchWorkstation(meta.workstationCode, meta.ip).catch(() => {});
  const res = json({
    candidate: {
      rollNumber: principal.rollNumber,
      fullName: principal.fullName,
      preferredLanguage: principal.preferredLanguage,
    },
  });
  setSessionCookie(res, CANDIDATE_COOKIE, token, expiresAt);
  // The capture token is single-use.
  clearSessionCookie(res, PHOTO_COOKIE);
  return res;
});
