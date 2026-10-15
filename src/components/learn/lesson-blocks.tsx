import { Fragment, type ReactNode } from "react";
import type { Block } from "@/lib/learn/types";
import { PathFigure, SeatsFigure, SeriesFigure, StackFigure, StepsFigure, TreeFigure, VennFigure } from "./lesson-visuals";

/** Renders **bold** and `code` inside lesson text. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-rose-700">
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Callout({ icon, title, tone, children }: { icon: string; title: string; tone: string; children: ReactNode }) {
  return (
    <div className={`avoid-break rounded-xl border-l-4 px-4 py-3 ${tone}`}>
      <p className="text-xs font-bold uppercase tracking-wider">
        {icon} {title}
      </p>
      <div className="mt-1 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

export function LessonBlock({ block, lang }: { block: Block; lang: "en" | "hi" }) {
  const hi = lang === "hi";
  switch (block.t) {
    case "p":
      return (
        <p className="text-[15px] leading-relaxed">
          <Rich text={block.text} />
        </p>
      );
    case "analogy":
      return (
        <Callout icon="💡" title={hi ? "ऐसे समझें" : "Think of it like this"} tone="border-sky-400 bg-sky-50 text-sky-950">
          <Rich text={block.text} />
        </Callout>
      );
    case "trap":
      return (
        <Callout icon="⚠" title={hi ? "परीक्षा का जाल" : "Exam trap"} tone="border-rose-400 bg-rose-50 text-rose-950">
          <Rich text={block.text} />
        </Callout>
      );
    case "trick":
      return (
        <Callout icon="🧠" title={hi ? "याद रखने की ट्रिक" : "Memory trick"} tone="border-violet-400 bg-violet-50 text-violet-950">
          <Rich text={block.text} />
        </Callout>
      );
    case "points":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <Rich text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <figure className="avoid-break">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {block.head.map((h, i) => (
                    <th key={i} className="border-b border-border px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50/60">
                    {r.map((c, j) => (
                      <td key={j} className={`border-b border-border px-3 py-2 align-top ${j === 0 ? "font-medium" : ""}`}>
                        <Rich text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption className="mt-1 text-xs text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "code":
      return (
        <figure className="avoid-break overflow-hidden rounded-xl border border-slate-800">
          <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
            <span className="font-mono uppercase">{block.lang}</span>
          </div>
          <pre className="overflow-x-auto bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">{block.code}</pre>
          {block.output !== undefined && (
            <div className="border-t border-slate-700 bg-slate-950 px-4 py-2 font-mono text-[13px] text-green-300">
              <span className="mr-2 text-slate-500">{hi ? "आउटपुट" : "Output"} ▸</span>
              <span className="whitespace-pre-wrap">{block.output}</span>
            </div>
          )}
          {block.note && (
            <figcaption className="bg-amber-50 px-4 py-2 text-sm text-amber-950">
              <Rich text={block.note} />
            </figcaption>
          )}
        </figure>
      );
    case "example":
      return (
        <div className="avoid-break rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">✏ {hi ? "हल किया उदाहरण" : "Solved example"}</p>
          <p className="mt-1 font-semibold">
            <Rich text={block.title} />
          </p>
          <ol className="mt-2 space-y-1.5">
            {block.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">
                  <Rich text={s} />
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-lg bg-white px-3 py-2 font-semibold text-emerald-900 ring-1 ring-emerald-200">
            ✅ <Rich text={block.answer} />
          </p>
        </div>
      );
    case "formula":
      return (
        <div className="avoid-break rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">📐 {hi ? "सूत्र" : "Formulas"}</p>
          <dl className="mt-2 grid gap-2">
            {block.items.map(([name, f], i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <dt className="text-sm text-indigo-900">{name}</dt>
                <dd className="font-mono text-[14px] font-semibold text-indigo-950">{f}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "exam":
      return (
        <div className="avoid-break rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">🎯 {hi ? "परीक्षा में ऐसे पूछा जाता है" : "How exams ask this"}</p>
          <ul className="mt-2 space-y-1.5">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2 text-[15px] text-emerald-950">
                <span aria-hidden className="font-bold">→</span>
                <span>
                  <Rich text={it} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "recap":
      return (
        <div className="avoid-break rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">⏱ {hi ? "30 सेकंड में दोहराएँ" : "Recap in 30 seconds"}</p>
          <ul className="mt-2 space-y-1.5">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2 text-[15px] text-amber-950">
                <span aria-hidden>✔</span>
                <span>
                  <Rich text={it} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "diagram":
      return (
        <figure className="avoid-break">
          <pre className="overflow-x-auto rounded-xl border border-border bg-white p-4 font-mono text-[13px] leading-snug">{block.text}</pre>
          {block.caption && <figcaption className="mt-1 text-xs text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "venn":
      return <VennFigure block={block} />;
    case "seats":
      return <SeatsFigure block={block} />;
    case "path":
      return <PathFigure block={block} />;
    case "tree":
      return <TreeFigure block={block} />;
    case "stack":
      return <StackFigure block={block} />;
    case "series":
      return <SeriesFigure block={block} />;
    case "steps":
      return <StepsFigure block={block} />;
  }
}
