import { pingDb } from "@/lib/db/client";
import { json } from "@/server/http";
import { getSchedulerHeartbeat } from "@/server/services/schedule-engine";

// Used by candidate clients (connection indicator), the Electron app's
// pre-flight check and centre monitoring. Exposes no sensitive data.
export async function GET() {
  const db = await pingDb();
  let scheduler: { at: string; ageSeconds: number } | null = null;
  if (db.ok) {
    try {
      scheduler = await getSchedulerHeartbeat();
    } catch {
      scheduler = null;
    }
  }
  const schedulerAgeSeconds = scheduler?.ageSeconds ?? null;
  return json(
    {
      status: db.ok ? "ok" : "degraded",
      serverTime: new Date().toISOString(),
      database: { ok: db.ok, latencyMs: db.latencyMs },
      scheduler: { lastHeartbeat: scheduler?.at ?? null, ageSeconds: schedulerAgeSeconds },
    },
    { status: db.ok ? 200 : 503 },
  );
}
