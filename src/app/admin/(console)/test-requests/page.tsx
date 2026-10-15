import { requireAdminPage } from "@/lib/auth/session";
import { DEFAULT_TIME_ZONE, formatDateTime, utcToZonedInput } from "@/lib/time/zone";
import { getRequireApproval, listScheduleRequests, START_WINDOW_MINUTES } from "@/server/services/test-schedule-service";
import { ActionButton } from "@/components/admin/action-button";
import { TestRequestReview } from "@/components/admin/test-request-review";
import { Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Test schedule requests" };

export default async function TestRequestsPage() {
  await requireAdminPage("students.manage");
  const [required, pending, all] = await Promise.all([getRequireApproval(), listScheduleRequests({ status: "PENDING" }), listScheduleRequests()]);
  const history = all.filter((r) => r.status !== "PENDING");
  return (
    <>
      <h1 className="text-xl font-semibold">Test schedule requests</h1>

      <Card
        title="Approval rule"
        actions={
          <ActionButton
            url="/api/admin/test-requests/settings"
            method="PUT"
            body={{ requireApproval: !required }}
            variant={required ? "secondary" : "primary"}
            confirm={required ? "Let students start online tests at any time without approval?" : "Require admin approval before students can start online tests?"}
          >
            {required ? "Turn off approval" : "Require approval"}
          </ActionButton>
        }
      >
        <p className="text-sm">
          {required ? (
            <>
              <Badge tone="READY">On</Badge> Students must schedule a test and get it approved here. They can start it from the approved time for{" "}
              {START_WINDOW_MINUTES} minutes. Tests already in progress can always be resumed.
            </>
          ) : (
            <>
              <Badge tone="CANCELLED">Off</Badge> Students can start online tests at any time. Scheduling is not required.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">Times are in {DEFAULT_TIME_ZONE}.</p>
      </Card>

      <Card title={`Pending approval (${pending.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Test</th>
              <th>Requested time</th>
              <th>Student note</th>
              <th>Sent</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.studentName}
                  <div className="text-xs text-muted">{r.studentEmail}</div>
                </td>
                <td>
                  {r.examTitle}
                  <div className="font-mono text-xs text-muted">{r.examCode}</div>
                </td>
                <td className="whitespace-nowrap">{formatDateTime(r.requestedStartAt)}</td>
                <td className="max-w-xs text-sm">{r.studentNote ?? "—"}</td>
                <td className="whitespace-nowrap text-xs">{formatDateTime(r.createdAt)}</td>
                <td>
                  <TestRequestReview requestId={r.id} defaultStart={utcToZonedInput(r.requestedStartAt)} />
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No requests waiting.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Card title="Reviewed and closed">
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Test</th>
              <th>Status</th>
              <th>Approved window</th>
              <th>Note</th>
              <th>Reviewed</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.studentName}
                  <div className="text-xs text-muted">{r.studentEmail}</div>
                </td>
                <td className="font-mono text-xs">{r.examCode}</td>
                <td>
                  <Badge>{r.status}</Badge>
                </td>
                <td className="whitespace-nowrap text-xs">{r.startAt ? `${formatDateTime(r.startAt)} → ${formatDateTime(r.windowEndsAt)}` : "—"}</td>
                <td className="max-w-xs text-sm">{r.adminNote ?? ""}</td>
                <td className="whitespace-nowrap text-xs">{formatDateTime(r.reviewedAt)}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  Nothing yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
