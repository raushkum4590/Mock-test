"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE } from "@/lib/auth/cookie-names";
import { api } from "@/lib/client/api";
import { cx } from "@/components/ui";

function writeLangCookie(l: "en" | "hi") {
  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** Switches the UI language for server-rendered pages (cookie + student profile), then re-renders. */
export function SiteLangSwitch({ lang, loggedIn }: { lang: "en" | "hi"; loggedIn: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (l: "en" | "hi") => {
    if (l === lang) return;
    writeLangCookie(l);
    start(async () => {
      if (loggedIn) await api("/api/student/profile", { method: "PATCH", body: { language: l } }).catch(() => {});
      router.refresh();
    });
  };
  return (
    <div role="group" aria-label="Language / भाषा" className={cx("inline-flex overflow-hidden rounded-md border border-border text-sm", pending && "opacity-60")}>
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => set(l)}
          className={cx("px-2.5 py-1", lang === l ? "bg-primary font-semibold text-white" : "bg-surface hover:bg-slate-50")}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}

export function StudentLogoutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-md px-3 py-1.5 text-sm hover:bg-slate-100"
      onClick={async () => {
        await api("/api/auth/logout?who=student", { method: "POST" }).catch(() => {});
        router.replace("/");
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
