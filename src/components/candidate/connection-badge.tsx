"use client";

import { cx } from "@/components/ui";
import { useLang } from "./lang";
import type { Connection } from "./use-exam-channel";

export function ConnectionBadge({ connection, dark = false }: { connection: Connection; dark?: boolean }) {
  const { t } = useLang();
  const label = connection === "online" ? t("online") : connection === "reconnecting" ? t("reconnecting") : t("offline");
  const dot = connection === "online" ? "bg-green-500" : connection === "reconnecting" ? "bg-amber-400" : "bg-red-500";
  const symbol = connection === "online" ? "●" : connection === "reconnecting" ? "◐" : "✕";
  return (
    <span role="status" aria-live="polite" className={cx("inline-flex items-center gap-1.5 text-xs", dark ? "text-white" : "text-muted")} data-testid="connection">
      <span aria-hidden className={cx("inline-block size-2.5 rounded-full", dot)} />
      <span aria-hidden className="sr-only">
        {symbol}
      </span>
      {label}
    </span>
  );
}
