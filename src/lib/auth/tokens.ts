import { createHmac, randomBytes } from "node:crypto";

let warned = false;

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32 && secret !== "replace-with-a-long-random-secret") return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters in production.");
  }
  if (!warned) {
    warned = true;
    console.warn("[auth] AUTH_SECRET missing or weak; using an insecure development secret.");
  }
  return "insecure-development-secret-do-not-use-in-production";
}

/** Random session token placed in the cookie (256 bits). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** What the database stores: HMAC-SHA256 of the token, so a DB leak exposes no usable tokens. */
export function hashSessionToken(token: string): string {
  return createHmac("sha256", authSecret()).update(token).digest("hex");
}
