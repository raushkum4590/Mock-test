# Architecture

## Components

```
 Candidate PCs (Electron client or browser)          Admin / invigilator PCs (browser)
        │  HTTP + SSE over LAN                                  │
        ▼                                                       ▼
 ┌──────────────────────── Exam server (one Windows PC) ─────────────────────────┐
 │ Next.js 16 (App Router)                                                        │
 │   pages ── src/app/admin, src/app/candidate, /login                            │
 │   API ──── src/app/api/*  →  src/server/http.ts (auth, CSRF origin, errors)    │
 │   services ─ src/server/services/* (all business rules + data access)          │
 │   scheduler ─ src/server/jobs/scheduler.ts (embedded via instrumentation.ts,   │
 │               or `npm run scheduler` as a separate process)                    │
 └───────────────────────────────┬────────────────────────────────────────────────┘
                                 │ node-postgres pool (TCP)
               ┌─────────────────┴──────────────────┐
         Profile A: Neon (internet)        Profile B: local PostgreSQL (offline)
```

- **Only `src/server/**` and `scripts/` touch the database.** Pages call services; client components call the JSON API. The driver is chosen in one file (`src/lib/db/client.ts`), so Neon and a local PostgreSQL are interchangeable with no code changes, only a different `DATABASE_URL`.
- **Drizzle schema:** `drizzle/schema.ts`. Migrations are under `drizzle/migrations`. All timestamps are `timestamptz` in UTC and are converted to the exam time zone (default `Asia/Kolkata`) only for display and form input.
- **Why node-postgres and not the Neon serverless driver?** The exam server is a long-running process, which is the case Neon recommends a pooled TCP connection for. The same driver works unchanged against a local PostgreSQL, which Profile B needs.
- **Why Cache Components is off:** every page is per-user and request-time. Cache Components would also keep hidden routes mounted (for example, a running exam screen with live timers), so it is disabled in `next.config.ts`.

## Exam schedule state machine

`src/lib/exam-engine/state-machine.ts` is pure and unit-tested.

```
DRAFT ─schedule→ SCHEDULED ─publish→ PUBLISHED ─(login_opens_at)→ WAITING ─(start_at)→ RUNNING ─(end_at)→ COMPLETED
  ↑                │  ↑                  │                                   │   ↑
  └───unschedule───┘  └────unpublish─────┘                         pause ↓   │ resume
                                                                            PAUSED ──end→ COMPLETED
any non-terminal state ─cancel→ CANCELLED          PUBLISHED/WAITING ─(window entirely missed)→ COMPLETED
```

- Transitions in brackets are applied **only by the server**. No admin action can start an exam (the only admin action that moves to RUNNING is RESUME from a pause).
- Admin actions are limited by role (`ADMIN_ACTION_RULES`). PAUSE, END, and CANCEL of a live exam require a reason, which is written to the audit log and the event log.
- **Pausing** records `paused_at`. **Resuming** extends `end_at` by the paused duration, so the remaining time is frozen during a hold. A PAUSED schedule never auto-completes.

## Durable scheduler

There is no in-memory timer that the system depends on. The schedule rows themselves are the persisted job queue.

- `runSchedulerTick(now)` selects every schedule whose next transition is due (`PUBLISHED & login_opens_at ≤ now`, `WAITING & start_at ≤ now`, `RUNNING & end_at ≤ now`) and applies it.
- Each transition is a **compare-and-set** inside a transaction: `UPDATE … SET status=:to WHERE id=:id AND status=:from RETURNING *`. Concurrent workers (the embedded scheduler, an external scheduler, and candidate requests) can never apply a transition twice. This is tested with 10 parallel workers.
- `reconcileSchedule` also runs on **every candidate request**, so a late or stopped scheduler loop cannot let anyone in early or past the deadline.
- **Restart recovery:** the loop runs a tick immediately on start. Overdue transitions are applied in order and recorded with `overdue: true` and `lagSeconds`.
  - Missed start policy: the exam starts as soon as the server is back, but the **official end time is unchanged**.
  - If the whole window was missed, the schedule goes PUBLISHED/WAITING → COMPLETED with reason `MISSED_WINDOW`; reschedule it as a new sitting.
- **Auto-submit:** when a schedule completes, every open attempt is finalised. Deadline submissions are stamped at the official `end_at`, even if processed later. A recovery pass finalises any attempt left open by a crash between "schedule completed" and "attempt submitted".
- **Heartbeat:** written to `application_settings` every 10 s and shown on the admin dashboard and at `/api/health`.

Supervision in production: run the Next.js server as a Windows service (see network-setup.md). With `SCHEDULER_MODE=embedded` (the default) that one service is everything. For extra resilience, also run `npm run scheduler` as a second service; running both at once is safe.

## Candidate timing policy (fixed window)

`src/lib/exam-engine/policy.ts`:

- Everyone shares the official window `[start_at, end_at)`. A late or reconnecting candidate gets **only the remaining time**.
- A **new** attempt may start until `start_at + late_entry_seconds` (default 15 minutes; configurable per schedule).
- An existing, unsubmitted attempt may **resume** at any time before `end_at`, including from a different PC after a hardware failure. A new login ends the old session.
- The client countdown is derived from the server's `end_at` and the measured server-clock offset. The server rejects any write at or after `end_at`.

## Answer persistence and synchronisation

The client engine is `src/lib/exam-engine/answer-sync.ts` (unit-tested); the server side is `saveAnswers` in `attempt-service.ts`.

- **Autosave:** every change (select, clear, mark) bumps a per-question **revision** and is queued. Rapid changes to the same question coalesce into one request. "Save & Next" flushes the queue immediately.
- **Server acceptance:** the server applies a change only if its revision is **greater** than the stored one (`ON CONFLICT … DO UPDATE … WHERE revision < excluded.revision`).
  - A retry of a change the server already applied (same revision and idempotency key) is acknowledged as `DUPLICATE`.
  - Any older change is `STALE`, and the server's state is returned for the client to adopt.
- The UI shows **"Saved" only after the server acknowledges that exact revision**.
- **Network failure:** changes stay queued and retry with exponential backoff, reusing the same idempotency key. The queue is mirrored to `sessionStorage` so a renderer crash or reload does not lose it. `sessionStorage` is never authoritative: on reload, the server state wins unless the stored change is newer.
- **Reconciliation:** every 30 s the client fetches the server's answers and adopts newer revisions for questions with no pending change.
- **Submission vs. in-flight saves:** a save holds `FOR SHARE` on the attempt row, and submission takes the row lock with its compare-and-set. An answer therefore either lands before the submission snapshot or is rejected; it can never be silently lost.
- **If the server or database is unreachable until the deadline:** answers acknowledged before the deadline are counted. Answers still unacknowledged at the deadline are **not** accepted afterwards, because accepting late writes would defeat deadline enforcement. The candidate sees an unsaved counter, and the invigilator sees missing activity in monitoring. If the outage is centre-wide, the invigilator should use **Emergency hold** before the deadline, which freezes the clock and extends `end_at` when resumed. In Profile A, a lost internet connection to Neon is this case; see offline-deployment.md for running Profile B instead.

## Scoring

`src/lib/scoring/score.ts`:

- Final score = Σ positive − Σ negative, computed in integer hundredths, so 3 × 0.33 is exactly 0.99.
- Marks come from the section (`marks_correct` / `marks_wrong`), with optional per-question overrides.
- Unanswered questions score 0. "Answered & marked for review" counts as answered.
- The result stores totals, section-wise scores, max score and time taken. Ranking uses standard competition ranking (1, 2, 2, 4).
- Scores are hidden from candidates until an admin releases them. Answer keys and explanations are never sent to the candidate during the exam; the paper query does not even select those columns.

## Security model

| Concern | Implementation |
| --- | --- |
| Passwords | Argon2id (19 MiB, t=2). Constant-time behaviour for unknown accounts (verifies against a dummy hash). |
| Sessions | 256-bit random token in an HttpOnly, SameSite=Lax cookie. The DB stores HMAC-SHA256(token, AUTH_SECRET). Admins: 8 h absolute, 60 min idle. Candidates: 12 h. One active session per candidate. Revocation is immediate. |
| Authorization | Checked in route handlers **and again inside services** (`authorize()`). Permissions are defined in code (`src/lib/permissions`), not in the editable roles table. |
| ID substitution | Every candidate query is scoped by the authenticated candidate ID. Foreign IDs return NOT_FOUND. Tested. |
| CSRF | SameSite cookies plus an Origin check on every state-changing request (`ALLOWED_ORIGINS` for extra origins). |
| Rate limits | Login: 8 per 5 min per IP+identity, 60 per 5 min per IP. Candidate API: 240/min per session. In-memory, which suits a single LAN server; move to the DB or Redis for multi-instance setups. |
| Input | Zod on every request. Parameterised SQL through Drizzle only (raw SQL is used solely for fixed statements). CSV export neutralises formula injection. |
| Headers | CSP (`default-src 'self'`; `frame-ancestors 'none'`; `connect-src 'self'`; no external origins), nosniff, `X-Frame-Options: DENY`, `Referrer-Policy`. Scripts allow `'unsafe-inline'` for Next.js bootstrap code. A nonce-based CSP via `proxy.ts` is the next hardening step. |
| Secrets | Database URL and AUTH_SECRET exist only on the server. The Electron client and browser never receive them. |
| Electron | contextIsolation, sandbox, no nodeIntegration, navigation locked to the server origin, no new windows/webviews/downloads, all permissions denied, optional kiosk. |
| Audit | `audit_logs` (admin and auth actions, exports, backups) and `exam_events` (every state transition, attempt start/resume/submit, failures). |

**Limits, stated plainly:** no software can fully prevent cheating. Kiosk mode and Windows Assigned Access reduce, but do not eliminate, the ability to leave the exam window. The workstation header can be spoofed by someone with admin rights on the PC. Physical invigilation is still required.

## Bilingual support

- UI strings are in `src/lib/i18n/dictionary.ts`. The `hi` dictionary is type-checked to cover every key.
- Questions, options, section titles and instructions have separate `*_en` / `*_hi` columns with fallback to the other language, plus a visible notice when a translation is missing.
- Switching language changes only display: answers are keyed by question/option IDs. Tested end to end.
- Fonts use system stacks: Segoe UI and Nirmala UI on Windows, Noto when installed. Builds and exam PCs therefore need no internet access for fonts.
- Mathematical content: Unicode (², √, π, ÷, ₹) renders directly, and whitespace and line breaks are preserved. Diagrams and complex tables go in as images (`image_url`). A math typesetting renderer is not included yet.

## Known gaps / next phases

- Desktop installer: the code is written and compiles, but packaging was not completed on the development machine because the disk was full. See desktop/README.md.
- Admin console text is English-only. The candidate interface is fully bilingual.
- Photo upload is a URL field (no file storage service yet).
- Optional post-exam answer review for candidates: the data model and admin sheet exist, but there is no candidate-facing review page yet.
- Rate limiting and the paper cache are per process (fine for one exam server).
