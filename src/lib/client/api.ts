/** Browser-side fetch helper for the JSON API. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isNetworkError(e: unknown): boolean {
  return e instanceof TypeError || (e instanceof ApiError && e.status === 0);
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; raw?: string; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (opts.raw !== undefined) {
    headers["Content-Type"] = "text/csv";
    body = opts.raw;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, {
    method: opts.method ?? (body ? "POST" : "GET"),
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store",
    signal: opts.signal,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    // A 422 import report is a normal (non-exception) result for callers.
    if (res.status === 422 && data && !err) return data as T;
    throw new ApiError(res.status, err?.code ?? "HTTP_" + res.status, err?.message ?? `Request failed (${res.status})`, err?.details);
  }
  return data as T;
}
