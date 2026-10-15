"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { useLang } from "./lang";

/**
 * Keeps the pre-exam candidate pages (dashboard, instructions, waiting room)
 * and the online mock-test exam screen in fullscreen. Fullscreen is lost on reload or Esc, and browsers only allow
 * re-entering it on a click, so a blocking overlay asks for that click.
 * The exam screen has its own proctored check (ExamProctor) and the
 * submission page is left alone; the Windows kiosk client is fullscreen already.
 */
export function FullscreenGate() {
  const { t } = useLang();
  const pathname = usePathname();
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    const sync = () => setNeeded(!window.cbtClient?.kiosk && !document.fullscreenElement);
    const id = setTimeout(sync, 0);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      clearTimeout(id);
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  if (!needed || pathname.startsWith("/candidate/exam/") || pathname.startsWith("/candidate/submission/")) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="alertdialog" aria-modal="true" data-testid="fullscreen-gate">
      <div className="max-w-md rounded-lg bg-surface p-6 text-center shadow-xl">
        <h2 className="text-lg font-semibold">{t("fullscreenNeededTitle")}</h2>
        <p className="mt-2 text-sm">{t("fullscreenNeededBody")}</p>
        <Button className="mt-4" onClick={() => void document.documentElement.requestFullscreen?.().catch(() => {})}>
          {t("enterFullscreen")}
        </Button>
      </div>
    </div>
  );
}
