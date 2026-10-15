import Link from "next/link";
import { getUiLang } from "@/lib/i18n/server-lang";
import { BRAND, st } from "@/lib/i18n/site";

export const metadata = { title: { absolute: `${BRAND} — SSC CGL, CHSL & JE mock tests` } };

/** Home page: only the choice between the exam-centre CBT and online mock tests. */
export default async function HomePage() {
  const lang = await getUiLang();
  const t = (k: Parameters<typeof st>[1]) => st(lang, k);
  return (
    <section aria-labelledby="modes" className="mx-auto max-w-6xl px-4 py-10">
      <h1 id="modes" className="mb-4 text-xl font-semibold">
        {t("modesTitle")}
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        <ModeCard
          badge={t("modeCbtBadge")}
          title={t("modeCbtTitle")}
          points={[t("modeCbt1"), t("modeCbt2"), t("modeCbt3"), t("modeCbt4")]}
          action={{ href: "/login", label: t("modeCbtAction") }}
          testId="mode-cbt"
        />
        <ModeCard
          badge={t("modePracticeBadge")}
          title={t("modePracticeTitle")}
          points={[t("modePractice1"), t("modePractice2"), t("modePractice3"), t("modePractice4")]}
          action={{ href: "/tests", label: t("modePracticeAction") }}
          testId="mode-practice"
        />
      </div>
    </section>
  );
}

function ModeCard({ badge, title, points, action, testId }: { badge: string; title: string; points: string[]; action: { href: string; label: string }; testId: string }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm" data-testid={testId}>
      <span className="mb-2 w-fit rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">{badge}</span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-3 flex-1 list-disc space-y-1 pl-5 text-sm text-muted">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <Link href={action.href} className="mt-5 w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
        {action.label}
      </Link>
    </article>
  );
}
