/**
 * Check that the Cloudinary credentials in .env can upload exam photos:
 * `npm run cloudinary:check`. Uploads a tiny test image (into the configured
 * folder, then into the root folder), prints Cloudinary's answer, and deletes
 * whatever it uploaded.
 */
import "dotenv/config";
import { createHash } from "node:crypto";

const cloud = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const secret = process.env.CLOUDINARY_API_SECRET ?? "";
const folder = process.env.CLOUDINARY_FOLDER || "edqity/exam-photos";

// 1x1 PNG.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

type CloudinaryReply = { public_id?: string; error?: { message?: string } };

/** Signed Cloudinary call: signature = SHA-1 of the sorted params + API secret. */
async function call(action: "upload" | "destroy", params: Record<string, string>, file?: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  if (file) form.append("file", file);
  form.append("api_key", apiKey);
  form.append("signature", createHash("sha1").update(toSign + secret).digest("hex"));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/${action}`, { method: "POST", body: form });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as CloudinaryReply };
}

const timestamp = () => Math.floor(Date.now() / 1000).toString();

async function tryUpload(label: string, withFolder: boolean): Promise<boolean> {
  const params: Record<string, string> = { public_id: `edqity-check-${Date.now().toString(36)}`, timestamp: timestamp() };
  if (withFolder) params.folder = folder;
  const up = await call("upload", params, PIXEL);
  if (up.status !== 200 || !up.body.public_id) {
    console.log(`  ✗ ${label}: ${up.status} ${up.body.error?.message ?? JSON.stringify(up.body)}`);
    return false;
  }
  console.log(`  ✓ ${label}: upload OK`);
  const del = await call("destroy", { public_id: up.body.public_id, timestamp: timestamp() });
  console.log(del.status === 200 ? "    (test image deleted)" : `    could not delete test image ${up.body.public_id} (${del.status}); delete it in the Media Library`);
  return true;
}

async function main() {
  if (!cloud || !apiKey || !secret) {
    console.log("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must all be set in .env.");
    process.exitCode = 1;
    return;
  }
  console.log(`Cloud "${cloud}", API key ${apiKey.slice(0, 4)}…`);
  const inFolder = await tryUpload(`folder "${folder}"`, true);
  const atRoot = inFolder || (await tryUpload("root folder", false));
  console.log();
  if (inFolder) console.log("Credentials are fine. Exam photo uploads should work (restart `npm run dev` if it still fails).");
  else if (atRoot) console.log(`The key can upload, but not into "${folder}". Set CLOUDINARY_FOLDER in .env to a folder this key may write to, or allow this folder for the key.`);
  else console.log("This API key cannot upload at all. In Cloudinary: Settings → API Keys → use the Root key, or give this key a role that can create/upload assets.");
  if (!inFolder) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
