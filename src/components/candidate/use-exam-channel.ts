"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/client/api";
import type { Timing } from "@/server/services/attempt-service";

export type Connection = "online" | "reconnecting" | "offline";

/**
 * Live official exam state for one schedule via Server-Sent Events, with
 * automatic fallback to polling if SSE keeps failing (e.g. a proxy buffers
 * the stream). Also estimates the offset between the server clock and this
 * PC's clock so countdowns follow server time, not the local clock.
 */
export function useExamChannel(scheduleId: string, initial?: Timing | null, enabled = true) {
  const [timing, setTiming] = useState<Timing | null>(initial ?? null);
  const [offsetMs, setOffsetMs] = useState(0);
  const [connection, setConnection] = useState<Connection>("reconnecting");
  const [sessionEnded, setSessionEnded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let es: EventSource | null = null;
    let errors = 0;
    let disposed = false;

    const accept = (t: Timing) => {
      if (disposed) return;
      setOffsetMs(new Date(t.serverNow).getTime() - Date.now());
      setTiming(t);
      setConnection("online");
    };
    const poll = async () => {
      try {
        const s = await api<{ timing: Timing }>(`/api/candidate/state?scheduleId=${scheduleId}`);
        accept(s.timing);
      } catch (e) {
        if (e instanceof ApiError && e.code === "UNAUTHENTICATED") setSessionEnded(true);
        else if (!disposed) setConnection("offline");
      }
    };
    const startPolling = () => {
      if (!pollRef.current) pollRef.current = setInterval(() => void poll(), 3000);
    };
    const stopPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };

    if (typeof EventSource === "undefined") {
      startPolling();
      void poll();
    } else {
      es = new EventSource(`/api/candidate/events?scheduleId=${scheduleId}`);
      es.addEventListener("state", (e) => accept((JSON.parse((e as MessageEvent).data) as { timing: Timing }).timing));
      es.addEventListener("timing", (e) => accept(JSON.parse((e as MessageEvent).data) as Timing));
      es.addEventListener("degraded", () => setConnection("reconnecting"));
      es.addEventListener("ended", () => {
        setSessionEnded(true);
        es?.close();
      });
      es.onopen = () => {
        errors = 0;
        stopPolling();
      };
      es.onerror = () => {
        // EventSource reconnects by itself; meanwhile poll so the clock stays right.
        errors++;
        setConnection(errors > 2 ? "offline" : "reconnecting");
        if (errors > 2) startPolling();
      };
    }
    return () => {
      disposed = true;
      es?.close();
      stopPolling();
    };
  }, [scheduleId, enabled]);

  return { timing, offsetMs, connection, sessionEnded };
}

/**
 * Official timing for a self-paced practice attempt: the deadline is fixed
 * by the server at start, so a light poll (clock-offset resync + status) is
 * enough. Seeded from the paper response so the countdown starts instantly.
 */
export function usePracticeTiming(attemptId: string, initial: Timing | null, initialOffsetMs: number, enabled = true) {
  const [polled, setPolled] = useState<{ timing: Timing; offsetMs: number } | null>(null);
  const [connection, setConnection] = useState<Connection>("online");
  const [sessionEnded, setSessionEnded] = useState(false);
  useEffect(() => {
    if (!enabled || !attemptId) return;
    let disposed = false;
    const poll = async () => {
      try {
        const s = await api<{ timing: Timing }>(`/api/student/attempts/${attemptId}/state`);
        if (disposed) return;
        setPolled({ timing: s.timing, offsetMs: new Date(s.timing.serverNow).getTime() - Date.now() });
        setConnection("online");
      } catch (e) {
        if (e instanceof ApiError && e.code === "UNAUTHENTICATED") setSessionEnded(true);
        else if (!disposed) setConnection("offline");
      }
    };
    const id = setInterval(() => void poll(), 15_000);
    return () => {
      disposed = true;
      clearInterval(id);
    };
  }, [attemptId, enabled]);
  // Until the first poll, use the paper's timing and the offset measured when it arrived.
  const timing = polled?.timing ?? initial;
  const offsetMs = polled?.offsetMs ?? initialOffsetMs;
  return { timing, offsetMs, connection, sessionEnded };
}

/** Ticks every 250 ms; returns the current time corrected to server time. */
export function useServerNow(offsetMs: number): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now() + offsetMs);
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 250);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [offsetMs]);
  return now;
}

/** Official remaining seconds: frozen while paused, otherwise end_at − server now. */
export function remainingFrom(timing: Timing | null, serverNow: number): number {
  if (!timing) return 0;
  if (timing.status === "PAUSED" || serverNow === 0) return timing.remainingSeconds;
  if (timing.status !== "RUNNING") return timing.status === "COMPLETED" || timing.status === "CANCELLED" ? 0 : timing.remainingSeconds;
  return Math.max(0, Math.ceil((Date.parse(timing.endAt) - serverNow) / 1000));
}
