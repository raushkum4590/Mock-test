/**
 * Candidate photo storage in Cloudinary (signed server-side upload; the
 * browser never sees the API secret). Photos get random, unguessable public
 * IDs and are only shown to staff through /api/admin/photos/[id], which
 * fetches them server-side.
 *
 * Configuration: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
 * optional CLOUDINARY_FOLDER (default "edqity/exam-photos").
 */
import { createHash, randomBytes } from "node:crypto";
import { AppError } from "@/lib/errors";

export const MAX_PHOTO_BYTES = 1_500_000;

export type StoredPhoto = { storageKey: string; url: string; bytes: number };
export type PhotoUploader = (jpeg: Buffer) => Promise<StoredPhoto>;

export function photoStorageConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/** Decode a `data:image/jpeg;base64,...` URL and check it really is a JPEG of acceptable size. */
export function decodeJpegDataUrl(dataUrl: string): Buffer {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new AppError("VALIDATION", "The photo must be a JPEG image.");
  const buf = Buffer.from(m[1]!, "base64");
  if (buf.length < 1000) throw new AppError("VALIDATION", "The photo is empty. Please capture it again.");
  if (buf.length > MAX_PHOTO_BYTES) throw new AppError("VALIDATION", "The photo is too large.");
  // JPEG files start with FF D8 FF.
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) throw new AppError("VALIDATION", "The photo must be a JPEG image.");
  return buf;
}

const cloudinaryUploader: PhotoUploader = async (jpeg) => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !secret) {
    throw new AppError("VALIDATION", "Photo upload is not set up on the server. Please call the invigilator.");
  }
  const folder = process.env.CLOUDINARY_FOLDER || "edqity/exam-photos";
  const publicId = randomBytes(18).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Cloudinary signature: SHA-1 of the alphabetically sorted params + secret.
  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + secret).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }), "photo.jpg");
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);

  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: form });
  } catch {
    throw new AppError("INTERNAL", "Could not reach the photo service. Check the internet connection and try again.");
  }
  if (!res.ok) {
    console.error("[photos] Cloudinary upload failed:", res.status, await res.text().catch(() => ""));
    throw new AppError("INTERNAL", "The photo could not be uploaded. Please try again.");
  }
  const body = (await res.json()) as { public_id: string; secure_url: string; bytes: number };
  return { storageKey: body.public_id, url: body.secure_url, bytes: body.bytes };
};

let uploader: PhotoUploader = cloudinaryUploader;

/** Tests replace the uploader; pass null to restore Cloudinary. */
export function setPhotoUploader(fn: PhotoUploader | null): void {
  uploader = fn ?? cloudinaryUploader;
}

export function uploadPhoto(jpeg: Buffer): Promise<StoredPhoto> {
  return uploader(jpeg);
}
