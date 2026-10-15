# Administrator manual

## Roles

| Role | Can do |
| --- | --- |
| Super Admin | Everything, including users, backups and the audit log |
| Exam Administrator | Exams, questions, candidates, schedules (create, publish, hold, end), monitoring, results |
| Invigilator | Live monitoring and emergency hold/resume |
| Result Viewer | View and export results |

Create users under **Users, audit & backup**. The first Super Admin is created on the server with `npm run admin:create`, or once via `/setup` if `SETUP_TOKEN` is set in `.env`.

## Preparing an exam

1. **Question bank:** add questions one at a time or import a CSV (`samples/questions-sample.csv`). Each question has English and/or Hindi text, 2–6 options with exactly one correct, subject/topic/difficulty, optional image, optional explanation, and optional mark overrides. Imports are all-or-nothing, with a row-by-row error report.
2. **Exam:** create it (code, type, bilingual title and instructions). Add **sections**, each with its own +/− marks, then attach questions from the bank. Nothing assumes an official pattern: you set the sections, question counts, marks and duration. Click **Mark READY**.
3. **Candidates:** add them, or import a CSV (`samples/candidates-sample.csv`). Blank passwords are generated and offered for download once. Use **batches** to group candidates, and **workstations** to register lab PCs.
4. **Schedule:** choose the exam, login-opening time, scheduled start, duration, late-entry window (minutes after start) and options (emergency hold allowed, require assigned workstation). All times are in the schedule's time zone (default Asia/Kolkata).
5. Assign candidates (*Assign all of batch* or individually) and optionally a workstation per candidate.
6. **Lock schedule**, then **Publish**. From this point the exam paper is locked against edits.

## On the day

- From *login opens*, candidates can log in, read the instructions and wait. The waiting screen counts down using server time.
- **At the scheduled start the server starts the exam automatically.** Every waiting screen opens the exam by itself. Nobody presses Start.
- **Live monitoring** shows each candidate's connection, workstation (assigned / actual), attempt status, answered and marked counts, and last activity, refreshed every 3 s.
- **Emergency hold** (for example after a power failure) freezes every candidate's clock and blocks answering. On **Resume**, the official end moves later by the length of the hold. A reason is required and is audited.
- **End exam now** submits everything immediately (reason required).
- **Late candidates** may start until the late-entry window closes and get only the remaining time. A candidate whose PC fails can log in on another PC and **resume** with their answers intact.
- **At the official end the server submits every attempt automatically** and computes results.

## Results

**Results → schedule** shows a ranked table with section-wise scores, CSV export, printing, and a per-candidate printable result sheet with question review. **Release scores to candidates** shows each candidate their score on the confirmation page. All results are labelled as mock examination results.

## Audit

Every administrative action, login (and failed login), export, backup and schedule transition is recorded. See *Users, audit & backup* and each schedule's *Event log*.
