import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setResultsPublished } from "@/server/services/results-service";

/** POST { scheduleId, published } — show/hide scores on candidates' submission page. */
export const POST = route(async (req) => {
  const admin = await requireAdmin(req, "schedules.publish");
  const { scheduleId, published } = await parseBody(req, z.object({ scheduleId: z.uuid(), published: z.boolean() }));
  await setResultsPublished(adminActor(admin, req), scheduleId, published);
  return json({ ok: true });
});
