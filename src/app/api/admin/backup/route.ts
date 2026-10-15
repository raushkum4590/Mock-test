import { adminActor, requireAdmin, route } from "@/server/http";
import { backupFilename, createBackupAudited } from "@/server/services/backup-service";

/**
 * Download a full JSON backup (contains answer keys and password hashes —
 * Super Admin only, audited). Restores are CLI-only: `npm run restore`.
 */
export const GET = route(async (req) => {
  const admin = await requireAdmin(req, "backup.manage");
  const backup = await createBackupAudited(adminActor(admin, req));
  return new Response(JSON.stringify(backup), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${backupFilename()}"`,
      "Cache-Control": "no-store",
    },
  });
});
