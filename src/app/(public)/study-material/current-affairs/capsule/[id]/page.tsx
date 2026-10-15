import Link from "next/link";
import { notFound } from "next/navigation";
import pdfs from "@/data/current-affairs/pdfs.json";
import { getUiLang } from "@/lib/i18n/server-lang";
import { capsuleMonths, getCapsule, YEAR_ID } from "@/lib/current-affairs/view";
import { CapsuleBooklet } from "@/components/study/capsule-view";
import { PrintButton } from "@/components/study/print-button";
import { cx } from "@/components/ui";

const PDFS = pdfs as Record<string, string>;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getCapsule(id);
  return { title: view ? `Current affairs – ${view.period}` : "Current affairs capsule" };
}

export default async function CapsulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getCapsule(id);
  if (!view) notFound();
  const lang = await getUiLang();
  const hi = lang === "hi";
  const months = capsuleMonths();

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <nav className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/study-material/current-affairs/capsule" className="text-sm text-primary hover:underline">
          ← {hi ? "सभी कैप्सूल" : "All capsules"}
        </Link>
        <div className="flex flex-wrap gap-2">
          {PDFS[view.id] && (
            <a href={PDFS[view.id]} download className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
              {hi ? "पीडीएफ़ डाउनलोड करें" : "Download PDF"}
            </a>
          )}
          <PrintButton label={hi ? "प्रिंट / पीडीएफ़ सहेजें" : "Print / Save as PDF"} />
        </div>
      </nav>
      <div className="no-print -mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2 pb-1">
          {[{ id: YEAR_ID, label: hi ? "पूरा वर्ष" : "Full year" }, ...months.map((m) => ({ id: m.month, label: m.label }))].map((x) => (
            <li key={x.id}>
              <Link
                href={`/study-material/current-affairs/capsule/${x.id}`}
                aria-current={x.id === view.id ? "page" : undefined}
                className={cx(
                  "block whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium",
                  x.id === view.id ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary hover:text-primary",
                )}
              >
                {x.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <CapsuleBooklet view={view} lang={lang} />
    </div>
  );
}
