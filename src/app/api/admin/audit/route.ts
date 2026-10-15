import { json, requireAdmin, route } from "@/server/http";
import { listAuditLogs } from "@/server/services/audit-service";

export const GET = route(async (req) => {
  await requireAdmin(req, "audit.view");
  const sp = req.nextUrl.searchParams;
  return json({
    logs: await listAuditLogs({
      limit: Number(sp.get("limit") ?? 100),
      offset: Number(sp.get("offset") ?? 0),
      entityType: sp.get("entityType") ?? undefined,
      action: sp.get("action") ?? undefined,
    }),
  });
});
