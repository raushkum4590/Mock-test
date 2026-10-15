import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end test of the full milestone flow against a production build.
 * Requires a disposable database in E2E_DATABASE_URL (e.g. `npm run db:local`
 * and postgresql://cbt:<LOCAL_PG_PASSWORD>@127.0.0.1:5433/cbt). Never point
 * it at a live exam database.
 *   npm run build && npm run test:e2e
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;
const dbUrl = process.env.E2E_DATABASE_URL;
if (!dbUrl) throw new Error("Set E2E_DATABASE_URL to a disposable PostgreSQL database.");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 8 * 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  // actionTimeout: fail fast on a broken locator instead of burning the whole test timeout.
  use: { baseURL, actionTimeout: 30_000, trace: "retain-on-failure", screenshot: "only-on-failure", locale: "en-IN", timezoneId: "Asia/Kolkata" },
  // E2E_BROWSER_CHANNEL=msedge (or chrome) uses an installed browser instead
  // of Playwright's downloaded Chromium — handy on offline Windows PCs.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: process.env.E2E_BROWSER_CHANNEL || undefined } }],
  webServer: {
    command: `npx next start -H 127.0.0.1 -p ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: dbUrl,
      APP_BASE_URL: baseURL,
      SCHEDULER_MODE: "embedded",
      SCHEDULER_INTERVAL_MS: "1000",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
    },
  },
});
