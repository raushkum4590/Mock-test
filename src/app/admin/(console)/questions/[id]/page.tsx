import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { getQuestion } from "@/server/services/question-service";
import { QuestionForm } from "@/components/admin/forms";
import { Alert, Card } from "@/components/ui";

export const metadata = { title: "Edit question" };

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("questions.manage");
  const { id } = await params;
  let q;
  try {
    q = await getQuestion(id);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  return (
    <>
      <Link href="/admin/questions" className="text-sm text-primary underline">
        ← Question bank
      </Link>
      <Card title={`Edit ${q.code}`}>
        <QuestionForm
          questionId={q.id}
          defaults={{
            code: q.code,
            subject: q.subject,
            topic: q.topic ?? "",
            difficulty: q.difficulty,
            textEn: q.textEn ?? "",
            textHi: q.textHi ?? "",
            imageUrl: q.imageUrl ?? "",
            explanationEn: q.explanationEn ?? "",
            explanationHi: q.explanationHi ?? "",
            marksCorrect: q.marksCorrect,
            marksWrong: q.marksWrong,
            isActive: q.isActive,
            options: q.options.map((o) => ({ textEn: o.textEn ?? "", textHi: o.textHi ?? "", imageUrl: o.imageUrl ?? "", isCorrect: o.isCorrect })),
          }}
        />
      </Card>
    </>
  );
}
