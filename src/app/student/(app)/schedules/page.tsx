import Link from "next/link";
import { requireStudentPage } from "@/lib/auth/session";
import { getUiLang } from "@/lib/i18n/server-lang";
import { st, type SiteKey } from "@/lib/i18n/site";
import { formatDateTime } from "@/lib/time/zone";
import { listStudentRequests } from "@/server/services/test-schedule-service";
import { CancelScheduleButton } from "@/components/student/student-widgets";

export const metadata = { title: "My scheduled tests" };

export default async function MySchedulesPage() {
  const student = await requireStudentPage("/student/schedules");
  const lang = await getUiLang();
  const rows = await listStudentRequests(student);
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h1 className="mb-4 text-xl font-semibold">{st(lang, "mySchedules")}</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{st(lang, "noSchedules")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-2 [&_td]:pr-3 [&_th]:pr-3 [&_th]:text-left">
            <thead className="text-muted">
              <tr>
                <th>{st(lang, "navMockTests")}</th>
                <th>{st(lang, "scheduledFor")}</th>
                <th>{st(lang, "scheduleStatus")}</th>
                <th>{st(lang, "adminNote")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.slug ? (
                      <Link href={`/student/tests/${r.slug}`} className="text-primary underline">
                        {lang === "hi" && r.titleHi ? r.titleHi : r.titleEn}
                      </Link>
                    ) : (
                      r.titleEn
                    )}
                  </td>
                  <td className="whitespace-nowrap">{formatDateTime(r.startAt ?? r.requestedStartAt)}</td>
                  <td>{st(lang, `st_${r.status}` as SiteKey)}</td>
                  <td className="text-muted">{r.adminNote ?? ""}</td>
                  <td>{(r.status === "PENDING" || r.status === "APPROVED") && <CancelScheduleButton requestId={r.id} lang={lang} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
