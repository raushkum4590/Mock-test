# EdQity — CBT Exam System + Practice Tests

A computer-based test (CBT) platform for running **SSC CGL, CHSL and JE style mock examinations** in Hindi and English. It is an original application: it reproduces the familiar competitive-exam workflow, not anyone's proprietary code or branding.

It serves two audiences from one codebase and one database:

- **Online mock-test platform** (public site + student accounts): browse SSC CGL / CHSL / JE tests, take self-paced timed mocks in the CBT interface, then see your score, explanations, analytics, history, bookmarks and leaderboards. Start at `/`. See [docs/online-platform.md](docs/online-platform.md).
- **Exam-centre system**: centre-issued roll numbers, server-scheduled sittings, a LAN Windows client. Start at `/login` and `/admin`.

- **Admin console** (Next.js): exams, a bilingual question bank, candidates and batches, workstations, schedules, live monitoring, results, audit log and backups.
- **Candidate interface**: login, instructions, a waiting room, the exam screen (question palette, mark for review, timer), and a submission confirmation. It runs in a browser or in the **Windows desktop client** (Electron, in `desktop/`).
- **Server-controlled exams**: the server starts each exam at the published time, enforces the deadline and auto-submits. There is no "Start" button for anyone to press.
- **Database**: PostgreSQL via Drizzle ORM. Use **Neon** for a connected centre (Profile A) or a **local PostgreSQL** for a strictly offline centre (Profile B).

> Results produced by this system are **mock examination results**, not official SSC results.

## Quick start (development)

Requirements: Node.js 22+, Windows/macOS/Linux. No Docker needed.

```powershell
npm install
copy .env.example .env          # then set DATABASE_URL and AUTH_SECRET

# Option 1 – Neon: put your Neon pooled connection string in DATABASE_URL.
# Option 2 – local PostgreSQL, no install required (keep this running):
npm run db:local                # uses LOCAL_PG_PASSWORD / LOCAL_PG_PORT from .env

npm run db:check                # read-only connectivity check
npm run db:migrate              # create/upgrade tables (refuses non-UTF-8 databases)
npm run db:seed                 # sample bilingual SSC CGL mock + 5 demo candidates
npm run admin:create -- --username admin --name "Centre Admin"   # prints a generated password once
npm run dev                     # http://localhost:3000  (scheduler runs inside the server)
```

- Public site / students: `http://localhost:3000/`. Sign up, then open **SSC CGL → SSC CGL Tier-I Mock Test 01** (`/tests/ssc-cgl-mock-01`).
- Admin console: `http://localhost:3000/admin/login`. Publish tests under **Exams → Online mock test**, and manage them under **Online catalogue** and **Students (online)**.
- Exam-centre candidate login: `http://localhost:3000/login` (demo credentials are in `seed-credentials.txt`)

**See the whole flow in about 5 minutes:** run `npm run db:seed -- --demo-schedule 3`. This publishes a 10-minute sitting that starts in 3 minutes for the demo candidates. Log in as one of them and wait on the waiting-room screen; the exam opens by itself at the start time and is submitted automatically when the time runs out. The result then appears under **Admin → Results**.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev server / production build / production server (listens on 0.0.0.0) |
| `npm run db:check` | Read-only database check (version, latency, tables) |
| `npm run db:generate` | Generate a new SQL migration after editing `drizzle/schema.ts` |
| `npm run db:migrate` | Apply migrations and synchronise the roles table |
| `npm run db:seed [-- --demo-schedule N]` | Sample exam, demo batch and candidates (idempotent) |
| `npm run db:local` | Run an embedded PostgreSQL 18 server in `./.pgdata` (Profile B and development) |
| `npm run admin:create -- --username U --name "N" [--role ROLE]` | Create an administrator from the console |
| `npm run scheduler` | Standalone scheduler process (use with `SCHEDULER_MODE=external`) |
| `npm run backup` / `npm run restore -- <file> --replace --yes \| --merge` | JSON backup and restore |
| `npm run sync:push` | Push an offline centre's database to Neon (`SYNC_TARGET_URL`) |
| `npm test` | Unit and integration tests (Vitest; in-process PostgreSQL via PGlite) |
| `npm run test:e2e` | Browser end-to-end test of the full flow (see below) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript strict mode |

### Running the tests

```powershell
npm test
```
This runs 63 tests: unit tests plus integration tests. The integration tests run a real PostgreSQL engine in-process (PGlite), use the production migrations, and drive time with a fake clock, so scheduling tests take milliseconds instead of hours.

End-to-end (real browser, production build, real PostgreSQL; takes about 3 minutes because it waits for a real scheduled start and a 1-minute exam):

```powershell
npm run db:local                                   # separate terminal, keep running
npm run build
$env:E2E_DATABASE_URL = "postgresql://cbt:<LOCAL_PG_PASSWORD>@127.0.0.1:5433/cbt"
$env:E2E_BROWSER_CHANNEL = "msedge"                # optional: use installed Edge instead of downloading Chromium
npm run test:e2e
```
Never point `E2E_DATABASE_URL` at a live exam database.

## Technology (pinned versions)

| Area | Choice |
| --- | --- |
| Web | Next.js 16.4.0 (App Router, Turbopack), React 19.3.0, TypeScript 5.9 (strict), Tailwind CSS 4 |
| Forms / validation | React Hook Form 7.89.0, @hookform/resolvers 5.9.1, Zod 4.6.5 (shared by client and server) |
| Database | PostgreSQL (Neon or local), Drizzle ORM 0.45.4, Drizzle Kit 0.31.11, node-postgres 8.23.1 |
| Auth | Server-side sessions (HMAC-hashed tokens in PostgreSQL), Argon2id via @node-rs/argon2 2.2.2 |
| Real-time | Server-Sent Events with automatic polling fallback |
| Desktop | Electron 44.7.0, electron-builder 26.15.3 (`desktop/`) |
| Tests | Vitest 5.0.3, PGlite 0.5.8, Playwright 1.64.0, embedded-postgres 18.4.0-beta.17 |

shadcn/ui was not used: the few primitives needed are in `src/components/ui`, which keeps the dependency surface small for offline installs.

## Documentation

- [docs/architecture.md](docs/architecture.md): components, state machine, scheduler, answer synchronisation, security model, known limits
- [docs/neon-setup.md](docs/neon-setup.md): setting up Neon (Profile A)
- [docs/network-setup.md](docs/network-setup.md): LAN server, firewall, Windows service, candidate PCs, kiosk mode
- [docs/offline-deployment.md](docs/offline-deployment.md): strictly offline centre (Profile B) and Neon sync
- [docs/backup-restore.md](docs/backup-restore.md)
- [docs/admin-manual.md](docs/admin-manual.md): day-of-exam runbook for administrators and invigilators
- [desktop/README.md](desktop/README.md): building and configuring the Windows candidate client

## Project layout

```
drizzle/            schema.ts + SQL migrations
src/app/            pages (admin, candidate, login, setup) and API route handlers (api/)
src/components/     admin/, candidate/, exam/ (CBT screen), ui/ (primitives)
src/lib/            db, auth, permissions, validation, exam-engine (state machine, policy,
                    answer sync), scoring, time, i18n, csv, security
src/server/         http.ts (route plumbing), services/ (all business logic + data access),
                    jobs/scheduler.ts
src/instrumentation.ts   starts the embedded scheduler with the server
scripts/            migrate, seed, local-postgres, scheduler, admin, backup/restore, sync
desktop/            Electron candidate client
tests/              unit/, integration/ (PGlite), e2e/ (Playwright)
samples/            example CSV files for import
```
