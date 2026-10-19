"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { CodeLang } from "@/lib/learn/types";
import { cx } from "@/components/ui";

const LANGS: [CodeLang, string][] = [
  ["python", "Python"],
  ["c", "C"],
  ["cpp", "C++"],
  ["java", "Java"],
  ["javascript", "JavaScript"],
];
const KEY = "learn:code-lang";
const EVENT = "learn:code-lang";

// The chosen language is shared by every code block on the page and remembered between visits.
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
function readLang(): CodeLang {
  try {
    const saved = localStorage.getItem(KEY);
    return LANGS.some(([l]) => l === saved) ? (saved as CodeLang) : "python";
  } catch {
    return "python";
  }
}
function chooseLang(lang: CodeLang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // storage blocked: the choice still applies until the page reloads
  }
  window.dispatchEvent(new Event(EVENT));
}

/** A program shown in five languages with tabs, its output, and a Try it link for the JavaScript version. */
export function MultiCode({
  title, code, output, note, tryItHref, lang: uiLang,
}: { title?: string; code: Record<CodeLang, string>; output?: string; note?: ReactNode; tryItHref?: string; lang: "en" | "hi" }) {
  const hi = uiLang === "hi";
  const lang = useSyncExternalStore(subscribe, readLang, () => "python" as CodeLang);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      ?.writeText(code[lang])
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <figure className="avoid-break rounded-lg bg-[#e7e9eb] p-4 text-slate-900">
      <p className="mb-2 text-lg font-semibold">{title ?? (hi ? "उदाहरण" : "Example")}</p>
      <div className="no-print flex flex-wrap items-end gap-1" role="tablist" aria-label={hi ? "प्रोग्रामिंग भाषा" : "Programming language"}>
        {LANGS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={lang === id}
            onClick={() => chooseLang(id)}
            className={cx(
              "rounded-t-md px-3 py-1.5 text-sm font-semibold",
              lang === id ? "bg-[#04aa6d] text-white" : "bg-white/60 text-slate-700 hover:bg-white",
            )}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={copy} className="ml-auto rounded px-2 py-1 text-xs text-slate-600 hover:bg-white/70">
          {copied ? (hi ? "कॉपी हुआ ✓" : "Copied ✓") : hi ? "कॉपी करें" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto border-l-4 border-[#04aa6d] bg-white p-4 font-mono text-[13px] leading-relaxed" role="tabpanel">
        {code[lang]}
      </pre>
      {output !== undefined && (
        <div className="mt-2 rounded bg-white/70 px-4 py-2 font-mono text-[13px]">
          <span className="mr-2 text-slate-500">{hi ? "आउटपुट" : "Output"} ▸</span>
          <span className="whitespace-pre-wrap">{output}</span>
          <span className="ml-2 text-xs text-slate-500">({hi ? "सभी भाषाओं में एक जैसा" : "same in every language"})</span>
        </div>
      )}
      {note && <figcaption className="mt-2 text-sm">{note}</figcaption>}
      <div className="no-print mt-3 flex flex-wrap items-center gap-3">
        {tryItHref && lang === "javascript" && (
          <Link href={tryItHref} className="inline-block rounded bg-[#04aa6d] px-5 py-2 text-[15px] font-semibold text-white hover:bg-[#059862]">
            {hi ? "स्वयं आज़माएँ »" : "Try it Yourself »"}
          </Link>
        )}
        {lang !== "javascript" && (
          <p className="text-xs text-slate-600">
            {hi
              ? "इसे अपने एडिटर या किसी ऑनलाइन कंपाइलर में चलाएँ। ब्राउज़र में चलाने के लिए JavaScript टैब चुनें।"
              : "Run it in your own editor or an online compiler. Choose the JavaScript tab to run it right here in the browser."}
          </p>
        )}
      </div>
    </figure>
  );
}
