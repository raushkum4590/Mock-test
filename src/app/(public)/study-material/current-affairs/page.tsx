import Link from "next/link";
import type { Lang } from "@/lib/i18n/dictionary";
import { getUiLang } from "@/lib/i18n/server-lang";
import { EXAM_TOPICS, splitOnKeyword, topicDef, type ExamTopic } from "@/lib/study-material/exam-view";
import { NEWS_SOURCES, pick } from "@/lib/study-material/resources";
import { getCurrentAffairs, getExamFacts, type ExamFactItem, type SourceFeed } from "@/server/services/current-affairs-service";
import { cx } from "@/components/ui";
import { CopyrightNote, ExternalLink, FilterChip, StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "Current affairs" };

/** Facts shown per topic on the overview before "+N more". */
const PER_TOPIC = 5;

const timeFmt = (lang: Lang) =>
  new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function CurrentAffairsPage({ searchParams }: { searchParams: Promise<{ view?: string; topic?: string }> }) {
  const params = await searchParams;
  const lang = await getUiLang();
  const hi = lang === "hi";
  const feeds = await getCurrentAffairs(30);
  const showAll = params.view === "all";
  const facts = await getExamFacts(feeds);
  const topic = EXAM_TOPICS.find((t) => t.id === params.topic)?.id;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/current-affairs"
        title={hi ? "दैनिक समसामयिकी" : "Daily current affairs"}
        subtitle={
          hi
            ? "परीक्षा के लिए उपयोगी तथ्य, विषयवार — पीआईबी, आकाशवाणी और आरबीआई से, हर 30 मिनट में अपडेट।"
            : "Exam-relevant facts, topic-wise — from PIB, All India Radio and RBI, refreshed every 30 minutes."
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-lg border border-border bg-surface p-1 text-sm">
          <ViewTab href="/study-material/current-affairs" active={!showAll}>
            {hi ? "परीक्षा दृष्टि" : "Exam view"}
          </ViewTab>
          <ViewTab href="/study-material/current-affairs?view=all" active={showAll}>
            {hi ? "सभी सुर्खियाँ" : "All headlines"}
          </ViewTab>
        </div>
        {!showAll && (
          <p className="text-sm text-muted">
            {hi ? `आज ${facts.length} परीक्षा-उपयोगी तथ्य` : `${facts.length} exam facts today`}
          </p>
        )}
      </div>

      {showAll ? <AllHeadlines feeds={feeds} lang={lang} /> : <ExamView facts={facts} topic={topic} lang={lang} />}

      <CopyrightNote lang={lang} />
    </div>
  );
}

function ViewTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cx("rounded-md px-3 py-1.5 font-medium", active ? "bg-primary text-white" : "text-muted hover:text-foreground")}
    >
      {children}
    </Link>
  );
}

function ExamView({ facts, topic, lang }: { facts: ExamFactItem[]; topic?: ExamTopic; lang: Lang }) {
  const hi = lang === "hi";
  const byTopic = new Map<ExamTopic, ExamFactItem[]>();
  // Reader's language first (stable, so each language keeps newest-first order).
  const ordered = [...facts].sort((a, b) => Number(b.source.lang === lang) - Number(a.source.lang === lang));
  for (const f of ordered) byTopic.set(f.topic, [...(byTopic.get(f.topic) ?? []), f]);
  const topics = EXAM_TOPICS.filter((t) => byTopic.has(t.id) && (!topic || t.id === topic));

  if (facts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
        {hi ? "अभी कोई परीक्षा-उपयोगी तथ्य नहीं मिला। “सभी सुर्खियाँ” देखें।" : "No exam facts right now. Try “All headlines”."}
      </p>
    );
  }

  return (
    <>
      <nav aria-label={hi ? "विषय" : "Topics"} className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2 pb-1">
          <li>
            <FilterChip href="/study-material/current-affairs" active={!topic}>
              {hi ? "सभी" : "All"} · {facts.length}
            </FilterChip>
          </li>
          {EXAM_TOPICS.filter((t) => byTopic.has(t.id)).map((t) => (
            <li key={t.id}>
              <FilterChip href={`/study-material/current-affairs?topic=${t.id}`} active={topic === t.id}>
                {pick(t.label, lang)} · {byTopic.get(t.id)!.length}
              </FilterChip>
            </li>
          ))}
        </ul>
      </nav>

      <div className={cx("grid items-start gap-4", !topic && "lg:grid-cols-2")}>
        {topics.map((t) => {
          const list = byTopic.get(t.id)!;
          const shown = topic ? list : list.slice(0, PER_TOPIC);
          return (
            <section key={t.id} className="rounded-xl border border-border bg-surface shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <span className={cx("rounded-md border px-2 py-0.5 text-xs font-semibold", t.tone)}>{list.length}</span>
                  {pick(t.label, lang)}
                </h2>
                <p className="text-xs text-muted">
                  {hi ? "उपयोगी: " : "For "}
                  {t.exams}
                </p>
              </header>
              <ol className="divide-y divide-border">
                {shown.map((f, i) => (
                  <FactRow key={`${i}-${f.url}`} fact={f} lang={lang} />
                ))}
              </ol>
              {!topic && list.length > PER_TOPIC && (
                <Link href={`/study-material/current-affairs?topic=${t.id}`} className="block border-t border-border px-5 py-2.5 text-sm font-medium text-primary hover:underline">
                  {hi ? `${list.length - PER_TOPIC} और देखें →` : `+${list.length - PER_TOPIC} more →`}
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function FactRow({ fact, lang }: { fact: ExamFactItem; lang: Lang }) {
  const [before, key, after] = splitOnKeyword(fact.title, fact.keyword);
  const tone = topicDef(fact.topic).tone;
  return (
    <li>
      <a href={fact.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 px-5 py-3 hover:bg-slate-50">
        <span aria-hidden className={cx("mt-2 size-1.5 shrink-0 rounded-full border", tone)} />
        <span className="min-w-0 flex-1">
          <span lang={fact.source.lang} className="leading-snug group-hover:text-primary">
            {before}
            {key && <mark className={cx("rounded px-0.5 font-semibold", tone)}>{key}</mark>}
            {after}
          </span>
          <span className="mt-1 block text-xs text-muted">
            {fact.source.short}
            {fact.publishedAt && ` · ${timeFmt(lang).format(fact.publishedAt)}`}
            <span className="ml-1 opacity-0 transition group-hover:opacity-100">↗</span>
          </span>
        </span>
      </a>
    </li>
  );
}

function AllHeadlines({ feeds, lang }: { feeds: SourceFeed[]; lang: Lang }) {
  const hi = lang === "hi";
  const fmt = timeFmt(lang);
  const linkOnly = NEWS_SOURCES.filter((s) => !s.feed);
  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {feeds.map(({ source, items, ok }) => (
          <section key={source.id} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">{pick(source.name, lang)}</h2>
                <p className="text-xs text-muted">{pick(source.use, lang)}</p>
              </div>
              {source.lang === "hi" && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-muted">हिंदी</span>}
            </header>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                {ok ? (hi ? "अभी कोई सुर्खी नहीं।" : "No headlines right now.") : hi ? "यह स्रोत अभी उपलब्ध नहीं है।" : "This source is not reachable right now."}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-sm">
                {items.slice(0, 15).map((it, i) => (
                  <li key={`${i}-${it.url}`} className="py-2">
                    <a href={it.url} target="_blank" rel="noopener noreferrer" lang={source.lang} className="hover:text-primary hover:underline">
                      {it.title}
                    </a>
                    {it.publishedAt && <time dateTime={it.publishedAt.toISOString()} className="ml-2 whitespace-nowrap text-xs text-muted">{fmt.format(it.publishedAt)}</time>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-auto pt-3 text-sm">
              <ExternalLink href={source.archive}>{hi ? "पुरानी विज्ञप्तियाँ / संग्रह" : "Older releases / archive"}</ExternalLink>
            </p>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-semibold">{hi ? "अन्य आधिकारिक स्रोत" : "More official sources"}</h2>
        <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {linkOnly.map((s) => (
            <li key={s.id}>
              <ExternalLink href={s.archive} className="font-medium">
                {pick(s.name, lang)}
              </ExternalLink>
              <span className="text-muted"> — {pick(s.use, lang)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
