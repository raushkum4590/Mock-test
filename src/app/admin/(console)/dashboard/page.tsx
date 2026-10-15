import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { pingDb } from "@/lib/db/client";
import { hasPermission, type Permission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/time/zone";
import { getDashboardStats } from "@/server/services/monitoring-service";
import { getSchedulerHeartbeat } from "@/server/services/schedule-engine";
import { Alert, Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdminPage();
  const [stats, heartbeat, db] = await Promise.all([getDashboardStats(), getSchedulerHeartbeat(), pingDb()]);
  const hbAge = heartbeat?.ageSeconds ?? null;
  return (
    <>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {(hbAge === null || hbAge > 30) && (
        <Alert tone="warning">
          The scheduler has not reported in {hbAge === null ? "yet" : `${hbAge} s`}. Automatic start/finish still happens on candidate
          requests, but check that the server process (or <code>npm run scheduler</code>) is running.
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ModePanel
          title="Real CBT examination"
          subtitle="Centre-based, scheduled sittings on exam-centre computers"
          links={[
            ["/admin/schedules", "Schedule exams", "schedules.manage"],
            ["/admin/candidates", "Candidates & roll numbers", "candidates.manage"],
            ["/admin/centres", "Exam centres & workstations", "candidates.manage"],
            ["/admin/monitoring", "Live monitoring", "monitoring.view"],
            ["/admin/results", "Results", "results.view"],
          ]}
          role={admin.role}
        />
        <ModePanel
          title="Practice tests"
          subtitle="Online mock tests students take on their own"
          links={[
            ["/admin/exams", "Create practice tests", "exams.manage"],
            ["/admin/catalog", "Online catalogue & test series", "exams.manage"],
            ["/admin/students", "Students & premium access", "students.manage"],
            ["/admin/test-requests", "Test schedule requests", "students.manage"],
          ]}
          role={admin.role}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Candidates" value={stats.candidates} />
        <Stat label="Exams" value={stats.exams} />
        <Stat label="Running now" value={(stats.schedulesByStatus.RUNNING ?? 0) + (stats.schedulesByStatus.PAUSED ?? 0)} />
        <Stat label="Published / waiting" value={(stats.schedulesByStatus.PUBLISHED ?? 0) + (stats.schedulesByStatus.WAITING ?? 0)} />
      </div>
      <Card title="Upcoming and live schedules" actions={<Link className="text-sm text-primary underline" href="/admin/schedules">All schedules</Link>}>
        {stats.upcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing scheduled.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Start</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className="text-primary underline" href={`/admin/schedules/${s.id}`}>
                      {s.title}
                    </Link>
                  </td>
                  <td>
                    <Badge>{s.status}</Badge>
                  </td>
                  <td>{formatDateTime(s.startAt, s.timeZone)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Card title="System">
        <ul className="space-y-1 text-sm">
          <li>
            Database: {db.ok ? `reachable (${db.latencyMs} ms)` : `UNREACHABLE — ${db.error}`}
          </li>
          <li>Scheduler heartbeat: {heartbeat ? `${formatDateTime(heartbeat.at)} on ${heartbeat.host} (pid ${heartbeat.pid})` : "none"}</li>
          <li>Server time: {formatDateTime(new Date())}</li>
        </ul>
      </Card>
    </>
  );
}

function ModePanel({ title, subtitle, links, role }: { title: string; subtitle: string; links: [string, string, Permission][]; role: string }) {
  const visible = links.filter(([, , p]) => hasPermission(role, p));
  if (visible.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-xs text-muted">{subtitle}</p>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {visible.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="inline-block rounded border border-border px-3 py-1.5 hover:bg-slate-50">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
