import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@db": fileURLToPath(new URL("./drizzle", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    pool: "forks",
    env: {
      AUTH_SECRET: "test-secret-test-secret-test-secret-0123456789",
      EXAM_TIME_ZONE: "Asia/Kolkata",
    },
  },
});
