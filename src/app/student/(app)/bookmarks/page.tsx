import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { listBookmarks } from "@/server/services/practice-service";
import { QuestionReview } from "@/components/student/question-review";
import { BookmarkButton } from "@/components/student/student-widgets";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const student = await requireStudentPage("/student/bookmarks");
  const lang = await getUiLang();
  const items = await listBookmarks(student);
  return (
    <>
      <h1 className="text-xl font-semibold">{st(lang, "bookmarks")}</h1>
      {items.length === 0 && <p className="text-sm text-muted">—</p>}
      {items.map((q) => (
        <QuestionReview
          key={q.id}
          lang={lang}
          textEn={q.textEn}
          textHi={q.textHi}
          options={q.options}
          selectedOptionId={null}
          correctOptionIds={[]}
          explanationEn={q.explanationEn}
          explanationHi={q.explanationHi}
          actions={
            <>
              <span className="text-xs text-muted">
                {q.subject}
                {q.topic ? ` · ${q.topic}` : ""}
              </span>
              <BookmarkButton questionId={q.id} initial lang={lang} />
            </>
          }
        />
      ))}
    </>
  );
}
