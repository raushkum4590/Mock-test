import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { hasPermission } from "@/lib/permissions";
import { formatDateTime, formatDuration } from "@/lib/time/zone";
import { listScheduleResults } from "@/server/services/results-service";
import { ActionButton } from "@/components/admin/action-button";
import { PrintButton } from "@/components/admin/print-button";
import { Alert, Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Results" };

export default async function ScheduleResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage("results.view");
  const { id } = await params;
  let data;
  try {
    data = await listScheduleResults(id);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  const { schedule: s, rows, examTitle, examCode } = data;
  const sectionCodes = [...new Set(rows.flatMap((r) => r.result?.sectionScores.map((x) => x.code) ?? []))];
  const scored = rows.filter((r) => r.result);
  const avg = scored.length ? scored.reduce((n, r) => n + r.result!.finalScore, 0) / scored.length : 0;
  return (
    <>
      <div className="no-print">
        <Link href="/admin/results" className="text-sm text-primary underline">
          ← Results
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">
            {examTitle} — {s.title} <Badge>{s.status}</Badge>
          </h1>
          <p className="text-sm text-muted">
            {examCode} · {formatDateTime(s.startAt, s.timeZone)} · {scored.length} scored of {rows.length} assigned · average {avg.toFixed(2)}
          </p>
          <p className="text-xs font-semibold text-warning">Mock examination results — not official SSC results.</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {hasPermission(admin.role, "results.export") && (
            <a className="rounded-md border border-border bg-surface px-3 py-1 text-sm" href={`/api/results/export?scheduleId=${s.id}`}>
              Export CSV
            </a>
          )}
          <PrintButton />
          {hasPermission(admin.role, "schedules.publish") && s.status === "COMPLETED" && (
            <ActionButton url="/api/results/release" body={{ scheduleId: s.id, published: !s.resultsPublished }} variant={s.resultsPublished ? "secondary" : "success"}>
              {s.resultsPublished ? "Hide scores from candidates" : "Release scores to candidates"}
            </ActionButton>
          )}
        </div>
      </div>
      <Card title="Ranked results">
        <Table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Roll number</th>
              <th>Name</th>
              <th>Status</th>
              <th>Attempted</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>+ Marks</th>
              <th>− Marks</th>
              <th>Score</th>
              {sectionCodes.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th>Time</th>
              <th className="no-print" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.candidateId}>
                <td>{r.rank ?? "—"}</td>
                <td className="font-mono">{r.rollNumber}</td>
                <td>{r.fullName}</td>
                <td>
                  {r.attemptStatus ? <Badge>{r.attemptStatus}</Badge> : <span className="text-muted">ABSENT</span>}
                  {r.submitReason && <div className="text-xs text-muted">{r.submitReason}</div>}
                </td>
                <td>{r.result ? `${r.result.attempted}/${r.result.totalQuestions}` : "—"}</td>
                <td>{r.result?.correct ?? "—"}</td>
                <td>{r.result?.incorrect ?? "—"}</td>
                <td>{r.result?.positiveMarks ?? "—"}</td>
                <td>{r.result?.negativeMarks ?? "—"}</td>
                <td className="font-semibold">{r.result ? `${r.result.finalScore} / ${r.result.maxScore}` : "—"}</td>
                {sectionCodes.map((c) => (
                  <td key={c}>{r.result?.sectionScores.find((x) => x.code === c)?.score ?? "—"}</td>
                ))}
                <td>{r.result ? formatDuration(r.result.timeTakenSeconds) : "—"}</td>
                <td className="no-print">
                  {r.result && (
                    <Link className="text-primary underline" href={`/admin/results/${s.id}/${r.candidateId}`}>
                      Sheet
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
