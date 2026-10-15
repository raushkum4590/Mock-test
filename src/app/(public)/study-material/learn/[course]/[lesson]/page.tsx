import Link from "next/link";
import { notFound } from "next/navigation";
import { getUiLang } from "@/lib/i18n/server-lang";
import { courseHref, findLessonIn } from "@/lib/learn/courses";
import { lessonSlug, progressKey } from "@/lib/learn/util";
import { shuffleOptions } from "@/lib/learn/shuffle";
import { LessonBlock } from "@/components/learn/lesson-blocks";
import { DoneButton, DoneTick, ProgressBar } from "@/components/learn/progress";
import { CapsuleQuiz } from "@/components/study/capsule-quiz";
import { cx } from "@/components/ui";

type Params = Promise<{ course: string; lesson: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const p = await params;
  const found = findLessonIn(p.course, p.lesson);
  return { title: found ? `${found.ref.lesson.title} – ${found.course.short}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Params }) {
  const p = await params;
  const found = findLessonIn(p.course, p.lesson);
  if (!found) notFound();
  const { course, ref, prev, next } = found;
  const { module: m, moduleIndex, lesson, lessonIndex } = ref;
  const base = courseHref(course);
  const lang = await getUiLang();
  const hi = lang === "hi";
  const quiz = (lesson.quiz ?? []).map((q, i) => {
    const id = `${ref.slug}-${i + 1}`;
    return shuffleOptions({ ...q, id }, id);
  });
  const finalLink = course.links?.[0];
  // The module test follows the module's last lesson.
  const moduleTest =
    lessonIndex === m.lessons.length - 1
      ? (m.practice ?? []).map((q, i) => {
          const id = `${m.id}-test-${i + 1}`;
          return shuffleOptions({ ...q, id }, id);
        })
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="no-print flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/study-material/learn" className="text-primary hover:underline">
          {hi ? "कोर्स" : "Courses"}
        </Link>
        <span>›</span>
        <Link href={base} className="text-primary hover:underline">
          {hi ? course.titleHi : course.title}
        </Link>
        <span>›</span>
        <span>
          {hi ? "मॉड्यूल" : "Module"} {moduleIndex + 1}: {hi ? m.titleHi : m.title}
        </span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="capsule min-w-0 space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {hi ? "पाठ" : "Lesson"} {moduleIndex + 1}.{lessonIndex + 1} · {lesson.minutes} {hi ? "मिनट" : "min"}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{lesson.title}</h1>
            <p className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-violet-700 px-5 py-4 text-lg font-semibold leading-snug text-white shadow">
              <span className="mr-2 text-white/70">{hi ? "एक पंक्ति में:" : "In one line:"}</span>
              {lesson.oneLine}
            </p>
          </header>

          {lesson.blocks.map((b, i) => (
            <LessonBlock key={i} block={b} lang={lang} />
          ))}

          {quiz.length > 0 && (
            <section className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-5">
              <h2 className="text-lg font-bold">✍ {hi ? "क्या समझ आया? — त्वरित क्विज़" : "Did it click? — quick quiz"}</h2>
              <p className="mb-3 text-sm text-muted">{hi ? "विकल्प पर टैप करें; उत्तर और कारण तुरंत दिखेगा।" : "Tap an option — you'll see the answer and why, instantly."}</p>
              <CapsuleQuiz quiz={quiz} lang={lang} columns={1} />
            </section>
          )}

          {moduleTest.length > 0 && (
            <section id="module-test" className="scroll-mt-20 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-5">
              <h2 className="text-lg font-bold">
                🏆 {hi ? "मॉड्यूल टेस्ट" : "Module test"} {moduleIndex + 1}: {hi ? m.titleHi : m.title}
              </h2>
              <p className="mb-3 text-sm text-muted">
                {hi
                  ? `${moduleTest.length} प्रश्न, परीक्षा के स्तर पर — पूरे मॉड्यूल से। 80% से ज़्यादा सही हों तो अगला मॉड्यूल शुरू करें।`
                  : `${moduleTest.length} exam-level questions from the whole module. Score 80%+ before moving to the next module.`}
              </p>
              <CapsuleQuiz quiz={moduleTest} lang={lang} columns={1} />
            </section>
          )}

          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <DoneButton slug={progressKey(course, ref.slug)} lang={lang} />
          </div>

          <nav className="no-print grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`${base}/${prev.slug}`} className="rounded-xl border border-border bg-surface p-4 hover:border-primary">
                <span className="text-xs text-muted">← {hi ? "पिछला" : "Previous"}</span>
                <span className="block font-semibold">{prev.lesson.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`${base}/${next.slug}`} className="rounded-xl border border-primary bg-primary p-4 text-right text-white hover:brightness-110">
                <span className="text-xs text-white/75">{hi ? "अगला" : "Next"} →</span>
                <span className="block font-semibold">{next.lesson.title}</span>
              </Link>
            ) : (
              <Link href={finalLink?.href ?? base} className="rounded-xl border border-green-300 bg-green-50 p-4 text-right text-green-900">
                <span className="text-xs">🎉 {hi ? "कोर्स पूरा!" : "Course complete!"}</span>
                <span className="block font-semibold">{finalLink ? (hi ? finalLink.titleHi : finalLink.title) : hi ? "कोर्स पर वापस" : "Back to the course"}</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="no-print lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {hi ? "मॉड्यूल" : "Module"} {moduleIndex + 1}
            </p>
            <p className="font-bold">{hi ? m.titleHi : m.title}</p>
            <ol className="mt-3 space-y-1">
              {m.lessons.map((l, j) => {
                const slug = lessonSlug(m, l);
                const current = slug === ref.slug;
                return (
                  <li key={l.id}>
                    <Link
                      href={`${base}/${slug}`}
                      aria-current={current ? "page" : undefined}
                      className={cx("flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm", current ? "bg-primary/10 font-semibold text-primary" : "hover:bg-slate-50")}
                    >
                      <DoneTick slug={progressKey(course, slug)} />
                      <span className="text-xs tabular-nums text-muted">
                        {moduleIndex + 1}.{j + 1}
                      </span>
                      <span className="flex-1">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3">
              <ProgressBar slugs={m.lessons.map((l) => progressKey(course, lessonSlug(m, l)))} lang={lang} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
