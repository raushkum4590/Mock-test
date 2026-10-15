"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/client/api";
import { errorText, pickText } from "@/lib/i18n/dictionary";
import { formatDuration, formatTime } from "@/lib/time/zone";
import type { getCandidateExamState } from "@/server/services/attempt-service";
import { Alert } from "@/components/ui";
import { CandidateHeader } from "./candidate-header";
import { useLang } from "./lang";
import { useExamChannel, useServerNow } from "./use-exam-channel";
import { ConnectionBadge } from "./connection-badge";

type State = Awaited<ReturnType<typeof getCandidateExamState>>;

/**
 * Waits for the server to start the exam. The countdown is informational;
 * the exam opens only when the server reports RUNNING (via SSE/polling)
 * and accepts the start request.
 */
export function WaitingRoom({ state }: { state: State }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const { timing, offsetMs, connection, sessionEnded } = useExamChannel(state.schedule.id, state.timing);
  const serverNow = useServerNow(offsetMs);
  const [error, setError] = useState<string | null>(null);
  const starting = useRef(false);

  useEffect(() => {
    if (sessionEnded) router.replace("/login");
  }, [sessionEnded, router]);

  useEffect(() => {
    if (!timing || starting.current) return;
    if (timing.phase === "ENDED") {
      router.replace(`/candidate/submission/${state.schedule.id}`);
      return;
    }
    if (timing.phase !== "RUNNING" && !(timing.phase === "PAUSED" && state.attempt)) return;
    starting.current = true;
    (async () => {
      try {
        await api("/api/attempts/start", { body: { scheduleId: state.schedule.id, language: lang } });
        router.replace(`/candidate/exam/${state.schedule.id}`);
      } catch (e) {
        starting.current = false;
        const code = e instanceof ApiError ? e.code : undefined;
        if (code === "ATTEMPT_SUBMITTED" || code === "EXAM_ENDED") router.replace(`/candidate/submission/${state.schedule.id}`);
        else setError(errorText(lang, code));
      }
    })();
  }, [timing, lang, router, state.schedule.id, state.attempt]);

  const secondsToStart = timing && serverNow ? Math.max(0, Math.ceil((Date.parse(timing.startAt) - serverNow) / 1000)) : (timing?.secondsToStart ?? 0);
  const title = pickText(lang, state.exam.titleEn, state.exam.titleHi).text;
  const locale = lang === "hi" ? "hi-IN" : "en-IN";

  return (
    <main className="flex flex-1 flex-col">
      <CandidateHeader name={state.candidate.fullName} rollNumber={state.candidate.rollNumber} showLogout={false} />
      <div className="mx-auto mt-10 w-full max-w-xl space-y-5 p-6 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-base">{t("waitingTitle")}</p>
        {timing?.phase === "UPCOMING" && <Alert tone="warning">{t("loginNotOpen")}</Alert>}
        <div className="rounded-lg border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-muted">{t("examStartsIn")}</p>
          <p className="mt-2 font-mono text-5xl font-bold tabular-nums" aria-live="polite" data-testid="start-countdown">
            {formatDuration(secondsToStart)}
          </p>
          {secondsToStart === 0 && <p className="mt-3 text-sm text-primary">{t("starting")}</p>}
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex items-center justify-center gap-4 text-sm text-muted">
          <ConnectionBadge connection={connection} />
          {serverNow > 0 && (
            <span>
              {t("serverTime")}: {formatTime(new Date(serverNow), state.schedule.timeZone, locale)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted">{t("doNotRefresh")}</p>
      </div>
    </main>
  );
}
