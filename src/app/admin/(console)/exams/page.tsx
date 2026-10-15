import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { listExams } from "@/server/services/exam-service";
import { listAllCategories, listAllSeries } from "@/server/services/catalog-service";
import { ExamForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Exams" };

export default async function ExamsPage() {
  await requireAdminPage("exams.manage");
  const [exams, categories, series] = await Promise.all([listExams(), listAllCategories(), listAllSeries()]);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Exams</h1>
        <Link href="/admin/exams/patterns" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          Create from exam pattern
        </Link>
      </div>
      <Card title="All exams">
        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Type</th>
              <th>Sections</th>
              <th>Questions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link className="font-mono text-primary underline" href={`/admin/exams/${e.id}`}>
                    {e.code}
                  </Link>
                </td>
                <td>
                  {e.titleEn}
                  {e.titleHi && <div className="text-xs text-muted" lang="hi">{e.titleHi}</div>}
                </td>
                <td>{e.examType.replaceAll("_", " ")}</td>
                <td>{e.sections}</td>
                <td>{e.questions}</td>
                <td>
                  <Badge>{e.status}</Badge>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No exams yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      <Card title="Create exam">
        <ExamForm
          categories={categories.map((c) => ({ id: c.id, label: c.nameEn }))}
          series={series.map((s) => ({ id: s.s.id, label: `${s.categoryName} · ${s.s.titleEn}` }))}
        />
      </Card>
    </>
  );
}
