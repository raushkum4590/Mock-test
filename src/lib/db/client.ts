/**
 * Single place where the database driver is chosen.
 *
 * node-postgres (TCP, pooled) is used for every deployment profile:
 *  - Profile A: DATABASE_URL points at Neon's pooled endpoint.
 *  - Profile B: DATABASE_URL points at a local PostgreSQL server.
 * The exam server is a long-running process, which is the case Neon
 * recommends a regular TCP pool for (rather than the HTTP/WebSocket
 * serverless driver, which targets short-lived serverless functions).
 *
 * Tests inject an in-process PGlite database through `setDb`.
 * Never import this module from client components or the Electron renderer.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "@db/schema";

export type Schema = typeof schema;
export type Db = PgDatabase<PgQueryResultHKT, Schema>;
export type Tx = PgTransaction<PgQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
/** Anything that can run queries: the root database or an open transaction. */
export type Queryable = Db | Tx;

type DbHolder = { db: Db; pool?: Pool };

// Stored on globalThis so dev-mode hot reloads reuse one pool instead of
// leaking a new pool on every edit.
const g = globalThis as unknown as { __cbtDb?: DbHolder | null };

function createPoolDb(): DbHolder {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  // Neon closes idle connections; an unhandled 'error' on an idle client would
  // crash the process. Log and let the pool replace the client.
  pool.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });
  const db = drizzle({ client: pool, schema }) as unknown as Db;
  return { db, pool };
}

export function getDb(): Db {
  if (!g.__cbtDb) g.__cbtDb = createPoolDb();
  return g.__cbtDb.db;
}

/** Test hook: replace the database (e.g. with PGlite). Pass null to reset. */
export function setDb(db: Db | null): void {
  g.__cbtDb = db ? { db } : null;
}

export async function closeDb(): Promise<void> {
  const holder = g.__cbtDb;
  g.__cbtDb = null;
  await holder?.pool?.end();
}

export async function pingDb(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const started = Date.now();
  try {
    await getDb().execute(sql`select 1`);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, error: (err as Error).message };
  }
}
