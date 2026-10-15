"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "@/lib/client/api";
import { AnswerSync, paletteState, type AnswerChange, type PaletteState, type SendResult, type SyncSnapshot } from "@/lib/exam-engine/answer-sync";
import { errorText, pickText } from "@/lib/i18n/dictionary";
import { formatDuration } from "@/lib/time/zone";
import type { getAttemptPaper, SaveItemResult, Timing } from "@/server/services/attempt-service";
import { Alert, Button, cx } from "@/components/ui";
import { LangSwitch, useLang } from "@/components/candidate/lang";
import { ConnectionBadge } from "@/components/candidate/connection-badge";
import { remainingFrom, useExamChannel, usePracticeTiming, useServerNow } from "@/components/candidate/use-exam-channel";
import { currentGroup, sectionStates, timerGroups } from "@/lib/exam-engine/section-timing";
import { ExamGuard } from "./exam-guard";
import { ExamProctor } from "./exam-proctor";
import { PaletteChip, PaletteLegend, PALETTE_STYLE } from "./palette";

type Paper = Awaited<ReturnType<typeof getAttemptPaper>>;
type FlatQuestion = Paper["sections"][number]["questions"][number] & { sectionIndex: number };

const FATAL = new Set(["EXAM_ENDED", "ATTEMPT_SUBMITTED", "NOT_FOUND", "UNAUTHENTICATED"]);

/** Exam-centre sitting (fixed window, SSE) or an online self-paced practice attempt. */
export type ExamMode = { kind: "centre"; scheduleId: string } | { kind: "practice"; attemptId: string };

type SaveResponse = { results: SaveItemResult[]; timing: Timing };
type AnswersResponse = { answers: Parameters<AnswerSync["applyServer"]>[0] };

function endpointsFor(mode: ExamMode) {
  if (mode.kind === "centre") {
    const sid = mode.scheduleId;
    return {
      start: async (language: string) => (await api<{ attemptId: string }>("/api/attempts/start", { body: { scheduleId: sid, language } })).attemptId,
      paper: (id: string) => api<Paper>(`/api/attempts/${id}/paper`),
      save: (id: string, changes: AnswerChange[]) => api<SaveResponse>("/api/answers", { body: { attemptId: id, changes } }),
      answers: (id: string) => api<AnswersResponse>(`/api/attempts/${id}/answers`),
      submit: (id: string) => api("/api/submissions", { body: { attemptId: id } }),
      // Asking for state makes the server finalise an expired attempt if the scheduler has not yet.
      probe: () => api(`/api/candidate/state?scheduleId=${sid}`),
      doneHref: () => `/candidate/submission/${sid}`,
      waitingHref: `/candidate/waiting/${sid}`,
      loginHref: "/login",
    };
  }
  const aid = mode.attemptId;
  return {
    start: async () => aid,
    paper: (id: string) => api<Paper>(`/api/student/attempts/${id}/paper`),
    save: (id: string, changes: AnswerChange[]) => api<SaveResponse>(`/api/student/attempts/${id}/answers`, { body: { changes } }),
    answers: (id: string) => api<AnswersResponse>(`/api/student/attempts/${id}/state`),
    submit: (id: string) => api(`/api/student/attempts/${id}/submit`, { method: "POST" }),
    probe: () => api(`/api/student/attempts/${aid}/state`),
    doneHref: () => `/student/attempts/${aid}/result`,
    waitingHref: `/student/attempts/${aid}/result`,
    loginHref: `/student/login?next=${encodeURIComponent(`/student/attempts/${aid}`)}`,
  };
}

export function ExamScreen({ mode, candidate }: { mode: ExamMode; candidate: { fullName: string; rollNumber: string } }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const modeKey = mode.kind === "centre" ? mode.scheduleId : mode.attemptId;
  const isPractice = mode.kind === "practice";
  // Keyed on the id so a parent re-render with a new object literal does not change it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ep = useMemo(() => endpointsFor(mode), [modeKey]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [initialOffsetMs, setInitialOffsetMs] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  // Render reads only state: the engine instance (for actions) and an
  // immutable snapshot it publishes on every change. The ref is for
  // effects and event handlers.
  const [sync, setSync] = useState<AnswerSync | null>(null);
  const [snap, setSnap] = useState<SyncSnapshot | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  // Leaving fullscreen restarts the test: the paper is reloaded empty (centre)
  // or the attempt is discarded and must be begun again (practice).
  const [reloadKey, setReloadKey] = useState(0);
  const [restarted, setRestarted] = useState(false);
  const [cancelled, setCancelled] = useState<{ href: string } | null>(null);
  const syncRef = useRef<AnswerSync | null>(null);
  const endingRef = useRef(false);

  // Both hooks are always called (rules of hooks); only the one for this mode is enabled.
  const centreTiming = useExamChannel(mode.kind === "centre" ? mode.scheduleId : "", paper?.timing ?? null, !isPractice);
  const practiceTiming = usePracticeTiming(mode.kind === "practice" ? mode.attemptId : "", paper?.timing ?? null, initialOffsetMs, isPractice);
  const { timing, offsetMs, connection, sessionEnded } = isPractice ? practiceTiming : centreTiming;
  const serverNow = useServerNow(offsetMs);
  const remaining = remainingFrom(timing, serverNow);
  const untimed = (timing as (Timing & { timed?: boolean }) | null)?.timed === false;

  const finish = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    setEnding(true);
    await syncRef.current?.flush().catch(() => {});
    await ep.probe().catch(() => {});
    router.replace(ep.doneHref());
  }, [router, ep]);

  // --- load -------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attemptId = await ep.start(lang);
        const p = await ep.paper(attemptId);
        if (cancelled) return;
        setInitialOffsetMs(new Date(p.timing.serverNow).getTime() - Date.now());
        const engine: AnswerSync = new AnswerSync({
          attemptId,
          storage: typeof window !== "undefined" ? window.sessionStorage : null,
          onChange: () => setSnap(engine.snapshot()),
          onFatal: (code) => {
            if (code === "UNAUTHENTICATED") router.replace(ep.loginHref);
            else void finish();
          },
          send: async (changes: AnswerChange[]): Promise<SendResult> => {
            try {
              const r = await ep.save(attemptId, changes);
              return { ok: true, results: r.results };
            } catch (e) {
              if (e instanceof ApiError) return { ok: false, fatal: FATAL.has(e.code), code: e.code };
              return { ok: false, fatal: false, code: "NETWORK" };
            }
          },
        });
        engine.init(p.answers);
        syncRef.current = engine;
        setSync(engine);
        setPaper(p);
        const first = p.sections.flatMap((s) => s.questions)[0];
        if (first) engine.visit(first.id);
      } catch (e) {
        const code = e instanceof ApiError ? e.code : undefined;
        if (code === "EXAM_NOT_STARTED") router.replace(ep.waitingHref);
        else if (code === "ATTEMPT_SUBMITTED" || code === "EXAM_ENDED") router.replace(ep.doneHref());
        else if (code === "UNAUTHENTICATED") router.replace(ep.loginHref);
        else if (!cancelled) setLoadError(errorText(lang, code));
      }
    })();
    return () => {
      cancelled = true;
      syncRef.current?.dispose();
    };
    // Load once per attempt (and again after a restart); language changes must not reload the paper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKey, reloadKey]);

  /** Drop the local answer engine and its stored queue so nothing old is re-sent. */
  const discardLocalAnswers = useCallback((attemptId: string) => {
    syncRef.current?.dispose();
    syncRef.current = null;
    try {
      window.sessionStorage.removeItem(`cbt-pending-${attemptId}`);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Centre: the server has already wiped the answers; reload the empty paper.
  const restartCentre = useCallback(() => {
    if (!paper) return;
    discardLocalAnswers(paper.attempt.id);
    setSync(null);
    setSnap(null);
    setPaper(null);
    setCurrent(0);
    setShowSubmit(false);
    setRestarted(true);
    setReloadKey((k) => k + 1);
  }, [paper, discardLocalAnswers]);

  // Practice: leaving fullscreen discards the attempt; the student must begin again.
  useEffect(() => {
    if (!isPractice || !paper) return;
    const onChange = async () => {
      if (document.fullscreenElement || endingRef.current || window.cbtClient?.kiosk) return;
      endingRef.current = true;
      discardLocalAnswers(paper.attempt.id);
      let slug: string | null = null;
      try {
        slug = (await api<{ slug: string | null }>(`/api/student/attempts/${paper.attempt.id}/cancel`, { method: "POST" })).slug;
      } catch {
        /* already submitted or offline: fall back to the dashboard */
      }
      setCancelled({ href: slug ? `/student/tests/${slug}` : "/student" });
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [isPractice, paper, discardLocalAnswers]);

  // Periodic reconciliation with the server's stored answers.
  useEffect(() => {
    if (!paper) return;
    const id = setInterval(async () => {
      try {
        const r = await ep.answers(paper.attempt.id);
        syncRef.current?.applyServer(r.answers);
      } catch {
        /* offline: the queue keeps retrying */
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [paper, ep]);

  useEffect(() => {
    if (sessionEnded) router.replace(ep.loginHref);
  }, [sessionEnded, router, ep]);

  // Official end: the countdown reaching zero or the server reporting ENDED.
  useEffect(() => {
    if (!paper || !timing) return;
    if (timing.phase === "ENDED" || timing.phase === "CANCELLED" || (!untimed && timing.status === "RUNNING" && serverNow > 0 && remaining === 0)) {
      void finish();
    }
  }, [paper, timing, remaining, serverNow, finish, untimed]);

  // Resume sending queued answers after a hold ends.
  useEffect(() => {
    if (timing?.status === "RUNNING") void syncRef.current?.flush();
  }, [timing?.status]);

  // Warn before closing the window while answers are unsaved.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if ((syncRef.current?.unsavedCount ?? 0) > 0 && !endingRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const flat: FlatQuestion[] = useMemo(
    () => paper?.sections.flatMap((s, si) => s.questions.map((q) => ({ ...q, sectionIndex: si }))) ?? [],
    [paper],
  );

  // --- sectional timing ----------------------------------------------------------
  // Timed sections open one after another on the exam's elapsed time; the
  // server rejects answers outside a section's window (see section-timing.ts).
  const sectional = !!paper && !untimed && timerGroups(paper.sections).length > 0;
  const started = timing?.status === "RUNNING" || timing?.status === "PAUSED";
  const elapsed = sectional && started && timing ? Math.max(0, timing.durationSeconds - remaining) : 0;
  const secStates = sectional && paper ? sectionStates(paper.sections, elapsed) : null;
  const group = sectional && paper ? currentGroup(paper.sections, elapsed) : null;
  // Send queued answers just before the running section closes.
  const sectionEnding = !!group && group.remainingSec <= 2;
  useEffect(() => {
    if (sectionEnding) void syncRef.current?.flush();
  }, [sectionEnding]);

  if (cancelled) {
    return (
      // Above the FullscreenGate overlay (z-50): this screen must stay reachable outside fullscreen.
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4" role="alertdialog" aria-modal="true" data-testid="test-cancelled">
        <div className="max-w-md rounded-lg bg-surface p-6 text-center shadow-xl">
          <h2 className="text-lg font-semibold">{t("testCancelledTitle")}</h2>
          <p className="mt-2 text-sm">{t("testCancelledBody")}</p>
          <Button className="mt-4" onClick={() => router.replace(cancelled.href)}>
            {t("startAgain")}
          </Button>
        </div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="mx-auto mt-16 max-w-lg p-6">
        <Alert tone="error">{loadError}</Alert>
      </div>
    );
  }
  if (!paper || !sync || !snap) return <p className="mt-16 text-center text-muted">{t("loadingPaper")}</p>;

  const isOpenAt = (i: number) => !secStates || secStates.get(paper.sections[flat[i]!.sectionIndex]!.id) === "open";
  // When the running section's time is over, show the first question of the section that is open now.
  const firstOpen = flat.findIndex((_, i) => isOpenAt(i));
  const shown = isOpenAt(current) || firstOpen < 0 ? current : firstOpen;
  const q = flat[shown]!;
  const section = paper.sections[q.sectionIndex]!;
  const answer = snap.answers.get(q.id);
  const qText = pickText(lang, q.textEn, q.textHi);
  const paused = timing?.status === "PAUSED";
  const sectionLocked = !isOpenAt(shown);
  const locked = paused || ending || sectionLocked;
  const lowTime = !untimed && remaining <= 300;

  const states = flat.map((fq) => paletteState(snap.answers.get(fq.id)));
  const counts = (idxs: number[]) => {
    const c: Record<PaletteState, number> = { NOT_VISITED: 0, NOT_ANSWERED: 0, ANSWERED: 0, MARKED: 0, ANSWERED_MARKED: 0 };
    for (const i of idxs) c[states[i]!]++;
    return c;
  };
  const sectionIdx = flat.map((fq, i) => (fq.sectionIndex === q.sectionIndex ? i : -1)).filter((i) => i >= 0);

  const goTo = (i: number) => {
    const idx = Math.max(0, Math.min(flat.length - 1, i));
    if (!isOpenAt(idx)) return; // timed section not open
    setCurrent(idx);
    sync.visit(flat[idx]!.id);
  };
  const next = () => goTo(shown + 1);
  const select = (optionId: string) => !locked && sync.update(q.id, { selectedOptionId: optionId });

  const saveStatus = answer?.status ?? "saved";
  const unsaved = snap.unsaved;

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    await sync.flush();
    if (sync.unsavedCount > 0) {
      setSubmitting(false);
      setSubmitError(t("unsavedWarning"));
      return;
    }
    try {
      endingRef.current = true;
      await ep.submit(paper.attempt.id);
      router.replace(ep.doneHref());
    } catch (e) {
      endingRef.current = false;
      setSubmitting(false);
      const code = e instanceof ApiError ? e.code : undefined;
      if (code === "ATTEMPT_SUBMITTED" || code === "EXAM_ENDED") router.replace(ep.doneHref());
      else setSubmitError(errorText(lang, code));
    }
  };

  return (
    <div
      // Desktop: fixed to the viewport so the action bar stays visible; the question
      // pane and the palette (up to 100+ buttons) scroll independently.
      className="exam-paper flex min-h-screen flex-col select-none lg:h-screen"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <ExamGuard />
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-primary px-4 py-2 text-white">
        <div>
          <div className="font-semibold">{pickText(lang, paper.exam.titleEn, paper.exam.titleHi).text}</div>
          <div className="text-xs opacity-90">
            {isPractice ? t("emailLabel") : t("rollNumber")}: <span className="font-mono">{candidate.rollNumber}</span> · {candidate.fullName}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ConnectionBadge connection={connection} dark />
          <LangSwitch dark />
          {group && (
            <div
              className={cx("rounded-md px-3 py-1 text-center", group.remainingSec <= 60 ? "bg-red-600" : "bg-amber-500/90")}
              role="timer"
              aria-label={`${t("sectionTimeLeft")} ${formatDuration(group.remainingSec)}`}
            >
              <div className="text-[10px] uppercase tracking-wide opacity-90">{t("sectionTimeLeft")}</div>
              <div className="font-mono text-xl font-bold tabular-nums" data-testid="section-timer">
                {formatDuration(group.remainingSec)}
              </div>
            </div>
          )}
          <div
            className={cx("rounded-md px-3 py-1 text-center", lowTime ? "bg-red-600" : "bg-white/15")}
            role="timer"
            aria-live={lowTime ? "assertive" : "off"}
            aria-label={untimed ? t("untimed") : `${t("timeLeft")} ${formatDuration(remaining)}`}
          >
            <div className="text-[10px] uppercase tracking-wide opacity-90">{t("timeLeft")}</div>
            <div className="font-mono text-xl font-bold tabular-nums" data-testid="timer">
              {untimed ? t("untimed") : formatDuration(remaining)}
            </div>
          </div>
        </div>
      </header>

      {/* Section tabs */}
      <nav className="flex flex-wrap gap-1 border-b border-border bg-surface px-4 pt-2" aria-label={t("section")}>
        {paper.sections.map((s, si) => {
          const firstIdx = flat.findIndex((fq) => fq.sectionIndex === si);
          const state = secStates?.get(s.id) ?? "open";
          return (
            <button
              key={s.id}
              type="button"
              disabled={firstIdx < 0 || state !== "open"}
              onClick={() => goTo(firstIdx)}
              className={cx(
                "rounded-t-md border border-b-0 px-3 py-1.5 text-sm disabled:cursor-not-allowed",
                si === q.sectionIndex
                  ? "border-primary bg-primary text-white"
                  : state === "open"
                    ? "border-border bg-slate-50 hover:bg-slate-100"
                    : "border-border bg-slate-100 text-muted",
              )}
              aria-current={si === q.sectionIndex ? "true" : undefined}
              title={state === "closed" ? t("sectionClosed") : state === "upcoming" ? t("sectionUpcoming") : undefined}
            >
              {state === "closed" && <span aria-hidden>✓ </span>}
              {state === "upcoming" && <span aria-hidden>🔒 </span>}
              {pickText(lang, s.titleEn, s.titleHi).text}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Question pane */}
        <main className="flex flex-1 flex-col bg-surface lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-2 text-sm">
            <span className="font-semibold">
              {t("questionNo")} {q.number}
            </span>
            <span className="text-muted">
              {t("marks")}: <span className="text-success">+{q.marksCorrect}</span> · {t("negative")}:{" "}
              <span className="text-danger">−{q.marksWrong}</span>
            </span>
          </div>
          {/* Action bar: above the question so it is always visible */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-slate-50 px-5 py-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={locked}
                onClick={() => {
                  sync.update(q.id, { markedForReview: true });
                  next();
                }}
              >
                {t("markForReviewAndNext")}
              </Button>
              <Button variant="secondary" disabled={locked} onClick={() => sync.update(q.id, { markedForReview: !answer?.markedForReview })}>
                {answer?.markedForReview ? t("unmarkReview") : t("markForReview")}
              </Button>
              <Button variant="secondary" disabled={locked || !answer?.selectedOptionId} onClick={() => sync.update(q.id, { selectedOptionId: null })}>
                {t("clearResponse")}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={shown === 0 || !isOpenAt(shown - 1)} onClick={() => goTo(shown - 1)}>
                {t("previous")}
              </Button>
              <Button
                variant="success"
                disabled={locked}
                data-testid="save-next"
                onClick={() => {
                  void sync.flush();
                  if (shown < flat.length - 1) next();
                }}
              >
                {t("saveAndNext")}
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {qText.fallback && lang === "hi" && (
              <p className="mb-2 text-xs text-muted" role="note">
                {t("notTranslated")}
              </p>
            )}
            <div className="question-text" lang={qText.fallback ? undefined : lang} data-testid="question-text">
              {qText.text}
            </div>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.imageUrl} alt="" className="mt-3 max-h-80 max-w-full border border-border" />
            )}
            <fieldset className="mt-5 space-y-2" disabled={locked}>
              <legend className="sr-only">{t("question")}</legend>
              {q.options.map((o) => {
                const oText = pickText(lang, o.textEn, o.textHi);
                const checked = answer?.selectedOptionId === o.id;
                return (
                  <label
                    key={o.id}
                    className={cx(
                      "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2",
                      checked ? "border-primary bg-sky-50" : "border-border hover:bg-slate-50",
                    )}
                    data-testid={`option-${o.label}`}
                  >
                    <input type="radio" name={`q-${q.id}`} className="mt-1 size-4" checked={checked} onChange={() => select(o.id)} />
                    <span className="font-semibold">{o.label}.</span>
                    <span className="question-text" lang={oText.fallback ? undefined : lang}>
                      {oText.text}
                      {o.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.imageUrl} alt="" className="mt-1 max-h-40" />
                      )}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            <p className="mt-3 text-xs" aria-live="polite" data-testid="save-status">
              {answer && saveStatus === "saved" && answer.savedRevision > 0 && <span className="text-success">✓ {t("saved")}</span>}
              {saveStatus === "pending" && <span className="text-warning">⟳ {connection === "online" ? t("saving") : t("notSaved")}</span>}
              {saveStatus === "error" && <span className="text-danger">✕ {answer?.error}</span>}
            </p>
          </div>
        </main>

        {/* Palette */}
        <aside className="w-full border-l border-border bg-slate-50 p-4 lg:w-80 lg:overflow-y-auto">
          <div className="mb-3 rounded-md border border-border bg-surface p-3 text-sm">
            <div className="font-semibold">{candidate.fullName}</div>
            <div className="font-mono text-xs text-muted">{candidate.rollNumber}</div>
          </div>
          <PaletteLegend counts={counts(sectionIdx)} />
          <h2 className="mt-4 mb-2 text-sm font-semibold">
            {t("palette")} — {pickText(lang, section.titleEn, section.titleHi).text}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {sectionIdx.map((i) => {
              const fq = flat[i]!;
              const st = states[i]!;
              return (
                <button
                  key={fq.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${t("question")} ${fq.number}: ${t(PALETTE_STYLE[st].label)}`}
                  aria-current={i === shown ? "true" : undefined}
                  data-testid={`palette-${fq.number}`}
                  data-state={st}
                >
                  <PaletteChip state={st} current={i === shown}>
                    {fq.number}
                  </PaletteChip>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs" aria-live="polite">
            {unsaved === 0 ? (
              <span className="text-success">✓ {t("allSaved")}</span>
            ) : (
              <span className="text-warning">
                {unsaved} {t("pendingAnswers")}
              </span>
            )}
          </p>
          <Button className="mt-4 w-full" disabled={locked} onClick={() => setShowSubmit(true)} data-testid="submit-exam">
            {t("submitExam")}
          </Button>
        </aside>
      </div>

      {/* Submit confirmation with section summary */}
      {showSubmit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <div className="w-full max-w-2xl rounded-lg bg-surface p-5 shadow-xl">
            <h2 id="submit-title" className="text-lg font-semibold">
              {t("confirmSubmitTitle")}
            </h2>
            <table className="mt-3 w-full border-collapse text-sm [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1">
              <thead>
                <tr>
                  <th className="text-left">{t("section")}</th>
                  <th>{t("total")}</th>
                  <th>{t("answered")}</th>
                  <th>{t("notAnswered")}</th>
                  <th>{t("marked")}</th>
                  <th>{t("answeredMarked")}</th>
                  <th>{t("notVisited")}</th>
                </tr>
              </thead>
              <tbody>
                {paper.sections.map((s, si) => {
                  const idx = flat.map((fq, i) => (fq.sectionIndex === si ? i : -1)).filter((i) => i >= 0);
                  const c = counts(idx);
                  return (
                    <tr key={s.id} className="text-center">
                      <td className="text-left">{pickText(lang, s.titleEn, s.titleHi).text}</td>
                      <td>{idx.length}</td>
                      <td>{c.ANSWERED}</td>
                      <td>{c.NOT_ANSWERED}</td>
                      <td>{c.MARKED}</td>
                      <td>{c.ANSWERED_MARKED}</td>
                      <td>{c.NOT_VISITED}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-sm">{t("confirmSubmitBody")}</p>
            {submitError && (
              <div className="mt-3">
                <Alert tone="error">{submitError}</Alert>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowSubmit(false)} disabled={submitting}>
                {t("cancel")}
              </Button>
              <Button variant="danger" onClick={submit} disabled={submitting} data-testid="confirm-submit">
                {submitting ? t("submitting") : t("yesSubmit")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode.kind === "centre" && paper.policy && (
        <ExamProctor
          attemptId={paper.attempt.id}
          policy={paper.policy}
          initialCount={paper.attempt.violationCount ?? 0}
          active={!ending && !submitting}
          onAutoSubmitted={() => void finish()}
          onAnswersReset={restartCentre}
        />
      )}

      {restarted && (
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center p-2" role="status">
          <div className="flex max-w-xl items-center gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-900 shadow">
            <span>{t("testRestartedNotice")}</span>
            <button type="button" className="font-semibold underline" onClick={() => setRestarted(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {paused && !ending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true">
          <div className="max-w-md rounded-lg bg-surface p-6 text-center shadow-xl">
            <h2 className="text-lg font-semibold">{t("onHoldTitle")}</h2>
            <p className="mt-2 text-sm">{t("onHoldBody")}</p>
            <p className="mt-3 font-mono text-2xl">{formatDuration(remaining)}</p>
          </div>
        </div>
      )}
      {ending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true">
          <div className="max-w-md rounded-lg bg-surface p-6 text-center shadow-xl" data-testid="time-up">
            <h2 className="text-lg font-semibold">{t("timeUpTitle")}</h2>
            <p className="mt-2 text-sm">{t("timeUpBody")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
