/**
 * Run a real PostgreSQL server locally without installing anything:
 *   npm run db:local
 * Uses the `embedded-postgres` binaries (Windows x64 included). Data lives in
 * ./.pgdata and persists between runs. This is the database for Profile B
 * (strictly offline centre) and for development without Neon.
 *
 * DATABASE_URL for it: postgresql://cbt:<LOCAL_PG_PASSWORD>@127.0.0.1:<LOCAL_PG_PORT>/cbt
 */
import "dotenv/config";
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const password = process.env.LOCAL_PG_PASSWORD;
  if (!password || password === "change-me") throw new Error("Set LOCAL_PG_PASSWORD in .env first.");
  const port = Number(process.env.LOCAL_PG_PORT ?? 5433);
  const dataDir = resolve(process.env.LOCAL_PG_DATA ?? ".pgdata");
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "cbt",
    password,
    port,
    persistent: true,
    // UTF-8 is mandatory: Windows would otherwise default to WIN1252, which
    // cannot store Devanagari (Hindi) text.
    initdbFlags: ["--encoding=UTF8", "--locale=C", "--auth=scram-sha-256"],
    // Listen on loopback only; the exam server is the only client.
    postgresFlags: ["-c", "listen_addresses=127.0.0.1", "-c", "timezone=UTC"],
  });
  const fresh = !existsSync(resolve(dataDir, "PG_VERSION"));
  if (fresh) {
    console.log(`Initialising new cluster in ${dataDir} ...`);
    await pg.initialise();
  }
  await pg.start();
  if (fresh) await pg.createDatabase("cbt");
  console.log(`PostgreSQL running on 127.0.0.1:${port} (database "cbt", user "cbt"). Ctrl+C to stop.`);

  const stop = async () => {
    console.log("Stopping PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());
  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error("Failed to start local PostgreSQL:", (err as Error).message);
  process.exit(1);
});
