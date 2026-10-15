import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects small inline bootstrap scripts, so 'unsafe-inline' is needed
// for scripts unless a nonce-based CSP is wired up through proxy.ts
// (see docs/architecture.md, "Content Security Policy").
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Every page in this application is per-user and request-time (sessions,
  // live exam state). Cache Components would keep hidden routes mounted via
  // <Activity> (e.g. a running exam screen with timers) and requires Suspense
  // around every session read, so it is deliberately disabled.
  cacheComponents: false,
  poweredByHeader: false,
  serverExternalPackages: ["@node-rs/argon2", "pg", "@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          // Camera is used on this site only (exam identity photos and monitoring).
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
