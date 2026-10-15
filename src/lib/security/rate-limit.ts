/**
 * In-memory fixed-window rate limiter. Adequate for the single exam server
 * of a LAN centre; a multi-instance deployment would move this to the
 * database or Redis (documented in docs/architecture.md).
 */
type Bucket = { count: number; resetAt: number };

const g = globalThis as unknown as { __cbtRate?: Map<string, Bucket> };
const buckets = (g.__cbtRate ??= new Map());

let lastSweep = 0;
function sweep(nowMs: number) {
  if (nowMs - lastSweep < 60_000) return;
  lastSweep = nowMs;
  for (const [key, b] of buckets) if (b.resetAt <= nowMs) buckets.delete(key);
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  // Rate limiting uses the real wall clock, not the injectable exam clock.
  const nowMs = Date.now();
  sweep(nowMs);
  let b = buckets.get(key);
  if (!b || b.resetAt <= nowMs) {
    b = { count: 0, resetAt: nowMs + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  return {
    allowed: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfterSeconds: Math.ceil((b.resetAt - nowMs) / 1000),
  };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

export function clearAllRateLimits(): void {
  buckets.clear();
}
