import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { formatDateTime, formatDuration } from "@/lib/time/zone";
import { getResultSheet } from "@/server/services/results-service";
import { PrintButton } from "@/components/admin/print-button";
import { Alert, Table } from "@/components/ui";

export const metadata = { title: "Result sheet" };

export default async function ResultSheetPage({ params }: { params: Promise<{ id: string; candidateId: string }> }) {
  await requireAdminPage("results.view");
  const { id, candidateId } = await params;
  let sheet;
  try {
    sheet = await getResultSheet(id, candidateId);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  const { candidate, result, attempt, schedule, exam, review } = sheet;
  const tz = schedule.timeZone;
  return (
    <article className="mx-auto max-w-4xl space-y-4 bg-surface p-6 print:p-0">
      <div className="no-print flex justify-between">
        <Link href={`/admin/results/${id}`} className="text-sm text-primary underline">
          ← Results
        </Link>
        <PrintButton />
      </div>
      <header className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold">{exam.titleEn}</h1>
        {exam.titleHi && <p lang="hi">{exam.titleHi}</p>}
        <p className="text-xs font-semibold">MOCK EXAMINATION RESULT — NOT AN OFFICIAL SSC RESULT</p>
      </header>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted">Candidate</dt>
        <dd>
          {candidate.fullName} (<span className="font-mono">{candidate.rollNumber}</span>)
        </dd>
        <dt className="text-muted">Sitting</dt>
        <dd>{schedule.title}</dd>
        <dt className="text-muted">Started</dt>
        <dd>{formatDateTime(attempt.startedAt, tz)}</dd>
        <dt className="text-muted">Submitted</dt>
        <dd>
          {formatDateTime(attempt.submittedAt, tz)} ({attempt.submitReason})
        </dd>
        <dt className="text-muted">Time taken</dt>
        <dd>{formatDuration(result.timeTakenSeconds)}</dd>
        <dt className="text-muted">Score</dt>
        <dd className="font-semibold">
          {result.finalScore} / {result.maxScore} (+{result.positiveMarks} − {result.negativeMarks})
        </dd>
        <dt className="text-muted">Attempted / correct / wrong</dt>
        <dd>
          {result.attempted} / {result.correct} / {result.incorrect} of {result.totalQuestions}
        </dd>
      </dl>
      <Table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Questions</th>
            <th>Attempted</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {result.sectionScores.map((s) => (
            <tr key={s.sectionId}>
              <td>{s.title}</td>
              <td>{s.total}</td>
              <td>{s.attempted}</td>
              <td>{s.correct}</td>
              <td>{s.incorrect}</td>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className="font-semibold">Question review</h2>
      {review.map(({ section, questions }) => (
        <section key={section.id} className="space-y-2">
          <h3 className="text-sm font-semibold">{section.titleEn}</h3>
          {questions.map(({ question: q, selectedOptionId, correctOptionIds, outcome }) => (
            <div key={q.id} className="break-inside-avoid border-b border-border pb-2 text-sm">
              <div>
                <span className="font-mono text-xs">Q{q.number}</span>{" "}
                <span className={outcome === "CORRECT" ? "text-success" : outcome === "INCORRECT" ? "text-danger" : "text-muted"}>
                  [{outcome}]
                </span>{" "}
                {q.textEn ?? q.textHi}
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                {q.options.map((o) => (
                  <span key={o.id} className={correctOptionIds.includes(o.id) ? "font-semibold text-success" : o.id === selectedOptionId ? "text-danger" : ""}>
                    {o.label}. {o.textEn ?? o.textHi}
                    {o.id === selectedOptionId && " ← chosen"}
                    {correctOptionIds.includes(o.id) && " ✓"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
