import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { practiceAttempts } from "@db/schema";
import { requireStudentPage } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getUiLang } from "@/lib/i18n/server-lang";
import { FullscreenGate } from "@/components/candidate/fullscreen-gate";
import { LangProvider } from "@/components/candidate/lang";
import { ExamScreen } from "@/components/exam/exam-screen";

export const metadata = { title: "Mock test" };

/** Full-screen exam interface for an online practice attempt (shared CBT screen). */
export default async function PracticeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await requireStudentPage(`/student/attempts/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/student");
  const [a] = await getDb()
    .select({ status: practiceAttempts.status })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.id, id), eq(practiceAttempts.studentId, student.studentId)));
  if (!a) redirect("/student");
  if (a.status !== "IN_PROGRESS") redirect(`/student/attempts/${id}/result`);
  return (
    <LangProvider initial={await getUiLang()} persist="student">
      <ExamScreen mode={{ kind: "practice", attemptId: id }} candidate={{ fullName: student.fullName, rollNumber: student.email }} />
      <FullscreenGate />
    </LangProvider>
  );
}
