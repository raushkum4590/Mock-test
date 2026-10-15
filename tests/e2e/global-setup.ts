/**
 * Migrates the disposable E2E database and creates a fresh Super Admin whose
 * credentials are handed to the tests through a temp file.
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../../drizzle/schema";
import { hashPassword } from "../../src/lib/auth/password";
import { ROLES, ROLE_CODES } from "../../src/lib/permissions";

export const CREDS_FILE = join(tmpdir(), "cbt-e2e-admin.json");

export default async function globalSetup() {
  const pool = new Pool({ connectionString: process.env.E2E_DATABASE_URL, max: 2 });
  const db = drizzle({ client: pool, schema });
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  for (const code of ROLE_CODES) {
    await db
      .insert(schema.roles)
      .values({ code, name: ROLES[code].name, permissions: [...ROLES[code].permissions] })
      .onConflictDoNothing();
  }
  const username = `e2e_${Date.now()}`;
  const password = randomBytes(12).toString("base64url");
  await db.insert(schema.users).values({ username, fullName: "E2E Admin", passwordHash: await hashPassword(password), roleCode: "SUPER_ADMIN" });
  writeFileSync(CREDS_FILE, JSON.stringify({ username, password }));
  await pool.end();
}
