"use client";

import { useState } from "react";
import { ActionButton } from "./action-button";

/** Generates a single-use, 30-minute password reset link to give to the student. */
export function ResetLinkButton({ studentId }: { studentId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <ActionButton url={`/api/admin/students/${studentId}/reset-link`} onDone={(r) => setUrl((r as { url: string }).url)}>
        Reset link
      </ActionButton>
      {url && (
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="mt-1 w-72 rounded border border-border px-1 font-mono text-xs" aria-label="Reset link" />
      )}
    </span>
  );
}
