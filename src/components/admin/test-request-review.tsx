"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { Button, Input } from "@/components/ui";

/** Approve (optionally at a different time) or reject a student's test schedule request. */
export function TestRequestReview({ requestId, defaultStart }: { requestId: string; defaultStart: string }) {
  const router = useRouter();
  const [startAt, setStartAt] = useState(defaultStart);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (decision: "APPROVE" | "REJECT") => {
    if (decision === "REJECT" && !note.trim()) {
      setError("Write a reason in the note to reject.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/test-requests/${requestId}`, { body: { decision, startAt: decision === "APPROVE" ? startAt : undefined, note: note || undefined } });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-w-72 flex-col gap-2">
      <Input type="datetime-local" aria-label="Approved start time" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
      <Input placeholder="Note to student (required to reject)" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="success" disabled={busy || !startAt} onClick={() => send("APPROVE")}>
          Approve
        </Button>
        <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => send("REJECT")}>
          Reject
        </Button>
      </div>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
