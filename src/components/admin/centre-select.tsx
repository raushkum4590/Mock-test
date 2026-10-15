"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";

/** Moves a workstation to another centre. */
export function WorkstationCentreSelect({ workstationId, value, centres }: { workstationId: string; value: string | null; centres: { id: string; code: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <select
        aria-label="Centre"
        className="rounded border border-border px-2 py-1 text-sm"
        value={value ?? ""}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          setError(null);
          try {
            await api(`/api/workstations/${workstationId}`, { method: "PATCH", body: { centreId: e.target.value || null } });
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <option value="">— no centre —</option>
        {centres.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}
