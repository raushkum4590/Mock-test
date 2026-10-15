import Link from "next/link";
import type { Lang } from "@/lib/i18n/dictionary";
import { st } from "@/lib/i18n/site";
import type { PublicTest } from "@/server/services/practice-service";

/** "BPSC TRE 4.0 Computer Science – Mock Test 01" → { series: "BPSC TRE 4.0 Computer Science", name: "Mock Test 01" }. */
export function splitTitle(title: string): { series: string; name: string } {
  const i = title.lastIndexOf(" – ");
  return i > 0 ? { series: title.slice(0, i), name: title.slice(i + 3) } : { series: "", name: title };
}

export const testTitle = (t: PublicTest, lang: Lang) => (lang === "hi" && t.titleHi ? t.titleHi : t.titleEn);

/** Compact one-line test entry used in category lists. */
export function TestRow({ test, lang, index }: { test: PublicTest; lang: Lang; index: number }) {
  const { name } = splitTitle(testTitle(test, lang));
  return (
    <li>
      <Link
        href={`/tests/${test.slug}`}
        className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition hover:border-primary hover:shadow-sm"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 font-mono text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium" lang={lang === "hi" && test.titleHi ? "hi" : undefined}>
            {name}
          </span>
          <span className="block text-xs text-muted">
            {test.questionCount} {st(lang, "questions")} · {test.maxMarks} {st(lang, "marks")} · {test.timed ? `${test.durationMinutes} ${st(lang, "minutes")}` : st(lang, "untimed")}
          </span>
        </span>
        {test.accessLevel === "FREE" ? (
          <span className="hidden rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 sm:inline">{st(lang, "free")}</span>
        ) : (
          <span className="hidden rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 sm:inline">★ {st(lang, "premium")}</span>
        )}
        <span className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white group-hover:brightness-110">{st(lang, "startTest")}</span>
      </Link>
    </li>
  );
}
