import { z } from "zod";
import { adminActor, json, parseBody, requireAdmin, route } from "@/server/http";
import { setRequireApproval } from "@/server/services/test-schedule-service";

/** PUT { requireApproval: boolean } — whether online tests need an approved schedule to start. */
export const PUT = route(async (req) => {
  const admin = await requireAdmin(req, "students.manage");
  const { requireApproval } = await parseBody(req, z.object({ requireApproval: z.boolean() }));
  await setRequireApproval(adminActor(admin, req), requireApproval);
  return json({ requireApproval });
});
