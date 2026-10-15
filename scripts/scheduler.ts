/**
 * Stand-alone scheduler process: `npm run scheduler`.
 * Use with SCHEDULER_MODE=external (or alongside the embedded one — both are
 * safe together). Supervise it as a Windows service (see docs/network-setup.md).
 */
import "dotenv/config";
import { closeDb } from "@/lib/db/client";
import { startScheduler } from "@/server/jobs/scheduler";

const handle = startScheduler({ label: "scheduler:external" });

async function shutdown(signal: string) {
  console.log(`[scheduler:external] ${signal} received, stopping...`);
  await handle.stop();
  await closeDb();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
// The interval timer is unref'd; keep the process alive explicitly.
setInterval(() => {}, 1 << 30);
