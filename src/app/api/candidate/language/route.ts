import { languageSchema } from "@/lib/validation/schemas";
import { json, parseBody, requireCandidate, route } from "@/server/http";
import { setPreferredLanguage } from "@/server/services/attempt-service";

export const POST = route(async (req) => {
  const p = await requireCandidate(req);
  const { language } = await parseBody(req, languageSchema);
  await setPreferredLanguage(p, language);
  return json({ ok: true });
});
