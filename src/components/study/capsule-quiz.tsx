"use client";

import { useState } from "react";
import { cx } from "@/components/ui";

const LETTERS = ["A", "B", "C", "D"];

/** A question with an optional source link and/or explanation shown after answering. */
export type QuizItem = { id: string; q: string; options: string[]; answer: number; url?: string; explain?: string };

/** Tap-to-answer MCQs with instant feedback and a running score. Prints as a plain question list. */
export function CapsuleQuiz({ quiz, lang, columns = 2 }: { quiz: QuizItem[]; lang: "en" | "hi"; columns?: 1 | 2 }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const answered = Object.keys(picked).length;
  const correct = quiz.filter((q) => picked[q.id] === q.answer).length;
  const hi = lang === "hi";

  return (
    <div>
      <div className="screen-only sticky top-16 z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/95 px-4 py-2 text-sm shadow-sm backdrop-blur">
        <span>
          {hi ? "स्कोर" : "Score"}: <strong className="text-success">{correct}</strong> / {answered}
          <span className="text-muted">
            {" "}
            · {quiz.length - answered} {hi ? "शेष" : "left"}
          </span>
        </span>
        {answered > 0 && (
          <button type="button" onClick={() => setPicked({})} className="text-primary hover:underline">
            {hi ? "फिर से शुरू करें" : "Reset"}
          </button>
        )}
      </div>
      <ol className={cx("grid gap-3", columns === 2 && "md:grid-cols-2")}>
        {quiz.map((q, i) => {
          const choice = picked[q.id];
          const done = choice !== undefined;
          return (
            <li key={q.id} className="avoid-break rounded-lg border border-border bg-surface p-3">
              <p className="font-medium leading-snug">
                <span className="mr-1 text-muted">Q{i + 1}.</span>
                {q.q}
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {q.options.map((o, j) => {
                  const isAnswer = j === q.answer;
                  return (
                    <li key={j}>
                      <button
                        type="button"
                        disabled={done}
                        onClick={() => setPicked((p) => ({ ...p, [q.id]: j }))}
                        className={cx(
                          "flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition",
                          !done && "border-border hover:border-primary hover:bg-slate-50",
                          done && isAnswer && "border-green-300 bg-green-50 text-green-900",
                          done && !isAnswer && choice === j && "border-red-300 bg-red-50 text-red-900",
                          done && !isAnswer && choice !== j && "border-border opacity-60",
                        )}
                      >
                        <span className="font-semibold">{LETTERS[j]}</span>
                        <span>{o}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {done && (
                <p className="screen-only mt-2 text-xs text-muted">
                  {choice === q.answer ? (hi ? "सही! " : "Correct! ") : hi ? `उत्तर: ${LETTERS[q.answer]}. ` : `Answer: ${LETTERS[q.answer]}. `}
                  {q.explain && <span className="text-foreground">{q.explain} </span>}
                  {q.url && (
                    <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {hi ? "स्रोत" : "Source"} ↗
                    </a>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
