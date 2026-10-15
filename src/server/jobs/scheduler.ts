/**
 * Scheduler loop. Correctness never depends on this loop's timing: each
 * tick asks the database what is due "now" and applies idempotent
 * transitions. The loop only bounds how quickly connected clients see a
 * start/end when nobody else is making requests.
 *
 * On start it runs a tick immediately, which reconciles anything that
 * became due while the server was down (restart recovery).
 */
import { now } from "@/lib/time/clock";
import { finalizeExpiredPracticeAttempts } from "@/server/services/practice-service";
import { runSchedulerTick } from "@/server/services/schedule-engine";
import { purgeOldSessions } from "@/server/services/session-service";

export type SchedulerHandle = { stop: () => Promise<void> };

const g = globalThis as unknown as { __cbtScheduler?: SchedulerHandle | null };

export function startScheduler(opts: { intervalMs?: number; label?: string } = {}): SchedulerHandle {
  // One loop per process even across dev hot reloads.
  if (g.__cbtScheduler) return g.__cbtScheduler;
  const intervalMs = Math.max(250, opts.intervalMs ?? Number(process.env.SCHEDULER_INTERVAL_MS ?? 1000));
  const label = opts.label ?? "scheduler";
  let running: Promise<void> | null = null;
  let failures = 0;
  let lastPurge = 0;

  const tick = async () => {
    if (running) return; // never overlap ticks
    running = (async () => {
      try {
        const at = now();
        await runSchedulerTick(at); // exam-centre schedules
        await finalizeExpiredPracticeAttempts(at); // self-paced online attempts past their deadline
        if (failures > 0) console.log(`[${label}] recovered after ${failures} failed tick(s)`);
        failures = 0;
        if (Date.now() - lastPurge > 60 * 60 * 1000) {
          lastPurge = Date.now();
          await purgeOldSessions();
        }
      } catch (err) {
        failures++;
        // Database unreachable (e.g. internet down in Profile A): keep
        // retrying. Deadlines are re-applied with their official timestamps
        // once the database is reachable again.
        if (failures === 1 || failures % 30 === 0) {
          console.error(`[${label}] tick failed (${failures} in a row):`, (err as Error).message);
        }
      } finally {
        running = null;
      }
    })();
    await running;
  };

  void tick();
  const timer = setInterval(() => void tick(), intervalMs);
  timer.unref?.();
  console.log(`[${label}] started (interval ${intervalMs} ms, pid ${process.pid})`);

  const handle: SchedulerHandle = {
    stop: async () => {
      clearInterval(timer);
      if (running) await running;
      g.__cbtScheduler = null;
    },
  };
  g.__cbtScheduler = handle;
  return handle;
}
