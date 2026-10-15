import Link from "next/link";
import { getStudent } from "@/lib/auth/session";
import type { Lang } from "@/lib/i18n/dictionary";
import { st, type SiteKey } from "@/lib/i18n/site";
import type { PublicTest } from "@/server/services/practice-service";
import { getRequireApprovalForRender } from "@/server/services/test-schedule-service";

export async function TestCard({ test, lang }: { test: PublicTest; lang: Lang }) {
  const [scheduling, student] = await Promise.all([getRequireApprovalForRender(), getStudent()]);
  const scheduleHref = student ? `/student/tests/${test.slug}` : `/student/login?next=${encodeURIComponent(`/student/tests/${test.slug}`)}`;
  const title = lang === "hi" && test.titleHi ? test.titleHi : test.titleEn;
  const desc = lang === "hi" && test.descriptionHi ? test.descriptionHi : test.descriptionEn;
  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{st(lang, `kind_${test.testKind}` as SiteKey)}</span>
        {test.accessLevel === "FREE" ? (
          <span className="rounded bg-green-100 px-2 py-0.5 font-semibold text-green-800">{st(lang, "free")}</span>
        ) : (
          <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">★ {st(lang, "premium")}</span>
        )}
        {test.categoryName && <span className="text-muted">{test.categoryName}</span>}
      </div>
      <h3 className="font-semibold leading-snug" lang={lang === "hi" && test.titleHi ? "hi" : undefined}>
        {title}
      </h3>
      {desc && <p className="mt-1 line-clamp-2 text-sm text-muted">{desc}</p>}
      <dl className="mt-3 flex gap-4 text-sm">
        <div>
          <dt className="sr-only">{st(lang, "questions")}</dt>
          <dd>
            <span className="font-semibold">{test.questionCount}</span> {st(lang, "questions")}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{st(lang, "marks")}</dt>
          <dd>
            <span className="font-semibold">{test.maxMarks}</span> {st(lang, "marks")}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{st(lang, "duration")}</dt>
          <dd>{test.timed ? `${test.durationMinutes} ${st(lang, "minutes")}` : st(lang, "untimed")}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <Link href={`/tests/${test.slug}`} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          {st(lang, "viewDetails")}
        </Link>
        {scheduling && (
          // Logged-out visitors log in first and then land on the scheduling form.
          <Link
            href={scheduleHref}
            className="inline-flex rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-slate-50"
            data-testid="schedule-test"
          >
            {st(lang, "scheduleTest")}
          </Link>
        )}
      </div>
    </article>
  );
}
