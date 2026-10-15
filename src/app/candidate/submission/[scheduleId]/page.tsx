import { requireCandidatePage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { getSubmissionSummary } from "@/server/services/attempt-service";
import { SubmissionView } from "@/components/candidate/submission-view";
import { CandidateMessage } from "@/components/candidate/candidate-header";

export const metadata = { title: "Submission" };

export default async function SubmissionPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const candidate = await requireCandidatePage();
  const { scheduleId } = await params;
  let summary;
  try {
    summary = await getSubmissionSummary(candidate, scheduleId);
  } catch (e) {
    if (isAppError(e)) return <CandidateMessage title={e.message} />;
    throw e;
  }
  return (
    <SubmissionView
      scheduleId={scheduleId}
      candidate={{ fullName: candidate.fullName, rollNumber: candidate.rollNumber }}
      summary={summary}
    />
  );
}
