import { redirect } from "next/navigation";
import { requireCandidatePage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { getCandidateExamState } from "@/server/services/attempt-service";
import { WaitingRoom } from "@/components/candidate/waiting-room";
import { CandidateMessage } from "@/components/candidate/candidate-header";

export const metadata = { title: "Waiting Room" };

export default async function WaitingPage({ params }: { params: Promise<{ scheduleId: string }> }) {
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
  return <WaitingRoom state={state} />;
}
