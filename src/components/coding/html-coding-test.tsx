"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cx } from "@/components/ui";
import { gradeHtml, HTML_MOCK_MINUTES, HTML_MOCK_QUESTIONS, HTML_MOCK_TITLE, type QuestionResult } from "@/lib/coding-tests/html-mock";

const STORE_KEY = "edqity.html-coding-mock.v1";
const DURATION_MS = HTML_MOCK_MINUTES * 60_000;
const TOTAL_MARKS = HTML_MOCK_QUESTIONS.reduce((n, q) => n + q.marks, 0);

type Saved = { name: string; startedAt: number; answers: Record<string, string>; results: QuestionResult[] | null };

/** Progress lives only in this browser so a refresh doesn't lose the guest's code. */
function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function save(s: Saved | null) {
  try {
    if (s) localStorage.setItem(STORE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORE_KEY);
  } catch {
    /* storage unavailable: progress just isn't kept */
  }
}

const starters = () => Object.fromEntries(HTML_MOCK_QUESTIONS.map((q) => [q.id, q.starter]));
const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Client-only: saved progress comes from localStorage, which the server can't see. */
export const HtmlCodingTest = dynamic(() => Promise.resolve(CodingTestApp), {
  ssr: false,
  loading: () => <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted">Loading…</div>,
});

function CodingTestApp() {
  const [state, setState] = useState<Saved | null>(load);

  const update = useCallback((next: Saved | null) => {
    setState(next);
    save(next);
  }, []);

  if (!state) return <Intro onStart={(name) => update({ name, startedAt: Date.now(), answers: starters(), results: null })} />;
  if (state.results) return <Results state={state} onRetake={() => update(null)} />;
  return <Workspace state={state} onChange={update} />;
}

function Intro({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Free · No login needed</span>
        <h1 className="mt-3 text-2xl font-bold">{HTML_MOCK_TITLE}</h1>
        <p className="mt-2 text-muted">Write real HTML for each task, run it to see a live preview, and get your code checked automatically.</p>
        <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
          <Stat label="Questions" value={String(HTML_MOCK_QUESTIONS.length)} />
          <Stat label="Marks" value={String(TOTAL_MARKS)} />
          <Stat label="Duration" value={`${HTML_MOCK_MINUTES} min`} />
        </dl>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Each question has 5 checks. You get marks for every check that passes.</li>
          <li>Use <b>Run</b> (Ctrl+Enter) to preview and <b>Check code</b> to see which checks pass.</li>
          <li>The test submits automatically when the timer ends.</li>
        </ul>
        <form
          className="mt-6 flex flex-wrap items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim();
            if (n.length < 2) return setError("Enter your name");
            onStart(n);
          }}
        >
          <div className="min-w-56 flex-1">
            <label htmlFor="guest-name" className="sr-only">Your name</label>
            <input
              id="guest-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={150}
              placeholder="Your name"
              className="w-full rounded-lg border border-border px-3 py-2.5"
              data-testid="guest-name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white" data-testid="start-coding-test">
            Start as guest
          </button>
        </form>
      </div>
    </div>
  );
}

function Workspace({ state, onChange }: { state: Saved; onChange: (s: Saved) => void }) {
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState<Record<string, string>>(() => ({ ...state.answers }));
  const [runId, setRunId] = useState(0);
  const [checked, setChecked] = useState<Record<string, QuestionResult>>({});
  const [now, setNow] = useState(() => Date.now());
  const q = HTML_MOCK_QUESTIONS[index]!;
  const code = state.answers[q.id] ?? "";
  const left = state.startedAt + DURATION_MS - now;

  const submit = useCallback(() => {
    const results = HTML_MOCK_QUESTIONS.map((x) => gradeHtml(x, state.answers[x.id] ?? ""));
    onChange({ ...state, results });
  }, [state, onChange]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (left <= 0) submit();
  }, [left, submit]);

  const setCode = (v: string) => onChange({ ...state, answers: { ...state.answers, [q.id]: v } });
  const run = () => {
    setPreview((p) => ({ ...p, [q.id]: code }));
    setRunId((n) => n + 1);
  };
  const check = () => {
    run();
    setChecked((c) => ({ ...c, [q.id]: gradeHtml(q, code) }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const t = e.currentTarget, s = t.selectionStart, end = t.selectionEnd;
      setCode(code.slice(0, s) + "  " + code.slice(end));
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; });
    }
  };

  const result = checked[q.id];
  const attempted = useMemo(
    () => new Set(HTML_MOCK_QUESTIONS.filter((x) => (state.answers[x.id] ?? "").trim() !== x.starter.trim()).map((x) => x.id)),
    [state.answers],
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-t-lg bg-[#282a35] px-4 py-2 text-white">
        <span className="font-semibold">{HTML_MOCK_TITLE}</span>
        <span className="text-xs text-white/60">Guest: {state.name}</span>
        <nav className="flex gap-1" aria-label="Questions">
          {HTML_MOCK_QUESTIONS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={cx(
                "h-8 w-8 rounded text-sm font-semibold",
                i === index ? "bg-white text-[#282a35]" : attempted.has(x.id) ? "bg-[#04aa6d]" : "bg-white/10 hover:bg-white/20",
              )}
            >
              {i + 1}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className={cx("rounded px-3 py-1 font-mono text-sm", left < 5 * 60_000 ? "bg-red-600" : "bg-white/10")} aria-label="Time left" data-testid="timer">
            ⏱ {fmtClock(left)}
          </span>
          <button
            type="button"
            onClick={() => { if (confirm("Submit the test? You can't change your code after submitting.")) submit(); }}
            className="rounded bg-amber-500 px-4 py-1.5 text-sm font-semibold text-[#282a35] hover:bg-amber-400"
            data-testid="submit-coding-test"
          >
            Submit test
          </button>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-b-lg border border-[#282a35] lg:grid-cols-[minmax(260px,1fr)_1.4fr_1.4fr]">
        <section className="space-y-4 overflow-auto bg-surface p-4 lg:max-h-[78vh]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Question {index + 1} of {HTML_MOCK_QUESTIONS.length} · {q.marks} marks</p>
            <h2 className="mt-1 text-lg font-semibold">{q.title}</h2>
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {q.task.map((t) => <li key={t}>{t}</li>)}
          </ol>
          <div>
            <h3 className="text-sm font-semibold">Checks</h3>
            <ul className="mt-2 space-y-1 text-sm" data-testid="check-list">
              {q.checks.map((c, i) => {
                const r = result?.checks[i];
                return (
                  <li key={c.label} className="flex gap-2">
                    <span aria-hidden className={cx("w-4 shrink-0 text-center", !r ? "text-muted" : r.passed ? "text-green-600" : "text-red-600")}>
                      {!r ? "○" : r.passed ? "✓" : "✗"}
                    </span>
                    <span className={cx(!r && "text-muted")}>{c.label}</span>
                  </li>
                );
              })}
            </ul>
            {result && <p className="mt-2 text-sm font-semibold">Score: {result.score} / {result.marks}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-40">
              ❮ Prev
            </button>
            <button type="button" disabled={index === HTML_MOCK_QUESTIONS.length - 1} onClick={() => setIndex(index + 1)} className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-40">
              Next ❯
            </button>
          </div>
        </section>

        <div className="flex flex-col border-t border-[#282a35] lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 bg-[#1d1f27] px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">index.html</span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => { if (confirm("Reset this question to the starter code?")) setCode(q.starter); }}
                className="rounded border border-white/30 px-3 py-1 text-xs text-white hover:bg-white/10"
              >
                Reset
              </button>
              <button type="button" onClick={run} className="rounded bg-[#04aa6d] px-4 py-1 text-xs font-semibold text-white hover:bg-[#059862]" data-testid="run-code">
                Run ❯
              </button>
              <button type="button" onClick={check} className="rounded bg-primary px-4 py-1 text-xs font-semibold text-white" data-testid="check-code">
                Check code
              </button>
            </div>
          </div>
          <label className="sr-only" htmlFor="coding-editor">Code for question {index + 1}</label>
          <textarea
            id="coding-editor"
            key={q.id}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="min-h-[50vh] flex-1 resize-none bg-[#1d1f27] p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none lg:min-h-[74vh]"
            data-testid="code-editor"
          />
        </div>

        <div className="flex min-h-[40vh] flex-col border-t border-[#282a35] bg-white lg:border-l lg:border-t-0">
          <p className="border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Live preview</p>
          {/* Empty sandbox: no scripts, no same-origin access, forms can't submit. */}
          <iframe key={`${q.id}-${runId}`} title="Live preview" sandbox="" srcDoc={preview[q.id] ?? ""} className="w-full flex-1 bg-white" style={{ minHeight: 300 }} />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">Your code is saved in this browser as you type. Press Ctrl+Enter to run.</p>
    </div>
  );
}

function Results({ state, onRetake }: { state: Saved; onRetake: () => void }) {
  const results = state.results!;
  const total = Math.round(results.reduce((n, r) => n + r.score, 0) * 10) / 10;
  const pct = Math.round((total / TOTAL_MARKS) * 100);
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted">{HTML_MOCK_TITLE} · {state.name}</p>
        <h1 className="mt-1 text-3xl font-bold" data-testid="coding-score">{total} / {TOTAL_MARKS}</h1>
        <p className={cx("mt-1 font-semibold", pct >= 60 ? "text-green-700" : "text-amber-700")}>{pct}% · {pct >= 60 ? "Passed" : "Keep practising"}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onRetake} className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white">Retake test</button>
          <Link href="/student/register" className="rounded-lg border border-border px-5 py-2.5 font-medium">Register to save your results</Link>
        </div>
      </header>
      {HTML_MOCK_QUESTIONS.map((q, i) => {
        const r = results.find((x) => x.id === q.id)!;
        return (
          <section key={q.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Q{i + 1}. {q.title}</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-semibold">{r.score} / {r.marks}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {r.checks.map((c) => (
                <li key={c.label} className="flex gap-2">
                  <span aria-hidden className={c.passed ? "text-green-600" : "text-red-600"}>{c.passed ? "✓" : "✗"}</span>
                  {c.label}
                </li>
              ))}
            </ul>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-primary">Your code</summary>
              <pre className="mt-2 max-h-72 overflow-auto rounded bg-[#1d1f27] p-3 text-xs text-slate-100">{state.answers[q.id]}</pre>
            </details>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
