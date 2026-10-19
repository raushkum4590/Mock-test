"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildTryItDocument, prepareReactSource, TRYIT_VENDOR_FILES, type TryItMessage, type TryItMode } from "@/lib/learn/try-it-runtime";
import { cx } from "@/components/ui";

type Line = { level: TryItMessage["level"]; text: string };

let vendorText: Promise<string> | null = null;
/** React's browser builds, served from /vendor/tryit and inlined into each run (the CSP blocks CDN scripts). */
function loadVendor() {
  vendorText ??= Promise.all(
    TRYIT_VENDOR_FILES.map((f) =>
      fetch(`/vendor/tryit/${f}.js`).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${f}.js (${r.status})`);
        return r.text();
      }),
    ),
  )
    .then((parts) => parts.join("\n;\n"))
    .catch((e) => {
      vendorText = null;
      throw e;
    });
  return vendorText;
}

async function compile(mode: TryItMode, src: string) {
  if (mode === "js") return src;
  const { transform } = await import("sucrase");
  return transform(prepareReactSource(src), { transforms: ["jsx"], jsxRuntime: "classic", production: true }).code;
}

/** Compiles the code and builds the iframe document, or returns the error to show in the console. */
async function prepare(mode: TryItMode, src: string): Promise<{ doc: string | null; error?: string }> {
  try {
    const [compiled, vendor] = await Promise.all([compile(mode, src), mode === "react" ? loadVendor() : Promise.resolve("")]);
    return { doc: buildTryItDocument({ mode, compiled, vendor }) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { doc: null, error: msg.startsWith("Could not load") ? msg : `SyntaxError: ${msg}` };
  }
}

export function TryItEditor({
  initialCode, mode, title, backHref, prevHref, nextHref, position, lang,
}: { initialCode: string; mode: TryItMode; title: string; backHref: string; prevHref?: string; nextHref?: string; position: string; lang: "en" | "hi" }) {
  const hi = lang === "hi";
  const [code, setCode] = useState(initialCode);
  const [doc, setDoc] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  const apply = useCallback((r: { doc: string | null; error?: string }) => {
    setDoc(r.doc);
    setLines(r.error ? [{ level: "error", text: r.error }] : []);
    setRunId((n) => n + 1);
    setBusy(false);
  }, []);

  const run = useCallback((src: string) => {
    setBusy(true);
    prepare(mode, src).then(apply);
  }, [mode, apply]);

  // Show the result straight away, like opening the example in a new tab.
  useEffect(() => {
    let cancelled = false;
    prepare(mode, initialCode).then((r) => { if (!cancelled) apply(r); });
    return () => { cancelled = true; };
  }, [initialCode, mode, apply]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const data = e.data as TryItMessage;
      if (!data || data.__tryit !== true) return;
      setLines((prev) => (prev.length > 300 ? prev : [...prev, { level: data.level, text: String(data.text) }]));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run(code);
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const t = e.currentTarget, s = t.selectionStart, end = t.selectionEnd;
      const next = code.slice(0, s) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; });
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-t-lg bg-[#282a35] px-4 py-2 text-white">
        <Link href={backHref} className="text-sm text-white/80 hover:text-white">
          ← {hi ? "पाठ पर वापस" : "Back to the lesson"}
        </Link>
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-white/60">{position}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {prevHref && (
            <Link href={prevHref} className="rounded px-2 py-1 text-sm text-white/80 hover:bg-white/10">
              ❮ {hi ? "पिछला उदाहरण" : "Prev example"}
            </Link>
          )}
          {nextHref && (
            <Link href={nextHref} className="rounded px-2 py-1 text-sm text-white/80 hover:bg-white/10">
              {hi ? "अगला उदाहरण" : "Next example"} ❯
            </Link>
          )}
          <button type="button" onClick={() => { setCode(initialCode); run(initialCode); }} className="rounded border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10">
            {hi ? "रीसेट" : "Reset"}
          </button>
          <button type="button" onClick={() => run(code)} disabled={busy} className="rounded bg-[#04aa6d] px-5 py-1.5 font-semibold hover:bg-[#059862] disabled:opacity-60">
            {busy ? "…" : hi ? "चलाएँ ❯" : "Run ❯"}
          </button>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-b-lg border border-[#282a35] lg:grid-cols-2">
        <label className="sr-only" htmlFor="tryit-code">{hi ? "कोड" : "Code"}</label>
        <textarea
          id="tryit-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="min-h-[50vh] resize-none bg-[#1d1f27] p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none lg:min-h-[75vh]"
        />
        <div className="flex min-h-[50vh] flex-col bg-white lg:min-h-[75vh]">
          <p className="border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{hi ? "परिणाम" : "Result"}</p>
          {doc ? (
            <iframe key={runId} ref={frame} title={hi ? "परिणाम" : "Result"} sandbox="allow-scripts" srcDoc={doc} className="w-full flex-1 bg-white" style={{ minHeight: 260 }} />
          ) : (
            <div className="flex-1" />
          )}
          <div className="max-h-56 min-h-24 overflow-auto border-t border-slate-200 bg-slate-950 px-4 py-2 font-mono text-[12.5px] leading-relaxed">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">Console</p>
            {lines.length === 0 && <p className="text-slate-500">{hi ? "console.log(...) का आउटपुट यहाँ दिखेगा।" : "Output from console.log(...) appears here."}</p>}
            {lines.map((l, i) => (
              <p key={i} className={cx("whitespace-pre-wrap wrap-break-word", l.level === "error" ? "text-red-300" : l.level === "warn" ? "text-amber-200" : "text-slate-100")}>
                {l.text}
              </p>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        {hi
          ? "कोड एक सुरक्षित सैंडबॉक्स में चलता है। Ctrl+Enter से चलाएँ। बदलाव सहेजे नहीं जाते।"
          : `Runs in a secure sandbox${mode === "react" ? " with React 18, the hooks, render() and a mock GitHub API preloaded" : ""}. Press Ctrl+Enter to run. Changes aren't saved.`}
      </p>
    </div>
  );
}
