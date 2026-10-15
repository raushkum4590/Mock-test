import type { Lang } from "@/lib/i18n/dictionary";
import { pickText } from "@/lib/i18n/dictionary";
import { st } from "@/lib/i18n/site";

/** Read-only question with the correct option highlighted and the explanation. */
export function QuestionReview({
  lang,
  number,
  textEn,
  textHi,
  imageUrl,
  options,
  selectedOptionId,
  correctOptionIds,
  explanationEn,
  explanationHi,
  outcome,
  actions,
}: {
  lang: Lang;
  number?: number;
  textEn: string | null;
  textHi: string | null;
  imageUrl?: string | null;
  options: { id?: string; label: string; textEn: string | null; textHi: string | null; isCorrect?: boolean }[];
  selectedOptionId: string | null;
  correctOptionIds: string[];
  explanationEn: string | null;
  explanationHi: string | null;
  outcome?: "CORRECT" | "INCORRECT" | "UNANSWERED";
  actions?: React.ReactNode;
}) {
  const q = pickText(lang, textEn, textHi);
  const exp = pickText(lang, explanationEn, explanationHi);
  const badge =
    outcome === "CORRECT"
      ? "border-green-200 bg-green-50 text-green-800"
      : outcome === "INCORRECT"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <article className="break-inside-avoid rounded-lg border border-border bg-surface p-4" data-testid="solution">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{number ? `Q${number}` : ""}</span>
        <div className="flex items-center gap-2">
          {outcome && (
            <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${badge}`}>
              {outcome === "CORRECT" ? `✓ ${st(lang, "correct")}` : outcome === "INCORRECT" ? `✕ ${st(lang, "incorrect")}` : `– ${st(lang, "unanswered")}`}
            </span>
          )}
          {actions}
        </div>
      </div>
      <p className="question-text" lang={q.fallback ? undefined : lang}>
        {q.text}
      </p>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mt-2 max-h-64" />
      )}
      <ul className="mt-3 space-y-1.5 text-sm">
        {options.map((o) => {
          const isCorrect = o.isCorrect ?? (o.id ? correctOptionIds.includes(o.id) : false);
          const chosen = !!o.id && o.id === selectedOptionId;
          const t = pickText(lang, o.textEn, o.textHi);
          return (
            <li
              key={o.label}
              className={
                "flex gap-2 rounded-md border px-3 py-1.5 " +
                (isCorrect ? "border-green-300 bg-green-50" : chosen ? "border-red-300 bg-red-50" : "border-border")
              }
            >
              <span className="font-semibold">{o.label}.</span>
              <span className="flex-1">{t.text}</span>
              {isCorrect && <span className="text-xs font-semibold text-green-800">✓ {st(lang, "correctAnswer")}</span>}
              {chosen && !isCorrect && <span className="text-xs font-semibold text-red-800">✕ {st(lang, "yourAnswer")}</span>}
              {chosen && isCorrect && <span className="text-xs text-green-800">({st(lang, "yourAnswer")})</span>}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
        <span className="font-semibold">{st(lang, "explanation")}: </span>
        {exp.text ? (
          <span className="question-text" lang={exp.fallback ? undefined : lang}>
            {exp.text}
          </span>
        ) : (
          <span className="text-muted">{st(lang, "noExplanation")}</span>
        )}
      </div>
    </article>
  );
}
