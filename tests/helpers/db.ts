/**
 * Integration-test database: a real PostgreSQL engine (PGlite, compiled to
 * WASM) running in-process, migrated with the same SQL migrations used in
 * production. Each test file gets a fresh database.
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@db/schema";
import { setDb, type Db } from "@/lib/db/client";
import { setClock } from "@/lib/time/clock";
import { clearAllRateLimits } from "@/lib/security/rate-limit";
import { ensureRoles } from "@/server/services/auth-service";
import { clearPaperCache } from "@/server/services/attempt-service";

export type TestDb = { db: Db; close: () => Promise<void> };

export async function createTestDb(): Promise<TestDb> {
  const client = new PGlite();
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  const typed = db as unknown as Db;
  setDb(typed);
  await ensureRoles(typed);
  clearAllRateLimits();
  clearPaperCache();
  return {
    db: typed,
    close: async () => {
      setDb(null);
      setClock(null);
      await client.close();
    },
  };
}
