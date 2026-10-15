"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { Alert, Button, Input } from "@/components/ui";

type Q = { id: string; code: string; subject: string; topic: string | null; textEn: string | null; textHi: string | null; isActive: boolean };

/** Pick questions from the bank and attach them to a section. */
export function AttachQuestions({ sectionId, subject }: { sectionId: string; subject: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Q[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState(subject);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const load = async (subj: string) => {
    const r = await api<{ questions: Q[] }>(`/api/questions?subject=${encodeURIComponent(subj)}&limit=500`);
    setItems(r.questions.filter((q) => q.isActive));
  };

  if (!open) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={async () => {
          setOpen(true);
          await load(filter).catch((e) => setMsg({ tone: "error", text: (e as Error).message }));
        }}
      >
        Add questions from bank
      </Button>
    );
  }
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Subject" aria-label="Subject filter" />
        <Button size="sm" variant="secondary" onClick={() => load(filter)}>
          Filter
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="max-h-72 overflow-y-auto text-sm">
        {items.length === 0 && <p className="text-muted">No active questions for this subject.</p>}
        {items.map((q) => (
          <label key={q.id} className="flex items-start gap-2 border-b border-border py-1">
            <input
              type="checkbox"
              className="mt-1"
              checked={selected.has(q.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(q.id);
                else next.delete(q.id);
                setSelected(next);
              }}
            />
            <span>
              <span className="font-mono text-xs text-muted">{q.code}</span> {q.textEn ?? q.textHi}
            </span>
          </label>
        ))}
      </div>
      <Button
        size="sm"
        disabled={selected.size === 0}
        onClick={async () => {
          try {
            const r = await api<{ added: number }>(`/api/sections/${sectionId}/questions`, { body: { questionIds: [...selected] } });
            setMsg({ tone: "success", text: `Added ${r.added} question(s). Questions already in this exam were skipped.` });
            setSelected(new Set());
            router.refresh();
          } catch (e) {
            setMsg({ tone: "error", text: (e as Error).message });
          }
        }}
      >
        Attach {selected.size} selected
      </Button>
    </div>
  );
}
