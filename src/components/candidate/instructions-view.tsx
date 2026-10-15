"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pickText } from "@/lib/i18n/dictionary";
import type { getCandidateExamState } from "@/server/services/attempt-service";
import { Alert, Button } from "@/components/ui";
import { CandidateHeader } from "./candidate-header";
import { useLang } from "./lang";

type State = Awaited<ReturnType<typeof getCandidateExamState>>;

export function InstructionsView({ state }: { state: State }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const title = pickText(lang, state.exam.titleEn, state.exam.titleHi).text;
  const instructions = pickText(lang, state.exam.instructionsEn, state.exam.instructionsHi);

  return (
    <main className="flex flex-1 flex-col">
      <CandidateHeader name={state.candidate.fullName} rollNumber={state.candidate.rollNumber} />
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t("generalInstructions")}</h2>
          {instructions.fallback && <Alert tone="info">{t("notTranslated")}</Alert>}
          <div className="question-text text-sm" lang={instructions.fallback ? undefined : lang}>
            {instructions.text}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span>{t("chooseLanguage")}:</span>
            <LangInline />
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" data-testid="marks-scheme">
          <h2 className="mb-3 font-semibold">{t("marksScheme")}</h2>
          <dl className="mb-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("totalQuestions")}</dt>
              <dd className="font-semibold">{state.paper.totalQuestions}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("maxMarks")}</dt>
              <dd className="font-semibold">{state.paper.maxMarks}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("durationLabel")}</dt>
              <dd className="font-semibold">
                {Math.round(state.schedule.durationSeconds / 60)} {t("minutes")}
              </dd>
            </div>
          </dl>
          <table className="w-full text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_th]:text-left">
            <thead className="text-muted">
              <tr>
                <th>{t("section")}</th>
                <th>{t("questionsLabel")}</th>
                <th>{t("perCorrect")}</th>
                <th>{t("perWrong")}</th>
              </tr>
            </thead>
            <tbody>
              {state.paper.sections.map((s) => (
                <tr key={s.titleEn}>
                  <td>{pickText(lang, s.titleEn, s.titleHi).text}</td>
                  <td>{s.questions}</td>
                  <td className="text-success">+{s.marksCorrect}</td>
                  <td className="text-danger">−{s.marksWrong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {(state.policy.cameraMonitoring || state.policy.requireFullscreen || state.policy.violationLimit > 0) && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm">
            <h2 className="mb-2 font-semibold">{t("monitoringRules")}</h2>
            <ul className="list-disc space-y-1 pl-5">
              {state.policy.cameraMonitoring && <li>{t("cameraOnRule")}</li>}
              {state.policy.requireFullscreen && <li>{t("fullscreenRule")}</li>}
              {state.policy.violationLimit > 0 && (
                <li>
                  {t("violationRule")}: {state.policy.violationLimit} — {t(state.policy.autoSubmitOnViolations ? "autoSubmitRule" : "alertOnlyRule")}
                </li>
              )}
            </ul>
          </section>
        )}
        <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <input type="checkbox" className="mt-1 size-4" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>{t("declaration")}</span>
        </label>
        {agreed && (
          <p className="text-center text-2xl font-bold text-primary" data-testid="best-of-luck">
            {t("bestOfLuck")}
          </p>
        )}
        <Button size="lg" disabled={!agreed} onClick={() => router.push(`/candidate/waiting/${state.schedule.id}`)}>
          {t("agreeAndProceed")}
        </Button>
        <p className="text-xs text-muted">{t("mockNotice")}</p>
      </div>
    </main>
  );
}

function LangInline() {
  const { lang, setLang } = useLang();
  return (
    <select className="rounded border border-border bg-surface px-2 py-1" value={lang} onChange={(e) => setLang(e.target.value === "hi" ? "hi" : "en")}>
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
