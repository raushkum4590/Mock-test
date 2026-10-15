import { requireCandidatePage } from "@/lib/auth/session";
import { ExamScreen } from "@/components/exam/exam-screen";

export const metadata = { title: "Examination" };

export default async function ExamPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const candidate = await requireCandidatePage();
  const { scheduleId } = await params;
  // Everything else is loaded client-side from the API so the page can
  // recover from reconnects without a full reload.
  return <ExamScreen mode={{ kind: "centre", scheduleId }} candidate={{ fullName: candidate.fullName, rollNumber: candidate.rollNumber }} />;
}
