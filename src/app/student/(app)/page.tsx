import Link from "next/link";
import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st, type SiteKey } from "@/lib/i18n/site";
import { formatDateTime } from "@/lib/time/zone";
import { getRecommendations, getStudentAnalytics, getStudentHistory, listPublicTests } from "@/server/services/practice-service";
import { PercentBars, TrendChart } from "@/components/student/analytics-charts";
import { TestCard } from "@/components/student/test-card";
import { HistoryTable } from "@/components/student/history-table";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const student = await requireStudentPage();
  const lang = await getUiLang();
  const t = (k: SiteKey) => st(lang, k);
  const [analytics, history] = await Promise.all([getStudentAnalytics(student), getStudentHistory(student)]);
  const weakSubjects = [...new Set(analytics.weakTopics.map((w) => w.subject).filter(Boolean))];
  const [recommendations, allTests] = await Promise.all([getRecommendations(student, weakSubjects), listPublicTests()]);
  const inProgress = history.filter((h) => h.status === "IN_PROGRESS");
  const s = analytics.summary;

  return (
    <>
      <h1 className="text-2xl font-bold">
        {t("welcomeBack")}, {student.displayName}
      </h1>

      {inProgress.map((h) => (
        <div key={h.attemptId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="text-sm">
            <span className="font-semibold">{t("inProgress")}:</span> {lang === "hi" && h.titleHi ? h.titleHi : h.titleEn}
          </span>
          <Link href={`/student/attempts/${h.attemptId}`} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            {t("continueTest")}
          </Link>
        </div>
      ))}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t("availableTests")}</h2>
          <Link href="/tests" className="text-sm text-primary underline">
            {t("viewAll")}
          </Link>
        </div>
        {allTests.length === 0 ? (
          <p className="text-sm text-muted">{t("noTests")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="available-tests">
            {allTests.slice(0, 6).map((test) => (
              <TestCard key={test.id} test={test} lang={lang} />
            ))}
          </div>
        )}
      </section>

      <section aria-label={t("overview")} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label={t("testsAttempted")} value={String(s.testsAttempted)} help={t("metricTests")} />
        <Tile label={t("averageScore")} value={`${s.averageScorePct}%`} help={t("metricAverage")} />
        <Tile label={t("bestScore")} value={`${s.bestScorePct}%`} help={t("metricBest")} />
        <Tile label={t("accuracy")} value={`${s.accuracyPct}%`} help={t("metricAccuracy")} />
      </section>

      {analytics.trend.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-muted">{t("noAttempts")}</p>
          <Link href="/tests?access=free" className="mt-3 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            {t("startFree")}
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{t("scoreTrend")}</h2>
            <p className="mb-3 text-xs text-muted">{t("scoreTrendHelp")}</p>
            <TrendChart
              data={analytics.trend.map((p, i) => ({
                label: `#${i + 1}`,
                title: p.title,
                date: formatDateTime(p.date).split(",").slice(0, 2).join(","),
                scorePct: p.scorePct,
                accuracyPct: p.accuracyPct,
              }))}
              labels={{ score: t("scorePct"), accuracy: t("accuracyPct"), table: t("table") }}
            />
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 font-semibold">{t("sectionPerformance")}</h2>
              <PercentBars
                label={t("accuracy")}
                table={t("table")}
                data={analytics.sections.map((x) => ({ name: x.section, value: x.accuracyPct, detail: `${x.correct}/${x.attempted}` }))}
              />
            </section>
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 font-semibold">{t("topicAccuracy")}</h2>
              <PercentBars
                label={t("accuracy")}
                table={t("table")}
                data={analytics.topics.slice(0, 10).map((x) => ({ name: x.topic, value: x.accuracyPct, detail: `${x.correct}/${x.attempted}` }))}
              />
            </section>
          </div>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{t("weakTopics")}</h2>
            <p className="mb-3 text-xs text-muted">{t("weakTopicsHelp")}</p>
            {analytics.weakTopics.length === 0 ? (
              <p className="text-sm text-muted">{t("noWeakTopics")}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {analytics.weakTopics.map((w) => (
                  <li key={w.topic} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-900">
                    ⚠ {w.topic} · {w.accuracyPct}% ({w.correct}/{w.attempted})
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">{t("recommended")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((r) => (
              <TestCard key={r.id} test={r} lang={lang} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t("recentAttempts")}</h2>
          <Link href="/student/history" className="text-sm text-primary underline">
            {t("viewAll")}
          </Link>
        </div>
        <HistoryTable rows={history.slice(0, 5)} lang={lang} />
      </section>
    </>
  );
}

function Tile({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <p className="mt-1 text-xs text-muted">{help}</p>
    </div>
  );
}
