import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { listQuestions, listSubjects, QUESTION_CSV_COLUMNS } from "@/server/services/question-service";
import { CsvImport } from "@/components/admin/csv-import";
import { QuestionForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Question bank" };

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ subject?: string; q?: string }> }) {
  await requireAdminPage("questions.manage");
  const sp = await searchParams;
  const [questions, subjects] = await Promise.all([listQuestions({ subject: sp.subject, search: sp.q, limit: 300 }), listSubjects()]);
  return (
    <>
      <h1 className="text-xl font-semibold">Question bank</h1>
      <Card
        title={`Questions (${questions.length}${questions.length === 300 ? "+" : ""})`}
        actions={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from an API route, not a page
          <a href="/api/questions/export" className="text-sm text-primary underline">
            Export CSV (includes answers)
          </a>
        }
      >
        <form className="mb-3 flex flex-wrap gap-2 text-sm" method="get">
          <select name="subject" defaultValue={sp.subject ?? ""} className="rounded border border-border px-2 py-1">
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search code or text" className="rounded border border-border px-2 py-1" />
          <button className="rounded border border-border bg-surface px-3 py-1">Filter</button>
        </form>
        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject / topic</th>
              <th>Question</th>
              <th>Difficulty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>
                  <Link href={`/admin/questions/${q.id}`} className="font-mono text-primary underline">
                    {q.code}
                  </Link>
                </td>
                <td>
                  {q.subject}
                  {q.topic && <div className="text-xs text-muted">{q.topic}</div>}
                </td>
                <td className="max-w-xl">
                  <div className="line-clamp-2">{q.textEn ?? q.textHi}</div>
                  {q.textEn && q.textHi && (
                    <div className="line-clamp-1 text-xs text-muted" lang="hi">
                      {q.textHi}
                    </div>
                  )}
                </td>
                <td>{q.difficulty}</td>
                <td>{q.isActive ? <Badge tone="READY">Active</Badge> : <Badge tone="ARCHIVED">Inactive</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card title="Import questions">
        <CsvImport url="/api/questions/import" columns={QUESTION_CSV_COLUMNS.join(", ")} label="Upload a UTF-8 CSV; 'correct' is A–F or 1–6" />
      </Card>
      <Card title="Create question">
        <QuestionForm />
      </Card>
    </>
  );
}
