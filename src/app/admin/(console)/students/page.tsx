import { eq } from "drizzle-orm";
import { exams } from "@db/schema";
import { requireAdminPage } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { formatDateTime } from "@/lib/time/zone";
import { listAllSeries, listEntitlements } from "@/server/services/catalog-service";
import { listStudents } from "@/server/services/student-auth-service";
import { ActionButton } from "@/components/admin/action-button";
import { ResetLinkButton } from "@/components/admin/reset-link-button";
import { EntitlementForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Students" };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPage("students.manage");
  const { q } = await searchParams;
  const [students, entitlements, series, premium] = await Promise.all([
    listStudents(q),
    listEntitlements(),
    listAllSeries(),
    getDb().select({ id: exams.id, code: exams.code, titleEn: exams.titleEn }).from(exams).where(eq(exams.accessLevel, "PREMIUM")),
  ]);
  return (
    <>
      <h1 className="text-xl font-semibold">Students (online platform)</h1>
      <Card title={`Students (${students.length})`}>
        <form className="mb-3 flex gap-2 text-sm" method="get">
          <input name="q" defaultValue={q ?? ""} placeholder="Email or name" className="rounded border border-border px-2 py-1" />
          <button className="rounded border border-border bg-surface px-3 py-1">Search</button>
        </form>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Registered</th>
              <th>Last login</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>
                  {s.fullName} <span className="text-xs text-muted">({s.displayName})</span>
                </td>
                <td>{formatDateTime(s.createdAt)}</td>
                <td>{formatDateTime(s.lastLoginAt)}</td>
                <td>{s.isActive ? <Badge tone="READY">Active</Badge> : <Badge tone="CANCELLED">Inactive</Badge>}</td>
                <td className="flex flex-wrap gap-1">
                  <ResetLinkButton studentId={s.id} />
                  <ActionButton url={`/api/admin/students/${s.id}`} method="PATCH" body={{ isActive: !s.isActive }} variant="ghost">
                    {s.isActive ? "Deactivate" : "Activate"}
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card title="Premium access">
        <p className="mb-3 text-sm text-muted">
          Payments are not integrated. Grant premium access manually; it is checked on the server whenever a student starts a premium test.
        </p>
        <EntitlementForm
          exams={premium.map((e) => ({ id: e.id, label: `${e.code} — ${e.titleEn}` }))}
          series={series.filter((x) => x.s.accessLevel === "PREMIUM").map((x) => ({ id: x.s.id, label: x.s.titleEn }))}
        />
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Test / series</th>
                <th>Expires</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entitlements.map((e) => (
                <tr key={e.id}>
                  <td>{e.email}</td>
                  <td>{e.examTitle ?? e.seriesTitle}</td>
                  <td>{e.expiresAt ? formatDateTime(e.expiresAt) : "Never"}</td>
                  <td>
                    <ActionButton url={`/api/admin/entitlements/${e.id}`} method="DELETE" variant="ghost" confirm="Revoke this access?">
                      Revoke
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}
