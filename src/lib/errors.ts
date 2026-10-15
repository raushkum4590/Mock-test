/** Typed application errors that map to HTTP responses in src/server/http.ts. */
export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INVALID_TRANSITION"
  | "RATE_LIMITED"
  | "NOT_ELIGIBLE"
  | "EXAM_NOT_OPEN"
  | "EXAM_NOT_STARTED"
  | "EXAM_PAUSED"
  | "EXAM_ENDED"
  | "LATE_ENTRY_CLOSED"
  | "ATTEMPT_SUBMITTED"
  | "WORKSTATION_MISMATCH"
  | "SETUP_DISABLED"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  INVALID_TRANSITION: 409,
  RATE_LIMITED: 429,
  NOT_ELIGIBLE: 403,
  EXAM_NOT_OPEN: 409,
  EXAM_NOT_STARTED: 409,
  EXAM_PAUSED: 409,
  EXAM_ENDED: 409,
  LATE_ENTRY_CLOSED: 403,
  ATTEMPT_SUBMITTED: 409,
  WORKSTATION_MISMATCH: 403,
  SETUP_DISABLED: 403,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export const isAppError = (e: unknown): e is AppError => e instanceof AppError;
