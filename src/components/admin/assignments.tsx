"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { Alert, Button, Input } from "@/components/ui";

export function WorkstationSelect({
  assignmentId,
  value,
  workstations,
}: {
  assignmentId: string;
  value: string | null;
  workstations: { id: string; code: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <select
        className="rounded border border-border px-2 py-1 text-sm"
        defaultValue={value ?? ""}
        aria-label="Workstation"
        onChange={async (e) => {
          setError(null);
          try {
            await api(`/api/assignments/${assignmentId}`, { method: "PATCH", body: { workstationId: e.target.value || null } });
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <option value="">—</option>
        {workstations.map((w) => (
          <option key={w.id} value={w.id}>
            {w.code}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}

export function AssignCandidates({
  scheduleId,
  candidates,
}: {
  scheduleId: string;
  candidates: { id: string; rollNumber: string; fullName: string; batchCode: string | null }[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? candidates.filter((c) => c.rollNumber.toLowerCase().includes(s) || c.fullName.toLowerCase().includes(s)) : candidates).slice(0, 200);
  }, [q, candidates]);

  if (candidates.length === 0) return <p className="text-sm text-muted">All active candidates are assigned.</p>;
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Assign individual candidates</span>
        <Input className="max-w-xs" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search candidates" />
        <Button size="sm" variant="secondary" onClick={() => setSelected(new Set(filtered.map((c) => c.id)))}>
          Select shown
        </Button>
      </div>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="max-h-56 overflow-y-auto text-sm">
        {filtered.map((c) => (
          <label key={c.id} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(c.id);
                else next.delete(c.id);
                setSelected(next);
              }}
            />
            <span className="font-mono">{c.rollNumber}</span> {c.fullName} {c.batchCode && <span className="text-muted">({c.batchCode})</span>}
          </label>
        ))}
      </div>
      <Button
        size="sm"
        disabled={selected.size === 0}
        onClick={async () => {
          try {
            const r = await api<{ added: number }>(`/api/schedules/${scheduleId}/assignments`, { body: { candidateIds: [...selected] } });
            setMsg({ tone: "success", text: `Assigned ${r.added} candidate(s).` });
            setSelected(new Set());
            router.refresh();
          } catch (e) {
            setMsg({ tone: "error", text: (e as Error).message });
          }
        }}
      >
        Assign {selected.size} selected
      </Button>
    </div>
  );
}
