import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { exams, practiceAttempts } from "@db/schema";
import { requireStudentPage } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { isAppError } from "@/lib/errors";
import { pickText, type Lang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { now } from "@/lib/time/clock";
import { DEFAULT_TIME_ZONE, formatDateTime, utcToZonedInput } from "@/lib/time/zone";
import { getPublicTestDetail, hasAccess } from "@/server/services/practice-service";
import { getRequireApproval, getStudentRequestForExam } from "@/server/services/test-schedule-service";
import { AutoRefresh } from "@/components/student/auto-refresh";
import { BeginTest, CancelScheduleButton, ScheduleTestForm } from "@/components/student/student-widgets";
import { Alert } from "@/components/ui";

export const metadata = { title: "Instructions" };

/** Test instructions shown before the attempt is created. */
export default async function InstructionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const student = await requireStudentPage(`/student/tests/${slug}`);
  const lang = await getUiLang();
  let d;
  try {
    d = await getPublicTestDetail(slug);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  const [row] = await getDb().select({ id: exams.id, accessLevel: exams.accessLevel, seriesId: exams.seriesId }).from(exams).where(eq(exams.id, d.exam.id));
  if (!(await hasAccess(student.studentId, row!))) return <Alert tone="warning">{st(lang, "premiumLocked")}</Alert>;
  const [active] = await getDb()
    .select({ id: practiceAttempts.id })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.studentId, student.studentId), eq(practiceAttempts.examId, d.exam.id), eq(practiceAttempts.status, "IN_PROGRESS")));
  const instructions = pickText(lang, d.exam.instructionsEn, d.exam.instructionsHi);
  const totalQ = d.sections.reduce((n, s) => n + s.questions, 0);
  return (
    <section className="space-y-4">
      <Link href={`/tests/${slug}`} className="text-sm text-primary underline">
        ← {pickText(lang, d.exam.titleEn, d.exam.titleHi).text}
      </Link>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">{st(lang, "instructions")}</h1>
        <p className="mt-1 text-sm text-muted">
          {totalQ} {st(lang, "questions")} · {d.exam.timed ? `${d.exam.durationMinutes} ${st(lang, "minutes")}` : st(lang, "untimed")}
        </p>
        <div className="question-text mt-4 text-sm" lang={instructions.fallback ? undefined : lang} data-testid="instructions">
          {instructions.text ||
            (lang === "hi"
              ? "प्रत्येक प्रश्न के लिए एक विकल्प चुनें। उत्तर स्वतः सहेजे जाते हैं। समय समाप्त होने पर टेस्ट स्वतः जमा हो जाएगा।"
              : "Choose one option for each question. Answers are saved automatically. The test is submitted automatically when time runs out.")}
        </div>
        <table className="mt-4 w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_th]:text-left">
          <thead className="text-muted">
            <tr>
              <th>{st(lang, "section")}</th>
              <th>{st(lang, "questions")}</th>
              <th>+</th>
              <th>{st(lang, "negative")}</th>
            </tr>
          </thead>
          <tbody>
            {d.sections.map((s) => (
              <tr key={s.titleEn}>
                <td>{lang === "hi" && s.titleHi ? s.titleHi : s.titleEn}</td>
                <td>{s.questions}</td>
                <td>{s.marksCorrect}</td>
                <td>−{s.marksWrong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {active || !(await getRequireApproval()) ? (
        <BeginTest slug={slug} lang={lang} resume={!!active} />
      ) : (
        <ScheduleGate slug={slug} lang={lang} request={await getStudentRequestForExam(student.studentId, d.exam.id)} />
      )}
    </section>
  );
}

/** Approval required: show the student's schedule request and only offer Begin inside the approved window. */
function ScheduleGate({ slug, lang, request: r }: { slug: string; lang: Lang; request: Awaited<ReturnType<typeof getStudentRequestForExam>> }) {
  const at = now();
  const form = <ScheduleTestForm slug={slug} lang={lang} minValue={utcToZonedInput(at)} timeZone={DEFAULT_TIME_ZONE} />;
  const note = r?.adminNote && (
    <p className="text-sm">
      <span className="font-medium">{st(lang, "adminNote")}:</span> {r.adminNote}
    </p>
  );
  if (r?.status === "PENDING") {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5" data-testid="schedule-pending">
        <p className="text-sm">
          {st(lang, "requestPending")} <strong>{formatDateTime(r.requestedStartAt)}</strong>
        </p>
        <CancelScheduleButton requestId={r.id} lang={lang} />
        <AutoRefresh seconds={30} />
      </div>
    );
  }
  if (r?.status === "APPROVED" && r.startAt && r.windowEndsAt) {
    const open = at >= r.startAt;
    return (
      <div className="space-y-3" data-testid="schedule-approved">
        <Alert tone="success">
          {st(lang, "requestApproved")} <strong>{formatDateTime(r.startAt)}</strong> {st(lang, "and")} <strong>{formatDateTime(r.windowEndsAt)}</strong>.
          {!open && ` ${st(lang, "requestApprovedUpcoming")}`}
        </Alert>
        {note}
        {open ? <BeginTest slug={slug} lang={lang} resume={false} /> : <CancelScheduleButton requestId={r.id} lang={lang} />}
        {!open && <AutoRefresh seconds={30} />}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {r?.status === "REJECTED" && <Alert tone="warning">{st(lang, "requestRejected")}</Alert>}
      {r?.status === "EXPIRED" && <Alert tone="warning">{st(lang, "requestExpired")}</Alert>}
      {(r?.status === "REJECTED" || r?.status === "EXPIRED") && note}
      {form}
    </div>
  );
}
