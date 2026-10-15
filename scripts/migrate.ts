/** Apply SQL migrations and sync the roles table: `npm run db:migrate`. */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { closeDb, getDb } from "@/lib/db/client";
import { ensureRoles } from "@/server/services/auth-service";

async function main() {
  const host = new URL(process.env.DATABASE_URL ?? "postgres://unset").host;
  console.log(`Migrating ${host} ...`);
  // Hindi content requires a UTF-8 database (a Windows-initialised cluster
  // can silently default to WIN1252).
  const enc = (await getDb().execute(sql`show server_encoding`)) as unknown as { rows: { server_encoding?: string }[] };
  const encoding = enc.rows[0]?.server_encoding;
  if (encoding !== "UTF8") {
    throw new Error(`Database encoding is ${encoding}; it must be UTF8. Re-create the database with ENCODING 'UTF8'.`);
  }
  await migrate(getDb() as unknown as NodePgDatabase, { migrationsFolder: "drizzle/migrations" });
  await ensureRoles();
  console.log("Migrations applied; roles synchronised.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
