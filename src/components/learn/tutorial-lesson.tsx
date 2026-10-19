import Link from "next/link";
import type { Course } from "@/lib/learn/types";
import { lessonSlug, progressKey, tryItModeOf, type LessonRef } from "@/lib/learn/util";
import { LessonBlock } from "@/components/learn/lesson-blocks";
import { DoneButton, DoneTick, ProgressBar } from "@/components/learn/progress";
import { CapsuleQuiz, type QuizItem } from "@/components/study/capsule-quiz";
import { cx } from "@/components/ui";

const GREEN = "rounded bg-[#04aa6d] px-4 py-2 text-[15px] font-semibold text-white hover:bg-[#059862]";

/** The whole course as a W3Schools-style menu: module headings with every lesson underneath. */
function TutorialMenu({ course, current, base, hi }: { course: Course; current: string; base: string; hi: boolean }) {
  return (
    <nav aria-label={hi ? "ट्यूटोरियल मेनू" : "Tutorial menu"}>
      {course.modules.map((m, i) => (
        <div key={m.id} className="mb-2">
          <p className="px-4 pb-1 pt-2 text-[12px] font-bold uppercase tracking-wide text-slate-600">
            {i + 1}. {hi ? m.titleHi : m.title}
          </p>
          <ul>
            {m.lessons.map((l) => {
              const slug = lessonSlug(m, l);
              const on = slug === current;
              return (
                <li key={l.id}>
                  <Link
                    href={`${base}/${slug}`}
                    aria-current={on ? "page" : undefined}
                    className={cx("flex items-center gap-2 px-4 py-1.5 text-[14px] leading-snug", on ? "bg-[#04aa6d] text-white" : "text-slate-900 hover:bg-[#cccccc]")}
                  >
                    <DoneTick slug={progressKey(course, slug)} />
                    <span>{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function PrevNext({ base, prev, next, hi }: { base: string; prev?: LessonRef; next?: LessonRef; hi: boolean }) {
  return (
    <div className="no-print flex items-center justify-between gap-3">
      {prev ? (
        <Link href={`${base}/${prev.slug}`} className={GREEN} title={prev.lesson.title}>
          ❮ {hi ? "पिछला" : "Previous"}
        </Link>
      ) : (
        <Link href={base} className={GREEN}>
          ❮ {hi ? "कोर्स" : "Home"}
        </Link>
      )}
      {next ? (
        <Link href={`${base}/${next.slug}`} className={GREEN} title={next.lesson.title}>
          {hi ? "अगला" : "Next"} ❯
        </Link>
      ) : (
        <Link href={base} className={GREEN}>
          {hi ? "कोर्स पूरा" : "Finish"} ✓
        </Link>
      )}
    </div>
  );
}

/** Lesson page for programming tutorials (course.tutorial): menu on the left, examples with "Try it Yourself". */
export function TutorialLesson({
  course, base, lessonRef, prev, next, quiz, lang,
}: { course: Course; base: string; lessonRef: LessonRef; prev?: LessonRef; next?: LessonRef; quiz: QuizItem[]; lang: "en" | "hi" }) {
  const hi = lang === "hi";
  const { module: m, moduleIndex, lesson } = lessonRef;
  const allKeys = course.modules.flatMap((mod) => mod.lessons.map((l) => progressKey(course, lessonSlug(mod, l))));

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="no-print hidden rounded-lg bg-[#e7e9eb] py-3 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
        <p className="px-4 pb-1 text-lg font-bold text-slate-900">
          {course.short} {hi ? "ट्यूटोरियल" : "Tutorial"}
        </p>
        <div className="px-4 pb-2">
          <ProgressBar slugs={allKeys} lang={lang} />
        </div>
        <TutorialMenu course={course} current={lessonRef.slug} base={base} hi={hi} />
      </aside>

      <article className="capsule min-w-0 space-y-6">
        <details className="no-print rounded-lg bg-[#e7e9eb] lg:hidden">
          <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-900">☰ {course.short} {hi ? "ट्यूटोरियल मेनू" : "Tutorial menu"}</summary>
          <div className="pb-3">
            <TutorialMenu course={course} current={lessonRef.slug} base={base} hi={hi} />
          </div>
        </details>

        <PrevNext base={base} prev={prev} next={next} hi={hi} />

        <header>
          <p className="text-sm text-muted">
            <Link href="/study-material/learn" className="text-primary hover:underline">
              {hi ? "कोर्स" : "Courses"}
            </Link>{" "}
            ›{" "}
            <Link href={base} className="text-primary hover:underline">
              {course.short}
            </Link>{" "}
            › {hi ? "मॉड्यूल" : "Module"} {moduleIndex + 1}: {hi ? m.titleHi : m.title}
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{lesson.title}</h1>
          <p className="mt-4 rounded border-l-4 border-[#04aa6d] bg-[#d9eee1] px-4 py-3 text-[16px] leading-relaxed text-slate-900">{lesson.oneLine}</p>
        </header>

        {lesson.blocks.map((b, i) => (
          <LessonBlock key={i} block={b} lang={lang} tutorial tryItHref={tryItModeOf(b) ? `${base}/${lessonRef.slug}/tryit/${i}` : undefined} />
        ))}

        {quiz.length > 0 && (
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-2xl font-bold">{hi ? "क्विज़ से खुद को परखें" : "Test Yourself With a Quiz"}</h2>
            <p className="mb-3 text-sm text-muted">{hi ? "विकल्प पर टैप करें; उत्तर और कारण तुरंत दिखेगा।" : "Tap an option. You'll see the answer and why, instantly."}</p>
            <CapsuleQuiz quiz={quiz} lang={lang} columns={1} />
          </section>
        )}

        <div className="no-print border-t border-border pt-5">
          <DoneButton slug={progressKey(course, lessonRef.slug)} lang={lang} />
        </div>

        <PrevNext base={base} prev={prev} next={next} hi={hi} />
      </article>
    </div>
  );
}
