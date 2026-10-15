import { z } from "zod";
import { json, requireStudent, route } from "@/server/http";
import { getPracticePaper } from "@/server/services/practice-service";

// Never includes correct answers or explanations.
export const GET = route<{ id: string }>(async (req, { params }) => {
  const s = await requireStudent(req);
  return json(await getPracticePaper(s, z.uuid().parse((await params).id)));
});
