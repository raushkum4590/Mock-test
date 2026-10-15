import Link from "next/link";
import { notFound } from "next/navigation";
import pdfs from "@/data/current-affairs/pdfs.json";
import { getUiLang } from "@/lib/i18n/server-lang";
import { courseHref, courseStats, findCourse } from "@/lib/learn/courses";
import { pick } from "@/lib/study-material/resources";
import { findGuide } from "@/lib/study-material/subject-guides";
import { PrintButton } from "@/components/study/print-button";
import { StudyHeader } from "@/components/study/study-ui";
import { GuideSwitcher, SubjectGuideBooklet } from "@/components/study/subject-guide-view";

const PDFS = pdfs as Record<string, string>;

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const guide = findGuide((await params).subject);
  return { title: guide ? guide.title.en : "Subject guide" };
}

export default async function SubjectGuidePage({ params }: { params: Promise<{ subject: string }> }) {
  const guide = findGuide((await params).subject);
  if (!guide) notFound();
  const lang = await getUiLang();
  const hi = lang === "hi";
  const pdf = PDFS[`guide:${guide.id}`];
  const course = findCourse(guide.id);
  const lessonCount = course ? courseStats(course).lessons.length : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/subjects"
        title={pick(guide.title, lang)}
      />
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <GuideSwitcher active={guide.id} lang={lang} />
        <div className="flex flex-wrap gap-2">
          {pdf && (
            <a href={pdf} download className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
              {hi ? "पीडीएफ़ डाउनलोड करें" : "Download PDF"}
            </a>
          )}
          <PrintButton label={hi ? "प्रिंट / पीडीएफ़ सहेजें" : "Print / Save as PDF"} />
        </div>
      </div>
      {course && (
        <Link
          href={courseHref(course)}
          className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary bg-primary/5 px-5 py-4 hover:bg-primary/10"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-wider text-primary">{hi ? "यह केवल दोहराने की चेकलिस्ट है" : "This page is only the revision checklist"}</span>
            <span className="text-lg font-bold">
              {hi
                ? `पूरा ${course.shortHi} कोर्स पढ़ें — ${lessonCount} पाठ, आसान व्याख्या, क्विज़`
                : `Study the full ${course.short} course — ${lessonCount} lessons, explained simply, with quizzes`}
            </span>
          </span>
          <span className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">{hi ? "कोर्स खोलें →" : "Open the course →"}</span>
        </Link>
      )}
      <SubjectGuideBooklet guide={guide} lang={lang} />
    </div>
  );
}
