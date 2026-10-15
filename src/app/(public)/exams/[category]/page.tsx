import Link from "next/link";
import { notFound } from "next/navigation";
import { EXAM_KITS } from "@/lib/study-material/exam-kits";
import { findLibraryCategory, patternTotals, TIMING_LABELS, type ExamPattern } from "@/lib/exam-patterns";
import { isAppError } from "@/lib/errors";
import type { Lang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { getCategoryBySlug, listPublicTests, listSeriesForCategory } from "@/server/services/practice-service";
import { TestRow } from "@/components/student/test-list";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const lang = await getUiLang();
  const library = findLibraryCategory(slug);
  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch (e) {
    // Library exams are listed in the menu before an admin has created any test for them.
    if (!isAppError(e)) throw e;
    if (!library) notFound();
  }
  const [series, tests] = category
    ? await Promise.all([listSeriesForCategory(category.id), listPublicTests({ categoryId: category.id })])
    : [[], []];
  const name = category ? (lang === "hi" && category.nameHi ? category.nameHi : category.nameEn) : lang === "hi" ? library!.nameHi : library!.nameEn;
  const description = category ? (lang === "hi" && category.descriptionHi ? category.descriptionHi : category.descriptionEn) : null;
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold">{name}</h1>
        {description && <p className="mt-2 max-w-3xl text-muted">{description}</p>}
      </header>
      {EXAM_KITS.filter((k) => k.categorySlug === slug).map((k) => (
        <Link
          key={k.id}
          href={`/study-material/exams/${k.id}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 hover:border-indigo-400"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-indigo-700">{lang === "hi" ? "अध्ययन सामग्री" : "Study material"}</span>
            <span className="font-semibold text-indigo-950">{lang === "hi" ? k.title.hi : k.title.en}</span>
          </span>
          <span className="text-sm font-medium text-indigo-700">{lang === "hi" ? "किट खोलें →" : "Open kit →"}</span>
        </Link>
      ))}
      {series.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{st(lang, "testSeries")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {series.map((s) => {
              const count = tests.filter((t) => t.seriesTitle === s.titleEn).length;
              return (
                <div key={s.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{lang === "hi" && s.titleHi ? s.titleHi : s.titleEn}</h3>
                    <span className={s.accessLevel === "FREE" ? "rounded bg-green-100 px-2 text-xs text-green-800" : "rounded bg-amber-100 px-2 text-xs text-amber-900"}>
                      {st(lang, s.accessLevel === "FREE" ? "free" : "premium")}
                    </span>
                  </div>
                  {s.descriptionEn && <p className="mt-1 text-sm text-muted">{s.descriptionEn}</p>}
                  <p className="mt-2 text-sm">
                    {count} {st(lang, "testsAvailable")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{st(lang, "allTests")}</h2>
        {tests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">{st(lang, "noTests")}</p>
        ) : (
          <ol className="grid gap-2 lg:grid-cols-2">
            {[...tests]
              .sort((a, b) => new Intl.Collator("en", { numeric: true }).compare(a.titleEn, b.titleEn))
              .map((t, i) => (
                <TestRow key={t.id} test={t} lang={lang} index={i} />
              ))}
          </ol>
        )}
      </section>
      {library && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{st(lang, "examPattern")}</h2>
          <div className="space-y-4">
            {library.patterns.map((p) => (
              <PatternCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PatternCard({ p, lang }: { p: ExamPattern; lang: Lang }) {
  const t = patternTotals(p);
  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{lang === "hi" ? p.nameHi : p.nameEn}</h3>
        <span className="text-sm text-muted">
          {t.questions} Q · {t.marks} marks · {p.durationMinutes} min
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {p.stage} · {TIMING_LABELS[p.timing]}
        {p.timingNote ? ` — ${p.timingNote}` : ""}
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-120 text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:text-muted">
          <thead>
            <tr>
              <th>Section</th>
              <th>Questions</th>
              <th>Marks</th>
              <th>Negative</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {p.sections.map((s) => (
              <tr key={s.code}>
                <td>
                  {lang === "hi" && s.titleHi ? s.titleHi : s.titleEn}
                  {s.qualifying && <span className="ml-1 text-xs text-muted">(qualifying)</span>}
                </td>
                <td>{s.questions}</td>
                <td>{Math.round(s.questions * s.marksCorrect * 100) / 100}</td>
                <td>{s.marksWrong > 0 ? `−${s.marksWrong}` : "—"}</td>
                <td>{s.groupMinutes ? `${s.groupMinutes} min` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs">
        <a href={p.source} target="_blank" rel="noreferrer" className="text-primary underline">
          {st(lang, "officialSource")}
        </a>{" "}
        · {p.patternYear}
        {!p.verified && <span className="ml-2 font-medium text-danger">{st(lang, "patternNotVerified")}</span>}
      </p>
    </article>
  );
}
