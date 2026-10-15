"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { LangSwitch, useLang } from "./lang";

export function CandidateHeader({ name, rollNumber, showLogout = true }: { name: string; rollNumber: string; showLogout?: boolean }) {
  const { t } = useLang();
  const router = useRouter();
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-primary px-6 py-3 text-white">
      <span className="text-lg font-semibold">{t("appName")}</span>
      <div className="flex items-center gap-4 text-sm">
        <span>
          {name} · <span className="font-mono">{rollNumber}</span>
        </span>
        <LangSwitch dark />
        {showLogout && (
          <button
            type="button"
            className="rounded border border-white/40 px-3 py-1 hover:bg-white/10"
            onClick={async () => {
              await api("/api/auth/logout?who=candidate", { method: "POST" }).catch(() => {});
              router.replace("/login");
            }}
          >
            {t("logout")}
          </button>
        )}
      </div>
    </header>
  );
}

export function CandidateMessage({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-lg border border-border bg-surface p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold">{title}</h1>
      {body && <p className="mt-2 text-sm text-muted">{body}</p>}
      <a href="/candidate/dashboard" className="mt-4 inline-block text-sm text-primary underline">
        ←
      </a>
    </div>
  );
}
