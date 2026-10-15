import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/time/zone";
import { listWorkstations } from "@/server/services/candidate-service";
import { listCentres } from "@/server/services/centre-service";
import { ActionButton } from "@/components/admin/action-button";
import { WorkstationCentreSelect } from "@/components/admin/centre-select";
import { CentreForm, WorkstationForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Exam centres" };

export default async function CentresPage() {
  await requireAdminPage("candidates.manage");
  const [centres, workstations] = await Promise.all([listCentres(), listWorkstations()]);
  const options = centres.filter((c) => c.isActive).map((c) => ({ id: c.id, code: c.code }));
  const codeById = new Map(centres.map((c) => [c.id, c.code]));
  return (
    <>
      <h1 className="text-xl font-semibold">Exam centres</h1>
      <p className="text-sm text-muted">
        Each centre has its own workstations and allotted candidates. Attendance for a sitting is reported centre-wise on the schedule page (by the
        candidate&apos;s workstation, or their allotted centre if no workstation is set).
      </p>
      <Card title={`Centres (${centres.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
              <th>Workstations</th>
              <th>Candidates</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {centres.map((c) => (
              <tr key={c.id}>
                <td className="font-mono">{c.code}</td>
                <td>
                  {c.name}
                  {c.address && <div className="text-xs text-muted">{c.address}</div>}
                </td>
                <td>{c.city ?? "—"}</td>
                <td>{c.workstations}</td>
                <td>
                  <Link className="text-primary underline" href={`/admin/candidates?centreId=${c.id}`}>
                    {c.candidates}
                  </Link>
                </td>
                <td>{c.isActive ? <Badge tone="READY">Active</Badge> : <Badge tone="CANCELLED">Inactive</Badge>}</td>
                <td>
                  <ActionButton url={`/api/centres/${c.id}`} method="PATCH" body={{ isActive: !c.isActive }} variant="ghost">
                    {c.isActive ? "Deactivate" : "Activate"}
                  </ActionButton>
                </td>
              </tr>
            ))}
            {centres.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted">
                  No centres yet. Add the first one below.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <div className="mt-4">
          <CentreForm />
        </div>
      </Card>
      <Card title={`Workstations (${workstations.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Lab</th>
              <th>IP</th>
              <th>Last seen</th>
              <th>Centre</th>
            </tr>
          </thead>
          <tbody>
            {workstations.map((w) => (
              <tr key={w.id}>
                <td className="font-mono">{w.code}</td>
                <td>{w.lab ?? "—"}</td>
                <td className="font-mono text-xs">{w.ipAddress ?? "—"}</td>
                <td className="text-xs">{formatDateTime(w.lastSeenAt)}</td>
                <td>
                  <WorkstationCentreSelect
                    workstationId={w.id}
                    value={w.centreId}
                    // Keep an inactive centre selectable for a workstation already in it.
                    centres={w.centreId && !options.some((o) => o.id === w.centreId) ? [...options, { id: w.centreId, code: codeById.get(w.centreId) ?? "?" }] : options}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="mt-4">
          <WorkstationForm centres={options} />
        </div>
      </Card>
    </>
  );
}
