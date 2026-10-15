import { requireCandidatePage } from "@/lib/auth/session";
import { normalizeLang } from "@/lib/i18n/dictionary";
import { FullscreenGate } from "@/components/candidate/fullscreen-gate";
import { LangProvider } from "@/components/candidate/lang";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const candidate = await requireCandidatePage();
  return (
    <LangProvider initial={normalizeLang(candidate.preferredLanguage)}>
      {children}
      <FullscreenGate />
    </LangProvider>
  );
}
