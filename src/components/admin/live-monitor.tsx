"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { formatDateTime, formatDuration } from "@/lib/time/zone";
import type { getScheduleMonitor } from "@/server/services/monitoring-service";
import { Alert, Badge, Card, Table } from "@/components/ui";
import { ActionButton } from "./action-button";

type Monitor = Awaited<ReturnType<typeof getScheduleMonitor>>;

/** Polls the monitoring API every 3 seconds. */
export function LiveMonitor({ scheduleId, canHold, canEnd }: { scheduleId: string; canHold: boolean; canEnd: boolean }) {
  const [data, setData] = useState<Monitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const d = await api<Monitor>(`/api/monitoring/${scheduleId}`);
        if (!stop) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (!stop) setError((e as Error).message);
      }
    };
    void load();
    const id = setInterval(load, 3000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [scheduleId]);

  if (!data) return error ? <Alert tone="error">{error}</Alert> : <p className="text-muted">Loading…</p>;
  const { schedule: s, timing, summary } = data;
  const tz = s.timeZone;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          {s.title} <Badge>{s.status}</Badge>
        </h1>
        <div className="flex gap-2">
          {canHold && s.status === "RUNNING" && s.allowPause && (
            <ActionButton url={`/api/schedules/${s.id}/transition`} body={{ action: "PAUSE" }} reasonPrompt="Reason for the emergency hold:" variant="danger">
              Emergency hold
            </ActionButton>
          )}
          {canHold && s.status === "PAUSED" && (
            <ActionButton url={`/api/schedules/${s.id}/transition`} body={{ action: "RESUME" }} variant="success">
              Resume
            </ActionButton>
          )}
          {canEnd && (s.status === "RUNNING" || s.status === "PAUSED") && (
            <ActionButton url={`/api/schedules/${s.id}/transition`} body={{ action: "END" }} reasonPrompt="Reason for ending the exam early (all attempts will be submitted):" variant="danger">
              End exam now
            </ActionButton>
          )}
        </div>
      </div>
      {error && <Alert tone="warning">Connection problem: {error} (showing last data)</Alert>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Box label="Remaining" value={["RUNNING", "PAUSED"].includes(s.status) ? formatDuration(timing.remainingSeconds) : "—"} />
        <Box label="Assigned" value={summary.assigned} />
        <Box label="Online now" value={summary.online} />
        <Box label="Not started" value={summary.notStarted} />
        <Box label="In progress" value={summary.inProgress} />
        <Box label="Submitted" value={summary.submitted} />
      </div>
      <p className="text-xs text-muted">
        Start {formatDateTime(timing.startAt, tz)} · official end {formatDateTime(timing.endAt, tz)} · server time {formatDateTime(timing.serverNow, tz)}
      </p>
      <Card title="Candidates">
        <Table>
          <thead>
            <tr>
              <th>Roll number</th>
              <th>Name</th>
              <th>Connection</th>
              <th>Workstation (assigned / actual)</th>
              <th>Status</th>
              <th>Answered</th>
              <th>Marked</th>
              <th>Violations</th>
              <th>Photos</th>
              <th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {data.candidates.map((c) => (
              <tr key={c.candidateId} className={s.violationLimit > 0 && c.violations >= s.violationLimit ? "bg-red-50" : undefined}>
                <td className="font-mono">{c.rollNumber}</td>
                <td>{c.fullName}</td>
                <td>{c.online ? <span className="text-success">● online</span> : <span className="text-muted">○ offline</span>}</td>
                <td className="font-mono text-xs">
                  {c.workstationCode ?? "—"} / {c.actualWorkstation ?? "—"}
                  {c.workstationCode && c.actualWorkstation && c.workstationCode !== c.actualWorkstation && <span className="ml-1 text-danger">≠</span>}
                </td>
                <td>{c.attemptStatus ? <Badge>{c.attemptStatus}</Badge> : <span className="text-muted">not started</span>}</td>
                <td>{c.answered}</td>
                <td>{c.marked}</td>
                <td>
                  {c.violations > 0 ? (
                    <span className={s.violationLimit > 0 && c.violations >= s.violationLimit ? "font-semibold text-danger" : "text-warning"}>
                      {c.violations}
                      {s.violationLimit > 0 && ` / ${s.violationLimit}`}
                      {c.lastViolation && <span className="block text-[11px] text-muted">{c.lastViolation.type.replace("_", " ").toLowerCase()}</span>}
                    </span>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </td>
                <td className="whitespace-nowrap text-xs">
                  {c.photos.length === 0
                    ? "—"
                    : c.photos.map((ph) => (
                        <a key={ph.id} href={`/api/admin/photos/${ph.id}`} target="_blank" rel="noreferrer" className="mr-1 text-primary underline" title={formatDateTime(ph.capturedAt, tz)}>
                          {ph.kind.toLowerCase()}
                        </a>
                      ))}
                </td>
                <td>{formatDateTime(c.lastSeenAt, tz)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card title="Recent events">
        <ul className="space-y-1 font-mono text-xs">
          {data.events.map((e) => (
            <li key={e.id}>
              {formatDateTime(e.createdAt, tz)} · {e.type} {e.toStatus ? `${e.fromStatus}→${e.toStatus}` : ""} · {e.actor}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function Box({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
