"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Lang } from "@/lib/i18n/dictionary";
import { st } from "@/lib/i18n/site";
import { api, ApiError } from "@/lib/client/api";
import { errorText } from "@/lib/i18n/dictionary";
import { studentProfileSchema } from "@/lib/validation/schemas";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

/** Instructions confirmation → server creates (or resumes) the attempt → exam screen. */
export function BeginTest({ slug, lang, resume }: { slug: string; lang: Lang; resume: boolean }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(resume);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {!resume && (
        <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <input type="checkbox" className="mt-1 size-4" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>{st(lang, "declaration")}</span>
        </label>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      <Button
        size="lg"
        disabled={!agreed || busy}
        data-testid="begin-test"
        onClick={async () => {
          // Before any await: browsers only allow fullscreen during the click itself.
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
          setBusy(true);
          setError(null);
          try {
            const { attemptId } = await api<{ attemptId: string }>(`/api/student/tests/${slug}/start`, { body: { language: lang } });
            router.push(`/student/attempts/${attemptId}`);
          } catch (e) {
            setBusy(false);
            setError(e instanceof ApiError && e.code !== "CONFLICT" && e.code !== "FORBIDDEN" ? errorText(lang, e.code) : (e as Error).message);
          }
        }}
      >
        {resume ? st(lang, "resumeTest") : st(lang, "beginTest")}
      </Button>
    </div>
  );
}

/** Name-only entry for guest tests: signs in as a guest, then opens the instructions. */
export function GuestStart({ slug, lang }: { slug: string; lang: Lang }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
      data-testid="guest-start"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const { next } = await api<{ next: string }>("/api/student/guest", { body: { fullName: name, slug } });
          router.push(next);
          router.refresh();
        } catch (err) {
          setBusy(false);
          setError((err as Error).message);
        }
      }}
    >
      <div className="flex-1">
        <Field label={lang === "hi" ? "आपका नाम" : "Your name"}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={150} autoComplete="name" data-testid="guest-name" />
        </Field>
      </div>
      <Button type="submit" size="lg" disabled={busy || name.trim().length < 2} data-testid="guest-start-button">
        {st(lang, "startTest")}
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
    </form>
  );
}

/** Student picks a time to sit the test; an admin must approve it before the test can start. */
export function ScheduleTestForm({ slug, lang, minValue, timeZone }: { slug: string; lang: Lang; minValue: string; timeZone: string }) {
  const router = useRouter();
  const [startAt, setStartAt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-3 rounded-xl border border-border bg-surface p-5"
      data-testid="schedule-test-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await api(`/api/student/tests/${slug}/schedule`, { body: { startAt, note: note || undefined } });
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-semibold">{st(lang, "scheduleTest")}</h2>
      <p className="text-sm text-muted">{st(lang, "scheduleIntro")}</p>
      <Field label={`${st(lang, "preferredTime")} (${timeZone})`}>
        <Input type="datetime-local" required min={minValue} value={startAt} onChange={(e) => setStartAt(e.target.value)} />
      </Field>
      <Field label={st(lang, "noteForAdmin")}>
        <Input maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" disabled={busy || !startAt}>
        {st(lang, "sendForApproval")}
      </Button>
    </form>
  );
}

export function CancelScheduleButton({ requestId, lang }: { requestId: string; lang: Lang }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api(`/api/student/schedule-requests/${requestId}`, { method: "DELETE" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {st(lang, "cancelRequest")}
    </Button>
  );
}

export function BookmarkButton({ questionId, initial, lang }: { questionId: string; initial: boolean; lang: Lang }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={busy}
      className={on ? "rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900" : "rounded border border-border px-2 py-0.5 text-xs hover:bg-slate-50"}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await api<{ bookmarked: boolean }>("/api/student/bookmarks", { body: { questionId } });
          setOn(r.bookmarked);
        } finally {
          setBusy(false);
        }
      }}
    >
      {on ? `★ ${st(lang, "bookmarked")}` : `☆ ${st(lang, "bookmark")}`}
    </button>
  );
}

export function ProfileForm({
  lang,
  defaults,
}: {
  lang: Lang;
  defaults: { fullName: string; displayName: string; preferredLanguage: "en" | "hi"; showOnLeaderboard: boolean };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(studentProfileSchema), defaultValues: defaults });
  return (
    <form
      noValidate
      className="max-w-lg space-y-4"
      onSubmit={handleSubmit(async (v) => {
        setMsg(null);
        try {
          await api("/api/student/profile", { method: "PUT", body: v });
          setMsg({ tone: "success", text: st(lang, "saved") });
          router.refresh();
        } catch (e) {
          setMsg({ tone: "error", text: (e as Error).message });
        }
      })}
    >
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label={st(lang, "fullName")} error={formState.errors.fullName?.message}>
        <Input {...register("fullName")} />
      </Field>
      <Field label={st(lang, "displayName")} error={formState.errors.displayName?.message}>
        <Input {...register("displayName")} />
      </Field>
      <Field label={st(lang, "preferredLanguage")}>
        <Select {...register("preferredLanguage")}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </Select>
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" {...register("showOnLeaderboard")} />
        {st(lang, "showOnLeaderboard")}
      </label>
      <Button type="submit" disabled={formState.isSubmitting}>
        {st(lang, "saveProfile")}
      </Button>
    </form>
  );
}
