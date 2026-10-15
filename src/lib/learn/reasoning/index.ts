import type { Course } from "../types";
import { R01_CODING_SERIES } from "./r01-coding-series";
import { R02_RELATIONS_DIRECTION } from "./r02-relations-direction";
import { R03_SYLLOGISM_INEQUALITY } from "./r03-syllogism-inequality";
import { R04_ARRANGEMENTS } from "./r04-arrangements";
import { R05_CRITICAL_DS } from "./r05-critical-ds";
import { REASONING_COURSE_PRACTICE } from "./practice";
import { withPractice } from "../util";

/** Practice PDFs shared by the site owner (one folder per topic). */
export const REASONING_DRIVE = "https://drive.google.com/drive/folders/1P2Iwn5pZExD4-TIKN20gMYtGetQjbzbJ";

export const REASONING_COURSE: Course = {
  id: "reasoning",
  title: "Reasoning made simple",
  titleHi: "तर्कशक्ति आसान भाषा में",
  short: "Reasoning",
  shortHi: "तर्कशक्ति",
  tagline: "IBPS/SBI PO & Clerk · SSC · Railway · Insurance · Police",
  subtitle: "Every reasoning topic of banking and SSC papers from zero — coding–decoding, series, input–output, blood relations, direction, syllogism, inequality, seating, puzzles, critical reasoning and data sufficiency — with step-by-step solved examples, traps, a quiz in every lesson and an exam-level test after every module.",
  subtitleHi: "बैंकिंग और एसएससी पेपरों का हर तर्कशक्ति विषय शुरुआत से — कूटलेखन, श्रेणी, इनपुट–आउटपुट, रक्त संबंध, दिशा, न्याय-वाक्य, असमानता, बैठक व्यवस्था, पहेलियाँ, आलोचनात्मक तर्क और आँकड़ा पर्याप्तता — चरणबद्ध हल उदाहरण, जाल, हर पाठ में क्विज़ और हर मॉड्यूल के बाद टेस्ट।",
  modules: withPractice([R01_CODING_SERIES, R02_RELATIONS_DIRECTION, R03_SYLLOGISM_INEQUALITY, R04_ARRANGEMENTS, R05_CRITICAL_DS], REASONING_COURSE_PRACTICE),
  links: [
    { title: "Topic-wise practice PDFs", titleHi: "विषयवार अभ्यास पीडीएफ़", sub: "Reasoning Champion folder (Google Drive)", subHi: "रीज़निंग चैंपियन फ़ोल्डर (गूगल ड्राइव)", href: REASONING_DRIVE },
    { title: "Reasoning revision checklist", titleHi: "तर्कशक्ति दोहराने की चेकलिस्ट", sub: "Hot topics and quick MCQs", subHi: "महत्वपूर्ण विषय और त्वरित प्रश्न", href: "/study-material/subjects/reasoning" },
    { title: "Free mock tests", titleHi: "निःशुल्क मॉक टेस्ट", sub: "Banking, SSC and Railway", subHi: "बैंकिंग, एसएससी और रेलवे", href: "/tests?access=free" },
  ],
};
