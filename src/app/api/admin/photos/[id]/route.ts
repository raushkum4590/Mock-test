import { z } from "zod";
import { requireAdmin, route } from "@/server/http";
import { getPhotoForStaff } from "@/server/services/proctoring-service";

/** GET — a candidate photo, for staff only (streamed through this server). */
export const GET = route<{ id: string }>(async (req, { params }) => {
  await requireAdmin(req, "monitoring.view");
  const id = z.uuid().parse((await params).id);
  const { body, contentType } = await getPhotoForStaff(id);
  return new Response(body, { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=300" } });
});
