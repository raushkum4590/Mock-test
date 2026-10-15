/** Browser camera helpers for identity photos and exam monitoring. */

export async function openCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera not supported");
  return navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false });
}

export function stopCamera(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop());
}

/** Current video frame as a JPEG data URL (max 640 px wide). Null if the video has no frame yet. */
export function captureJpeg(video: HTMLVideoElement, quality = 0.8): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const scale = Math.min(1, 640 / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Wait until the video element has a frame to capture (or give up after `ms`). */
export function waitForFrame(video: HTMLVideoElement, ms = 5000): Promise<boolean> {
  if (video.videoWidth > 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", onData);
      resolve(ok);
    };
    const onData = () => done(true);
    const timer = setTimeout(() => done(video.videoWidth > 0), ms);
    video.addEventListener("loadeddata", onData);
  });
}
