"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/client/api";
import { Button } from "@/components/ui";

/**
 * Calls an API endpoint, optionally after a confirmation or a required
 * reason (sent as `reason` in the body), then refreshes server data.
 */
export function ActionButton({
  url,
  method = "POST",
  body,
  confirm,
  reasonPrompt,
  children,
  variant = "secondary",
  size = "sm",
  onDone,
}: {
  url: string;
  method?: "POST" | "PATCH" | "DELETE" | "PUT";
  body?: Record<string, unknown>;
  confirm?: string;
  reasonPrompt?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md";
  onDone?: (result: unknown) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    let reason: string | null = null;
    if (reasonPrompt) {
      reason = window.prompt(reasonPrompt);
      if (reason === null) return;
      if (!reason.trim()) {
        setError("A reason is required.");
        return;
      }
    } else if (confirm && !window.confirm(confirm)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api(url, { method, body: reason ? { ...body, reason } : body });
      onDone?.(result);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <Button type="button" variant={variant} size={size} onClick={run} disabled={busy}>
        {busy ? "…" : children}
      </Button>
      {error && (
        <span role="alert" className="mt-1 max-w-xs text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
