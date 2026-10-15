/**
 * Restore a JSON backup into the database configured in DATABASE_URL.
 *   npm run restore -- <file> --replace --yes   (wipe, then load)
 *   npm run restore -- <file> --merge           (upsert by primary key)
 * Run `npm run db:migrate` on the target first. Stop the exam server while
 * restoring with --replace.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { closeDb, getDb } from "@/lib/db/client";
import { audit, SYSTEM_ACTOR } from "@/server/services/audit-service";
import { restoreBackup, type BackupFile } from "@/server/services/backup-service";

async function main() {
  const file = process.argv[2];
  const mode = process.argv.includes("--replace") ? "replace" : process.argv.includes("--merge") ? "merge" : null;
  if (!file || !mode) throw new Error("Usage: npm run restore -- <backup.json> (--replace --yes | --merge)");
  if (mode === "replace" && !process.argv.includes("--yes")) {
    throw new Error("--replace deletes ALL current data in the target database. Add --yes to confirm.");
  }
  const backup = JSON.parse(readFileSync(file, "utf8")) as BackupFile;
  const host = new URL(process.env.DATABASE_URL ?? "postgres://unset").host;
  console.log(`Restoring ${file} into ${host} (${mode}) ...`);
  const { rows } = await restoreBackup(backup, mode);
  await audit(getDb(), { ...SYSTEM_ACTOR, label: "cli" }, "backup.restore", null, { file, mode, rows });
  console.log(`Restored ${rows} rows.`);
}

main()
  .catch((err) => {
    console.error("Restore failed:", (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
