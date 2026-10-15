/**
 * Logical backup / restore as JSON. Works identically against Neon and a
 * local PostgreSQL server (no pg_dump required on Windows), and is the
 * transport for pushing an offline centre's data to Neon (merge mode).
 *
 * Sessions are deliberately excluded: restoring never resurrects logins.
 */
import { getTableColumns, getTableName, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import * as s from "@db/schema";
import { getDb, type Queryable } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { now } from "@/lib/time/clock";
import { audit, authorize, type Actor } from "./audit-service";

/** Parent tables before children so inserts satisfy foreign keys. */
const TABLES: PgTable[] = [
  s.roles,
  s.users,
  s.examBatches,
  s.examCentres,
  s.candidates,
  s.workstations,
  s.students,
  s.examCategories,
  s.testSeries,
  s.exams,
  s.examSections,
  s.questions,
  s.questionOptions,
  s.examSectionQuestions,
  s.examSchedules,
  s.examAssignments,
  s.candidateAttempts,
  s.candidateAnswers,
  s.examPhotos,
  s.examViolations,
  s.submissions,
  s.results,
  s.studentEntitlements,
  s.practiceAttempts,
  s.practiceAnswers,
  s.practiceResults,
  s.bookmarks,
  s.testScheduleRequests,
  s.examEvents,
  s.auditLogs,
  s.applicationSettings,
];
const SERIAL_TABLES = ["exam_events", "audit_logs"];

export type BackupFile = {
  format: "cbt-backup";
  version: 1;
  createdAt: string;
  tables: Record<string, Record<string, unknown>[]>;
};

export async function createBackup(q: Queryable = getDb()): Promise<BackupFile> {
  const tables: BackupFile["tables"] = {};
  for (const t of TABLES) tables[getTableName(t)] = (await q.select().from(t)) as Record<string, unknown>[];
  return { format: "cbt-backup", version: 1, createdAt: new Date().toISOString(), tables };
}

export async function createBackupAudited(actor: Actor): Promise<BackupFile> {
  authorize(actor, "backup.manage");
  const backup = await createBackup();
  await audit(getDb(), actor, "backup.create", null, {
    rows: Object.values(backup.tables).reduce((n, r) => n + r.length, 0),
  });
  return backup;
}

/** JSON turns Dates into strings; turn timestamp columns back into Dates. */
function reviveRow(table: PgTable, row: Record<string, unknown>) {
  const cols = getTableColumns(table);
  const out: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(cols)) {
    if (!(key in row)) continue;
    const v = row[key];
    out[key] = col.columnType === "PgTimestamp" && typeof v === "string" ? new Date(v) : v;
  }
  return out;
}

function primaryKeyTarget(table: PgTable) {
  const cols = Object.values(getTableColumns(table)).filter((c) => c.primary);
  if (cols.length) return cols;
  // Composite primary key (exam_section_questions).
  if (table === s.examSectionQuestions) return [s.examSectionQuestions.sectionId, s.examSectionQuestions.questionId];
  if (table === s.bookmarks) return [s.bookmarks.studentId, s.bookmarks.questionId];
  throw new Error(`No primary key for ${getTableName(table)}`);
}

/**
 * mode "replace": wipe and load (disaster recovery into an empty/replacement DB).
 * mode "merge":   upsert by primary key (offline centre -> Neon sync). Local
 *                 rows win for the same key; audit/event rows that already
 *                 exist are kept as they are.
 */
export async function restoreBackup(backup: BackupFile, mode: "replace" | "merge"): Promise<{ rows: number }> {
  if (backup?.format !== "cbt-backup" || backup.version !== 1) {
    throw new AppError("VALIDATION", "Not a recognised backup file.");
  }
  let total = 0;
  await getDb().transaction(async (tx) => {
    if (mode === "replace") {
      const names = [...TABLES.map(getTableName), "sessions", "password_reset_tokens"].map((n) => `"${n}"`).join(", ");
      await tx.execute(sql.raw(`TRUNCATE ${names} CASCADE`));
    }
    for (const t of TABLES) {
      const name = getTableName(t);
      const rows = (backup.tables[name] ?? []).map((r) => reviveRow(t, r));
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const insert = tx.insert(t).values(chunk as never);
        if (mode === "replace") {
          await insert;
        } else if (SERIAL_TABLES.includes(name)) {
          await insert.onConflictDoNothing();
        } else {
          const cols = getTableColumns(t);
          const set = Object.fromEntries(
            Object.entries(cols)
              .filter(([, c]) => !c.primary)
              .map(([k, c]) => [k, sql.raw(`excluded."${c.name}"`)]),
          );
          await insert.onConflictDoUpdate({ target: primaryKeyTarget(t) as never, set: set as never });
        }
        total += chunk.length;
      }
    }
    for (const name of SERIAL_TABLES) {
      await tx.execute(
        sql.raw(`SELECT setval(pg_get_serial_sequence('${name}', 'id'), COALESCE((SELECT MAX(id) FROM "${name}"), 0) + 1, false)`),
      );
    }
  });
  return { rows: total };
}

export function backupFilename(at: Date = now()): string {
  return `cbt-backup-${at.toISOString().replace(/[:.]/g, "-")}.json`;
}
