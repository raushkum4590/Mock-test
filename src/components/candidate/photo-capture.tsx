"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { captureJpeg, openCamera, stopCamera, waitForFrame } from "@/lib/client/camera";
import { Alert, Button } from "@/components/ui";
import { useLang } from "./lang";

/** Step 1 of the centre login: live camera → capture → upload (Cloudinary via the server). */
export function PhotoCapture({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"idle" | "live" | "captured" | "uploading">("idle");
  const [shot, setShot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    try {
      stopCamera(streamRef.current);
      const stream = await openCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("live");
    } catch {
      setError(t("photoCameraError"));
      setPhase("idle");
    }
  };

  useEffect(() => {
    const id = setTimeout(() => void start(), 0);
    return () => {
      clearTimeout(id);
      stopCamera(streamRef.current);
    };
    // Start once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !(await waitForFrame(video))) {
      setError(t("photoCameraError"));
      return;
    }
    const jpeg = captureJpeg(video);
    if (!jpeg) {
      setError(t("photoCameraError"));
      return;
    }
    setShot(jpeg);
    setPhase("captured");
  };

  const upload = async () => {
    if (!shot) return;
    setPhase("uploading");
    setError(null);
    try {
      await api("/api/candidate/photo", { body: { image: shot } });
      stopCamera(streamRef.current);
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setPhase("captured");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm" data-testid="photo-step">
      <h2 className="text-lg font-semibold">{t("photoTitle")}</h2>
      <p className="text-sm text-muted">{t("photoIntro")}</p>
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-slate-900">
        {/* Live preview stays mounted so the stream keeps playing; the captured frame is laid over it. */}
        <video ref={videoRef} muted playsInline className="size-full -scale-x-100 object-cover" aria-label={t("photoTitle")} />
        {shot && phase !== "live" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} alt="" className="absolute inset-0 size-full -scale-x-100 object-cover" />
        )}
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        {phase === "idle" && <Button onClick={start}>{t("photoStartCamera")}</Button>}
        {phase === "live" && (
          <Button onClick={capture} data-testid="capture-photo">
            {t("photoCapture")}
          </Button>
        )}
        {(phase === "captured" || phase === "uploading") && (
          <>
            <Button onClick={upload} disabled={phase === "uploading"} data-testid="use-photo">
              {phase === "uploading" ? t("photoUploading") : t("photoUse")}
            </Button>
            <Button
              variant="secondary"
              disabled={phase === "uploading"}
              onClick={() => {
                setShot(null);
                setPhase("live");
              }}
            >
              {t("photoRetake")}
            </Button>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-muted">
          <button type="button" className="underline" onClick={onSkip}>
            {t("photoSkip")}
          </button>{" "}
          — {t("photoSkipNote")}
        </p>
      )}
    </section>
  );
}
