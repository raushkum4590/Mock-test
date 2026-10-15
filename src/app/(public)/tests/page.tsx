import Link from "next/link";
import { findLibraryCategory, GROUP_LABELS, GROUP_LABELS_HI } from "@/lib/exam-patterns";
import type { Lang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { cx } from "@/components/ui";
import { listCategories, listPublicTests, type PublicTest } from "@/server/services/practice-service";
import { splitTitle, testTitle, TestRow } from "@/components/student/test-list";

export const metadata = { title: "Mock tests" };

/** Tests on the overview before "View all" for each category. */
const PREVIEW = 4;

type Group = { slug: string; name: string; groupLabel: string | null; tests: PublicTest[] };

export default async function TestsPage({ searchParams }: { searchParams: Promise<{ access?: string; cat?: string }> }) {
  const { access, cat } = await searchParams;
  const lang = await getUiLang();
  const [tests, categories] = await Promise.all([
    listPublicTests({ accessLevel: access === "free" ? "FREE" : access === "premium" ? "PREMIUM" : undefined }),
    listCategories(),
  ]);
  const groups = groupByCategory(tests, categories, lang);
  const selected = cat ? groups.find((g) => g.slug === cat) : undefined;
  const href = (slug?: string) => {
    const p = new URLSearchParams();
    if (access) p.set("access", access);
    if (slug) p.set("cat", slug);
    const q = p.toString();
    return q ? `/tests?${q}` : "/tests";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{access === "free" ? st(lang, "popularTests") : st(lang, "allTests")}</h1>
      <p className="mt-1 text-sm text-muted">
        {tests.length} {st(lang, "testsAvailable")} · {groups.length} {st(lang, "examCategories")}
      </p>

      {/* Category filter */}
      <nav aria-label={st(lang, "examCategories")} className="-mx-4 mt-5 overflow-x-auto px-4">
        <ul className="flex gap-2 pb-2">
          <li>
            <Chip href={href()} active={!selected} label={st(lang, "allCategories")} count={tests.length} />
          </li>
          {groups.map((g) => (
            <li key={g.slug}>
              <Chip href={href(g.slug)} active={selected?.slug === g.slug} label={g.name} count={g.tests.length} />
            </li>
          ))}
        </ul>
      </nav>

      {tests.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">{st(lang, "noTests")}</p>
      ) : selected ? (
        <section className="mt-6">
          <CategoryHeader g={selected} lang={lang} />
          <ol className="mt-4 grid gap-2 lg:grid-cols-2">
            {selected.tests.map((t, i) => (
              <TestRow key={t.id} test={t} lang={lang} index={i} />
            ))}
          </ol>
        </section>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <section key={g.slug} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <CategoryHeader g={g} lang={lang} />
              <ol className="mt-4 grid gap-2 lg:grid-cols-2">
                {g.tests.slice(0, PREVIEW).map((t, i) => (
                  <TestRow key={t.id} test={t} lang={lang} index={i} />
                ))}
              </ol>
              {g.tests.length > PREVIEW && (
                <Link href={href(g.slug)} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {st(lang, "viewAllTests").replace("{n}", String(g.tests.length))} →
                </Link>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary hover:text-primary",
      )}
    >
      {label}
      <span className={cx("rounded-full px-2 text-xs", active ? "bg-white/20" : "bg-slate-100 text-muted")}>{count}</span>
    </Link>
  );
}

function CategoryHeader({ g, lang }: { g: Group; lang: Lang }) {
  const first = g.tests[0]!;
  const series = [...new Set(g.tests.map((t) => splitTitle(testTitle(t, lang)).series).filter(Boolean))];
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {g.groupLabel && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{g.groupLabel}</p>}
        <h2 className="text-lg font-semibold">
          <Link href={`/exams/${g.slug}`} className="hover:underline">
            {g.name}
          </Link>
        </h2>
        {series.length === 1 && <p className="text-sm text-muted">{series[0]}</p>}
      </div>
      <dl className="flex flex-wrap gap-2 text-xs">
        <Stat label={st(lang, "testsShort")} value={g.tests.length} />
        <Stat label={st(lang, "questions")} value={first.questionCount} />
        <Stat label={st(lang, "marks")} value={first.maxMarks} />
        <Stat label={st(lang, "minutes")} value={first.durationMinutes} />
      </dl>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-center">
      <dd className="text-base font-semibold">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  );
}

/** Tests grouped by category, biggest categories first; tests keep their numeric order. */
function groupByCategory(tests: PublicTest[], categories: Awaited<ReturnType<typeof listCategories>>, lang: Lang): Group[] {
  const names = new Map(categories.map((c) => [c.slug, lang === "hi" && c.nameHi ? c.nameHi : c.nameEn]));
  const map = new Map<string, Group>();
  for (const t of tests) {
    const slug = t.categorySlug ?? "other";
    const lib = findLibraryCategory(slug);
    const g = map.get(slug) ?? {
      slug,
      name: names.get(slug) ?? t.categoryName ?? (lang === "hi" ? "अन्य" : "Other"),
      groupLabel: lib ? (lang === "hi" ? GROUP_LABELS_HI[lib.group] : GROUP_LABELS[lib.group]) : null,
      tests: [],
    };
    g.tests.push(t);
    map.set(slug, g);
  }
  const byTitle = new Intl.Collator("en", { numeric: true });
  for (const g of map.values()) g.tests.sort((a, b) => byTitle.compare(a.titleEn, b.titleEn));
  return [...map.values()].sort((a, b) => b.tests.length - a.tests.length || a.name.localeCompare(b.name));
}
