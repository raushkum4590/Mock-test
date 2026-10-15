import Link from "next/link";
import type { Lang } from "@/lib/i18n/dictionary";
import { st } from "@/lib/i18n/site";
import { formatDateTime } from "@/lib/time/zone";
import type { getStudentHistory } from "@/server/services/practice-service";

type Row = Awaited<ReturnType<typeof getStudentHistory>>[number];

export function HistoryTable({ rows, lang }: { rows: Row[]; lang: Lang }) {
  if (rows.length === 0) return <p className="text-sm text-muted">{st(lang, "noAttempts")}</p>;
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:py-2 [&_th]:text-left" data-testid="history-table">
        <thead>
          <tr className="text-muted">
            <th>{st(lang, "allTests")}</th>
            <th>{st(lang, "date")}</th>
            <th>{st(lang, "score")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hidden = !r.released;
            return (
              <tr key={r.attemptId}>
                <td>
                  {lang === "hi" && r.titleHi ? r.titleHi : r.titleEn}
                  <span className="ml-1 text-xs text-muted">
                    ({st(lang, "attemptNo")} {r.attemptNumber})
                  </span>
                </td>
                <td className="whitespace-nowrap">{formatDateTime(r.submittedAt ?? r.startedAt, undefined, locale)}</td>
                <td className="tabular-nums">
                  {r.status === "IN_PROGRESS" ? (
                    <span className="text-warning">{st(lang, "inProgress")}</span>
                  ) : hidden || r.finalScore === null ? (
                    "—"
                  ) : (
                    `${r.finalScore} / ${r.maxScore}`
                  )}
                </td>
                <td className="text-right">
                  <Link href={r.status === "IN_PROGRESS" ? `/student/attempts/${r.attemptId}` : `/student/attempts/${r.attemptId}/result`} className="text-primary underline">
                    {r.status === "IN_PROGRESS" ? st(lang, "continueTest") : st(lang, "viewResult")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
