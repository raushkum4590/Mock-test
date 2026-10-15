import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { listIncorrectQuestions } from "@/server/services/practice-service";
import { QuestionReview } from "@/components/student/question-review";

export const metadata = { title: "Practise your mistakes" };

/** Questions answered incorrectly in released results, with the correct answer and explanation. */
export default async function MistakesPage() {
  const student = await requireStudentPage("/student/mistakes");
  const lang = await getUiLang();
  const items = await listIncorrectQuestions(student);
  return (
    <>
      <h1 className="text-xl font-semibold">{st(lang, "incorrectPractice")}</h1>
      {items.length === 0 && <p className="text-sm text-muted">{st(lang, "noAttempts")}</p>}
      {items.map((q) => (
        <details key={q.id} className="rounded-lg border border-border bg-surface">
          <summary className="cursor-pointer p-4 text-sm">
            <span className="text-xs text-muted">
              {q.subject}
              {q.topic ? ` · ${q.topic}` : ""}
            </span>
            <span className="mt-1 block">{lang === "hi" && q.textHi ? q.textHi : (q.textEn ?? q.textHi)}</span>
            <span className="mt-1 block text-xs text-primary">{st(lang, "showSolution")}</span>
          </summary>
          <div className="p-4 pt-0">
            <QuestionReview
              lang={lang}
              textEn={q.textEn}
              textHi={q.textHi}
              options={q.options}
              selectedOptionId={q.yourOptionId}
              correctOptionIds={q.options.filter((o) => o.isCorrect).map((o) => o.id)}
              explanationEn={q.explanationEn}
              explanationHi={q.explanationHi}
              outcome="INCORRECT"
            />
          </div>
        </details>
      ))}
    </>
  );
}
