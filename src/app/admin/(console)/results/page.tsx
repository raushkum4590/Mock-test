import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/time/zone";
import { listSchedules } from "@/server/services/schedule-service";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Results" };

export default async function ResultsIndex() {
  await requireAdminPage("results.view");
  const schedules = (await listSchedules()).filter((s) => ["RUNNING", "PAUSED", "COMPLETED", "CANCELLED"].includes(s.status));
  return (
    <>
      <h1 className="text-xl font-semibold">Results</h1>
      <Card title="Schedules with attempts">
        <Table>
          <thead>
            <tr>
              <th>Schedule</th>
              <th>Exam</th>
              <th>Start</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link className="text-primary underline" href={`/admin/results/${s.id}`}>
                    {s.title}
                  </Link>
                </td>
                <td className="font-mono text-xs">{s.examCode}</td>
                <td>{formatDateTime(s.startAt, s.timeZone)}</td>
                <td>
                  <Badge>{s.status}</Badge>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
