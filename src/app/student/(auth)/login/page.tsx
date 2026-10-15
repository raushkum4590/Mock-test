import { redirect } from "next/navigation";
import { getStudent } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { StudentLoginForm } from "@/components/student/auth-forms";

export const metadata = { title: "Log in" };

export default async function StudentLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getStudent()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/student");
  return <StudentLoginForm lang={await getUiLang()} next={next} />;
}
