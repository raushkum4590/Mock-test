# Online mock-test platform (students)

The same application serves two audiences on one database:

| | Exam centre (existing) | Online platform (this document) |
| --- | --- | --- |
| Users | Candidates with centre-issued roll numbers | Self-registered students (email + password) |
| Timing | Mode A: fixed window, server starts/ends the sitting | Mode B: self-paced, each attempt has its own server deadline |
| Entry | `/login` (Electron client) | `/` public site → `/student` |
| Paper | `exams` + sections + question bank (shared) | same `exams`, published online |

The question bank, papers, marking rules, scoring, CBT screen, answer-sync engine and durable scheduler are shared. Only the attempt lifecycle differs.

## Publishing a test online

1. Build the paper as usual (Exams → sections → attach questions) and click **Mark READY**.
2. On the exam page, under **Online mock test (students)**, configure the following and save:
   - **Publish online** and a **URL slug** (`/tests/<slug>`)
   - category and test series
   - type (full / sectional / topic / PYQ-style / quiz)
   - free or premium access
   - timed or untimed
   - attempts allowed (0 = unlimited)
   - result release: immediately, or at a fixed time
3. Students see the test only while it is **published online AND READY**. While it is published, or while any attempt is in progress, the paper is locked; unpublish it to edit.

Categories and test series are managed under **Admin → Online catalogue**. The seed creates SSC CGL, SSC CHSL and SSC JE categories. Nothing about an official pattern is hard-coded: sections, question counts, marks, negative marks and duration are all set per test.

## Attempt rules (defaults)

| Rule | Behaviour |
| --- | --- |
| Start | The student confirms the instructions; the server creates the attempt and fixes `deadline_at = started_at + duration`. No admin approval is needed. |
| One active attempt | A unique partial index allows at most one `IN_PROGRESS` attempt per student per test. Concurrent "start" clicks converge on that one attempt (tested). |
| Interruptions | Refresh, closed tab or lost network: the student resumes the same attempt with the saved answers and the **remaining** time. The clock keeps running while they are away. |
| Answers | Same revision-checked autosave as the exam centre: an answer shows "Saved" only after the server acknowledges it; failed saves are retried with idempotency keys; the server rejects writes at or after the deadline. |
| Deadline | The durable scheduler (and any request touching the attempt) auto-submits at the deadline, stamped with the official deadline time. This works even if the browser is closed. |
| Submission | Compare-and-set: one submission and one result per attempt, however many times "Submit" is pressed (tested). |
| Retakes | Allowed until `max_attempts` submitted attempts (0 = unlimited). Each retake is a new attempt with its own number. |
| Untimed tests | No deadline; the student submits when ready. |

## Results and solutions

- **Immediate:** score, section-wise and topic-wise breakdown, the student's answer vs the correct answer, and bilingual explanations for every question.
- **At a fixed time:** before the release time the student sees only "submitted" plus the answered count. Scores, answers and explanations stay on the server and are excluded from analytics and leaderboards until then (tested).
- **Accuracy** = correct ÷ attempted. **Score** = positive − negative marks (exact arithmetic in hundredths).
- Answer keys and explanations are never sent during an attempt (tested).

## Leaderboards

- **Cohort:** each student's **first** attempt at the test. Retakes are excluded because repeat attempts at the same paper are not comparable.
- **Order:** final score (high → low), then time taken (low → high). Students equal on both share a rank (1, 2, 2, 4).
- **Percentile** = (cohort − rank) ÷ (cohort − 1) × 100, shown only when the cohort has more than one student.
- **Privacy:** only display names are shown. Students can opt out in their profile; they then appear as "Anonymous" but still count in the cohort. Emails are never shown.
- Labelled as a **mock ranking, not an official rank**. For self-paced tests the cohort is whoever has attempted so far, so ranks shift as more students attempt.

## Analytics (student dashboard)

Computed only from the student's stored, **released** results:

| Metric | Definition |
| --- | --- |
| Tests attempted | Submitted attempts with released results |
| Average score | Mean of (marks obtained ÷ maximum marks) |
| Best score | Highest percentage score |
| Accuracy | Σ correct ÷ Σ attempted |
| Trend chart | Score % and accuracy % per attempt, oldest first (one axis, both percentages) |
| Section-wise | Accuracy per section title across attempts |
| Topic-wise | Accuracy per question topic (falls back to subject) |
| Weak topics | ≥ 2 questions attempted in the topic and < 60 % accuracy |
| Recommended | Published tests not yet attempted, preferring those whose sections cover weak subjects |

Also on the dashboard: **Practise your mistakes** (incorrectly answered questions with solutions) and **Bookmarks**.

## Access model (free / premium)

- Tests and series are FREE or PREMIUM. Premium requires an **entitlement** (per test or per series, optional expiry). It is checked on the server whenever an attempt starts (tested).
- **Payments are not integrated and are disabled.** Admins grant access under **Admin → Students (online)**. To add a payment provider later, create entitlements only from a server-side handler that verifies the provider's webhook signature and confirms the payment through its official API. Never trust a client redirect.

## Accounts and password reset

- Passwords use Argon2id. Sessions last 14 days, are revocable, and live in an HttpOnly cookie (`cbt_student`) separate from admin and candidate cookies.
- Registration is limited to 10 per hour per IP; logins to 8 per 5 minutes per IP+email.
- **Password reset:** single-use tokens valid for 30 minutes; only their HMAC is stored. A successful reset ends all of the student's sessions. The response is identical whether or not the email exists.
  - **No email provider is configured,** so reset links are written to the server log (`[password-reset] link for …`). Admins can also generate a link under **Students (online) → Reset link**.
  - Before public launch, connect an SMTP or transactional-email provider in `requestPasswordReset` (`src/server/services/student-auth-service.ts`).

## Bilingual UI

Public pages and the student area render in English or Hindi from the student's saved preference, or a cookie for visitors; use the EN/हिं switch in the header. Strings live in `src/lib/i18n/site.ts` (the Hindi map is type-checked to be complete). The exam screen uses the existing dictionary, and switching language never changes answers.

## Deployment notes

- The online platform needs the **long-running Node server** (`npm run build && npm start`, or a VM/container host). Auto-submit relies on the scheduler loop, and Server-Sent Events need a persistent process. Serverless hosting would need an external cron calling a tick endpoint; that is not provided.
- Recommended setup: Neon in the region closest to your students (for India, `ap-south-1` Mumbai), with the app server in the same region.
- `NEXT_PUBLIC_BRAND_NAME` sets the brand (default "EdQity").

## Not yet implemented

- Email delivery (see above)
- Payment integration (intentionally disabled)
- Scheduled **live** online tests for students (Mode A exists for exam-centre candidates; extending it to students is the next step)
- Question versioning and duplicate detection in the bank
- Practice mode with instant per-question feedback
- shadcn/ui: not used; the project's own primitives in `src/components/ui` are used instead
