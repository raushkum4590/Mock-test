# Backup and restore

Backups are logical JSON exports of every table except `sessions`. They work the same against Neon and a local PostgreSQL, and need no `pg_dump` on Windows.

| Action | How |
| --- | --- |
| Backup to `backups/` | `npm run backup` (or `npm run backup -- --out E:\cbt-backups`) |
| Download from the browser | Admin → Users, audit & backup → *Download a full JSON backup* (Super Admin only, audited) |
| Restore into an empty or replacement DB | `npm run db:migrate` then `npm run restore -- <file> --replace --yes` |
| Merge into an existing DB | `npm run restore -- <file> --merge` (upsert by primary key) |

- **Backup files contain password hashes and answer keys.** Store them encrypted (for example on a BitLocker drive) and restrict access.
- `--replace` truncates every table first. Stop the exam server while doing it. The command requires `--yes`.
- Restores never bring back login sessions; users simply log in again.
- Suggested schedule on exam days: back up before publishing, right after each sitting completes, and daily. Example Windows Task Scheduler action: `cmd /c cd /d D:\cbt && npm run backup -- --out E:\cbt-backups`.
- For Neon, also rely on its point-in-time restore.
- **Tested:** an automated test backs up a database containing a completed attempt with its result, restores it into a fresh database, and checks every table's row count, the result, the options and that candidate logins still work. It also checks that merge restores are idempotent.
