import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { DEFAULT_TIME_ZONE, formatDateTime } from "@/lib/time/zone";
import { listBatches } from "@/server/services/candidate-service";
import { listExams } from "@/server/services/exam-service";
import { listSchedules } from "@/server/services/schedule-service";
import { ScheduleForm } from "@/components/admin/forms";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Schedules" };

export default async function SchedulesPage() {
  const admin = await requireAdminPage("monitoring.view");
  const canManage = hasPermission(admin.role, "schedules.manage");
  const [schedules, exams, batches] = await Promise.all([listSchedules(), canManage ? listExams() : [], canManage ? listBatches() : []]);
  return (
    <>
      <h1 className="text-xl font-semibold">Schedules</h1>
      <Card title="All schedules">
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Exam</th>
              <th>Batch</th>
              <th>Login opens</th>
              <th>Start</th>
              <th>End</th>
              <th>Assigned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link className="text-primary underline" href={`/admin/schedules/${s.id}`}>
                    {s.title}
                  </Link>
                </td>
                <td className="font-mono text-xs">{s.examCode}</td>
                <td>{s.batchCode ?? "—"}</td>
                <td>{formatDateTime(s.loginOpensAt, s.timeZone)}</td>
                <td>{formatDateTime(s.startAt, s.timeZone)}</td>
                <td>{formatDateTime(s.endAt, s.timeZone)}</td>
                <td>{s.assigned}</td>
                <td>
                  <Badge>{s.status}</Badge>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted">
                  No schedules yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      {canManage && (
        <Card title="Create schedule">
          <ScheduleForm exams={exams} batches={batches} timeZone={DEFAULT_TIME_ZONE} />
        </Card>
      )}
    </>
  );
}
