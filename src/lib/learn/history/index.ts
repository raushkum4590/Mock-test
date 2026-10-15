import type { Course } from "../types";
import { withPractice } from "../util";
import { H01_ANCIENT } from "./h01-ancient";
import { H02_MEDIEVAL } from "./h02-medieval";
import { H03_MODERN } from "./h03-modern";
import { H04_WORLD_BIHAR } from "./h04-world-bihar";
import { H05_CULTURE } from "./h05-culture";
import { HISTORY_PRACTICE } from "./practice";

export const HISTORY_COURSE: Course = {
  id: "history",
  title: "History — ancient to modern, with art & culture",
  titleHi: "इतिहास — प्राचीन से आधुनिक, कला एवं संस्कृति सहित",
  short: "History",
  shortHi: "इतिहास",
  tagline: "BPSC · SSC · Railway · State PSC · TET/TRE · Police",
  subtitle: "Indian history told as a story, period by period, plus art & culture — every lesson with timelines, who-did-what tables, “how exams ask this”, traps, memory tricks and a quiz, and an exam-level test after every module. Bihar's role is highlighted for BPSC.",
  subtitleHi: "भारतीय इतिहास कहानी की तरह, काल-दर-काल, साथ में कला एवं संस्कृति — हर पाठ में समय-रेखा, तालिकाएँ, “परीक्षा में ऐसे पूछा जाता है”, जाल, ट्रिक और क्विज़, और हर मॉड्यूल के बाद परीक्षा-स्तर का टेस्ट। बीपीएससी के लिए बिहार विशेष रूप से।",
  modules: withPractice([H01_ANCIENT, H02_MEDIEVAL, H03_MODERN, H04_WORLD_BIHAR, H05_CULTURE], HISTORY_PRACTICE),
  links: [
    { title: "Current affairs capsule", titleHi: "समसामयिकी कैप्सूल", sub: "Last 12 months, PDF", subHi: "पिछले 12 महीने, पीडीएफ़", href: "/study-material/current-affairs/capsule" },
    { title: "History revision checklist", titleHi: "इतिहास दोहराने की चेकलिस्ट", sub: "With NCERT chapter links", subHi: "एनसीईआरटी अध्याय लिंक सहित", href: "/study-material/subjects/history" },
    { title: "Free mock tests", titleHi: "निःशुल्क मॉक टेस्ट", sub: "Practise GS questions", subHi: "सामान्य अध्ययन का अभ्यास", href: "/tests?access=free" },
  ],
};
