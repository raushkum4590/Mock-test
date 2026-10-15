import { z } from "zod";
import { json, requireStudent, route } from "@/server/http";
import { cancelPracticeAttemptForFullscreenExit } from "@/server/services/practice-service";

/** Fullscreen was left: discard the in-progress attempt so the test must be restarted. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  return json(await cancelPracticeAttemptForFullscreenExit(s, z.uuid().parse((await params).id)));
});
