import { getUiLang } from "@/lib/i18n/server-lang";
import { ResetPasswordForm } from "@/components/student/auth-forms";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <ResetPasswordForm lang={await getUiLang()} token={token ?? ""} />;
}
