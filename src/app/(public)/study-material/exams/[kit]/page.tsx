import Link from "next/link";
import { notFound } from "next/navigation";
import { findPattern } from "@/lib/exam-patterns";
import { getUiLang } from "@/lib/i18n/server-lang";
import { findKit, type KitRef } from "@/lib/study-material/exam-kits";
import { pick } from "@/lib/study-material/resources";
import { cx } from "@/components/ui";
import { CopyrightNote, ExternalLink, StudyHeader } from "@/components/study/study-ui";

export async function generateMetadata({ params }: { params: Promise<{ kit: string }> }) {
  const kit = findKit((await params).kit);
  return { title: kit ? kit.title.en : "Exam kit" };
}

const REF_STYLE: Record<KitRef["kind"], string> = {
  ncert: "border-indigo-200 bg-indigo-50 text-indigo-900 hover:border-indigo-400",
  nios: "border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-400",
  web: "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400",
  app: "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400",
};

export default async function ExamKitPage({ params }: { params: Promise<{ kit: string }> }) {
  const kit = findKit((await params).kit);
  if (!kit) notFound();
  const lang = await getUiLang();
  const hi = lang === "hi";
  const pattern = findPattern(kit.patternId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <StudyHeader lang={lang} active="/study-material" title={pick(kit.title, lang)} subtitle={pick(kit.subtitle, lang)} />

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-6 text-white shadow-md md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{hi ? "परीक्षा किट" : "Exam kit"}</p>
        <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">{pick(kit.title, lang)}</h2>
        {pattern && (
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [hi ? "प्रश्न" : "Questions", String(pattern.sections.reduce((n, s) => n + s.questions, 0))],
              [hi ? "अवधि" : "Duration", `${pattern.durationMinutes} ${hi ? "मिनट" : "min"}`],
              [hi ? "ऋणात्मक अंकन" : "Negative marking", hi ? "विज्ञापन देखें" : "Check advert"],
              [hi ? "कंप्यूटर विज्ञान" : "Computer Science", `${kit.parts.find((p) => p.id === "cs")?.questions ?? 0} Q`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
                <dd className="text-xl font-bold">{value}</dd>
                <dt className="text-xs text-white/75">{label}</dt>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={kit.mocksHref} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/90">
            {hi ? "मॉक टेस्ट दें" : "Take a mock test"}
          </Link>
          <a href={kit.officialSyllabus} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            {hi ? "आधिकारिक पाठ्यक्रम (बीपीएससी) ↗" : "Official syllabus (BPSC) ↗"}
          </a>
          <Link href="/study-material/current-affairs/capsule" className="rounded-md bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            {hi ? "समसामयिकी कैप्सूल" : "Current affairs capsule"}
          </Link>
        </div>
        {pattern && !pattern.verified && (
          <p className="mt-4 text-xs text-white/75">
            {hi ? "परीक्षा पैटर्न आधिकारिक रूप से सत्यापित नहीं — विज्ञापन में पुष्टि करें।" : "Pattern not verified against the official advertisement — confirm before the exam."} {pattern.notes}
          </p>
        )}
      </section>

      {/* Parts & topics */}
      {kit.parts.map((part) => (
        <section key={part.id} className="rounded-xl border border-border bg-surface shadow-sm">
          <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">{pick(part.title, lang)}</h2>
              {part.note && <p className="mt-0.5 text-sm text-muted">{pick(part.note, lang)}</p>}
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
              {part.questions} {hi ? "प्रश्न" : "questions"}
            </span>
          </header>
          <ol className="divide-y divide-border">
            {part.topics.map((topic, i) => (
              <li key={i} className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-muted">{i + 1}.</span>
                  <h3 className="font-semibold">{pick(topic.title, lang)}</h3>
                  {topic.weight === "high" && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-semibold text-rose-800">{hi ? "अधिक प्रश्न" : "High weight"}</span>}
                </div>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {topic.refs.map((r) => (
                    <li key={r.url + r.label}>
                      {r.kind === "app" ? (
                        <Link href={r.url} className={cx("inline-block rounded-md border px-2 py-1 text-xs font-medium", REF_STYLE[r.kind])}>
                          {r.label} →
                        </Link>
                      ) : (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className={cx("inline-block rounded-md border px-2 py-1 text-xs font-medium", REF_STYLE[r.kind])}>
                          {r.label}
                          {r.kind === "ncert" ? " · PDF" : ""} ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* Plan + tips */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold">{hi ? "8 सप्ताह की अध्ययन योजना" : "8-week study plan"}</h2>
          <ol className="mt-4 space-y-3">
            {kit.plan.map((p) => (
              <li key={p.week} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-800">{p.week}</span>
                <span className="pt-1.5 text-sm">{pick(p.focus, lang)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-amber-900">{hi ? "परीक्षा टिप्स" : "Exam tips"}</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-950">
            {kit.tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>💡</span>
                <span>{pick(tip, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-sm text-muted">
        {hi ? "विषय-सूची एनसीईआरटी कक्षा 11–12 कंप्यूटर विज्ञान पर आधारित है। " : "The topic map follows NCERT Class 11–12 Computer Science. "}
        <ExternalLink href={kit.officialSyllabus}>{hi ? "बीपीएससी का आधिकारिक पाठ्यक्रम देखें" : "Check BPSC's official syllabus"}</ExternalLink>
      </p>
      <CopyrightNote lang={lang} />
    </div>
  );
}
