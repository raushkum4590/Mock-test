import { redirect } from "next/navigation";
import { requireCandidatePage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { getCandidateExamState } from "@/server/services/attempt-service";
import { InstructionsView } from "@/components/candidate/instructions-view";
import { CandidateMessage } from "@/components/candidate/candidate-header";

export const metadata = { title: "Instructions" };

export default async function InstructionsPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const candidate = await requireCandidatePage();
  const { scheduleId } = await params;
  let state;
  try {
    state = await getCandidateExamState(candidate, scheduleId);
  } catch (e) {
    if (isAppError(e)) return <CandidateMessage title={e.message} />;
    throw e;
  }
  if (state.attempt && state.attempt.status !== "IN_PROGRESS") redirect(`/candidate/submission/${scheduleId}`);
  return <InstructionsView state={state} />;
}
