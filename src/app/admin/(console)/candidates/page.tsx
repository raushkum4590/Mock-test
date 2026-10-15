import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/time/zone";
import { listBatches, listCandidates, listWorkstations } from "@/server/services/candidate-service";
import { listCentres } from "@/server/services/centre-service";
import { ActionButton } from "@/components/admin/action-button";
import { CsvImport } from "@/components/admin/csv-import";
import { ResetPasswordButton } from "@/components/admin/reset-password-button";
import { BatchForm, CandidateForm, WorkstationForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Candidates" };

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ q?: string; batchId?: string; centreId?: string }> }) {
  await requireAdminPage("candidates.manage");
  const sp = await searchParams;
  const [candidates, batches, workstations, centres] = await Promise.all([
    listCandidates({ search: sp.q, batchId: sp.batchId, centreId: sp.centreId }),
    listBatches(),
    listWorkstations(),
    listCentres(),
  ]);
  return (
    <>
      <h1 className="text-xl font-semibold">Candidates</h1>
      <Card title={`Candidates (${candidates.length})`}>
        <form className="mb-3 flex flex-wrap gap-2 text-sm" method="get">
          <select name="batchId" defaultValue={sp.batchId ?? ""} className="rounded border border-border px-2 py-1">
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code}
              </option>
            ))}
          </select>
          <select name="centreId" defaultValue={sp.centreId ?? ""} className="rounded border border-border px-2 py-1">
            <option value="">All centres</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Roll number or name" className="rounded border border-border px-2 py-1" />
          <button className="rounded border border-border bg-surface px-3 py-1">Filter</button>
        </form>
        <Table>
          <thead>
            <tr>
              <th>Roll number</th>
              <th>Name</th>
              <th>Batch</th>
              <th>Centre</th>
              <th>Status</th>
              <th>Last login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id}>
                <td className="font-mono">{c.rollNumber}</td>
                <td>{c.fullName}</td>
                <td>{c.batchCode ?? "—"}</td>
                <td>{c.centreCode ?? "—"}</td>
                <td>{c.isActive ? <Badge tone="READY">Active</Badge> : <Badge tone="CANCELLED">Inactive</Badge>}</td>
                <td>{formatDateTime(c.lastLoginAt)}</td>
                <td className="flex flex-wrap gap-1">
                  <ResetPasswordButton candidateId={c.id} rollNumber={c.rollNumber} />
                  <ActionButton url={`/api/candidates/${c.id}`} method="PATCH" body={{ isActive: !c.isActive }} variant="ghost">
                    {c.isActive ? "Deactivate" : "Activate"}
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card title="Add candidate">
        <CandidateForm batches={batches} centres={centres.filter((c) => c.isActive)} />
      </Card>
      <Card title="Import candidates">
        <CsvImport
          url="/api/candidates/import"
          columns="roll_number, full_name, password (optional), batch_code (optional), centre_code (optional), photo_url (optional), language (en/hi)"
          label="Blank passwords are generated and offered for download once"
        />
      </Card>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title={`Batches (${batches.length})`}>
          <ul className="mb-3 space-y-1 text-sm">
            {batches.map((b) => (
              <li key={b.id}>
                <span className="font-mono">{b.code}</span> — {b.name}
              </li>
            ))}
          </ul>
          <BatchForm />
        </Card>
        <Card title={`Workstations (${workstations.length})`}>
          <ul className="mb-3 space-y-1 text-sm">
            {workstations.map((w) => (
              <li key={w.id}>
                <span className="font-mono">{w.code}</span> {w.lab && `· ${w.lab}`} {w.ipAddress && `· ${w.ipAddress}`} · last seen{" "}
                {formatDateTime(w.lastSeenAt)}
              </li>
            ))}
          </ul>
          <WorkstationForm centres={centres.filter((c) => c.isActive)} />
        </Card>
      </div>
    </>
  );
}
