import { redirect } from "next/navigation";
import { getStudent } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { StudentRegisterForm } from "@/components/student/auth-forms";

export const metadata = { title: "Sign up" };

export default async function StudentRegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getStudent()) redirect("/student");
  return <StudentRegisterForm lang={await getUiLang()} next={next} />;
}
