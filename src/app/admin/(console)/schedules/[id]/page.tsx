import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/session";
import { isAppError } from "@/lib/errors";
import { ADMIN_ACTION_RULES, ADMIN_ACTIONS } from "@/lib/exam-engine/state-machine";
import { hasPermission } from "@/lib/permissions";
import { formatDateTime, utcToZonedInput } from "@/lib/time/zone";
import { listScheduleEvents } from "@/server/services/audit-service";
import { listBatches, listCandidates, listWorkstations } from "@/server/services/candidate-service";
import { getAttendance } from "@/server/services/centre-service";
import { listExams } from "@/server/services/exam-service";
import { getScheduleDetail } from "@/server/services/schedule-service";
import { ActionButton } from "@/components/admin/action-button";
import { AssignCandidates, WorkstationSelect } from "@/components/admin/assignments";
import { ScheduleForm } from "@/components/admin/forms";
import { Alert, Badge, Card, Table } from "@/components/ui";

export const metadata = { title: "Schedule" };

const NEEDS_REASON = new Set(["PAUSE", "END", "CANCEL"]);

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage("monitoring.view");
  const { id } = await params;
  let detail;
  try {
    detail = await getScheduleDetail(id);
  } catch (e) {
    if (isAppError(e)) return <Alert tone="error">{e.message}</Alert>;
    throw e;
  }
  const { schedule: s, exam, batch, assignments } = detail;
  const canManage = hasPermission(admin.role, "schedules.manage");
  const tz = s.timeZone;
  const actions = ADMIN_ACTIONS.filter((a) => ADMIN_ACTION_RULES[a].from.includes(s.status) && hasPermission(admin.role, ADMIN_ACTION_RULES[a].permission))
    .filter((a) => a !== "PAUSE" || s.allowPause);
  const [events, workstations, allCandidates, exams, batches, attendance] = await Promise.all([
    listScheduleEvents(id, 50),
    canManage ? listWorkstations() : [],
    canManage ? listCandidates({ limit: 5000 }) : [],
    canManage && s.status === "DRAFT" ? listExams() : [],
    canManage && s.status === "DRAFT" ? listBatches() : [],
    getAttendance(id),
  ]);
  const assignedIds = new Set(assignments.map((a) => a.candidateId));
  const unassigned = allCandidates.filter((c) => !assignedIds.has(c.id) && c.isActive);
  const editable = !["COMPLETED", "CANCELLED"].includes(s.status);

  return (
    <>
      <div>
        <Link href="/admin/schedules" className="text-sm text-primary underline">
          ← Schedules
        </Link>
        <h1 className="text-xl font-semibold">
          {s.title} <Badge>{s.status}</Badge>
        </h1>
        <p className="text-sm text-muted">
          {exam.code} — {exam.titleEn} {batch && `· batch ${batch.code}`}
        </p>
      </div>

      <Card
        title="Timing (official, server-controlled)"
        actions={
          <>
            <Link className="text-sm text-primary underline" href={`/admin/monitoring/${s.id}`}>
              Live monitor
            </Link>
            <Link className="text-sm text-primary underline" href={`/admin/results/${s.id}`}>
              Results
            </Link>
          </>
        }
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm md:grid-cols-2">
          <Row k="Time zone" v={tz} />
          <Row k="Login opens" v={formatDateTime(s.loginOpensAt, tz)} />
          <Row k="Scheduled start" v={formatDateTime(s.startAt, tz)} />
          <Row k="Official end" v={formatDateTime(s.endAt, tz)} />
          <Row k="Duration" v={`${s.durationSeconds / 60} minutes`} />
          <Row k="Late entry until" v={formatDateTime(new Date(s.startAt.getTime() + s.lateEntrySeconds * 1000), tz)} />
          <Row k="Actual start" v={formatDateTime(s.actualStartAt, tz)} />
          <Row k="Actual end" v={formatDateTime(s.actualEndAt, tz)} />
          <Row k="Paused since" v={formatDateTime(s.pausedAt, tz)} />
          <Row k="Total paused" v={`${Math.round(s.totalPausedSeconds / 60)} min`} />
          <Row k="Workstation enforced" v={s.enforceWorkstation ? "Yes" : "No"} />
          <Row k="Emergency hold allowed" v={s.allowPause ? "Yes" : "No"} />
          <Row k="Photo before login" v={s.requirePhoto ? "Required" : "No"} />
          <Row k="Camera monitoring" v={s.cameraMonitoring ? "On" : "Off"} />
          <Row k="Fullscreen" v={s.requireFullscreen ? "Required" : "No"} />
          <Row
            k="Violation limit"
            v={s.violationLimit === 0 ? "No limit" : `${s.violationLimit}${s.autoSubmitOnViolations ? " (then auto-submit)" : " (alert only)"}`}
          />
        </dl>
        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            {actions.map((a) => {
              const live = ["PUBLISHED", "WAITING", "RUNNING", "PAUSED"].includes(s.status);
              return (
                <ActionButton
                  key={a}
                  url={`/api/schedules/${s.id}/transition`}
                  body={{ action: a }}
                  variant={a === "PUBLISH" || a === "RESUME" ? "success" : NEEDS_REASON.has(a) ? "danger" : "secondary"}
                  reasonPrompt={NEEDS_REASON.has(a) && (a !== "CANCEL" || live) ? `Reason for "${ADMIN_ACTION_RULES[a].label}" (recorded in the audit log):` : undefined}
                  confirm={a === "PUBLISH" ? "Publish? Candidates will see this exam and it will start automatically at the scheduled time." : undefined}
                >
                  {ADMIN_ACTION_RULES[a].label}
                </ActionButton>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          DRAFT → Lock schedule → Publish. The server then opens login, starts and ends the exam on its own at the times above.
        </p>
      </Card>

      {s.status === "DRAFT" && canManage && (
        <Card title="Edit schedule">
          <ScheduleForm
            scheduleId={s.id}
            exams={exams}
            batches={batches}
            timeZone={tz}
            defaults={{
              examId: s.examId,
              batchId: s.batchId ?? "",
              title: s.title,
              timeZone: tz,
              loginOpensAt: utcToZonedInput(s.loginOpensAt, tz),
              startAt: utcToZonedInput(s.startAt, tz),
              durationMinutes: s.durationSeconds / 60,
              lateEntryMinutes: s.lateEntrySeconds / 60,
              allowPause: s.allowPause,
              enforceWorkstation: s.enforceWorkstation,
              requirePhoto: s.requirePhoto,
              cameraMonitoring: s.cameraMonitoring,
              requireFullscreen: s.requireFullscreen,
              violationLimit: s.violationLimit,
              autoSubmitOnViolations: s.autoSubmitOnViolations,
            }}
          />
        </Card>
      )}

      <Card
        title={`Assigned candidates (${assignments.length})`}
        actions={
          canManage && editable && s.batchId ? (
            <ActionButton url={`/api/schedules/${s.id}/assignments`} body={{ fromBatch: true }} variant="primary">
              Assign all of batch {batch?.code}
            </ActionButton>
          ) : null
        }
      >
        <Table>
          <thead>
            <tr>
              <th>Roll number</th>
              <th>Name</th>
              <th>Workstation</th>
              <th>Attempt</th>
              {canManage && <th />}
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="font-mono">{a.rollNumber}</td>
                <td>{a.fullName}</td>
                <td>
                  {canManage && editable ? (
                    <WorkstationSelect assignmentId={a.id} value={a.workstationId} workstations={workstations.map((w) => ({ id: w.id, code: w.code }))} />
                  ) : (
                    (a.workstationCode ?? "—")
                  )}
                </td>
                <td>{a.attemptStatus ? <Badge>{a.attemptStatus}</Badge> : <span className="text-muted">not started</span>}</td>
                {canManage && (
                  <td>
                    {!a.attemptStatus && editable && (
                      <ActionButton url={`/api/assignments/${a.id}`} method="DELETE" variant="ghost">
                        Remove
                      </ActionButton>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        {canManage && editable && (
          <div className="mt-4">
            <AssignCandidates scheduleId={s.id} candidates={unassigned.map((c) => ({ id: c.id, rollNumber: c.rollNumber, fullName: c.fullName, batchCode: c.batchCode }))} />
          </div>
        )}
      </Card>

      <Card
        title="Centre-wise attendance"
        actions={
          <a className="text-sm text-primary underline" href={`/api/schedules/${s.id}/attendance`}>
            Download CSV
          </a>
        }
      >
        <Table>
          <thead>
            <tr>
              <th>Centre</th>
              <th>Assigned</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Submitted</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {attendance.centres.map((c) => (
              <tr key={c.centreCode ?? "none"}>
                <td>{c.centreCode ? `${c.centreCode} — ${c.centreName}` : <span className="text-muted">No centre</span>}</td>
                <td>{c.assigned}</td>
                <td>{c.present}</td>
                <td>{c.absent}</td>
                <td>{c.submitted}</td>
                <td>{c.attendancePct}%</td>
              </tr>
            ))}
            {attendance.centres.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No candidates assigned.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <p className="mt-2 text-xs text-muted">Present = started the exam (including those who have submitted). Absent = assigned but never started.</p>
      </Card>

      <Card title="Event log">
        <Table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{formatDateTime(e.createdAt, tz)}</td>
                <td>
                  {e.type}
                  {e.toStatus && (
                    <span className="text-muted">
                      {" "}
                      {e.fromStatus} → {e.toStatus}
                    </span>
                  )}
                </td>
                <td className="font-mono text-xs">{e.actor}</td>
                <td className="max-w-md truncate font-mono text-xs">{e.payload ? JSON.stringify(e.payload) : ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
