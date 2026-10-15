# Strictly offline centre (Profile B)

Neon is a cloud database: it does **not** work without internet access. A centre that must keep running through a complete internet outage uses a **local PostgreSQL** on the exam server instead. The schema, migrations and application code are identical; only `DATABASE_URL` differs. The application never switches databases on its own.

## Option 1 – embedded PostgreSQL (no installation)

```powershell
# .env
LOCAL_PG_PASSWORD=<strong random password>
LOCAL_PG_PORT=5433
DATABASE_URL=postgresql://cbt:<same password>@127.0.0.1:5433/cbt

npm run db:local      # starts PostgreSQL 18 from node_modules, data in .\.pgdata
npm run db:migrate
```

- `db:local` initialises the cluster as **UTF-8** (Windows would otherwise default to WIN1252, which cannot store Hindi), listens on 127.0.0.1 only, and uses SCRAM authentication.
- `db:migrate` refuses to run against a non-UTF-8 database.
- Run it as a Windows service (NSSM) that starts before the CBT server service: `nssm install CBTDatabase node.exe D:\cbt\node_modules\tsx\dist\cli.mjs scripts\local-postgres.ts`.

**Tested:** the full end-to-end browser test (automatic start → answers → auto-submit → result) was run against this embedded PostgreSQL 18 with no internet dependency at runtime.

## Option 2 – regular PostgreSQL install

Install PostgreSQL 16+ for Windows, then create the role and a UTF-8 database:

```sql
CREATE ROLE cbt LOGIN PASSWORD '…';
CREATE DATABASE cbt OWNER cbt ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C';
```

Point `DATABASE_URL` at it and run `npm run db:migrate`.

## Getting exams in, and results out

- **Before the exam (online):** prepare exams, candidates and schedules in either database. To move them to the offline centre, run `npm run backup` on the source, copy the file, then on the centre run `npm run restore -- <file> --merge`.
- **After the exam, when internet is available:** push the centre's data to Neon:
  ```powershell
  $env:SYNC_TARGET_URL = "<Neon connection string>"
  npm run sync:push
  ```

## Synchronisation and conflict resolution

`sync:push` is a **one-way upsert by primary key** from the local centre database to Neon:

- All keys are UUIDs (or per-table sequences for logs), so rows created at different sites do not collide.
- **The local centre is authoritative for its own exams.** For the same primary key, local values overwrite Neon's (attempts, answers, submissions and results produced at the centre are final).
- `audit_logs` and `exam_events` use local sequence IDs. Rows whose ID already exists in the target are **kept unchanged** (`ON CONFLICT DO NOTHING`). To avoid ID overlap between centres, **give each centre its own Neon database or branch** and consolidate reports from there.
- Sessions are never synchronised.
- Re-running the push is idempotent (tested).
- There is no two-way sync. Do not edit the same exam in Neon while a centre runs it offline; make the centre's database the single place of truth for that sitting.
