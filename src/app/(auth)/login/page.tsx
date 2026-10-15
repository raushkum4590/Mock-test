import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LANG_COOKIE } from "@/lib/auth/cookie-names";
import { getCandidate } from "@/lib/auth/session";
import { normalizeLang } from "@/lib/i18n/dictionary";
import { LangProvider } from "@/components/candidate/lang";
import { CandidateLoginForm } from "@/components/candidate/login-form";

export const metadata = { title: "Candidate Login" };

export default async function LoginPage() {
  if (await getCandidate()) redirect("/candidate/dashboard");
  const lang = normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
  return (
    <LangProvider initial={lang} persist={false}>
      <CandidateLoginForm />
    </LangProvider>
  );
}
