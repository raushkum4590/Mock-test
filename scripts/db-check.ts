/**
 * Read-only connectivity check: `npm run db:check`.
 * Prints server version, latency and the tables present. Changes nothing.
 */
import "dotenv/config";
import { Client } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (see .env.example).");
  const host = new URL(url).host;
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 15_000 });
  const t0 = Date.now();
  await client.connect();
  const connectMs = Date.now() - t0;
  const v = await client.query<{ version: string; db: string }>("select version(), current_database() as db");
  const t1 = Date.now();
  await client.query("select 1");
  const rtt = Date.now() - t1;
  const tables = await client.query<{ name: string }>(
    "select table_schema || '.' || table_name as name from information_schema.tables " +
      "where table_schema not in ('pg_catalog','information_schema') order by 1",
  );
  console.log(`host:      ${host}`);
  console.log(`server:    ${v.rows[0]!.version.split(",")[0]}`);
  console.log(`database:  ${v.rows[0]!.db}`);
  console.log(`connect:   ${connectMs} ms, query round trip: ${rtt} ms`);
  console.log(`tables:    ${tables.rows.length ? tables.rows.map((r) => r.name).join(", ") : "(none)"}`);
  await client.end();
}

main().catch((err) => {
  console.error("Database check failed:", (err as Error).message);
  process.exit(1);
});
