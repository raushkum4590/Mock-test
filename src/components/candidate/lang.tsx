"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { t as translate, type DictKey, type Lang } from "@/lib/i18n/dictionary";
import { api } from "@/lib/client/api";
import { LANG_COOKIE } from "@/lib/auth/cookie-names";
import { cx } from "@/components/ui";

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string };
const Ctx = createContext<LangCtx | null>(null);

/** persist: where the preference is stored server-side, or false. */
export function LangProvider({ initial, persist = "candidate", children }: { initial: Lang; persist?: false | "candidate" | "student"; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      document.documentElement.lang = l;
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      // Preference only — switching language never touches answers.
      if (persist === "candidate") void api("/api/candidate/language", { body: { language: l } }).catch(() => {});
      if (persist === "student") void api("/api/student/profile", { method: "PATCH", body: { language: l } }).catch(() => {});
    },
    [persist],
  );
  const t = useCallback((k: DictKey) => translate(lang, k), [lang]);
  return <Ctx value={{ lang, setLang, t }}>{children}</Ctx>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside LangProvider");
  return v;
}

export function LangSwitch({ className, dark = false }: { className?: string; dark?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t("language")} className={cx("inline-flex overflow-hidden rounded-md border text-sm", dark ? "border-white/40" : "border-border", className)}>
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cx(
            "px-3 py-1",
            lang === l ? (dark ? "bg-white text-primary font-semibold" : "bg-primary text-white font-semibold") : dark ? "text-white hover:bg-white/10" : "bg-surface hover:bg-slate-50",
          )}
          lang={l}
        >
          {l === "en" ? "English" : "हिन्दी"}
        </button>
      ))}
    </div>
  );
}
