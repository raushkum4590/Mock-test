import Link from "next/link";
import pdfs from "@/data/current-affairs/pdfs.json";
import { getUiLang } from "@/lib/i18n/server-lang";
import { capsuleMonths, getCapsule, YEAR_ID } from "@/lib/current-affairs/view";
import { StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "Current affairs capsule" };

const PDFS = pdfs as Record<string, string>;

export default async function CapsuleIndexPage() {
  const lang = await getUiLang();
  const hi = lang === "hi";
  const months = capsuleMonths();
  const year = getCapsule(YEAR_ID);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/current-affairs/capsule"
        title={hi ? "करंट अफेयर्स कैप्सूल" : "Current affairs capsule"}
        subtitle={
          hi
            ? "पिछले 12 महीनों की समसामयिकी — परीक्षा के अंदाज़ में: तालिकाएँ, ज़रूरी तथ्य और अभ्यास प्रश्न। पढ़ें या पीडीएफ़ डाउनलोड करें।"
            : "The last 12 months of current affairs, the way exams ask them: tables, must-know facts and practice MCQs. Read online or download the PDF."
        }
      />

      {!year ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">{hi ? "कैप्सूल अभी तैयार नहीं है।" : "No capsule has been generated yet."}</p>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-700 to-violet-700 p-6 text-white shadow-md md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{hi ? "वार्षिक संस्करण" : "Yearly edition"}</p>
            <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">{year.period}</h2>
            <p className="mt-2 text-sm text-white/80">
              {hi
                ? `${year.facts.appointments.length} नियुक्तियाँ · ${year.facts.exercises.length} सैन्य अभ्यास · ${year.facts.summits.length} शिखर सम्मेलन · ${year.facts.awards.length} पुरस्कार · ${year.facts.days.length} दिवस · ${year.quiz.length} प्रश्न`
                : `${year.facts.appointments.length} appointments · ${year.facts.exercises.length} defence exercises · ${year.facts.summits.length} summits · ${year.facts.awards.length} awards · ${year.facts.days.length} days · ${year.quiz.length} MCQs`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/study-material/current-affairs/capsule/${YEAR_ID}`} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/90">
                {hi ? "ऑनलाइन पढ़ें" : "Read online"}
              </Link>
              {PDFS[YEAR_ID] && (
                <a href={PDFS[YEAR_ID]} download className="rounded-md bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
                  {hi ? "पीडीएफ़ डाउनलोड करें" : "Download PDF"}
                </a>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">{hi ? "मासिक कैप्सूल" : "Monthly capsules"}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {months.map((m) => {
                const f = m.facts;
                return (
                  <li key={m.month} className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold">{m.label}</h3>
                      {m.partial && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{hi ? "जारी" : "In progress"}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {f.appointments.length} {hi ? "नियुक्तियाँ" : "appointments"} · {f.exercises.length} {hi ? "अभ्यास" : "exercises"} · {f.summits.length} {hi ? "सम्मेलन" : "summits"} · {m.quiz.length} MCQs
                    </p>
                    <div className="mt-auto flex flex-wrap gap-3 pt-3 text-sm font-medium">
                      <Link href={`/study-material/current-affairs/capsule/${m.month}`} className="text-primary hover:underline">
                        {hi ? "पढ़ें →" : "Read →"}
                      </Link>
                      {PDFS[m.month] && (
                        <a href={PDFS[m.month]} download className="text-primary hover:underline">
                          PDF ↓
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
