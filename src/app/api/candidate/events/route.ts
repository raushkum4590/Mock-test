import { z } from "zod";
import { CANDIDATE_COOKIE } from "@/lib/auth/cookie-names";
import { errorResponse, requireCandidate } from "@/server/http";
import { getCandidateExamState, getScheduleTimingShared } from "@/server/services/attempt-service";
import { resolveCandidateSession } from "@/server/services/session-service";
import type { NextRequest } from "next/server";

const TICK_MS = 2000;
const SESSION_CHECK_MS = 10_000;

/**
 * Server-Sent Events stream of the official exam state for one schedule.
 * Events:
 *   state  – full candidate state on connect
 *   timing – { serverNow, status, phase, endAt, remainingSeconds, ... } every 2 s
 *   ended  – session revoked/expired; the client must re-authenticate
 * The client falls back to polling /api/candidate/state if SSE is blocked.
 */
export async function GET(req: NextRequest) {
  let initial;
  let scheduleId: string;
  try {
    const principal = await requireCandidate(req);
    scheduleId = z.uuid().parse(req.nextUrl.searchParams.get("scheduleId"));
    initial = await getCandidateExamState(principal, scheduleId); // also authorizes the schedule
  } catch (err) {
    return errorResponse(err);
  }
  const token = req.cookies.get(CANDIDATE_COOKIE)?.value;
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          close();
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      };

      send("state", initial);
      let busy = false;
      let lastSessionCheck = Date.now();
      interval = setInterval(async () => {
        if (busy || closed) return;
        busy = true;
        try {
          // Re-validating the session keeps last_seen fresh (monitoring
          // "online" status) and ends the stream after logout/revocation.
          if (Date.now() - lastSessionCheck > SESSION_CHECK_MS) {
            lastSessionCheck = Date.now();
            if (!(await resolveCandidateSession(token))) {
              send("ended", { reason: "SESSION_ENDED" });
              close();
              return;
            }
          }
          const timing = await getScheduleTimingShared(scheduleId);
          if (timing) send("timing", timing);
        } catch {
          send("degraded", { message: "Server cannot reach the database. Retrying…" });
        } finally {
          busy = false;
        }
      }, TICK_MS);
      req.signal.addEventListener("abort", close);
    },
    cancel() {
      closed = true;
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
