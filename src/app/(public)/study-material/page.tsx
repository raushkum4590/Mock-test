import Link from "next/link";
import { getUiLang } from "@/lib/i18n/server-lang";
import { NCERT_BOOKS, NCERT_CLASSES, type StudySubject } from "@/lib/study-material/ncert";
import { GENERAL_RESOURCES, pick, SUBJECT_LABELS, SUBJECT_REFERENCES } from "@/lib/study-material/resources";
import { EXAM_KITS } from "@/lib/study-material/exam-kits";
import { topicDef } from "@/lib/study-material/exam-view";
import { getExamFacts } from "@/server/services/current-affairs-service";
import { cx } from "@/components/ui";
import { CopyrightNote, ResourceList, StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "Study material" };

const SUBJECTS = Object.keys(SUBJECT_LABELS) as StudySubject[];
const HEADLINES = 6;

export default async function StudyMaterialPage() {
  const lang = await getUiLang();
  const hi = lang === "hi";
  // Latest exam facts, preferring the reader's language (PIB's feed is Hindi only).
  const facts = await getExamFacts();
  const headlines = [...facts.filter((f) => f.source.lang === lang), ...facts.filter((f) => f.source.lang !== lang)].slice(0, HEADLINES);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material"
        title={hi ? "अध्ययन सामग्री" : "Study material"}
        subtitle={
          hi
            ? "एनसीईआरटी पुस्तकें, दैनिक समसामयिकी और विषयवार आधिकारिक संदर्भ — सब एक जगह, निःशुल्क।"
            : "NCERT books, daily current affairs and subject-wise official references — all in one place, free."
        }
      />

      <div className="grid items-start gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{hi ? "एनसीईआरटी पुस्तकें" : "NCERT books"}</h2>
          <p className="mt-1 text-sm text-muted">
            {hi
              ? `कक्षा 6–12 · ${NCERT_BOOKS.length} पुस्तकें · हिंदी एवं अंग्रेज़ी माध्यम`
              : `Class 6–12 · ${NCERT_BOOKS.length} books · English and Hindi medium`}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {NCERT_CLASSES.map((c) => (
              <li key={c}>
                <Link href={`/study-material/ncert?class=${c}`} className="grid h-9 min-w-9 place-items-center rounded-md border border-border px-3 text-sm font-medium hover:border-primary hover:text-primary">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/study-material/ncert" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            {hi ? "सभी पुस्तकें देखें →" : "Browse all books →"}
          </Link>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{hi ? "आज की समसामयिकी" : "Today's current affairs"}</h2>
          {headlines.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{hi ? "सुर्खियाँ अभी उपलब्ध नहीं हैं।" : "Headlines are not available right now."}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border text-sm">
              {headlines.map((h, i) => (
                <li key={`${i}-${h.url}`} className="py-2">
                  <span className={cx("mr-2 inline-block rounded border px-1.5 text-[11px] font-semibold", topicDef(h.topic).tone)}>{pick(topicDef(h.topic).label, lang)}</span>
                  <a href={h.url} target="_blank" rel="noopener noreferrer" lang={h.source.lang} className="hover:text-primary hover:underline">
                    {h.title}
                  </a>
                  <span className="ml-2 text-xs text-muted">{h.source.short}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/study-material/current-affairs" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            {hi ? "सभी स्रोत देखें →" : "All sources →"}
          </Link>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{hi ? "परीक्षावार किट" : "Exam-wise kits"}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {EXAM_KITS.map((k) => (
            <li key={k.id}>
              <Link
                href={`/study-material/exams/${k.id}`}
                className="block h-full rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm hover:border-indigo-400"
              >
                <span className="block font-semibold text-indigo-950">{pick(k.title, lang)}</span>
                <span className="mt-1 block text-sm text-indigo-900/80">{pick(k.subtitle, lang)}</span>
                <span className="mt-3 block text-sm font-medium text-indigo-700">{hi ? "किट खोलें →" : "Open kit →"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{hi ? "विषयवार सामग्री" : "Subject-wise material"}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => {
            const books = NCERT_BOOKS.filter((b) => b.subjects.includes(s)).length;
            return (
              <section key={s} id={s} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-semibold">{pick(SUBJECT_LABELS[s], lang)}</h3>
                <Link href={`/study-material/ncert?subject=${s}`} className="mt-2 text-sm font-medium text-primary hover:underline">
                  {hi ? `एनसीईआरटी: ${books} पुस्तकें →` : `NCERT: ${books} books →`}
                </Link>
                <div className="mt-3 border-t border-border pt-3">
                  <ResourceList items={SUBJECT_REFERENCES[s]} lang={lang} />
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{hi ? "अन्य निःशुल्क अध्ययन सामग्री" : "More free study material"}</h2>
        <div className="mt-3 md:columns-2">
          <ResourceList items={GENERAL_RESOURCES} lang={lang} />
        </div>
        <p className="mt-4 text-xs text-muted">
          {hi ? "समाचार पत्र (द हिंदू, टाइम्स ऑफ़ इंडिया आदि) कॉपीराइट हैं, इसलिए यहाँ शामिल नहीं हैं।" : "Newspapers (The Hindu, Times of India, etc.) are copyrighted and are not included here."}
        </p>
      </section>

      <CopyrightNote lang={lang} />
    </div>
  );
}
