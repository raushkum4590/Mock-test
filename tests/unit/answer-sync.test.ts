import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnswerSync, paletteState, type AnswerChange, type SendResult, type ServerAnswer } from "@/lib/exam-engine/answer-sync";

/** In-memory fake of the server's revision rules (mirrors attempt-service). */
class FakeServer {
  rows = new Map<string, ServerAnswer & { key: string }>();
  online = true;
  fatal: string | null = null;
  calls: AnswerChange[][] = [];
  async send(changes: AnswerChange[]): Promise<SendResult> {
    this.calls.push(changes);
    if (this.fatal) return { ok: false, fatal: true, code: this.fatal };
    if (!this.online) throw new TypeError("Failed to fetch");
    return {
      ok: true,
      results: changes.map((c) => {
        const cur = this.rows.get(c.questionId);
        if (!cur || cur.revision < c.revision) {
          this.rows.set(c.questionId, { ...c, key: c.idempotencyKey });
          return { questionId: c.questionId, status: "SAVED" as const, revision: c.revision };
        }
        if (cur.revision === c.revision && cur.key === c.idempotencyKey) {
          return { questionId: c.questionId, status: "DUPLICATE" as const, revision: c.revision };
        }
        return { questionId: c.questionId, status: "STALE" as const, revision: cur.revision, server: { ...cur } };
      }),
    };
  }
}

class MemStorage {
  m = new Map<string, string>();
  getItem = (k: string) => this.m.get(k) ?? null;
  setItem = (k: string, v: string) => void this.m.set(k, v);
  removeItem = (k: string) => void this.m.delete(k);
}

describe("AnswerSync", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function make(server: FakeServer, storage = new MemStorage()) {
    let n = 0;
    const sync = new AnswerSync({
      attemptId: "att-1",
      send: (c) => server.send(c),
      storage,
      newKey: () => `key-${++n}`,
      retryBaseMs: 1000,
      debounceMs: 100,
    });
    return { sync, storage };
  }

  it("autosaves, coalesces rapid changes and reports saved only after acknowledgement", async () => {
    const server = new FakeServer();
    const { sync } = make(server);
    sync.init([]);
    sync.update("q1", { selectedOptionId: "a" });
    sync.update("q1", { selectedOptionId: "b" });
    sync.update("q1", { selectedOptionId: "c" });
    expect(sync.status("q1")).toBe("pending");
    await vi.advanceTimersByTimeAsync(150);
    expect(server.calls).toHaveLength(1);
    expect(server.calls[0]).toHaveLength(1); // coalesced
    expect(server.rows.get("q1")).toMatchObject({ selectedOptionId: "c", revision: 3 });
    expect(sync.status("q1")).toBe("saved");
    expect(sync.unsavedCount).toBe(0);
  });

  it("keeps changes through a network outage and retries with the same idempotency key", async () => {
    const server = new FakeServer();
    const { sync, storage } = make(server);
    sync.init([]);
    server.online = false;
    sync.update("q1", { selectedOptionId: "a" });
    await vi.advanceTimersByTimeAsync(150);
    expect(sync.status("q1")).toBe("pending");
    expect(storage.getItem("cbt-pending-att-1")).toContain('"q1"'); // survives a reload
    await vi.advanceTimersByTimeAsync(1000); // retry #1 (still offline)
    server.online = true;
    await vi.advanceTimersByTimeAsync(2000); // retry #2 succeeds
    expect(server.rows.get("q1")?.selectedOptionId).toBe("a");
    const keys = new Set(server.calls.map((c) => c[0]!.idempotencyKey));
    expect(keys.size).toBe(1);
    expect(sync.status("q1")).toBe("saved");
    expect(storage.getItem("cbt-pending-att-1")).toBeNull();
  });

  it("a retry of a request the server already applied is acknowledged (no double write)", async () => {
    const server = new FakeServer();
    // First attempt reaches the server but the response is lost.
    let dropResponse = true;
    const sync = new AnswerSync({
      attemptId: "att-2",
      newKey: () => "fixed-key",
      debounceMs: 0,
      retryBaseMs: 500,
      send: async (c) => {
        const r = await server.send(c);
        if (dropResponse) {
          dropResponse = false;
          throw new TypeError("connection reset");
        }
        return r;
      },
    });
    sync.init([]);
    sync.update("q1", { selectedOptionId: "a" });
    await vi.advanceTimersByTimeAsync(10);
    await vi.advanceTimersByTimeAsync(600);
    expect(sync.status("q1")).toBe("saved");
    expect(server.rows.get("q1")?.revision).toBe(1);
  });

  it("restores unsent changes after a reload, unless the server already has newer data", async () => {
    const server = new FakeServer();
    const storage = new MemStorage();
    storage.setItem(
      "cbt-pending-att-1",
      JSON.stringify([
        { questionId: "q1", selectedOptionId: "x", markedForReview: false, revision: 4, idempotencyKey: "k1" },
        { questionId: "q2", selectedOptionId: "old", markedForReview: false, revision: 1, idempotencyKey: "k2" },
      ]),
    );
    const { sync } = make(server, storage);
    sync.init([
      { questionId: "q1", selectedOptionId: "a", markedForReview: false, revision: 3 },
      { questionId: "q2", selectedOptionId: "new", markedForReview: false, revision: 2 },
    ]);
    expect(sync.get("q1")?.selectedOptionId).toBe("x"); // newer local change kept
    expect(sync.get("q2")?.selectedOptionId).toBe("new"); // server wins
    await vi.advanceTimersByTimeAsync(10);
    expect(server.rows.get("q1")?.revision).toBe(4);
  });

  it("adopts the server state on STALE (another device moved ahead)", async () => {
    const server = new FakeServer();
    server.rows.set("q1", { questionId: "q1", selectedOptionId: "server", markedForReview: true, revision: 5, key: "other" });
    const { sync } = make(server);
    sync.init([{ questionId: "q1", selectedOptionId: "mine", markedForReview: false, revision: 2 }]);
    sync.update("q1", { selectedOptionId: "mine2" }); // revision 3 < 5
    await vi.advanceTimersByTimeAsync(150);
    expect(sync.get("q1")).toMatchObject({ selectedOptionId: "server", markedForReview: true, revision: 5, savedRevision: 5 });
  });

  it("stops on a fatal response (time over) and reports it", async () => {
    const server = new FakeServer();
    server.fatal = "EXAM_ENDED";
    const onFatal = vi.fn();
    const sync = new AnswerSync({ attemptId: "a", send: (c) => server.send(c), onFatal, debounceMs: 0 });
    sync.init([]);
    sync.update("q1", { selectedOptionId: "a" });
    await vi.advanceTimersByTimeAsync(10);
    expect(onFatal).toHaveBeenCalledWith("EXAM_ENDED");
    expect(sync.fatal).toBe("EXAM_ENDED");
    sync.update("q2", { selectedOptionId: "b" }); // ignored once fatal
    expect(sync.get("q2")).toBeUndefined();
  });

  it("language is not part of answer state, and palette states derive from answers", () => {
    expect(paletteState(undefined)).toBe("NOT_VISITED");
    expect(paletteState({ selectedOptionId: null, markedForReview: false })).toBe("NOT_ANSWERED");
    expect(paletteState({ selectedOptionId: "a", markedForReview: false })).toBe("ANSWERED");
    expect(paletteState({ selectedOptionId: null, markedForReview: true })).toBe("MARKED");
    expect(paletteState({ selectedOptionId: "a", markedForReview: true })).toBe("ANSWERED_MARKED");
  });
});
