import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/time/zone";
import { listAttemptedExams, listPracticeAttemptsForAdmin } from "@/server/services/practice-service";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Mock test attempts" };

const duration = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

export default async function TestAttemptsPage({ searchParams }: { searchParams: Promise<{ exam?: string; who?: string }> }) {
  await requireAdminPage("students.manage");
  const { exam, who } = await searchParams;
  const whoFilter = who === "guest" || who === "registered" ? who : undefined;
  const examId = exam && /^[0-9a-f-]{36}$/i.test(exam) ? exam : undefined;
  const [rows, examList] = await Promise.all([listPracticeAttemptsForAdmin({ examId, who: whoFilter }), listAttemptedExams()]);
  return (
    <>
      <h1 className="text-xl font-semibold">Mock test attempts</h1>
      <Card title={`Attempts (${rows.length})`}>
        <form className="mb-3 flex flex-wrap gap-2 text-sm" method="get">
          <select name="exam" defaultValue={exam ?? ""} className="rounded border border-border px-2 py-1">
            <option value="">All tests</option>
            {examList.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.titleEn}
              </option>
            ))}
          </select>
          <select name="who" defaultValue={whoFilter ?? ""} className="rounded border border-border px-2 py-1">
            <option value="">Guests and students</option>
            <option value="guest">Guests only (name only)</option>
            <option value="registered">Registered students only</option>
          </select>
          <button className="rounded border border-border bg-surface px-3 py-1">Filter</button>
        </form>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Test</th>
              <th>Attempt</th>
              <th>Status</th>
              <th>Started</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Time taken</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No attempts yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.attemptId}>
                <td>
                  {r.fullName}
                  {!r.isGuest && <div className="text-xs text-muted">{r.email}</div>}
                </td>
                <td>{r.isGuest ? <Badge tone="WAITING">Guest</Badge> : <Badge tone="PUBLISHED">Student</Badge>}</td>
                <td>
                  {r.examTitle}
                  <div className="text-xs text-muted">{r.examCode}</div>
                </td>
                <td>#{r.attemptNumber}</td>
                <td>
                  <Badge>{r.status}</Badge>
                </td>
                <td>{formatDateTime(r.startedAt)}</td>
                <td>{r.finalScore != null ? `${r.finalScore} / ${r.maxScore}` : "—"}</td>
                <td>{r.correct != null ? `${r.correct} / ${r.totalQuestions} (${r.attempted} attempted)` : "—"}</td>
                <td>{r.timeTakenSeconds != null ? duration(r.timeTakenSeconds) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
