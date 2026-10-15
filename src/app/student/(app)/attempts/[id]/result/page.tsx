import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudentPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { pickText } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st, type SiteKey } from "@/lib/i18n/site";
import { formatDateTime, formatDuration } from "@/lib/time/zone";
import { getLeaderboard, getPracticeResult } from "@/server/services/practice-service";
import { QuestionReview } from "@/components/student/question-review";
import { BookmarkButton } from "@/components/student/student-widgets";
import { Alert } from "@/components/ui";
import { AutoRefresh } from "@/components/student/auto-refresh";

export const metadata = { title: "Result" };

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await requireStudentPage(`/student/attempts/${id}/result`);
  const lang = await getUiLang();
  const t = (k: SiteKey) => st(lang, k);
  let r;
  try {
    r = await getPracticeResult(student, id);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  if (r.status === "IN_PROGRESS") redirect(`/student/attempts/${id}`);
  const title = pickText(lang, r.exam.titleEn, r.exam.titleHi).text;
  const locale = lang === "hi" ? "hi-IN" : "en-IN";

  if (r.status === "PROCESSING" || r.status === "PENDING_RELEASE") {
    return (
      <section className="rounded-xl border border-border bg-surface p-6" data-testid="result-pending">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-3">✓ {t("resultPending")}</p>
        {r.status === "PENDING_RELEASE" ? (
          <p className="mt-2 text-muted">
            {t("resultPendingAt")} <strong>{formatDateTime(r.releaseAt, undefined, locale)}</strong>
          </p>
        ) : (
          <>
            <p className="mt-2 text-muted">{t("resultProcessing")}</p>
            <AutoRefresh seconds={3} />
          </>
        )}
      </section>
    );
  }

  const res = r.result;
  const board = await getLeaderboard(r.exam.id, student.studentId, 10);

  return (
    <>
      <header className="rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          {t("resultTitle")} · {t("attemptNo")} {r.attemptNumber} · {formatDateTime(r.submittedAt, undefined, locale)}
          {r.submitReason === "DEADLINE" && ` · ${t("autoSubmitted")}`}
        </p>
        <h1 className="mt-1 text-xl font-semibold">{title}</h1>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" data-testid="score-summary">
          <Big label={t("marksObtained")} value={`${res.finalScore} / ${res.maxScore}`} strong testId="final-score" />
          <Big label={t("correct")} value={String(res.correct)} />
          <Big label={t("incorrect")} value={String(res.incorrect)} />
          <Big label={t("unanswered")} value={String(res.unanswered)} />
          <Big label={t("accuracy")} value={`${res.accuracy}%`} />
          <Big label={t("timeTaken")} value={formatDuration(res.timeTakenSeconds)} />
        </div>
        <p className="mt-3 text-xs text-muted">
          +{res.positiveMarks} − {res.negativeMarks} = {res.finalScore}. {t("metricAccuracy")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {r.exam.slug && (
            <Link href={`/tests/${r.exam.slug}`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-slate-50">
              {t("retake")}
            </Link>
          )}
          <Link href="/student/history" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-slate-50">
            {t("history")}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">{t("sectionWise")}</h2>
          <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_th]:text-left">
            <thead className="text-muted">
              <tr>
                <th>{t("section")}</th>
                <th>{t("correct")}</th>
                <th>{t("incorrect")}</th>
                <th>{t("score")}</th>
              </tr>
            </thead>
            <tbody>
              {res.sectionScores.map((s) => (
                <tr key={s.sectionId}>
                  <td>{s.title}</td>
                  <td>
                    {s.correct}/{s.total}
                  </td>
                  <td>{s.incorrect}</td>
                  <td className="font-semibold">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">{t("topicWise")}</h2>
          <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_th]:text-left">
            <thead className="text-muted">
              <tr>
                <th>Topic</th>
                <th>{t("correct")}</th>
                <th>{t("accuracy")}</th>
              </tr>
            </thead>
            <tbody>
              {res.topicScores.map((tp) => (
                <tr key={tp.topic}>
                  <td>{tp.topic}</td>
                  <td>
                    {tp.correct}/{tp.total}
                  </td>
                  <td>{tp.attempted ? `${Math.round((tp.correct / tp.attempted) * 100)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {board.released && board.cohort > 0 && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">{t("leaderboard")}</h2>
          {board.viewer && (
            <p className="mt-1 text-sm">
              {t("yourRank")}: <strong>{board.viewer.rank}</strong> {t("of")} {board.cohort}
              {board.viewer.percentile !== null && ` · ${t("percentile")} ${board.viewer.percentile}`}
            </p>
          )}
          <table className="mt-3 w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_th]:text-left">
            <thead className="text-muted">
              <tr>
                <th>{t("rank")}</th>
                <th>{t("name")}</th>
                <th>{t("score")}</th>
                <th>{t("timeTaken")}</th>
              </tr>
            </thead>
            <tbody>
              {board.rows.map((row, i) => (
                <tr key={i} className={row.isViewer ? "bg-sky-50 font-semibold" : ""}>
                  <td>{row.rank}</td>
                  <td>{row.name}</td>
                  <td>
                    {row.score} / {row.maxScore}
                  </td>
                  <td>{formatDuration(row.timeTakenSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">{t("cohortNote")}</p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("solutions")}</h2>
        {r.solutions.map((sec) => (
          <div key={sec.id} className="space-y-3">
            <h3 className="font-semibold text-muted">{pickText(lang, sec.titleEn, sec.titleHi).text}</h3>
            {sec.questions.map((q) => (
              <QuestionReview
                key={q.id}
                lang={lang}
                number={q.number}
                textEn={q.textEn}
                textHi={q.textHi}
                imageUrl={q.imageUrl}
                options={q.options}
                selectedOptionId={q.selectedOptionId}
                correctOptionIds={q.correctOptionIds}
                explanationEn={q.explanationEn}
                explanationHi={q.explanationHi}
                outcome={q.outcome}
                actions={<BookmarkButton questionId={q.id} initial={q.bookmarked} lang={lang} />}
              />
            ))}
          </div>
        ))}
      </section>
    </>
  );
}

function Big({ label, value, strong, testId }: { label: string; value: string; strong?: boolean; testId?: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={strong ? "text-2xl font-bold text-primary tabular-nums" : "text-xl font-semibold tabular-nums"} data-testid={testId}>
        {value}
      </div>
    </div>
  );
}
