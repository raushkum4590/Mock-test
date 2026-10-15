import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/time/zone";
import { listSchedules } from "@/server/services/schedule-service";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Live monitoring" };

export default async function MonitoringIndex() {
  await requireAdminPage("monitoring.view");
  const all = await listSchedules();
  const live = all.filter((s) => ["PUBLISHED", "WAITING", "RUNNING", "PAUSED"].includes(s.status));
  const recent = all.filter((s) => s.status === "COMPLETED").slice(0, 10);
  return (
    <>
      <h1 className="text-xl font-semibold">Live monitoring</h1>
      {[
        ["Published and live", live],
        ["Recently completed", recent],
      ].map(([title, rows]) => (
        <Card key={title as string} title={title as string}>
          <Table>
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Start</th>
                <th>Assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(rows as typeof all).map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className="text-primary underline" href={`/admin/monitoring/${s.id}`}>
                      {s.title}
                    </Link>
                  </td>
                  <td>{formatDateTime(s.startAt, s.timeZone)}</td>
                  <td>{s.assigned}</td>
                  <td>
                    <Badge>{s.status}</Badge>
                  </td>
                </tr>
              ))}
              {(rows as typeof all).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">
                    None.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      ))}
    </>
  );
}
