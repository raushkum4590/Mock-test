// Runs once when the Next.js server starts. With SCHEDULER_MODE=embedded
// (the default) the durable scheduler runs inside the web server process.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if ((process.env.SCHEDULER_MODE ?? "embedded") !== "embedded") return;
  if (!process.env.DATABASE_URL) {
    console.warn("[scheduler] DATABASE_URL not set; embedded scheduler not started.");
    return;
  }
  const { startScheduler } = await import("./server/jobs/scheduler");
  startScheduler({ label: "scheduler:embedded" });
}
