"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { captureJpeg, openCamera, stopCamera, waitForFrame } from "@/lib/client/camera";
import type { ViolationType } from "@db/schema";
import type { ProctoringPolicy, ViolationResult } from "@/server/services/proctoring-service";
import { Button, cx } from "@/components/ui";
import { useLang } from "@/components/candidate/lang";

/**
 * Centre-exam proctoring on the exam screen:
 *  - camera stays on with a visible indicator; a START photo is uploaded once,
 *  - fullscreen is required (skipped in the Windows kiosk client, which is
 *    fullscreen and locked already),
 *  - leaving fullscreen, hiding the tab and losing the camera are reported to
 *    the server, which counts them and may auto-submit (schedule policy).
 */
export function ExamProctor({
  attemptId,
  policy,
  initialCount,
  active,
  onAutoSubmitted,
  onAnswersReset,
}: {
  attemptId: string;
  policy: ProctoringPolicy;
  initialCount: number;
  /** False while the exam is ending, so leaving fullscreen then is not a violation. */
  active: boolean;
  onAutoSubmitted: () => void;
  /** The server discarded all answers because fullscreen was left; the paper must be reloaded. */
  onAnswersReset: () => void;
}) {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(active);
  const [camera, setCamera] = useState<"off" | "starting" | "on" | "failed">("off");
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [kiosk, setKiosk] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [warning, setWarning] = useState(false);

  // The parent passes a fresh callback on every render (its timer ticks each
  // second); keep it in a ref so `report`/`startCamera` stay stable and the
  // camera effect does not stop and restart the camera on every tick.
  const onAutoSubmittedRef = useRef(onAutoSubmitted);
  const onAnswersResetRef = useRef(onAnswersReset);
  useEffect(() => {
    activeRef.current = active;
    onAutoSubmittedRef.current = onAutoSubmitted;
    onAnswersResetRef.current = onAnswersReset;
  }, [active, onAutoSubmitted, onAnswersReset]);

  const report = useCallback(
    async (type: ViolationType) => {
      if (!activeRef.current) return;
      try {
        const r = await api<ViolationResult>(`/api/attempts/${attemptId}/violations`, { body: { type } });
        setCount(r.count);
        if (r.counted) setWarning(true);
        if (r.autoSubmitted) onAutoSubmittedRef.current();
        else if (r.answersReset) onAnswersResetRef.current();
      } catch {
        /* offline: the event is lost but the screen stays blocked until fixed */
      }
    },
    [attemptId],
  );

  // --- camera --------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    setCamera("starting");
    try {
      stopCamera(streamRef.current);
      const stream = await openCamera();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
      setCamera("on");
      for (const track of stream.getVideoTracks()) {
        track.addEventListener("ended", () => {
          setCamera("failed");
          void report("CAMERA_OFF");
        });
      }
      // START photo once per attempt (survives page reloads).
      const key = `cbt:photo:start:${attemptId}`;
      if (video && !sessionStorage.getItem(key) && (await waitForFrame(video))) {
        const jpeg = captureJpeg(video);
        if (jpeg) {
          await api(`/api/attempts/${attemptId}/photo`, { body: { kind: "START", image: jpeg } })
            .then(() => sessionStorage.setItem(key, "1"))
            .catch(() => {});
        }
      }
    } catch {
      setCamera("failed");
      void report("CAMERA_DENIED");
    }
  }, [attemptId, report]);

  useEffect(() => {
    if (!policy.cameraMonitoring) return;
    const id = setTimeout(() => void startCamera(), 0);
    return () => {
      clearTimeout(id);
      stopCamera(streamRef.current);
    };
  }, [policy.cameraMonitoring, startCamera]);

  // --- fullscreen and tab visibility ------------------------------------------------
  useEffect(() => {
    const isKiosk = !!window.cbtClient?.kiosk;
    const id = setTimeout(() => {
      setKiosk(isKiosk);
      setIsFullscreen(!!document.fullscreenElement);
    }, 0);
    if (!policy.requireFullscreen || isKiosk) return () => clearTimeout(id);
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) void report("FULLSCREEN_EXIT");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void report("TAB_HIDDEN");
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(id);
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [policy.requireFullscreen, report]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setWarning(false);
    } catch {
      /* the browser refused; the overlay stays */
    }
  };

  const needFullscreen = policy.requireFullscreen && !kiosk && !isFullscreen && active;
  const needCamera = policy.cameraMonitoring && camera === "failed" && active;
  const limitText = policy.violationLimit > 0 ? ` / ${policy.violationLimit}` : "";

  return (
    <>
      {policy.cameraMonitoring && (
        <div className="fixed bottom-3 left-3 z-30 w-36 overflow-hidden rounded-md border border-border bg-black shadow-lg" aria-live="polite">
          <video ref={videoRef} muted playsInline className="aspect-4/3 w-full -scale-x-100 object-cover" aria-hidden />
          <div className={cx("flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white", camera === "on" ? "bg-green-700" : "bg-red-700")} data-testid="camera-indicator">
            <span aria-hidden>●</span> {camera === "on" ? t("cameraActive") : t("cameraOff")}
            {count > 0 && (
              <span className="ml-auto">
                {t("violationsSoFar")}: {count}
                {limitText}
              </span>
            )}
          </div>
        </div>
      )}

      {(needFullscreen || needCamera) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="alertdialog" aria-modal="true" data-testid="proctor-block">
          <div className="max-w-md rounded-lg bg-surface p-6 text-center shadow-xl">
            {warning && count > 0 && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <p className="font-semibold">{t("violationWarningTitle")}</p>
                <p>{t("violationWarningBody")}</p>
                <p className="mt-1 font-mono">
                  {t("violationsSoFar")}: {count}
                  {limitText}
                </p>
              </div>
            )}
            {needCamera ? (
              <>
                <h2 className="text-lg font-semibold">{t("cameraNeededTitle")}</h2>
                <p className="mt-2 text-sm">{t("cameraNeededBody")}</p>
                <Button className="mt-4" onClick={() => void startCamera()}>
                  {t("retry")}
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">{t("fullscreenNeededTitle")}</h2>
                <p className="mt-2 text-sm">{t("fullscreenNeededBody")}</p>
                <Button className="mt-4" onClick={() => void enterFullscreen()} data-testid="enter-fullscreen">
                  {t("enterFullscreen")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
