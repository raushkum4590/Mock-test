"use client";

import Link from "next/link";
import type { DictKey } from "@/lib/i18n/dictionary";
import { formatDateTime } from "@/lib/time/zone";
import type { getCandidateDashboard } from "@/server/services/attempt-service";
import { Badge } from "@/components/ui";
import { CandidateHeader } from "./candidate-header";
import { useLang } from "./lang";

type Exam = Awaited<ReturnType<typeof getCandidateDashboard>>[number];

export function DashboardView({ candidate, exams }: { candidate: { fullName: string; rollNumber: string }; exams: Exam[] }) {
  const { t, lang } = useLang();
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return (
    <main className="flex flex-1 flex-col">
      <CandidateHeader name={candidate.fullName} rollNumber={candidate.rollNumber} />
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        <h1 className="text-xl font-semibold">
          {t("welcome")}, {candidate.fullName}
        </h1>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("yourExams")}</h2>
        {exams.length === 0 && <p className="rounded-md border border-border bg-surface p-4 text-sm">{t("noExams")}</p>}
        {exams.map((e) => {
          const submitted = e.attemptStatus === "SUBMITTED" || e.attemptStatus === "AUTO_SUBMITTED";
          const phase = submitted ? "SUBMITTED" : e.timing.phase;
          const canProceed = !submitted && ["WAITING", "RUNNING", "PAUSED"].includes(e.timing.phase);
          const title = lang === "hi" && e.examTitleHi ? e.examTitleHi : e.examTitleEn;
          return (
            <article key={e.scheduleId} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted">{e.title}</p>
                </div>
                <Badge tone={phase === "SUBMITTED" ? "SUBMITTED" : e.timing.status}>{t(`st_${phase}` as DictKey)}</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="inline text-muted">{t("loginOpens")}: </dt>
                  <dd className="inline">{formatDateTime(e.timing.loginOpensAt, e.timeZone, locale)}</dd>
                </div>
                <div>
                  <dt className="inline text-muted">{t("startsAt")}: </dt>
                  <dd className="inline">{formatDateTime(e.timing.startAt, e.timeZone, locale)}</dd>
                </div>
                <div>
                  <dt className="inline text-muted">{t("duration")}: </dt>
                  <dd className="inline">
                    {Math.round(e.durationSeconds / 60)} {t("minutes")}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-muted">{t("endsAt")}: </dt>
                  <dd className="inline">{formatDateTime(e.timing.endAt, e.timeZone, locale)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                {canProceed && (
                  <Link href={`/candidate/instructions/${e.scheduleId}`} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
                    {t("proceed")}
                  </Link>
                )}
                {submitted && (
                  <Link href={`/candidate/submission/${e.scheduleId}`} className="text-sm text-primary underline">
                    {t("viewSubmission")}
                  </Link>
                )}
                {phase === "UPCOMING" && <p className="text-sm text-muted">{t("loginNotOpen")}</p>}
              </div>
            </article>
          );
        })}
        <p className="text-xs text-muted">{t("mockNotice")}</p>
      </div>
    </main>
  );
}
