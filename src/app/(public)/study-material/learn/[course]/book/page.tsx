import Link from "next/link";
import { notFound } from "next/navigation";
import pdfs from "@/data/current-affairs/pdfs.json";
import { getUiLang } from "@/lib/i18n/server-lang";
import { courseHref, courseStats, findCourse } from "@/lib/learn/courses";
import { lessonSlug } from "@/lib/learn/util";
import { shuffleOptions } from "@/lib/learn/shuffle";
import { LessonBlock } from "@/components/learn/lesson-blocks";
import { PrintButton } from "@/components/study/print-button";

const PDFS = pdfs as Record<string, string>;
const LETTERS = ["A", "B", "C", "D"];

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const c = findCourse((await params).course);
  return { title: c ? `${c.short} course – full book` : "Course book" };
}

/** Printable question set with the answers at the end. */
function PracticeSet({ title, quiz }: { title: string; quiz: { q: string; options: readonly string[]; answer: number; explain: string }[] }) {
  return (
    <div className="avoid-break rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <p className="font-bold">{title}</p>
      <ol className="mt-2 space-y-3 text-sm">
        {quiz.map((q, k) => (
          <li key={k}>
            <p className="font-medium">
              Q{k + 1}. {q.q}
            </p>
            <p className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
              {q.options.map((o, x) => (
                <span key={x}>
                  ({LETTERS[x]}) {o}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-violet-200 pt-2 text-xs text-violet-950">
        <strong>Answers:</strong> {quiz.map((q, k) => `Q${k + 1} ${LETTERS[q.answer]} — ${q.explain}`).join("  ·  ")}
      </p>
    </div>
  );
}

/** A whole course on one page — the source of the downloadable course PDF. */
export default async function CourseBookPage({ params }: { params: Promise<{ course: string }> }) {
  const c = findCourse((await params).course);
  if (!c) notFound();
  const lang = await getUiLang();
  const hi = lang === "hi";
  const pdf = PDFS[`learn:${c.id}`];
  const { lessons, questions } = courseStats(c);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={courseHref(c)} className="text-sm text-primary hover:underline">
          ← {hi ? "कोर्स पर वापस" : "Back to the course"}
        </Link>
        <div className="flex gap-2">
          {pdf && (
            <a href={pdf} download className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
              {hi ? "पीडीएफ़ डाउनलोड करें" : "Download PDF"}
            </a>
          )}
          <PrintButton label={hi ? "प्रिंट / पीडीएफ़ सहेजें" : "Print / Save as PDF"} />
        </div>
      </div>

      <article className="capsule space-y-8">
        {/* Cover */}
        <header className="avoid-break rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{c.tagline}</p>
          <h1 className="mt-3 text-4xl font-extrabold">{c.title}</h1>
          <p className="mt-3 text-sm text-white/85">{c.subtitle}</p>
          <p className="mt-6 text-sm text-white/80">
            {c.modules.length} modules · {lessons.length} lessons · {questions} quiz questions
          </p>
        </header>

        {/* Contents */}
        <section className="avoid-break rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-bold">Contents</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {c.modules.map((m, i) => (
              <li key={m.id}>
                <p className="font-semibold">
                  {i + 1}. {m.title}
                </p>
                <p className="text-muted">{m.lessons.map((l, j) => `${i + 1}.${j + 1} ${l.title}`).join(" · ")}</p>
              </li>
            ))}
          </ol>
        </section>

        {c.modules.map((m, i) => (
          <section key={m.id} className="print-break space-y-8">
            <div className="avoid-break rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Module {i + 1}</p>
              <h2 className="text-2xl font-extrabold">{m.title}</h2>
              <p className="text-sm text-muted">{m.blurb}</p>
            </div>

            {m.lessons.map((l, j) => {
              const slug = lessonSlug(m, l);
              const quiz = (l.quiz ?? []).map((q, k) => shuffleOptions(q, `${slug}-${k + 1}`));
              return (
                <section key={l.id} id={slug} className="space-y-4">
                  <header className="avoid-break">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Lesson {i + 1}.{j + 1} · {l.minutes} min
                    </p>
                    <h3 className="text-xl font-extrabold">{l.title}</h3>
                    <p className="mt-2 rounded-xl bg-gradient-to-r from-primary to-violet-700 px-4 py-3 font-semibold text-white">
                      <span className="mr-2 text-white/70">In one line:</span>
                      {l.oneLine}
                    </p>
                  </header>
                  {l.blocks.map((b, k) => (
                    <LessonBlock key={k} block={b} lang="en" />
                  ))}
                  {quiz.length > 0 && <PracticeSet title="✍ Quick quiz" quiz={quiz} />}
                </section>
              );
            })}

            {m.practice && m.practice.length > 0 && (
              <PracticeSet title={`🏆 Module ${i + 1} test — ${m.practice.length} exam-level questions`} quiz={m.practice.map((q, k) => shuffleOptions(q, `${m.id}-test-${k + 1}`))} />
            )}
          </section>
        ))}

        <footer className="border-t border-border pt-4 text-xs text-muted">
          © EdQity — {c.title}. Original lessons; confirm topics against your exam&apos;s official syllabus.
        </footer>
      </article>
    </div>
  );
}
