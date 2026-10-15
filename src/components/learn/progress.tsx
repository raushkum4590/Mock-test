"use client";

/**
 * Per-viewer lesson progress kept in localStorage (a convenience only: it
 * stays on this device and the page works without it).
 */
import { useSyncExternalStore } from "react";
import { cx } from "@/components/ui";

const KEY = "edqity-learn-done";
const EVENT = "edqity-learn-progress";

function read(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage blocked: progress just isn't remembered
  }
  window.dispatchEvent(new Event(EVENT));
}

let cache: { raw: string | null; list: string[] } = { raw: null, list: [] };
function snapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cache.raw) cache = { raw, list: read() };
  return cache.list;
}
const EMPTY: string[] = [];

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useDone(): string[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** "Mark as done" toggle for one lesson. */
export function DoneButton({ slug, lang }: { slug: string; lang: "en" | "hi" }) {
  const done = useDone().includes(slug);
  const hi = lang === "hi";
  return (
    <button
      type="button"
      onClick={() => {
        const list = read();
        write(done ? list.filter((s) => s !== slug) : [...list, slug]);
      }}
      className={cx(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition",
        done ? "border-green-300 bg-green-50 text-green-800" : "border-primary bg-primary text-white hover:brightness-110",
      )}
    >
      {done ? (hi ? "✓ पूरा हुआ" : "✓ Completed") : hi ? "पूरा हुआ चिह्नित करें" : "Mark lesson as done"}
    </button>
  );
}

/** Tick shown next to a lesson in lists. */
export function DoneTick({ slug }: { slug: string }) {
  const done = useDone().includes(slug);
  return (
    <span aria-hidden className={cx("grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold", done ? "border-green-500 bg-green-500 text-white" : "border-border text-transparent")}>
      ✓
    </span>
  );
}

/** Progress bar for a set of lessons (a module or the whole course). */
export function ProgressBar({ slugs, lang, light }: { slugs: string[]; lang: "en" | "hi"; light?: boolean }) {
  const done = useDone();
  const n = slugs.filter((s) => done.includes(s)).length;
  const pct = slugs.length ? Math.round((n / slugs.length) * 100) : 0;
  return (
    <div className="w-full">
      <div className={cx("h-2 overflow-hidden rounded-full", light ? "bg-white/20" : "bg-slate-200")}>
        <div className={cx("h-full rounded-full transition-all", light ? "bg-white" : "bg-green-500")} style={{ width: `${pct}%` }} />
      </div>
      <p className={cx("mt-1 text-xs", light ? "text-white/80" : "text-muted")}>
        {n} / {slugs.length} {lang === "hi" ? "पाठ पूरे" : "lessons done"} · {pct}%
      </p>
    </div>
  );
}
