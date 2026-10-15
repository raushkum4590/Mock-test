import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { exams, practiceAttempts } from "@db/schema";
import { getStudent } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { isAppError } from "@/lib/errors";
import { pickText } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st, type SiteKey } from "@/lib/i18n/site";
import { formatDateTime } from "@/lib/time/zone";
import { isGuestEmail } from "@/lib/guest-tests";
import { getPublicTestDetail, hasAccess, isGuestExam } from "@/server/services/practice-service";
import { GuestStart } from "@/components/student/student-widgets";
import { getRequireApproval } from "@/server/services/test-schedule-service";

export default async function TestDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getUiLang();
  const t = (k: SiteKey) => st(lang, k);
  let d;
  try {
    d = await getPublicTestDetail(slug);
  } catch (e) {
    if (isAppError(e)) notFound();
    throw e;
  }
  const guestExam = await isGuestExam(d.exam);
  // A name-only guest counts as signed in only on guest tests.
  const signedIn = await getStudent();
  const student = signedIn && (guestExam || !isGuestEmail(signedIn.email)) ? signedIn : null;
  let access = d.exam.accessLevel === "FREE";
  let activeAttemptId: string | null = null;
  if (student) {
    const [row] = await getDb().select({ id: exams.id, accessLevel: exams.accessLevel, seriesId: exams.seriesId }).from(exams).where(eq(exams.id, d.exam.id));
    access = await hasAccess(student.studentId, row!);
    const [active] = await getDb()
      .select({ id: practiceAttempts.id })
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.studentId, student.studentId), eq(practiceAttempts.examId, d.exam.id), eq(practiceAttempts.status, "IN_PROGRESS")));
    activeAttemptId = active?.id ?? null;
  }
  const title = pickText(lang, d.exam.titleEn, d.exam.titleHi).text;
  const desc = pickText(lang, d.exam.descriptionEn, d.exam.descriptionHi).text;
  const totalQ = d.sections.reduce((n, s) => n + s.questions, 0);
  const maxMarks = d.sections.reduce((n, s) => n + s.maxMarks, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {d.category && (
          <>
            {" / "}
            <Link href={`/exams/${d.category.slug}`} className="hover:underline">
              {lang === "hi" && d.category.nameHi ? d.category.nameHi : d.category.nameEn}
            </Link>
          </>
        )}
      </nav>
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{t(`kind_${d.exam.testKind}` as SiteKey)}</span>
          <span className={d.exam.accessLevel === "FREE" ? "rounded bg-green-100 px-2 py-0.5 font-semibold text-green-800" : "rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900"}>
            {t(d.exam.accessLevel === "FREE" ? "free" : "premium")}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {desc && <p className="mt-2 text-muted">{desc}</p>}
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
          <Stat label={t("questions")} value={String(totalQ)} />
          <Stat label={t("marks")} value={String(maxMarks)} />
          <Stat label={t("duration")} value={d.exam.timed ? `${d.exam.durationMinutes} ${t("minutes")}` : t("untimed")} />
          <Stat label={t("languages")} value={d.languages.map((l) => (l === "en" ? "English" : "हिन्दी")).join(", ")} />
          <Stat label={t("attemptsAllowed")} value={d.exam.maxAttempts ? String(d.exam.maxAttempts) : t("unlimited")} />
        </dl>
        <p className="mt-4 text-sm text-muted">
          {d.exam.resultPolicy === "IMMEDIATE" ? t("resultsImmediate") : `${t("resultsAt")} ${formatDateTime(d.exam.resultReleaseAt)}`}
        </p>
        <div className="mt-5">
          {!student && guestExam ? (
            <GuestStart slug={slug} lang={lang} />
          ) : !student ? (
            <Link href={`/student/login?next=${encodeURIComponent(`/student/tests/${slug}`)}`} className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-medium text-white">
              {t("loginToStart")}
            </Link>
          ) : !access ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t("premiumLocked")}</p>
          ) : activeAttemptId ? (
            <Link href={`/student/attempts/${activeAttemptId}`} className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-medium text-white" data-testid="resume-test">
              {t("resumeTest")}
            </Link>
          ) : (
            <Link href={`/student/tests/${slug}`} className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-medium text-white" data-testid="start-test">
              {!guestExam && (await getRequireApproval()) ? t("scheduleTest") : t("startTest")}
            </Link>
          )}
        </div>
      </header>
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-3 font-semibold">{t("sectionsTitle")}</h2>
        <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-2 [&_th]:py-2 [&_th]:text-left">
          <thead>
            <tr>
              <th>{t("section")}</th>
              <th>{t("questions")}</th>
              <th>{t("marks")}</th>
              <th>{t("negative")}</th>
            </tr>
          </thead>
          <tbody>
            {d.sections.map((s) => (
              <tr key={s.titleEn}>
                <td>{lang === "hi" && s.titleHi ? s.titleHi : s.titleEn}</td>
                <td>{s.questions}</td>
                <td>
                  {s.maxMarks} (+{s.marksCorrect})
                </td>
                <td>−{s.marksWrong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
