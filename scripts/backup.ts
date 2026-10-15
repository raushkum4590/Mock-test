/**
 * Write a JSON backup of the database configured in DATABASE_URL:
 *   npm run backup [-- --out backups/]
 * The file contains password hashes and answer keys: store it securely.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { closeDb, getDb } from "@/lib/db/client";
import { audit, SYSTEM_ACTOR } from "@/server/services/audit-service";
import { backupFilename, createBackup } from "@/server/services/backup-service";

async function main() {
  const i = process.argv.indexOf("--out");
  const dir = resolve(i >= 0 ? process.argv[i + 1]! : "backups");
  mkdirSync(dir, { recursive: true });
  const backup = await createBackup();
  const file = join(dir, backupFilename());
  writeFileSync(file, JSON.stringify(backup));
  const rows = Object.values(backup.tables).reduce((n, r) => n + r.length, 0);
  await audit(getDb(), { ...SYSTEM_ACTOR, label: "cli" }, "backup.create", null, { file, rows });
  console.log(`Backup written: ${file} (${rows} rows)`);
}

main()
  .catch((err) => {
    console.error("Backup failed:", err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
