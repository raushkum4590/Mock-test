/**
 * The server's notion of "now". Every time-dependent decision (schedule
 * transitions, deadlines, late entry) reads it from here so tests can drive
 * time deterministically instead of waiting in real time.
 */
type NowFn = () => Date;

const g = globalThis as unknown as { __cbtClock?: NowFn | null };

export function now(): Date {
  return g.__cbtClock ? g.__cbtClock() : new Date();
}

/** Test hook. Pass null to restore the system clock. */
export function setClock(fn: NowFn | null): void {
  g.__cbtClock = fn;
}

/** Controllable clock for tests. */
export class FakeClock {
  private current: number;
  constructor(start: Date | string) {
    this.current = new Date(start).getTime();
  }
  now = (): Date => new Date(this.current);
  set(to: Date | string): void {
    this.current = new Date(to).getTime();
  }
  advance(ms: number): void {
    this.current += ms;
  }
  advanceSeconds(s: number): void {
    this.advance(s * 1000);
  }
  advanceMinutes(m: number): void {
    this.advance(m * 60_000);
  }
  install(): this {
    setClock(this.now);
    return this;
  }
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * SECOND);
}

export function secondsBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / SECOND);
}
