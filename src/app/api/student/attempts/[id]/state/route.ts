import { z } from "zod";
import { json, requireStudent, route } from "@/server/http";
import { getPracticeState } from "@/server/services/practice-service";

/** Official timing + stored answers (for clock sync and reconciliation). */
export const GET = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  return json(await getPracticeState(s, z.uuid().parse((await params).id)));
});
