/**
 * Client-side answer synchronisation (framework-agnostic, unit-tested).
 *
 *  - Every local change bumps a per-question revision and is queued.
 *  - Changes to the same question coalesce: only the newest is sent.
 *  - A queued change keeps its idempotency key across retries, so a retry
 *    of a request the server already applied is acknowledged (DUPLICATE).
 *  - An answer is shown as saved only after the server acknowledges that
 *    exact revision.
 *  - Network failures retry with exponential backoff; nothing is dropped.
 *  - STALE responses (server holds a newer revision, e.g. a second device)
 *    adopt the server state.
 *  - The pending queue is mirrored to sessionStorage so a renderer crash or
 *    accidental reload does not lose unsent changes. sessionStorage is never
 *    authoritative: on load the server state wins unless the stored change
 *    is newer than what the server has.
 *  - Fatal responses (exam ended / submitted / paused) stop sending and are
 *    reported; the server is the final authority on what was accepted.
 */
export type ServerAnswer = { questionId: string; selectedOptionId: string | null; markedForReview: boolean; revision: number };

export type AnswerChange = ServerAnswer & { idempotencyKey: string };

export type SaveItemResult =
  | { questionId: string; status: "SAVED" | "DUPLICATE"; revision: number }
  | { questionId: string; status: "STALE"; revision: number; server: ServerAnswer }
  | { questionId: string; status: "INVALID"; message: string };

export type SendResult = { ok: true; results: SaveItemResult[] } | { ok: false; fatal: boolean; code: string };

export type LocalAnswer = {
  selectedOptionId: string | null;
  markedForReview: boolean;
  /** Latest local revision. */
  revision: number;
  /** Latest revision the server has acknowledged. */
  savedRevision: number;
  error?: string;
};

export type SyncStatus = "saved" | "pending" | "error";

export type SyncSnapshot = {
  answers: ReadonlyMap<string, LocalAnswer & { status: SyncStatus }>;
  unsaved: number;
  pending: number;
  fatal: string | null;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AnswerSyncOptions = {
  attemptId: string;
  send: (changes: AnswerChange[]) => Promise<SendResult>;
  onChange?: () => void;
  onFatal?: (code: string) => void;
  storage?: StorageLike | null;
  newKey?: () => string;
  retryBaseMs?: number;
  retryMaxMs?: number;
  /** Delay before sending, so rapid clicks coalesce into one request. */
  debounceMs?: number;
  batchSize?: number;
};

export class AnswerSync {
  private answers = new Map<string, LocalAnswer>();
  private queue = new Map<string, AnswerChange>();
  private inFlight = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;
  private fatalCode: string | null = null;
  private readonly o: Required<Omit<AnswerSyncOptions, "storage" | "onChange" | "onFatal">> &
    Pick<AnswerSyncOptions, "storage" | "onChange" | "onFatal">;

  constructor(opts: AnswerSyncOptions) {
    this.o = {
      retryBaseMs: 1000,
      retryMaxMs: 15_000,
      debounceMs: 150,
      batchSize: 50,
      newKey: () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      ...opts,
    };
  }

  private get storageKey() {
    return `cbt-pending-${this.o.attemptId}`;
  }

  /** Load server state, then re-queue stored changes that are newer than the server's. */
  init(server: ServerAnswer[]): void {
    this.answers.clear();
    for (const a of server) {
      this.answers.set(a.questionId, {
        selectedOptionId: a.selectedOptionId,
        markedForReview: a.markedForReview,
        revision: a.revision,
        savedRevision: a.revision,
      });
    }
    const stored = this.readStorage();
    for (const c of stored) {
      const current = this.answers.get(c.questionId);
      if (current && current.savedRevision >= c.revision) continue;
      this.queue.set(c.questionId, c);
      this.answers.set(c.questionId, {
        selectedOptionId: c.selectedOptionId,
        markedForReview: c.markedForReview,
        revision: c.revision,
        savedRevision: current?.savedRevision ?? 0,
      });
    }
    this.persist();
    if (this.queue.size) this.schedule(0);
    this.o.onChange?.();
  }

  get(questionId: string): LocalAnswer | undefined {
    return this.answers.get(questionId);
  }

  status(questionId: string): SyncStatus {
    const a = this.answers.get(questionId);
    if (!a) return "saved";
    if (a.error) return "error";
    return a.savedRevision >= a.revision ? "saved" : "pending";
  }

  get pendingCount(): number {
    return this.queue.size;
  }

  /** Questions whose latest local revision is not yet acknowledged. */
  get unsavedCount(): number {
    let n = 0;
    // Rejected changes (INVALID, e.g. a closed timed section) can never be saved and must not block submission.
    for (const a of this.answers.values()) if (a.savedRevision < a.revision && !a.error) n++;
    return n;
  }

  get fatal(): string | null {
    return this.fatalCode;
  }

  /** Immutable copy of the current state, for rendering. */
  snapshot(): SyncSnapshot {
    const answers = new Map<string, LocalAnswer & { status: SyncStatus }>();
    for (const [id, a] of this.answers) answers.set(id, { ...a, status: this.status(id) });
    return { answers, unsaved: this.unsavedCount, pending: this.queue.size, fatal: this.fatalCode };
  }

  /** Record a visit so the palette can distinguish "not visited". */
  visit(questionId: string): void {
    if (!this.answers.has(questionId)) this.update(questionId, { selectedOptionId: null, markedForReview: false });
  }

  update(questionId: string, patch: { selectedOptionId?: string | null; markedForReview?: boolean }): void {
    if (this.fatalCode) return;
    const prev = this.answers.get(questionId);
    const next: LocalAnswer = {
      selectedOptionId: patch.selectedOptionId !== undefined ? patch.selectedOptionId : (prev?.selectedOptionId ?? null),
      markedForReview: patch.markedForReview !== undefined ? patch.markedForReview : (prev?.markedForReview ?? false),
      revision: (prev?.revision ?? 0) + 1,
      savedRevision: prev?.savedRevision ?? 0,
    };
    this.answers.set(questionId, next);
    this.queue.set(questionId, {
      questionId,
      selectedOptionId: next.selectedOptionId,
      markedForReview: next.markedForReview,
      revision: next.revision,
      idempotencyKey: this.o.newKey(),
    });
    this.persist();
    this.o.onChange?.();
    this.schedule(this.o.debounceMs);
  }

  /** Send everything queued now (e.g. on "Save & Next" or before submit). */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.sendNow();
  }

  /** Periodic reconciliation with the server's view (no pending change wins over it). */
  applyServer(server: ServerAnswer[]): void {
    let changed = false;
    for (const s of server) {
      if (this.queue.has(s.questionId)) continue;
      const local = this.answers.get(s.questionId);
      if (!local || s.revision > local.savedRevision) {
        this.answers.set(s.questionId, {
          selectedOptionId: s.selectedOptionId,
          markedForReview: s.markedForReview,
          revision: s.revision,
          savedRevision: s.revision,
        });
        changed = true;
      }
    }
    if (changed) this.o.onChange?.();
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  // --- internals ---------------------------------------------------------------

  private schedule(ms: number) {
    if (this.timer || this.fatalCode) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.sendNow();
    }, ms);
  }

  private async sendNow(): Promise<void> {
    if (this.inFlight || this.fatalCode || this.queue.size === 0) return;
    this.inFlight = true;
    const batch = [...this.queue.values()].slice(0, this.o.batchSize);
    let result: SendResult;
    try {
      result = await this.o.send(batch);
    } catch {
      result = { ok: false, fatal: false, code: "NETWORK" };
    }
    this.inFlight = false;

    if (!result.ok) {
      if (result.fatal) {
        this.fatalCode = result.code;
        for (const c of batch) {
          const a = this.answers.get(c.questionId);
          if (a) a.error = result.code;
        }
        this.o.onChange?.();
        this.o.onFatal?.(result.code);
        return;
      }
      this.failures++;
      const delay = Math.min(this.o.retryMaxMs, this.o.retryBaseMs * 2 ** Math.min(this.failures - 1, 6));
      this.o.onChange?.();
      this.schedule(delay);
      return;
    }

    this.failures = 0;
    for (const r of result.results) {
      const sent = batch.find((c) => c.questionId === r.questionId);
      const local = this.answers.get(r.questionId);
      if (!sent || !local) continue;
      const queued = this.queue.get(r.questionId);
      const superseded = queued && queued.revision > sent.revision;
      if (r.status === "SAVED" || r.status === "DUPLICATE") {
        local.savedRevision = Math.max(local.savedRevision, r.revision);
        local.error = undefined;
        if (!superseded) this.queue.delete(r.questionId);
      } else if (r.status === "STALE") {
        if (!superseded || (queued && queued.revision <= r.server.revision)) {
          // Server is ahead: adopt its state and continue from its revision.
          this.queue.delete(r.questionId);
          this.answers.set(r.questionId, {
            selectedOptionId: r.server.selectedOptionId,
            markedForReview: r.server.markedForReview,
            revision: r.server.revision,
            savedRevision: r.server.revision,
          });
        }
      } else if (r.status === "INVALID") {
        // Cannot succeed: drop it and flag the question.
        local.error = r.message;
        if (!superseded) this.queue.delete(r.questionId);
      }
    }
    this.persist();
    this.o.onChange?.();
    if (this.queue.size) this.schedule(0);
  }

  private persist() {
    const s = this.o.storage;
    if (!s) return;
    try {
      if (this.queue.size) s.setItem(this.storageKey, JSON.stringify([...this.queue.values()]));
      else s.removeItem(this.storageKey);
    } catch {
      /* storage full or unavailable: the in-memory queue still works */
    }
  }

  private readStorage(): AnswerChange[] {
    const s = this.o.storage;
    if (!s) return [];
    try {
      const raw = s.getItem(this.storageKey);
      const parsed = raw ? (JSON.parse(raw) as AnswerChange[]) : [];
      return Array.isArray(parsed) ? parsed.filter((c) => c && typeof c.questionId === "string" && typeof c.revision === "number") : [];
    } catch {
      return [];
    }
  }
}

export type PaletteState = "NOT_VISITED" | "NOT_ANSWERED" | "ANSWERED" | "MARKED" | "ANSWERED_MARKED";

export function paletteState(a: Pick<LocalAnswer, "selectedOptionId" | "markedForReview"> | undefined): PaletteState {
  if (!a) return "NOT_VISITED";
  if (a.selectedOptionId && a.markedForReview) return "ANSWERED_MARKED";
  if (a.selectedOptionId) return "ANSWERED";
  if (a.markedForReview) return "MARKED";
  return "NOT_ANSWERED";
}
