import { requireCandidatePage } from "@/lib/auth/session";
import { getCandidateDashboard } from "@/server/services/attempt-service";
import { DashboardView } from "@/components/candidate/dashboard-view";

export const metadata = { title: "Dashboard" };

export default async function CandidateDashboardPage() {
  const candidate = await requireCandidatePage();
  const exams = await getCandidateDashboard(candidate);
  return <DashboardView candidate={{ fullName: candidate.fullName, rollNumber: candidate.rollNumber }} exams={exams} />;
}
