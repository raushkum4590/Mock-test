import { z } from "zod";
import { PHOTO_COOKIE } from "@/lib/auth/cookie-names";
import { json, parseBody, requestMeta, route, setSessionCookie } from "@/server/http";
import { capturePreLoginPhoto } from "@/server/services/proctoring-service";

/** POST { image: "data:image/jpeg;base64,..." } — photo taken before the roll-number login. */
export const POST = route(async (req) => {
  const { image } = await parseBody(req, z.object({ image: z.string().max(2_100_000) }));
  const { captureToken, expiresAt } = await capturePreLoginPhoto(image, requestMeta(req));
  const res = json({ ok: true, expiresAt: expiresAt.toISOString() }, { status: 201 });
  setSessionCookie(res, PHOTO_COOKIE, captureToken, expiresAt);
  return res;
});
