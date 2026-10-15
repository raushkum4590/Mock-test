import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { getExamDetail } from "@/server/services/exam-service";
import { listSubjects } from "@/server/services/question-service";
import { listAllCategories, listAllSeries } from "@/server/services/catalog-service";
import { utcToZonedInput } from "@/lib/time/zone";
import { ActionButton } from "@/components/admin/action-button";
import { AttachQuestions } from "@/components/admin/attach-questions";
import { ExamForm, SectionForm } from "@/components/admin/forms";
import { Alert, Badge, Card } from "@/components/ui";

export const metadata = { title: "Exam" };

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("exams.manage");
  const { id } = await params;
  let detail;
  try {
    detail = await getExamDetail(id);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  const { exam, sections } = detail;
  const [subjects, categories, seriesList] = await Promise.all([listSubjects(), listAllCategories(), listAllSeries()]);
  const total = sections.reduce((n, s) => n + s.questions.length, 0);
  const maxMarks = sections.reduce((n, s) => n + s.questions.reduce((m, q) => m + q.marksCorrect, 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/admin/exams" className="text-sm text-primary underline">
            ← Exams
          </Link>
          <h1 className="text-xl font-semibold">
            {exam.code} — {exam.titleEn} <Badge>{exam.status}</Badge>
          </h1>
          <p className="text-sm text-muted">
            {sections.length} sections · {total} questions · maximum {maxMarks} marks
          </p>
          {exam.isPublic && exam.slug && (
            <p className="text-sm">
              Online:{" "}
              <a className="text-primary underline" href={`/tests/${exam.slug}`}>
                /tests/{exam.slug}
              </a>{" "}
              {total === 0 && <span className="text-warning">(students will see it once it has questions)</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {exam.status !== "READY" && (
            <ActionButton url={`/api/exams/${exam.id}`} method="PATCH" body={{ status: "READY" }} variant="success">
              Mark READY
            </ActionButton>
          )}
          {exam.status === "READY" && (
            <ActionButton url={`/api/exams/${exam.id}`} method="PATCH" body={{ status: "DRAFT" }}>
              Back to draft
            </ActionButton>
          )}
          {exam.status !== "ARCHIVED" && (
            <ActionButton url={`/api/exams/${exam.id}`} method="PATCH" body={{ status: "ARCHIVED" }} confirm="Archive this exam?">
              Archive
            </ActionButton>
          )}
        </div>
      </div>

      {sections.map((s) => (
        <Card
          key={s.id}
          title={
            <>
              {s.code} · {s.titleEn} {s.titleHi && <span className="text-sm font-normal text-muted" lang="hi">/ {s.titleHi}</span>}
              <span className="ml-2 text-sm font-normal text-muted">
                +{s.marksCorrect} / −{s.marksWrong} · {s.questions.length} questions
                {s.timerGroup && s.groupMinutes ? ` · ⏱ ${s.groupMinutes} min (group ${s.timerGroup})` : ""}
              </span>
            </>
          }
          actions={
            <ActionButton url={`/api/sections/${s.id}`} method="DELETE" confirm="Delete this section (questions stay in the bank)?" variant="ghost">
              Delete section
            </ActionButton>
          }
        >
          <ol className="space-y-2 text-sm">
            {s.questions.map((q) => (
              <li key={q.id} className="flex items-start justify-between gap-3 border-b border-border pb-2">
                <div>
                  <span className="font-mono text-xs text-muted">
                    Q{q.number} · {q.code}
                  </span>
                  <div>{q.textEn ?? q.textHi}</div>
                  {q.textHi && q.textEn && <div className="text-muted" lang="hi">{q.textHi}</div>}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs">
                    {q.options.map((o) => (
                      <span key={o.id} className={q.correctOptionIds.includes(o.id) ? "font-semibold text-success" : ""}>
                        {o.label}. {o.textEn ?? o.textHi} {q.correctOptionIds.includes(o.id) && "✓"}
                      </span>
                    ))}
                  </div>
                </div>
                <ActionButton url={`/api/sections/${s.id}/questions?questionId=${q.id}`} method="DELETE" variant="ghost">
                  Remove
                </ActionButton>
              </li>
            ))}
          </ol>
          <div className="mt-3">
            <AttachQuestions sectionId={s.id} subject={s.subject} />
          </div>
        </Card>
      ))}

      <Card title="Add section">
        <SectionForm examId={exam.id} subjects={subjects} />
        <p className="mt-2 text-xs text-muted">
          Sections, question counts, marks and duration are fully configurable per mock exam; nothing assumes a fixed official pattern.
        </p>
      </Card>

      <Card title="Exam details">
        <ExamForm
          examId={exam.id}
          categories={categories.map((c) => ({ id: c.id, label: c.nameEn }))}
          series={seriesList.map((s) => ({ id: s.s.id, label: `${s.categoryName} · ${s.s.titleEn}` }))}
          defaults={{
            code: exam.code,
            examType: exam.examType,
            titleEn: exam.titleEn,
            titleHi: exam.titleHi ?? "",
            instructionsEn: exam.instructionsEn ?? "",
            instructionsHi: exam.instructionsHi ?? "",
            defaultDurationMinutes: exam.defaultDurationMinutes,
            allowAnswerReview: exam.allowAnswerReview,
            slug: exam.slug ?? "",
            descriptionEn: exam.descriptionEn ?? "",
            descriptionHi: exam.descriptionHi ?? "",
            categoryId: exam.categoryId ?? "",
            seriesId: exam.seriesId ?? "",
            testKind: exam.testKind,
            isPublic: exam.isPublic,
            accessLevel: exam.accessLevel,
            timed: exam.timed,
            maxAttempts: exam.maxAttempts,
            resultPolicy: exam.resultPolicy,
            resultReleaseAt: exam.resultReleaseAt ? utcToZonedInput(exam.resultReleaseAt) : "",
          }}
        />
      </Card>
    </>
  );
}
