import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n/dictionary";
import { EXAM_TIPS } from "@/lib/current-affairs/capsule";
import type { CapsuleView } from "@/lib/current-affairs/view";
import { EXAM_TOPICS, topicDef } from "@/lib/study-material/exam-view";
import { pick } from "@/lib/study-material/resources";
import { cx } from "@/components/ui";
import { CapsuleQuiz } from "./capsule-quiz";

const LETTERS = ["A", "B", "C", "D"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortMonth = (ym: string) => `${SHORT_MONTHS[Number(ym.slice(5, 7)) - 1]} ’${ym.slice(2, 4)}`;

/** Accent per section: [badge, header band]. */
const TONES = {
  indigo: ["bg-indigo-600", "border-indigo-200 bg-indigo-50"],
  slate: ["bg-slate-700", "border-slate-300 bg-slate-100"],
  violet: ["bg-violet-600", "border-violet-200 bg-violet-50"],
  amber: ["bg-amber-500", "border-amber-200 bg-amber-50"],
  orange: ["bg-orange-500", "border-orange-200 bg-orange-50"],
  pink: ["bg-pink-600", "border-pink-200 bg-pink-50"],
  teal: ["bg-teal-600", "border-teal-200 bg-teal-50"],
  emerald: ["bg-emerald-600", "border-emerald-200 bg-emerald-50"],
  sky: ["bg-sky-600", "border-sky-200 bg-sky-50"],
  rose: ["bg-rose-600", "border-rose-200 bg-rose-50"],
} as const;
type Tone = keyof typeof TONES;

export function CapsuleBooklet({ view, lang }: { view: CapsuleView; lang: Lang }) {
  const f = view.facts;
  const hi = lang === "hi";
  const year = view.id === "year";
  const m = (row: { month: string }) => (year ? [shortMonth(row.month)] : []);
  const monthHead = year ? [hi ? "माह" : "Month"] : [];
  const tip = (k: keyof typeof EXAM_TIPS) => EXAM_TIPS[k][lang];

  const stats: [string, number][] = [
    [hi ? "नियुक्तियाँ" : "Appointments", f.appointments.length],
    [hi ? "सैन्य अभ्यास" : "Defence exercises", f.exercises.length],
    [hi ? "शिखर सम्मेलन" : "Summits & meets", f.summits.length],
    [hi ? "पुरस्कार" : "Awards", f.awards.length],
    [hi ? "खेल" : "Sports wins", f.sports.length],
    [hi ? "महत्वपूर्ण दिवस" : "Important days", f.days.length],
    [hi ? "अभ्यास प्रश्न" : "Practice MCQs", view.quiz.length],
  ];

  return (
    <article className="capsule space-y-8">
      {/* Cover */}
      <header className="avoid-break overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-6 text-white shadow-md md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{view.title}</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{view.period}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          {hi
            ? `परीक्षा-उपयोगी तथ्य, तालिकाएँ और अभ्यास प्रश्न — ${view.headlines.toLocaleString("en-IN")} आधिकारिक सुर्खियों (पीआईबी, आरबीआई, आकाशवाणी) से संकलित।`
            : `Exam-ready tables, quick facts and practice MCQs — compiled from ${view.headlines.toLocaleString("en-IN")} official headlines (PIB, RBI, All India Radio).`}
          {view.partial && (hi ? " यह माह अभी जारी है।" : " This month is still in progress.")}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {stats.map(([label, n]) => (
            <div key={label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <dd className="text-2xl font-bold tabular-nums">{n}</dd>
              <dt className="text-[11px] leading-tight text-white/75">{label}</dt>
            </div>
          ))}
        </dl>
      </header>

      {/* Top facts */}
      {view.highlights.length > 0 && (
        <section className="avoid-break">
          <SectionTitle tone="indigo" code="★" title={year ? (hi ? "वर्ष के 20 ज़रूरी तथ्य" : "20 must-know facts of the year") : hi ? "इस माह के 10 ज़रूरी तथ्य" : "10 must-know facts this month"} />
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {view.highlights.map((h, i) => (
              <li key={i} className="avoid-break flex gap-3 rounded-xl border border-border bg-surface p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
                <span className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{h.kind}</span>
                  <a href={h.url} target="_blank" rel="noopener noreferrer" className="block font-semibold leading-snug hover:underline">
                    {h.main}
                  </a>
                  <span className="block text-sm text-muted">{h.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <FactTable
        tone="slate"
        code="EX"
        title={hi ? "सैन्य अभ्यास" : "Defence exercises"}
        tip={tip("exercises")}
        head={[...monthHead, hi ? "अभ्यास" : "Exercise", hi ? "भारत के साथ" : "With India", hi ? "स्थान" : "Where"]}
        rows={f.exercises.map((e) => ({ url: e.url, cells: [...m(e), e.name, e.partners.join(", ") || (hi ? "भारत (स्वदेशी)" : "India (own forces)"), e.venue ?? "—"] }))}
      />
      <FactTable
        tone="indigo"
        code="SU"
        title={hi ? "शिखर सम्मेलन एवं बैठकें" : "Summits, conferences & meetings"}
        tip={tip("summits")}
        head={[...monthHead, hi ? "आयोजन" : "Event", hi ? "स्थान" : "Venue"]}
        rows={f.summits.map((s) => ({ url: s.url, cells: [...m(s), s.event, s.venue] }))}
      />
      <FactTable
        tone="violet"
        code="AP"
        title={hi ? "नियुक्तियाँ" : "Appointments"}
        tip={tip("appointments")}
        head={[...monthHead, hi ? "कौन" : "Who", hi ? "पद" : "Post"]}
        rows={f.appointments.map((a) => ({ url: a.url, cells: [...m(a), a.who, a.post] }))}
      />
      <FactTable
        tone="amber"
        code="AW"
        title={hi ? "पुरस्कार एवं सम्मान" : "Awards & honours"}
        tip={tip("awards")}
        head={[...monthHead, hi ? "पुरस्कार" : "Award", hi ? "विजेता" : "Winner"]}
        rows={f.awards.map((a) => ({ url: a.url, cells: [...m(a), a.award, a.winner] }))}
      />
      <FactTable
        tone="orange"
        code="SP"
        title={hi ? "खेल" : "Sports"}
        tip={tip("sports")}
        head={[...monthHead, hi ? "कौन" : "Who", hi ? "उपलब्धि" : "Won", hi ? "प्रतियोगिता" : "Event"]}
        rows={f.sports.map((s) => ({ url: s.url, cells: [...m(s), s.who, s.feat, s.event ?? "—"] }))}
      />
      <FactTable
        tone="pink"
        code="DY"
        title={hi ? "महत्वपूर्ण दिवस" : "Important days"}
        tip={tip("days")}
        head={[...monthHead, hi ? "तिथि" : "Date", hi ? "दिवस" : "Day", hi ? "थीम" : "Theme"]}
        rows={f.days.map((d) => ({ url: d.url, cells: [...m(d), d.observed ?? `${hi ? "समाचार" : "reported"} ${d.date.slice(8)}/${d.date.slice(5, 7)}`, d.day, d.theme ?? "—"] }))}
      />
      <FactTable
        tone="teal"
        code="MO"
        title={hi ? "समझौते एवं एमओयू" : "Agreements & MoUs"}
        tip={tip("agreements")}
        head={[...monthHead, hi ? "देश" : "Country", hi ? "क्षेत्र" : "Area"]}
        rows={f.agreements.map((a) => ({ url: a.url, cells: [...m(a), a.country, a.area] }))}
      />
      <FactTable
        tone="sky"
        code="SC"
        title={hi ? "योजनाएँ, पोर्टल एवं पहल" : "Schemes, portals & initiatives"}
        tip={tip("launches")}
        head={[...monthHead, hi ? "क्या" : "What", hi ? "किसके द्वारा" : "By"]}
        rows={f.launches.map((l) => ({ url: l.url, cells: [...m(l), l.what, l.by] }))}
      />

      <ListSection tone="rose" code="CB" title={hi ? "कैबिनेट निर्णय" : "Cabinet decisions"} tip={tip("cabinet")} items={f.cabinet.map((c) => ({ url: c.url, text: c.text, month: year ? shortMonth(c.month) : undefined }))} />

      {(f.rbiPenalties.length > 0 || f.rbiLicences.length > 0) && (
        <Section tone="emerald" code="₹" title={hi ? "बैंकिंग कॉर्नर (आरबीआई)" : "Banking corner (RBI)"} tip={tip("rbi")}>
          <div className="grid gap-3 md:grid-cols-2">
            {f.rbiLicences.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-sm font-semibold">
                  {hi ? "लाइसेंस रद्द" : "Licence cancelled"} <span className="text-muted">({f.rbiLicences.length})</span>
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                  {f.rbiLicences.map((x, i) => (
                    <li key={i}>{x.text}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm font-semibold">
                {hi ? "मौद्रिक जुर्माना लगाया गया" : "Monetary penalty imposed on"} <span className="text-muted">({f.rbiPenalties.length})</span>
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                {f.rbiPenalties.slice(0, year ? 40 : 20).map((x, i) => (
                  <li key={i}>{x.text}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      <ListSection tone="indigo" code="#" title={hi ? "रैंकिंग एवं सूचकांक" : "Rankings & indices"} items={f.rankings.map((c) => ({ url: c.url, text: c.text, month: year ? shortMonth(c.month) : undefined }))} />

      {/* Fast facts by topic */}
      {f.oneLiners.length > 0 && (
        <section>
          <SectionTitle tone="slate" code="⚡" title={hi ? "फटाफट तथ्य (विषयवार)" : "Fast facts by topic"} />
          <div className="mt-3 columns-1 gap-4 md:columns-2">
            {EXAM_TOPICS.filter((t) => f.oneLiners.some((o) => o.topic === t.id)).map((t) => (
              <div key={t.id} className="avoid-break mb-4 rounded-lg border border-border bg-surface p-3">
                <p className={cx("inline-block rounded border px-2 py-0.5 text-xs font-semibold", topicDef(t.id).tone)}>{pick(t.label, lang)}</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {f.oneLiners
                    .filter((o) => o.topic === t.id)
                    .slice(0, year ? 12 : 8)
                    .map((o, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="text-muted">›</span>
                        <a href={o.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                          {o.text}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quiz */}
      {view.quiz.length > 0 && (
        <section className="print-break">
          <SectionTitle tone="violet" code="?" title={hi ? `अभ्यास प्रश्न (${view.quiz.length})` : `Practice MCQs (${view.quiz.length})`} />
          <p className="mb-3 mt-1 text-sm text-muted">
            {hi ? "परीक्षा जैसे प्रश्न। विकल्प पर टैप करें — तुरंत पता चलेगा सही या गलत।" : "Exam-style questions. Tap an option to check yourself instantly."}
          </p>
          <CapsuleQuiz quiz={view.quiz} lang={lang} />
          <div className="print-only avoid-break mt-6">
            <p className="font-semibold">{hi ? "उत्तर कुंजी" : "Answer key"}</p>
            <p className="mt-1 text-sm">
              {view.quiz.map((q, i) => `${i + 1}-${LETTERS[q.answer]}`).join("   ")}
            </p>
          </div>
        </section>
      )}

      <footer className="border-t border-border pt-4 text-xs text-muted">
        {hi
          ? "पीआईबी, आरबीआई और आकाशवाणी की आधिकारिक सुर्खियों से स्वचालित रूप से संकलित। प्रत्येक पंक्ति अपने स्रोत से जुड़ी है — परीक्षा से पहले स्रोत पर पुष्टि करें।"
          : "Auto-compiled from official PIB, RBI and All India Radio headlines. Every row links to its source — check the source before relying on a detail."}
      </footer>
    </article>
  );
}

function SectionTitle({ tone, code, title, count }: { tone: Tone; code: string; title: string; count?: number }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold">
      <span className={cx("grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-xs font-extrabold text-white", TONES[tone][0])}>{code}</span>
      {title}
      {count !== undefined && <span className="rounded-full bg-slate-100 px-2 text-sm font-semibold text-muted">{count}</span>}
    </h2>
  );
}

function Section({ tone, code, title, tip, count, children }: { tone: Tone; code: string; title: string; tip?: string; count?: number; children: ReactNode }) {
  return (
    <section>
      <SectionTitle tone={tone} code={code} title={title} count={count} />
      {tip && <p className={cx("avoid-break mt-2 rounded-lg border px-3 py-2 text-sm", TONES[tone][1])}>💡 {tip}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function FactTable({ tone, code, title, tip, head, rows }: { tone: Tone; code: string; title: string; tip: string; head: string[]; rows: { url: string; cells: string[] }[] }) {
  if (!rows.length) return null;
  // The key column (after the optional month column) is bold.
  const boldAt = head[0] === "Month" || head[0] === "माह" ? 1 : 0;
  return (
    <Section tone={tone} code={code} title={title} tip={tip} count={rows.length}>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted">
              {head.map((h) => (
                <th key={h} className="border-b border-border px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="avoid-break odd:bg-white even:bg-slate-50/60">
                {r.cells.map((c, j) => (
                  <td key={j} className={cx("border-b border-border px-3 py-1.5 align-top", j === boldAt && "font-semibold")}>
                    {j === r.cells.length - 1 ? (
                      <span className="flex items-start justify-between gap-2">
                        <span>{c}</span>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="screen-only shrink-0 text-xs text-muted hover:text-primary" aria-label="Source">
                          ↗
                        </a>
                      </span>
                    ) : (
                      c
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function ListSection({ tone, code, title, tip, items }: { tone: Tone; code: string; title: string; tip?: string; items: { url: string; text: string; month?: string }[] }) {
  if (!items.length) return null;
  return (
    <Section tone={tone} code={code} title={title} tip={tip} count={items.length}>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((x, i) => (
          <li key={i} className="avoid-break flex gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
            {x.month && <span className="shrink-0 text-xs font-semibold text-muted">{x.month}</span>}
            <a href={x.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
              {x.text}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
