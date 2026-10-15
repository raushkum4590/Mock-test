import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n/dictionary";
import { pick, type ResourceLink } from "@/lib/study-material/resources";
import { cx } from "@/components/ui";

const TABS = [
  ["/study-material", { en: "Overview", hi: "सारांश" }],
  ["/study-material/ncert", { en: "NCERT books", hi: "एनसीईआरटी पुस्तकें" }],
  ["/study-material/current-affairs", { en: "Current affairs", hi: "समसामयिकी" }],
  ["/study-material/current-affairs/capsule", { en: "CA capsule (PDF)", hi: "सीए कैप्सूल (पीडीएफ़)" }],
  ["/study-material/learn", { en: "Courses (CS, History, Geo, Polity, Economy, Reasoning)", hi: "कोर्स (कंप्यूटर, इतिहास, भूगोल, राजव्यवस्था, अर्थव्यवस्था, तर्कशक्ति)" }],
  ["/study-material/subjects", { en: "Revision checklists", hi: "दोहराने की चेकलिस्ट" }],
] as const;

export type StudyTab = (typeof TABS)[number][0];

export function StudyHeader({ lang, active, title, subtitle }: { lang: Lang; active: (typeof TABS)[number][0]; title: string; subtitle?: string }) {
  return (
    <header className="no-print">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{lang === "hi" ? "अध्ययन सामग्री" : "Study material"}</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
      <nav aria-label={lang === "hi" ? "अध्ययन सामग्री" : "Study material"} className="-mx-4 mt-5 overflow-x-auto px-4">
        <ul className="flex gap-2 border-b border-border">
          {TABS.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active === href ? "page" : undefined}
                className={cx(
                  "-mb-px block whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
                  active === href ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {label[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/** Link to an external official site; always opens in a new tab. */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("text-primary hover:underline", className)}>
      {children}
      <span aria-hidden className="ml-0.5 text-xs">↗</span>
    </a>
  );
}

export function ResourceList({ items, lang }: { items: ResourceLink[]; lang: Lang }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((r) => (
        <li key={r.url + r.title.en}>
          <ExternalLink href={r.url} className="font-medium">
            {pick(r.title, lang)}
          </ExternalLink>
          {r.note && <span className="text-muted"> — {pick(r.note, lang)}</span>}
        </li>
      ))}
    </ul>
  );
}

export function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}

export function CopyrightNote({ lang }: { lang: Lang }) {
  return (
    <p className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-xs text-muted">
      {lang === "hi"
        ? "सभी पुस्तकें और सामग्री उनकी आधिकारिक वेबसाइट पर खुलती हैं। कॉपीराइट संबंधित प्रकाशक (एनसीईआरटी, एनआईओएस, भारत सरकार आदि) का है। यह साइट केवल लिंक प्रदान करती है।"
        : "All books and material open on their official websites. Copyright belongs to the respective publisher (NCERT, NIOS, Government of India, etc.); this site only links to them."}
    </p>
  );
}
