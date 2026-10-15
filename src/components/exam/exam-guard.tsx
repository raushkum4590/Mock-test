"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/candidate/lang";

/**
 * Discourages copying and screenshots of the question paper in a browser:
 *  - blocks copy/cut/select-all/print/save/view-source/devtools shortcuts,
 *  - clears the clipboard after PrintScreen (best effort),
 *  - hides the paper while the window is not focused (snipping tools such as
 *    Win+Shift+S take focus before capturing), and
 *  - prints a blank page (see `.exam-paper` in globals.css).
 * A web page cannot fully stop OS screenshots or a phone camera; the Windows
 * client turns on OS-level capture protection (desktop/src/main.ts).
 */
export function ExamGuard() {
  const { t } = useLang();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const blocked = new Set(["c", "x", "a", "p", "s", "u"]);
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        (ctrl && blocked.has(k)) ||
        (ctrl && e.shiftKey && (k === "i" || k === "j" || k === "c" || k === "s")) ||
        k === "f12" ||
        k === "printscreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "printscreen") void navigator.clipboard?.writeText("").catch(() => {});
    };
    const hide = () => setHidden(true);
    const show = () => setHidden(document.visibilityState !== "visible" || !document.hasFocus());
    const onVisibility = () => (document.visibilityState === "visible" ? show() : hide());
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!hidden) return null;
  return (
    <div className="fixed inset-0 z-45 flex items-center justify-center bg-slate-900 p-4 text-center text-white" role="alert" data-testid="exam-hidden">
      <div>
        <p className="text-lg font-semibold">{t("paperHiddenTitle")}</p>
        <p className="mt-2 text-sm opacity-90">{t("paperHiddenBody")}</p>
      </div>
    </div>
  );
}
