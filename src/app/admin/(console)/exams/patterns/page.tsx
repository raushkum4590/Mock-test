import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { EXAM_PATTERNS, GROUP_LABELS, TIMING_LABELS, patternTotals, type ExamGroup, type TimingType } from "@/lib/exam-patterns";
import { CreateFromPatternButton } from "@/components/admin/create-from-pattern";
import { Card, Table } from "@/components/ui";

export const metadata = { title: "Exam patterns" };

const TIMING_TONE: Record<TimingType, string> = {
  SECTIONAL: "bg-amber-100 text-amber-900",
  OVERALL: "bg-slate-100 text-slate-800",
  MODULES: "bg-sky-100 text-sky-900",
  NOT_VERIFIED: "bg-red-100 text-red-900",
};

function hours(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

export default async function ExamPatternsPage() {
  await requireAdminPage("exams.manage");
  const groups = Object.keys(GROUP_LABELS) as ExamGroup[];
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Exam pattern library</h1>
        <Link href="/admin/exams" className="text-sm text-primary underline">
          ← Exams
        </Link>
      </div>
      <p className="text-sm text-muted">
        &quot;Create mock test&quot; makes a draft test with the category, total time, sections, marks and negative marking filled in. Then attach questions
        to each section. Patterns marked <strong>Not verified</strong> must be checked against the latest official notification before publishing. Sectional
        timers and separately timed modules are enforced in the exam screen: each timed section opens only in its own window, in section order.
      </p>
      {groups.map((g) => {
        const list = EXAM_PATTERNS.filter((p) => p.group === g);
        if (list.length === 0) return null;
        return (
          <Card key={g} title={GROUP_LABELS[g]}>
            <Table>
              <thead>
                <tr>
                  <th>Exam / stage</th>
                  <th>Questions</th>
                  <th>Marks</th>
                  <th>Time</th>
                  <th>Timing</th>
                  <th>Sections</th>
                  <th>Source</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const t = patternTotals(p);
                  return (
                    <tr key={p.id} className="align-top">
                      <td>
                        <div className="font-medium">{p.nameEn}</div>
                        <div className="text-xs text-muted">{p.stage}</div>
                      </td>
                      <td>{t.questions}</td>
                      <td>{t.marks}</td>
                      <td className="whitespace-nowrap">
                        {p.durationMinutes} min
                        <div className="text-xs text-muted">{hours(p.durationMinutes)}</div>
                      </td>
                      <td>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${TIMING_TONE[p.timing]}`}>{TIMING_LABELS[p.timing]}</span>
                        {p.timingNote && <div className="mt-1 max-w-xs text-xs text-muted">{p.timingNote}</div>}
                      </td>
                      <td className="text-xs">
                        <ul className="space-y-0.5">
                          {p.sections.map((s) => (
                            <li key={s.code}>
                              {s.titleEn}: {s.questions} Q · +{s.marksCorrect}
                              {s.marksWrong > 0 ? ` / −${s.marksWrong}` : " / no negative"}
                              {s.groupMinutes ? ` · ${s.groupMinutes} min` : ""}
                            </li>
                          ))}
                        </ul>
                        {p.notes && <p className="mt-1 max-w-xs text-muted">{p.notes}</p>}
                      </td>
                      <td className="text-xs">
                        <a href={p.source} target="_blank" rel="noreferrer" className="text-primary underline">
                          Official site
                        </a>
                        <div className="mt-1">{p.patternYear}</div>
                        <div className={p.verified ? "text-success" : "font-semibold text-danger"}>{p.verified ? "Verified" : "Not verified"}</div>
                      </td>
                      <td>
                        <CreateFromPatternButton patternId={p.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        );
      })}
    </>
  );
}
