/**
 * Profile B -> Neon synchronisation (one-way push, run when internet is back):
 *   SYNC_TARGET_URL=<neon url> npm run sync:push
 *
 * Reads everything from DATABASE_URL (the local centre database) and upserts
 * it into SYNC_TARGET_URL by primary key. The local centre is authoritative
 * for its own exams: for the same key, local values overwrite Neon values.
 * Audit/event rows that already exist in the target are left untouched.
 * Push each centre to its own Neon database or branch (docs/offline-deployment.md).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "@db/schema";
import { closeDb, setDb, type Db } from "@/lib/db/client";
import { createBackup, restoreBackup } from "@/server/services/backup-service";

async function main() {
  const target = process.env.SYNC_TARGET_URL;
  if (!target) throw new Error("Set SYNC_TARGET_URL to the Neon connection string.");
  if (target === process.env.DATABASE_URL) throw new Error("Source and target are the same database.");

  console.log("Reading local database ...");
  const snapshot = await createBackup();
  await closeDb();

  const pool = new Pool({ connectionString: target, max: 2 });
  const remote = drizzle({ client: pool, schema });
  console.log(`Migrating target ${new URL(target).host} ...`);
  await migrate(remote, { migrationsFolder: "drizzle/migrations" });
  setDb(remote as unknown as Db);
  const { rows } = await restoreBackup(snapshot, "merge");
  console.log(`Pushed ${rows} rows to Neon.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Sync failed:", (err as Error).message);
  process.exit(1);
});
