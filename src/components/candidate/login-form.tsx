"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, Button, Field, Input, cx } from "@/components/ui";
import { api, ApiError } from "@/lib/client/api";
import { errorText } from "@/lib/i18n/dictionary";
import { candidateLoginSchema } from "@/lib/validation/schemas";
import { LangSwitch, useLang } from "./lang";
import { PhotoCapture } from "./photo-capture";

type Form = z.input<typeof candidateLoginSchema>;
type Mode = "practice" | "centre";
declare global {
  interface Window {
    cbtClient?: { workstationCode: string | null; version: string; kiosk: boolean };
  }
}

/**
 * Entry page with two ways to take a test:
 *  - Practice (default): self-service mock tests, no admin permission.
 *  - Scheduled exam: roll number issued by the exam centre; the admin
 *    assigns the exam and the server starts it at the scheduled time.
 * On exam-centre PCs (Electron client) only the scheduled-exam login is shown.
 */
export function CandidateLoginForm() {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("practice");
  const [centrePc, setCentrePc] = useState(false);
  const [workstation, setWorkstation] = useState<string | null>(null);

  useEffect(() => {
    // Exposed by the Electron preload script on exam-centre PCs.
    const id = setTimeout(() => {
      if (window.cbtClient) {
        setCentrePc(true);
        setMode("centre");
        setWorkstation(window.cbtClient.workstationCode ?? null);
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // The mode chooser is hidden while in fullscreen (entered by picking "Scheduled exam").
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between bg-primary px-6 py-3 text-white">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <LangSwitch dark />
      </header>
      <div className="flex flex-1 items-start justify-center p-6 pt-12">
        <div className="w-full max-w-2xl space-y-4">
          {!centrePc && !fullscreen && (
            <>
              <h1 className="text-center text-xl font-semibold">{t("chooseMode")}</h1>
              <div role="radiogroup" aria-label={t("chooseMode")} className="grid gap-3 sm:grid-cols-2">
                <ModeCard
                  selected={mode === "practice"}
                  onSelect={() => {
                    setMode("practice");
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                  }}
                  title={t("modePractice")}
                  desc={t("modePracticeDesc")}
                  icon="✎"
                  testId="mode-practice"
                />
                <ModeCard
                  selected={mode === "centre"}
                  onSelect={() => {
                    setMode("centre");
                    // Must run inside the click handler: browsers only allow fullscreen on a user gesture.
                    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
                  }}
                  title={t("modeCentre")}
                  desc={t("modeCentreDesc")}
                  icon="🔒"
                  testId="mode-centre"
                />
              </div>
            </>
          )}
          {mode === "practice" ? <PracticePanel /> : <CentreFlow workstation={workstation} hideSteps={fullscreen} />}
          <p className="text-center text-xs text-muted">{t("mockNotice")}</p>
        </div>
      </div>
      <footer className="pb-4 text-center text-xs">
        <a href="/admin/login" className="text-muted underline">
          {t("adminLoginLink")}
        </a>
      </footer>
    </main>
  );
}

function ModeCard({
  selected,
  onSelect,
  title,
  desc,
  icon,
  testId,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
  icon: string;
  testId: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      data-testid={testId}
      className={cx(
        "flex gap-3 rounded-xl border-2 bg-surface p-4 text-left transition",
        selected ? "border-primary shadow-sm" : "border-border hover:border-slate-400",
      )}
    >
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      <span>
        <span className="flex items-center gap-2 font-semibold">
          {title}
          {selected && <span className="text-primary">✓</span>}
        </span>
        <span className="mt-1 block text-sm text-muted">{desc}</span>
      </span>
    </button>
  );
}

function PracticePanel() {
  const { t } = useLang();
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{t("modePractice")}</h2>
      <p className="text-sm text-muted">{t("modePracticeDesc")}</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <Link href="/student/register" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          {t("studentSignup")}
        </Link>
        <Link href="/student/login" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          {t("studentLogin")}
        </Link>
        <Link href="/tests" className="rounded-md px-4 py-2 text-sm font-medium text-primary underline">
          {t("browseTests")}
        </Link>
      </div>
    </div>
  );
}

type Step = "photo" | "rules" | "login";

/** Exam-centre entry: 1. photo → 2. rules → 3. roll number + password. The server enforces the photo when the sitting requires it. */
function CentreFlow({ workstation, hideSteps }: { workstation: string | null; hideSteps: boolean }) {
  const { t } = useLang();
  const [step, setStep] = useState<Step>("photo");
  const [notice, setNotice] = useState<string | null>(null);
  const steps: [Step, string][] = [
    ["photo", t("stepPhoto")],
    ["rules", t("stepRules")],
    ["login", t("stepLogin")],
  ];
  return (
    <div className="space-y-4">
      {!hideSteps && (
        <ol className="mx-auto flex max-w-md items-center justify-between text-xs" aria-label={t("candidateLogin")}>
          {steps.map(([s, label], i) => (
            <li key={s} className={cx("flex items-center gap-2", s === step ? "font-semibold text-primary" : "text-muted")} aria-current={s === step ? "step" : undefined}>
              <span className={cx("grid size-6 place-items-center rounded-full border", s === step ? "border-primary bg-primary text-white" : "border-border")}>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
      {notice && (
        <div className="mx-auto max-w-md">
          <Alert tone="warning">{notice}</Alert>
        </div>
      )}
      {step === "photo" && (
        <PhotoCapture
          onDone={() => {
            setNotice(null);
            setStep("rules");
          }}
          onSkip={() => setStep("rules")}
        />
      )}
      {step === "rules" && <RulesStep onBack={() => setStep("photo")} onAccept={() => setStep("login")} />}
      {step === "login" && (
        <CentreLogin
          workstation={workstation}
          onBack={() => setStep("rules")}
          onNeedPhoto={() => {
            setNotice(t("photoRequiredLogin"));
            setStep("photo");
          }}
        />
      )}
    </div>
  );
}

function RulesStep({ onBack, onAccept }: { onBack: () => void; onAccept: () => void }) {
  const { t } = useLang();
  const [agreed, setAgreed] = useState(false);
  return (
    <section className="mx-auto w-full max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm" data-testid="rules-step">
      <h2 className="text-lg font-semibold">{t("rulesTitle")}</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        {(["rule1", "rule2", "rule3", "rule4", "rule5"] as const).map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ol>
      <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
        <input type="checkbox" className="mt-1 size-4" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} data-testid="accept-rules" />
        <span>{t("rulesAccept")}</span>
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack}>
          {t("back")}
        </Button>
        <Button disabled={!agreed} onClick={onAccept}>
          {t("rulesContinue")}
        </Button>
      </div>
    </section>
  );
}

function CentreLogin({ workstation, onBack, onNeedPhoto }: { workstation: string | null; onBack: () => void; onNeedPhoto: () => void }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(candidateLoginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await api("/api/auth/candidate/login", { body: values });
      router.replace("/candidate/dashboard");
    } catch (e) {
      if (e instanceof ApiError && (e.details as { needPhoto?: boolean } | null)?.needPhoto) {
        onNeedPhoto();
        return;
      }
      setError(e instanceof ApiError && e.code !== "UNAUTHENTICATED" && e.code !== "RATE_LIMITED" ? errorText(lang, e.code) : (e as Error).message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm" noValidate>
      <h2 className="text-lg font-semibold">{t("loginStepTitle")}</h2>
      <p className="text-xs text-muted">{t("modeCentreDesc")}</p>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label={t("rollNumber")} error={formState.errors.rollNumber?.message}>
        <Input autoComplete="username" autoFocus {...register("rollNumber")} />
      </Field>
      <Field label={t("password")} error={formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </Field>
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? t("signingIn") : t("signIn")}
      </Button>
      <button type="button" className="text-xs text-muted underline" onClick={onBack}>
        ← {t("back")}
      </button>
      <p className="text-xs text-muted">
        {t("workstation")}: <span className="font-mono">{workstation ?? t("notConfigured")}</span>
      </p>
    </form>
  );
}
