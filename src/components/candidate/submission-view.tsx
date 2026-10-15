"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { captureJpeg, openCamera, stopCamera, waitForFrame } from "@/lib/client/camera";
import type { DictKey } from "@/lib/i18n/dictionary";
import { pickText } from "@/lib/i18n/dictionary";
import { formatDateTime, formatDuration } from "@/lib/time/zone";
import type { getSubmissionSummary } from "@/server/services/attempt-service";
import { CandidateHeader } from "./candidate-header";
import { useLang } from "./lang";

type Summary = Awaited<ReturnType<typeof getSubmissionSummary>>;

/** Takes and uploads the end-of-exam photo once (best effort: the exam is already submitted). */
function EndPhoto({ attemptId }: { attemptId: string }) {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"taking" | "done" | "skipped">("taking");

  useEffect(() => {
    const key = `cbt:photo:end:${attemptId}`;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      if (sessionStorage.getItem(key)) return setStatus("done");
      try {
        stream = await openCamera();
        const video = videoRef.current;
        if (!video || cancelled) return;
        video.srcObject = stream;
        await video.play().catch(() => {});
        const jpeg = (await waitForFrame(video)) ? captureJpeg(video) : null;
        if (!jpeg) return setStatus("skipped");
        await api(`/api/attempts/${attemptId}/photo`, { body: { kind: "END", image: jpeg } });
        sessionStorage.setItem(key, "1");
        if (!cancelled) setStatus("done");
      } catch {
        if (!cancelled) setStatus("skipped");
      } finally {
        stopCamera(stream);
      }
    })();
    return () => {
      cancelled = true;
      stopCamera(stream);
    };
  }, [attemptId]);

  if (status === "skipped") return null;
  return (
    <div className="flex items-center gap-3 text-xs text-muted" aria-live="polite">
      <video ref={videoRef} muted playsInline className={status === "taking" ? "h-12 w-16 -scale-x-100 rounded object-cover" : "hidden"} aria-hidden />
      {status === "taking" ? t("endPhotoTaking") : `✓ ${t("endPhotoDone")}`}
    </div>
  );
}

export function SubmissionView({
  scheduleId,
  candidate,
  summary,
}: {
  scheduleId: string;
  candidate: { fullName: string; rollNumber: string };
  summary: Summary;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const pending = summary.attempt.status === "IN_PROGRESS";

  // Deadline processing can take a moment: refresh until the server confirms.
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(id);
  }, [pending, router]);

  if (pending) {
    return (
      <main className="flex flex-1 flex-col">
        <CandidateHeader name={candidate.fullName} rollNumber={candidate.rollNumber} showLogout={false} />
        <div className="mx-auto mt-16 max-w-lg p-6 text-center">
          <p className="text-lg">{t("timeUpBody")}</p>
          <a className="mt-4 inline-block text-sm text-primary underline" href={`/candidate/exam/${scheduleId}`}>
            ←
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <CandidateHeader name={candidate.fullName} rollNumber={candidate.rollNumber} />
      <div className="mx-auto mt-10 w-full max-w-xl space-y-4 p-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center" data-testid="submission-confirmed">
          <div aria-hidden className="text-4xl text-success">
            ✓
          </div>
          <h1 className="mt-2 text-xl font-semibold">{t("submissionTitle")}</h1>
          <p className="mt-1 text-sm">{pickText(lang, summary.exam.titleEn, summary.exam.titleHi).text}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <dt className="text-muted">{t("submittedAt")}</dt>
          <dd>{formatDateTime(summary.attempt.submittedAt, undefined, lang === "hi" ? "hi-IN" : "en-IN")}</dd>
          <dt className="text-muted">{t("submittedBy")}</dt>
          <dd>{summary.attempt.reason ? t(`reason_${summary.attempt.reason}` as DictKey) : "—"}</dd>
          {summary.counts && (
            <>
              <dt className="text-muted">{t("answeredCount")}</dt>
              <dd>
                {summary.counts.answered} / {summary.counts.total}
              </dd>
              <dt className="text-muted">{t("notAnsweredCount")}</dt>
              <dd>{summary.counts.notAnswered}</dd>
            </>
          )}
          {summary.counts && (
            <>
              <dt className="text-muted">{t("timeTaken")}</dt>
              <dd>{formatDuration(summary.counts.timeTakenSeconds)}</dd>
            </>
          )}
          {summary.score && (
            <>
              <dt className="text-muted">{t("correctCount")}</dt>
              <dd className="text-success">{summary.score.correct}</dd>
              <dt className="text-muted">{t("incorrectCount")}</dt>
              <dd className="text-danger">{summary.score.incorrect}</dd>
              <dt className="text-muted">{t("negativeMarks")}</dt>
              <dd>−{summary.score.negativeMarks}</dd>
              <dt className="text-muted">{t("accuracy")}</dt>
              <dd>{summary.score.accuracyPct}%</dd>
              <dt className="text-muted">{t("yourScore")}</dt>
              <dd className="font-semibold">
                {summary.score.finalScore} / {summary.score.maxScore}
              </dd>
            </>
          )}
        </dl>
        {summary.score && summary.score.sections.length > 1 && (
          <table className="w-full rounded-lg border border-border bg-surface text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left">
            <caption className="pb-1 text-left font-semibold">{t("sectionWise")}</caption>
            <thead className="text-muted">
              <tr>
                <th>{t("section")}</th>
                <th>{t("answeredCount")}</th>
                <th>{t("correctCount")}</th>
                <th>{t("incorrectCount")}</th>
                <th>{t("marks")}</th>
              </tr>
            </thead>
            <tbody>
              {summary.score.sections.map((s) => (
                <tr key={s.sectionId}>
                  <td>{s.title}</td>
                  <td>
                    {s.attempted} / {s.total}
                  </td>
                  <td>{s.correct}</td>
                  <td>{s.incorrect}</td>
                  <td>{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!summary.score && <p className="text-sm text-muted">{t("resultPending")}</p>}
        {summary.policy.cameraMonitoring && <EndPhoto attemptId={summary.attempt.id} />}
        <p className="text-center text-2xl font-bold text-primary">{t("bestOfLuck")}</p>
        <p className="text-sm">{t("thankYou")}</p>
        <p className="text-xs text-muted">{t("mockNotice")}</p>
        <a href="/candidate/dashboard" className="text-sm text-primary underline">
          {t("backToDashboard")}
        </a>
      </div>
    </main>
  );
}
