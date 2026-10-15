import Link from "next/link";
import { getUiLang } from "@/lib/i18n/server-lang";
import { pick } from "@/lib/study-material/resources";
import { SUBJECT_GUIDES } from "@/lib/study-material/subject-guides";
import { StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "Subject guides" };

export default async function SubjectGuidesPage() {
  const lang = await getUiLang();
  const hi = lang === "hi";
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/subjects"
        title={hi ? "विषय गाइड" : "Subject guides"}
        subtitle={
          hi
            ? "हर विषय मॉड्यूलवार: क्या पढ़ें, परीक्षा में कैसे पूछा जाता है, और कौन-सा एनसीईआरटी/एनआईओएस अध्याय खोलें। पीडीएफ़ के रूप में भी।"
            : "Every subject module by module: what to study, how exams ask it, and exactly which NCERT/NIOS chapter to open. Also as a PDF."
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECT_GUIDES.map((g) => (
          <li key={g.id}>
            <Link href={`/study-material/subjects/${g.id}`} className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary hover:shadow">
              <span className="text-lg font-bold">{pick(g.title, lang)}</span>
              <span className="mt-1 text-sm text-muted">{pick(g.subtitle, lang)}</span>
              <span className="mt-3 text-xs text-muted">{g.exams}</span>
              <span className="mt-auto pt-3 text-sm font-medium text-primary">
                {g.modules.length} {hi ? "मॉड्यूल" : "modules"} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
