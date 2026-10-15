import Link from "next/link";
import type { Lang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { chapterTitle } from "@/lib/study-material/ncert-chapters";
import {
  chapterUrl,
  filterNcertBooks,
  fullBookUrl,
  NCERT_CLASSES,
  NCERT_TEXTBOOK_PAGE,
  type NcertBook,
  type StudySubject,
} from "@/lib/study-material/ncert";
import { pick, SUBJECT_LABELS } from "@/lib/study-material/resources";
import { Badge } from "@/components/ui";
import { CopyrightNote, ExternalLink, FilterChip, StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "NCERT books" };

type Params = { class?: string; subject?: string; medium?: string };

const SUBJECTS = Object.keys(SUBJECT_LABELS) as StudySubject[];

export default async function NcertPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const lang = await getUiLang();
  const cls = NCERT_CLASSES.find((c) => String(c) === params.class);
  const subject = SUBJECTS.find((s) => s === params.subject);
  const medium: Lang = params.medium === "hi" || params.medium === "en" ? params.medium : lang;
  const books = filterNcertBooks({ cls, subject, medium });

  const href = (next: Partial<Params>) => {
    const p = new URLSearchParams();
    const merged = { class: cls ? String(cls) : undefined, subject, medium: params.medium, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const q = p.toString();
    return q ? `/study-material/ncert?${q}` : "/study-material/ncert";
  };

  const byClass = new Map<number, NcertBook[]>();
  for (const b of books) byClass.set(b.cls, [...(byClass.get(b.cls) ?? []), b]);
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/ncert"
        title={hi ? "एनसीईआरटी पाठ्यपुस्तकें (कक्षा 6–12)" : "NCERT textbooks (Class 6–12)"}
        subtitle={
          hi
            ? "प्रतियोगी परीक्षाओं के सामान्य अध्ययन का आधार। प्रत्येक अध्याय एनसीईआरटी की आधिकारिक वेबसाइट पर पीडीएफ़ के रूप में खुलता है।"
            : "The base for General Studies in competitive exams. Every chapter opens as a PDF on NCERT's official website."
        }
      />

      <section aria-label={hi ? "फ़िल्टर" : "Filters"} className="space-y-3">
        <FilterRow label={hi ? "माध्यम" : "Medium"}>
          <FilterChip href={href({ medium: "en" })} active={medium === "en"}>
            English
          </FilterChip>
          <FilterChip href={href({ medium: "hi" })} active={medium === "hi"}>
            हिंदी
          </FilterChip>
        </FilterRow>
        <FilterRow label={hi ? "कक्षा" : "Class"}>
          <FilterChip href={href({ class: undefined })} active={!cls}>
            {hi ? "सभी" : "All"}
          </FilterChip>
          {NCERT_CLASSES.map((c) => (
            <FilterChip key={c} href={href({ class: String(c) })} active={cls === c}>
              {c}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label={hi ? "विषय" : "Subject"}>
          <FilterChip href={href({ subject: undefined })} active={!subject}>
            {hi ? "सभी" : "All"}
          </FilterChip>
          {SUBJECTS.map((s) => (
            <FilterChip key={s} href={href({ subject: s })} active={subject === s}>
              {pick(SUBJECT_LABELS[s], lang)}
            </FilterChip>
          ))}
        </FilterRow>
      </section>

      {books.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          {hi ? "इस चयन के लिए कोई पुस्तक नहीं मिली।" : "No books match this selection."}{" "}
          <ExternalLink href={NCERT_TEXTBOOK_PAGE}>{hi ? "एनसीईआरटी वेबसाइट देखें" : "Browse the NCERT website"}</ExternalLink>
        </p>
      ) : (
        [...byClass.entries()].map(([c, list]) => (
          <section key={c} className="space-y-3">
            <h2 className="text-lg font-semibold">{hi ? `कक्षा ${c}` : `Class ${c}`}</h2>
            <ul className="grid gap-3 lg:grid-cols-2">
              {list.map((b) => (
                <BookCard key={b.id} book={b} medium={medium} lang={lang} otherMediumHref={href({ medium: medium === "en" ? "hi" : "en" })} />
              ))}
            </ul>
          </section>
        ))
      )}

      {(!cls || cls === 9) && (!subject || ["history", "geography", "polity", "economics"].includes(subject)) && (
        <p className="text-sm text-muted">
          {hi ? "कक्षा 9 सामाजिक विज्ञान की नई पुस्तकें: " : "Class 9 Social Science (new books): "}
          <ExternalLink href={NCERT_TEXTBOOK_PAGE}>{hi ? "एनसीईआरटी वेबसाइट पर देखें" : "see the NCERT website"}</ExternalLink>
        </p>
      )}

      <CopyrightNote lang={lang} />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">{children}</div>
    </div>
  );
}

function BookCard({ book, medium, lang, otherMediumHref }: { book: NcertBook; medium: Lang; lang: Lang; otherMediumHref: string }) {
  const ed = book[medium]!;
  const hi = lang === "hi";
  const other = medium === "en" ? book.hi : book.en;
  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold" lang={medium}>
            {ed.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {book.subjects.map((s) => pick(SUBJECT_LABELS[s], lang)).join(" · ")} · {ed.chapters} {hi ? "अध्याय" : "chapters"}
          </p>
        </div>
        {book.previous && <Badge tone="ARCHIVED">{hi ? "पिछला संस्करण" : "Previous edition"}</Badge>}
      </div>
      <ol className="mt-3 divide-y divide-border border-y border-border text-sm" aria-label={hi ? "अध्याय" : "Chapters"}>
        {Array.from({ length: ed.chapters }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <a
              href={chapterUrl(ed.code, n)}
              target="_blank"
              rel="noopener noreferrer"
              lang={medium}
              className="group flex items-baseline gap-3 py-1.5 hover:text-primary"
            >
              <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-muted group-hover:text-primary">{n}</span>
              <span className="flex-1 group-hover:underline">{chapterTitle(ed.code, n) ?? (medium === "hi" ? `अध्याय ${n}` : `Chapter ${n}`)}</span>
              <span className="shrink-0 text-xs text-muted">PDF ↗</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <ExternalLink href={fullBookUrl(ed.code)}>{hi ? "पूरी पुस्तक (ZIP)" : "Full book (ZIP)"}</ExternalLink>
        {other && (
          <Link href={otherMediumHref} className="text-muted hover:text-primary hover:underline">
            {medium === "en" ? (hi ? "हिंदी माध्यम में देखें" : "View in Hindi medium") : hi ? "अंग्रेज़ी माध्यम में देखें" : "View in English medium"}
          </Link>
        )}
      </p>
    </li>
  );
}
