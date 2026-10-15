/**
 * "Exam view" of current affairs: sorts official headlines into the topics
 * competitive exams ask about, drops routine news (weather, train
 * cancellations, condolences, greetings, festival coverage) and marks the
 * keyword that put a headline in its topic so students can scan quickly.
 *
 * Rule-based (English + Hindi keywords) — no AI, no network. Headlines that
 * match no topic are left out of the exam view but stay in "All headlines".
 */
import type { Bilingual } from "./resources";

export type ExamTopic =
  | "banking"
  | "defence"
  | "science"
  | "sports"
  | "awards"
  | "appointments"
  | "international"
  | "polity"
  | "environment"
  | "schemes"
  | "days";

type TopicDef = { id: ExamTopic; label: Bilingual; exams: string; tone: string; pattern: RegExp; acronyms?: RegExp };

// \b does not work around Devanagari, so Hindi alternatives are plain substrings.
const re = (en: string, hi: string) => new RegExp(`\\b(?:${en})\\b|${hi}`, "i");
/** Acronyms and short words match case-sensitively ("UN" but not "un", "Act" but not "act"). */
const caps = (words: string) => new RegExp(`\\b(?:${words})\\b`);

/** In priority order: the first matching topic wins. */
export const EXAM_TOPICS: TopicDef[] = [
  {
    id: "banking",
    label: { en: "Banking & Economy", hi: "बैंकिंग एवं अर्थव्यवस्था" },
    exams: "IBPS · SBI · RBI · NABARD",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pattern: re(
      "Reserve Bank|banks?|banking|repo rate|inflation|rupee|forex|fiscal|budget|economy|economic|exports?|imports?|monetary|dollar|stock market",
      "आरबीआई|रिज़र्व बैंक|रिजर्व बैंक|बैंक|मुद्रास्फीति|जीडीपी|सेबी|अर्थव्यवस्था|जीएसटी|बजट|निर्यात|आयात|यूपीआई|रुपये",
    ),
    acronyms: caps("RBI|GDP|SEBI|IRDAI|NABARD|GST|MSMEs?|UPI|NPCI"),
  },
  {
    id: "defence",
    label: { en: "Defence & Security", hi: "रक्षा एवं सुरक्षा" },
    exams: "CDS · NDA · AFCAT · SSC",
    tone: "bg-slate-100 text-slate-800 border-slate-300",
    pattern: re(
      "Army|Navy|Naval|Air Force|missile|exercise|Defence|warship|submarine|Coast Guard|Rajnath Singh",
      "रक्षा|सेना|नौसेना|वायुसेना|डीआरडीओ|मिसाइल|सैन्य अभ्यास|तटरक्षक",
    ),
    acronyms: caps("IAF|DRDO|BSF|CRPF|ITBP"),
  },
  {
    id: "science",
    label: { en: "Science & Technology", hi: "विज्ञान एवं प्रौद्योगिकी" },
    exams: "SSC · Railway · UPSC",
    tone: "bg-sky-50 text-sky-800 border-sky-200",
    pattern: re(
      "satellite|space|spacecraft|artificial intelligence|quantum|semiconductor|research|robotics?|technology|nuclear|telecommunications?|telecom|vaccine",
      "इसरो|उपग्रह|अंतरिक्ष|विज्ञान|प्रौद्योगिकी|अनुसंधान|रोबोटिक्स|सेमीकंडक्टर|टीका",
    ),
    acronyms: caps("ISRO|AI|DST|CSIR|5G|6G"),
  },
  {
    id: "sports",
    label: { en: "Sports", hi: "खेल" },
    exams: "SSC · Railway · Banking",
    tone: "bg-orange-50 text-orange-800 border-orange-200",
    pattern: re(
      "medals?|championships?|tournament|Cup|Olympics?|Paralympics?|Asian Games|Commonwealth Games|Khelo India|Fit India|cricket|hockey|chess|football|badminton|wrestling|athletics",
      "पदक|चैंपियनशिप|खेलो इंडिया|फिट इंडिया|ओलंपिक|टूर्नामेंट|क्रिकेट|हॉकी|शतरंज|खेल",
    ),
  },
  {
    id: "awards",
    label: { en: "Awards & Honours", hi: "पुरस्कार एवं सम्मान" },
    exams: "SSC · Banking · Railway",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
    pattern: re("awards?|honoured|prize|conferred|Padma|Bharat Ratna", "पुरस्कार|सम्मानित|पद्म"),
  },
  {
    id: "international",
    label: { en: "International Relations", hi: "अंतरराष्ट्रीय संबंध" },
    exams: "UPSC · SSC · State PSC",
    tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
    pattern: re(
      "United Nations|bilateral|summit|Inter-Parliamentary|embassy|External Affairs|treaty|agreement|foreign minister|holds (?:talks|meetings?) with",
      "संयुक्त राष्ट्र|द्विपक्षीय|शिखर सम्मेलन|समझौत|विदेश|ब्रिक्स|अंतर-संसदीय|प्रतिनिधिमंडल",
    ),
    acronyms: caps("UN|UNGA|MoU|G20|BRICS|SCO|ASEAN|QUAD|IPU"),
  },
  {
    id: "polity",
    label: { en: "Polity & Governance", hi: "राजव्यवस्था एवं शासन" },
    exams: "UPSC · SSC · State PSC",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
    pattern: re(
      "Parliament|Lok Sabha|Rajya Sabha|Supreme Court|High Court|Constitution|Election Commission|Governor|Vice[- ]President|President Murmu|Rashtrapati",
      "संसद|लोकसभा|राज्यसभा|सर्वोच्च न्यायालय|उच्च न्यायालय|संविधान|अधिनियम|विधेयक|राज्यपाल|उपराष्ट्रपति|राष्ट्रपति|उपसभापति",
    ),
    acronyms: caps("Act|Bill"),
  },
  {
    id: "appointments",
    label: { en: "Appointments", hi: "नियुक्तियाँ" },
    exams: "SSC · Banking · Railway",
    tone: "bg-violet-50 text-violet-800 border-violet-200",
    pattern: re("appointed|takes charge|assumes charge|sworn in|elected|re-elected|named as|new chief", "नियुक्त|कार्यभार|शपथ|निर्वाचित"),
  },
  {
    id: "environment",
    label: { en: "Environment", hi: "पर्यावरण" },
    exams: "UPSC · State PSC · SSC",
    tone: "bg-lime-50 text-lime-800 border-lime-200",
    pattern: re(
      "forests?|wildlife|tigers?|climate|biodiversity|Ramsar|national park|pollution|renewable|solar|wetlands?",
      "वन अधिकार|वन्य|जलवायु|जैव विविधता|बाघ|प्रदूषण|नवीकरणीय|सौर|आर्द्रभूमि",
    ),
  },
  {
    id: "schemes",
    label: { en: "Schemes & Initiatives", hi: "योजनाएँ एवं पहल" },
    exams: "UPSC · SSC · Banking",
    tone: "bg-teal-50 text-teal-800 border-teal-200",
    pattern: re(
      "scheme|Yojana|Mission|Abhiyan|launch(?:es|ed)?|inaugurat\\w*|Cabinet approves|approved|policy|portal|initiative|programme|conclave|conference",
      "योजना|मिशन|अभियान|शुभारंभ|उद्घाटन|मंत्रिमंडल|मंजूरी|नीति|पोर्टल|सम्मेलन",
    ),
  },
  {
    id: "days",
    label: { en: "Important Days", hi: "महत्वपूर्ण दिवस" },
    exams: "SSC · Railway",
    tone: "bg-pink-50 text-pink-800 border-pink-200",
    pattern: re("Day|Diwas|Week|anniversary|Jayanti", "दिवस|सप्ताह|जयंती"),
  },
];

/** Routine news that exams do not ask about (incl. RBI's daily market operations). */
const NOISE = re(
  "forecasts?|rainfall|weather|cancels?|cancelled|diverted|passes away|condoles?|condolences?|greetings|wishes|celebrated|being observed|closed for|road accidents?|fatalities|traffic|alleges?|auctions?|results?|Statistical Supplement|Money Market Operations|OMO|VRRR",
  "शुभकामनाएं|शुभकामनाएँ|शोक|निधन|बधाई|मौसम|वर्षा|परिणाम",
);

export type ExamFact = { topic: ExamTopic; keyword: string };

export function classifyHeadline(title: string): ExamFact | null {
  if (NOISE.test(title)) return null;
  for (const t of EXAM_TOPICS) {
    const m = t.pattern.exec(title) ?? t.acronyms?.exec(title);
    if (m) return { topic: t.id, keyword: m[0] };
  }
  return null;
}

/** Splits a title around the first occurrence of `keyword` for highlighting. */
export function splitOnKeyword(title: string, keyword: string): [string, string, string] {
  const i = title.toLowerCase().indexOf(keyword.toLowerCase());
  if (i < 0) return [title, "", ""];
  return [title.slice(0, i), title.slice(i, i + keyword.length), title.slice(i + keyword.length)];
}

export const topicDef = (id: ExamTopic) => EXAM_TOPICS.find((t) => t.id === id)!;
