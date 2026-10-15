import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st } from "@/lib/i18n/site";
import { getStudentHistory } from "@/server/services/practice-service";
import { HistoryTable } from "@/components/student/history-table";

export const metadata = { title: "Test history" };

export default async function HistoryPage() {
  const student = await requireStudentPage("/student/history");
  const lang = await getUiLang();
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h1 className="mb-4 text-xl font-semibold">{st(lang, "history")}</h1>
      <HistoryTable rows={await getStudentHistory(student)} lang={lang} />
    </section>
  );
}
