import Link from "next/link";
import { notFound } from "next/navigation";
import pdfs from "@/data/current-affairs/pdfs.json";
import { getUiLang } from "@/lib/i18n/server-lang";
import { COURSES, courseHref, courseStats, findCourse } from "@/lib/learn/courses";
import { lessonSlug, progressKey } from "@/lib/learn/util";
import { DoneTick, ProgressBar } from "@/components/learn/progress";
import { StudyHeader } from "@/components/study/study-ui";

const PDFS = pdfs as Record<string, string>;

const TONES = ["bg-indigo-600", "bg-teal-600", "bg-orange-500", "bg-violet-600", "bg-sky-600", "bg-rose-600"];

export function generateStaticParams() {
  return COURSES.map((c) => ({ course: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const c = findCourse((await params).course);
  return { title: c ? `${c.short} course` : "Course" };
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const c = findCourse((await params).course);
  if (!c) notFound();
  const lang = await getUiLang();
  const hi = lang === "hi";
  const base = courseHref(c);
  const { lessons, minutes, questions } = courseStats(c);
  const all = lessons.map((r) => progressKey(c, r.slug));
  const pdf = PDFS[`learn:${c.id}`];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <StudyHeader lang={lang} active="/study-material/learn" title={hi ? c.titleHi : c.title} />

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-6 text-white shadow-md md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{c.tagline}</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">{hi ? c.titleHi : c.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/85">{hi ? c.subtitleHi : c.subtitle}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [hi ? "मॉड्यूल" : "Modules", c.modules.length],
            [hi ? "पाठ" : "Lessons", lessons.length],
            [hi ? "घंटे" : "Hours", Math.max(1, Math.round(minutes / 60))],
            [hi ? "क्विज़ प्रश्न" : "Quiz questions", questions],
          ].map(([label, n]) => (
            <div key={label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <dd className="text-2xl font-bold tabular-nums">{n}</dd>
              <dt className="text-[11px] text-white/75">{label}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={`${base}/${lessons[0]!.slug}`} className="rounded-md bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-white/90">
            {hi ? "पहला पाठ शुरू करें →" : "Start lesson 1 →"}
          </Link>
          {pdf ? (
            <a href={pdf} download className="rounded-md bg-white/15 px-5 py-2.5 text-sm font-bold ring-1 ring-white/40 hover:bg-white/25">
              ⬇ {hi ? "पूरा कोर्स पीडीएफ़" : "Download course PDF"}
            </a>
          ) : (
            <Link href={`${base}/book`} className="rounded-md bg-white/15 px-5 py-2.5 text-sm font-bold ring-1 ring-white/40 hover:bg-white/25">
              📖 {hi ? "पूरी किताब देखें / प्रिंट करें" : "Full book / print"}
            </Link>
          )}
          <div className="w-64 max-w-full">
            <ProgressBar slugs={all} lang={lang} light />
          </div>
        </div>
        {hi && <p className="mt-4 text-xs text-white/70">पाठ अभी अंग्रेज़ी में हैं।</p>}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {c.modules.map((m, i) => {
          const keys = m.lessons.map((l) => progressKey(c, lessonSlug(m, l)));
          return (
            <section key={m.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <header className="flex items-start gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-base font-extrabold text-white ${TONES[i % TONES.length]}`}>{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold leading-tight">{hi ? m.titleHi : m.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{m.blurb}</p>
                </div>
              </header>
              <ol className="mt-4 space-y-1">
                {m.lessons.map((l, j) => (
                  <li key={l.id}>
                    <Link href={`${base}/${lessonSlug(m, l)}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                      <DoneTick slug={progressKey(c, lessonSlug(m, l))} />
                      <span className="w-8 shrink-0 text-xs font-semibold tabular-nums text-muted">
                        {i + 1}.{j + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium group-hover:text-primary">{l.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {l.minutes} {hi ? "मि" : "min"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              {m.practice && m.practice.length > 0 && (
                <Link
                  href={`${base}/${lessonSlug(m, m.lessons.at(-1)!)}#module-test`}
                  className="mt-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 hover:border-emerald-400"
                >
                  🏆 {hi ? `मॉड्यूल टेस्ट — ${m.practice.length} प्रश्न` : `Module test — ${m.practice.length} exam-level questions`}
                </Link>
              )}
              <div className="mt-auto pt-4">
                <ProgressBar slugs={keys} lang={lang} />
              </div>
            </section>
          );
        })}
      </div>

      {c.links && c.links.length > 0 && (
        <section className="grid gap-3 md:grid-cols-3">
          {c.links.map((l, i) =>
            l.href.startsWith("http") ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-surface p-4 hover:border-primary">
                <p className="font-semibold">{hi ? l.titleHi : l.title} ↗</p>
                <p className="text-sm text-muted">{hi ? l.subHi : l.sub}</p>
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={i === 0 ? "rounded-xl border border-amber-200 bg-amber-50 p-4 hover:border-amber-400" : "rounded-xl border border-border bg-surface p-4 hover:border-primary"}
              >
                <p className={i === 0 ? "font-semibold text-amber-950" : "font-semibold"}>{hi ? l.titleHi : l.title}</p>
                <p className={i === 0 ? "text-sm text-amber-900/80" : "text-sm text-muted"}>{hi ? l.subHi : l.sub}</p>
              </Link>
            ),
          )}
        </section>
      )}
    </div>
  );
}
