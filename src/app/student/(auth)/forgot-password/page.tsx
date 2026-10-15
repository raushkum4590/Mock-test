import { getUiLang } from "@/lib/i18n/server-lang";
import { ForgotPasswordForm } from "@/components/student/auth-forms";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  return <ForgotPasswordForm lang={await getUiLang()} />;
}
