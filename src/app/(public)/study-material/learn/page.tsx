import Link from "next/link";
import { getUiLang } from "@/lib/i18n/server-lang";
import { COURSES, courseHref, courseStats } from "@/lib/learn/courses";
import { progressKey } from "@/lib/learn/util";
import { ProgressBar } from "@/components/learn/progress";
import { StudyHeader } from "@/components/study/study-ui";

export const metadata = { title: "Courses" };

const ICONS: Record<string, string> = { "computer-science": "💻", history: "🏛", geography: "🌏", polity: "⚖", economy: "📈", javascript: "🟨", react: "⚛", dsa: "🧩", python: "🐍", statistics: "📊", "data-science": "🧪", "python-data-science-handbook": "📘", "essential-math": "∑", "hands-on-ml": "🤖" };
const TONES = ["from-indigo-600 to-violet-700", "from-amber-600 to-orange-700", "from-teal-600 to-emerald-700", "from-sky-600 to-blue-700", "from-rose-600 to-pink-700"];
/** Courses with their own colour instead of the rotating TONES. */
const TONE_BY_ID: Record<string, string> = { javascript: "from-zinc-800 to-slate-900", react: "from-cyan-700 to-sky-900", dsa: "from-emerald-700 to-teal-900", python: "from-blue-700 to-yellow-600", statistics: "from-fuchsia-700 to-indigo-900", "data-science": "from-orange-600 to-rose-800", "python-data-science-handbook": "from-sky-700 to-indigo-800", "essential-math": "from-violet-700 to-purple-900", "hands-on-ml": "from-amber-700 to-red-800" };

export default async function CoursesPage() {
  const lang = await getUiLang();
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <StudyHeader
        lang={lang}
        active="/study-material/learn"
        title={hi ? "कोर्स — शुरुआत से, आसान भाषा में" : "Courses — learn from zero, in plain words"}
        subtitle={
          hi
            ? "हर पाठ में एक मुख्य विचार, रोज़मर्रा का उदाहरण, तालिकाएँ, परीक्षा के जाल, याद रखने की ट्रिक, 30-सेकंड रिवीज़न और क्विज़।"
            : "Every lesson has one big idea, an everyday example, tables, exam traps, memory tricks, a 30-second recap and a quiz."
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((c, i) => {
          const { lessons, minutes, questions } = courseStats(c);
          return (
            <Link key={c.id} href={courseHref(c)} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`bg-gradient-to-br ${TONE_BY_ID[c.id] ?? TONES[i % TONES.length]} p-5 text-white`}>
                <span className="text-3xl" aria-hidden>
                  {ICONS[c.id] ?? "📘"}
                </span>
                <h2 className="mt-2 text-xl font-extrabold">{hi ? c.shortHi : c.short}</h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/75">{c.tagline}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-sm text-muted">{hi ? c.subtitleHi : c.subtitle}</p>
                <p className="text-xs font-semibold text-slate-600">
                  {c.modules.length} {hi ? "मॉड्यूल" : "modules"} · {lessons.length} {hi ? "पाठ" : "lessons"} · ~{Math.max(1, Math.round(minutes / 60))} {hi ? "घंटे" : "h"} ·{" "}
                  {questions} {hi ? "प्रश्न" : "quiz Qs"}
                </p>
                <div className="mt-auto">
                  <ProgressBar slugs={lessons.map((r) => progressKey(c, r.slug))} lang={lang} />
                </div>
                <span className="text-sm font-bold text-primary group-hover:underline">{hi ? "कोर्स खोलें →" : "Open course →"}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        {hi
          ? "पाठ अभी अंग्रेज़ी में हैं। तथ्य मानक स्रोतों (एनसीईआरटी, संविधान, सरकारी वेबसाइट) से लिए गए हैं — अपनी परीक्षा के आधिकारिक पाठ्यक्रम से मिलान करें।"
          : "Lessons are in English for now. Facts follow standard sources (NCERT, the Constitution, government websites) — match topics against your exam's official syllabus."}
      </p>
    </div>
  );
}
