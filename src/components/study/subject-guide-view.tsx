import Link from "next/link";
import type { Lang } from "@/lib/i18n/dictionary";
import { findCourse, LEARN_BASE } from "@/lib/learn/courses";
import { pick } from "@/lib/study-material/resources";
import { SUBJECT_GUIDES, type GuideRef, type SubjectGuide } from "@/lib/study-material/subject-guides";
import { cx } from "@/components/ui";
import { CapsuleQuiz } from "./capsule-quiz";

/** Accent per module, cycled: [number badge, card border, tip box]. */
const TONES = [
  ["bg-indigo-600", "border-indigo-200", "bg-indigo-50 border-indigo-200 text-indigo-950"],
  ["bg-teal-600", "border-teal-200", "bg-teal-50 border-teal-200 text-teal-950"],
  ["bg-orange-500", "border-orange-200", "bg-orange-50 border-orange-200 text-orange-950"],
  ["bg-violet-600", "border-violet-200", "bg-violet-50 border-violet-200 text-violet-950"],
  ["bg-sky-600", "border-sky-200", "bg-sky-50 border-sky-200 text-sky-950"],
  ["bg-rose-600", "border-rose-200", "bg-rose-50 border-rose-200 text-rose-950"],
] as const;

const REF_STYLE: Record<GuideRef["kind"], string> = {
  ncert: "border-indigo-200 bg-white text-indigo-900 hover:border-indigo-400",
  nios: "border-teal-200 bg-white text-teal-900 hover:border-teal-400",
  web: "border-slate-200 bg-white text-slate-800 hover:border-slate-400",
  app: "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400",
};
const KIND_LABEL: Record<GuideRef["kind"], { en: string; hi: string }> = {
  ncert: { en: "NCERT", hi: "एनसीईआरटी" },
  nios: { en: "NIOS", hi: "एनआईओएस" },
  web: { en: "Official", hi: "आधिकारिक" },
  app: { en: "On EdQity", hi: "यहीं" },
};

/** Chips to switch between subject guides. */
export function GuideSwitcher({ active, lang }: { active?: string; lang: Lang }) {
  return (
    <nav aria-label={lang === "hi" ? "विषय" : "Subjects"} className="no-print -mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2 pb-1">
        {SUBJECT_GUIDES.map((g) => (
          <li key={g.id}>
            <Link
              // Subjects with a full course open it; their guide is only the revision checklist.
              href={findCourse(g.id) ? `${LEARN_BASE}/${g.id}` : `/study-material/subjects/${g.id}`}
              aria-current={g.id === active ? "page" : undefined}
              className={cx(
                "block whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium",
                g.id === active ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary hover:text-primary",
              )}
            >
              {pick(g.title, lang).split(" — ")[0]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RefChip({ r, lang }: { r: GuideRef; lang: Lang }) {
  const label = pick(r.label, lang);
  const cls = cx("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", REF_STYLE[r.kind]);
  const tag = <span className="rounded bg-slate-100 px-1 text-[10px] font-semibold uppercase text-muted">{KIND_LABEL[r.kind][lang]}</span>;
  if (r.kind === "app") {
    return (
      <Link href={r.url} className={cls}>
        {tag}
        {label} →
      </Link>
    );
  }
  // Hindi readers get the Hindi-medium NCERT PDF when it exists.
  const href = lang === "hi" && r.hiUrl ? r.hiUrl : r.url;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {tag}
      {label}
      {r.kind === "ncert" ? " · PDF" : ""} ↗
    </a>
  );
}

export function SubjectGuideBooklet({ guide, lang }: { guide: SubjectGuide; lang: Lang }) {
  const hi = lang === "hi";
  const ncertCount = guide.modules.reduce((n, m) => n + m.refs.filter((r) => r.kind === "ncert").length, 0);
  const topicCount = guide.modules.reduce((n, m) => n + m.topics.length, 0);
  const mcqCount = guide.modules.reduce((n, m) => n + (m.mcqs?.length ?? 0), 0);

  return (
    <article className="capsule space-y-8">
      {/* Cover */}
      <header className="avoid-break overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-6 text-white shadow-md md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{hi ? "विषय गाइड" : "Subject guide"}</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{pick(guide.title, lang)}</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/85">{pick(guide.subtitle, lang)}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
          {(
            [
              [hi ? "मॉड्यूल" : "Modules", guide.modules.length],
              [hi ? "विषय" : "Topics", topicCount],
              [hi ? "एनसीईआरटी अध्याय" : "NCERT chapters", ncertCount],
              ...(mcqCount ? [[hi ? "अभ्यास प्रश्न" : "Practice MCQs", mcqCount]] : []),
            ] as [string, number][]
          ).map(([label, n]) => (
            <div key={label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <dd className="text-2xl font-bold tabular-nums">{n}</dd>
              <dt className="text-[11px] text-white/75">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-white/75">
          {hi ? "किन परीक्षाओं में: " : "Asked in: "}
          {guide.exams}
        </p>
      </header>

      {/* Contents */}
      <section className="avoid-break rounded-xl border border-border bg-surface p-5">
        <h2 className="font-bold">{hi ? "विषय-सूची" : "Contents"}</h2>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {guide.modules.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-6 shrink-0 text-right font-semibold tabular-nums text-muted">{i + 1}</span>
              <a href={`#m${i + 1}`} className="hover:text-primary hover:underline">
                {pick(m.title, lang)}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* Modules */}
      <div className="space-y-5">
        {guide.modules.map((m, i) => {
          const [badge, border, tipBox] = TONES[i % TONES.length]!;
          return (
            <section key={i} id={`m${i + 1}`} className={cx("avoid-break scroll-mt-24 rounded-xl border-2 bg-surface p-5 shadow-sm", border)}>
              <h2 className="flex items-start gap-3 text-lg font-bold">
                <span className={cx("grid size-9 shrink-0 place-items-center rounded-lg text-sm font-extrabold text-white", badge)}>{i + 1}</span>
                <span className="pt-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {hi ? "मॉड्यूल" : "Module"} {i + 1}
                  </span>
                  {pick(m.title, lang)}
                </span>
              </h2>
              <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm md:grid-cols-2">
                {m.topics.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden className="mt-0.5 text-muted">☐</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              {m.hot && m.hot.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">🔥 {hi ? "बार-बार पूछे जाते हैं" : "Asked again and again"}</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.hot.map((h) => (
                      <li key={h} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-900">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className={cx("mt-3 rounded-lg border px-3 py-2 text-sm", tipBox)}>
                <strong>{hi ? "कैसे पूछा जाता है: " : "How it's asked: "}</strong>
                {pick(m.tip, lang)}
              </p>
              {m.refs.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{hi ? "पढ़ें (निःशुल्क, आधिकारिक)" : "Read (free, official)"}</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.refs.map((r) => (
                      <li key={r.url + pick(r.label, "en")}>
                        <RefChip r={r} lang={lang} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {m.mcqs && m.mcqs.length > 0 && (
                <details className="group mt-4 rounded-lg border border-border bg-slate-50/60 p-3 open:bg-surface" open={i === 0}>
                  <summary className="cursor-pointer select-none text-sm font-semibold text-primary">
                    ✍ {hi ? `त्वरित अभ्यास — ${m.mcqs.length} प्रश्न` : `Quick check — ${m.mcqs.length} MCQs`}
                    <span className="ml-1 font-normal text-muted">{hi ? "(विकल्प पर टैप करें)" : "(tap an option)"}</span>
                  </summary>
                  <div className="mt-3">
                    <CapsuleQuiz quiz={m.mcqs} lang={lang} />
                  </div>
                  <p className="print-only mt-2 text-xs">
                    {hi ? "उत्तर: " : "Answers: "}
                    {m.mcqs.map((q, j) => `${j + 1}-${"ABCD"[q.answer]}`).join("  ")}
                  </p>
                </details>
              )}
            </section>
          );
        })}
      </div>

      {/* Exam focus */}
      {guide.examFocus && (
        <section className="avoid-break">
          <h2 className="text-lg font-bold">{hi ? "हर परीक्षा के लिए इसका उपयोग कैसे करें" : "How to use this for each exam"}</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="border-b border-border px-3 py-2">{hi ? "परीक्षा" : "Exam"}</th>
                  <th className="border-b border-border px-3 py-2">{hi ? "मुख्य फ़ोकस" : "Main focus"}</th>
                </tr>
              </thead>
              <tbody>
                {guide.examFocus.map((r) => (
                  <tr key={r.exam} className="odd:bg-white even:bg-slate-50/60">
                    <td className="border-b border-border px-3 py-2 font-semibold">{r.exam}</td>
                    <td className="border-b border-border px-3 py-2">{pick(r.focus, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Daily routine */}
      {guide.routine && (
        <section className="avoid-break">
          <h2 className="text-lg font-bold">
            {hi ? "दैनिक दिनचर्या" : "Daily routine"} · {guide.routine.reduce((n, r) => n + r.minutes, 0) / 60} {hi ? "घंटे" : "hours"}
          </h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guide.routine.map((r, i) => (
              <li key={i} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-2xl font-extrabold text-primary">
                  {r.minutes} <span className="text-sm font-semibold">{hi ? "मिनट" : "min"}</span>
                </p>
                <p className="mt-1 font-semibold">{pick(r.what, lang)}</p>
                <p className="mt-1 text-sm text-muted">{pick(r.how, lang)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Practice + official */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-950">{hi ? "अभ्यास करें" : "Practise"}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {guide.practice.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="font-medium text-amber-900 hover:underline">
                  {pick(p.label, lang)} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {guide.official && (
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-bold">{hi ? "आधिकारिक पाठ्यक्रम" : "Official syllabus"}</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {guide.official.map((o) => (
                <li key={o.url}>
                  <a href={o.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {o.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {guide.note && <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">⚠ {pick(guide.note, lang)}</p>}

      <footer className="border-t border-border pt-4 text-xs text-muted">
        {hi
          ? "सभी पुस्तकें और सामग्री उनकी आधिकारिक वेबसाइट पर खुलती हैं; कॉपीराइट संबंधित प्रकाशक का है।"
          : "All books and material open on their official websites; copyright belongs to the respective publishers."}
      </footer>
    </article>
  );
}
