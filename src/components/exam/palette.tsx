"use client";

import type { PaletteState } from "@/lib/exam-engine/answer-sync";
import { cx } from "@/components/ui";
import { useLang } from "@/components/candidate/lang";
import type { DictKey } from "@/lib/i18n/dictionary";

/** Shape + symbol + colour + text label for each state (never colour alone). */
export const PALETTE_STYLE: Record<PaletteState, { cls: string; symbol: string; label: DictKey }> = {
  NOT_VISITED: { cls: "bg-[var(--pal-not-visited)] text-slate-800 border border-slate-400 rounded-sm", symbol: "", label: "notVisited" },
  NOT_ANSWERED: { cls: "bg-[var(--pal-not-answered)] text-white rounded-b-2xl", symbol: "✕", label: "notAnswered" },
  ANSWERED: { cls: "bg-[var(--pal-answered)] text-white rounded-t-2xl", symbol: "✓", label: "answered" },
  MARKED: { cls: "bg-[var(--pal-marked)] text-white rounded-full", symbol: "?", label: "marked" },
  ANSWERED_MARKED: { cls: "bg-[var(--pal-marked)] text-white rounded-full", symbol: "✓?", label: "answeredMarked" },
};

export function PaletteChip({ state, children, current = false, small = false }: { state: PaletteState; children: React.ReactNode; current?: boolean; small?: boolean }) {
  const s = PALETTE_STYLE[state];
  return (
    <span
      className={cx(
        "relative inline-flex items-center justify-center font-semibold tabular-nums",
        small ? "size-7 text-xs" : "size-10 text-sm",
        s.cls,
        current && "ring-2 ring-offset-2 ring-sky-500",
      )}
    >
      {children}
      {state === "ANSWERED_MARKED" && (
        <span aria-hidden className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full border border-white bg-[var(--pal-answered)] text-[10px]">
          ✓
        </span>
      )}
    </span>
  );
}

export function PaletteLegend({ counts }: { counts: Record<PaletteState, number> }) {
  const { t } = useLang();
  return (
    <ul className="grid grid-cols-2 gap-2 text-xs">
      {(Object.keys(PALETTE_STYLE) as PaletteState[]).map((s) => (
        <li key={s} className={cx("flex items-center gap-2", s === "ANSWERED_MARKED" && "col-span-2")}>
          <PaletteChip state={s} small>
            {counts[s]}
          </PaletteChip>
          <span>
            {t(PALETTE_STYLE[s].label)}
            {s === "ANSWERED_MARKED" && <span className="block text-muted">{t("answeredMarkedNote")}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
