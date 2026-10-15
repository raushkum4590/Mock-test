import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { listAllCategories, listAllSeries } from "@/server/services/catalog-service";
import { listExams } from "@/server/services/exam-service";
import { getDb } from "@/lib/db/client";
import { exams } from "@db/schema";
import { eq } from "drizzle-orm";
import { CategoryForm, SeriesForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Online catalogue" };

export default async function CatalogPage() {
  await requireAdminPage("exams.manage");
  const [categories, series, allExams, published] = await Promise.all([
    listAllCategories(),
    listAllSeries(),
    listExams(),
    getDb().select({ id: exams.id, slug: exams.slug, isPublic: exams.isPublic, accessLevel: exams.accessLevel, testKind: exams.testKind }).from(exams).where(eq(exams.isPublic, true)),
  ]);
  const pubById = new Map(published.map((p) => [p.id, p]));
  return (
    <>
      <h1 className="text-xl font-semibold">Online catalogue</h1>
      <p className="text-sm text-muted">
        Students see tests that are <strong>published online</strong> (exam edit page) and in status <strong>READY</strong>. Categories and series organise them on the
        public site.
      </p>
      <Card title="Published online tests">
        <Table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>URL</th>
              <th>Type</th>
              <th>Access</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allExams
              .filter((e) => pubById.has(e.id))
              .map((e) => {
                const p = pubById.get(e.id)!;
                return (
                  <tr key={e.id}>
                    <td>
                      <Link className="text-primary underline" href={`/admin/exams/${e.id}`}>
                        {e.code}
                      </Link>{" "}
                      {e.titleEn}
                    </td>
                    <td className="font-mono text-xs">
                      <a className="underline" href={`/tests/${p.slug}`}>
                        /tests/{p.slug}
                      </a>
                    </td>
                    <td>{p.testKind}</td>
                    <td>{p.accessLevel}</td>
                    <td>
                      <Badge>{e.status}</Badge>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </Card>
      <Card title={`Exam categories (${categories.length})`}>
        <ul className="mb-4 space-y-1 text-sm">
          {categories.map((c) => (
            <li key={c.id}>
              <span className="font-mono">{c.slug}</span> — {c.nameEn} {c.nameHi && <span lang="hi">/ {c.nameHi}</span>}
            </li>
          ))}
        </ul>
        <CategoryForm />
      </Card>
      <Card title={`Test series (${series.length})`}>
        <ul className="mb-4 space-y-1 text-sm">
          {series.map(({ s, categoryName }) => (
            <li key={s.id}>
              <span className="font-mono">{s.slug}</span> — {s.titleEn} · {categoryName} · {s.accessLevel} {!s.isPublished && "(unpublished)"}
            </li>
          ))}
        </ul>
        <SeriesForm categories={categories.map((c) => ({ id: c.id, label: c.nameEn }))} />
      </Card>
    </>
  );
}
