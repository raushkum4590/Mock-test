import type { Course } from "../types";
import { G01_PHYSICAL } from "./g01-physical";
import { G02_INDIA_PHYSICAL } from "./g02-india-physical";
import { G03_INDIA_ECONOMIC } from "./g03-india-economic";
import { G04_WORLD_ENV_BIHAR } from "./g04-world-env-bihar";
import { GEOGRAPHY_PRACTICE } from "./practice";
import { withPractice } from "../util";

export const GEOGRAPHY_COURSE: Course = {
  id: "geography",
  title: "Geography: Earth, India, World & Bihar",
  titleHi: "भूगोल: पृथ्वी, भारत, विश्व एवं बिहार",
  short: "Geography",
  shortHi: "भूगोल",
  tagline: "BPSC · SSC · Railway · State PSC · TET/TRE · Police",
  subtitle: "Geography explained from zero — solar system, how the Earth works, India's land, rivers, passes, lakes, monsoon, crops and minerals, parks, disasters, world facts and Bihar — with tables, “how exams ask this”, tricks, traps, a quiz in every lesson and an exam-level test after every module.",
  subtitleHi: "भूगोल शुरुआत से — सौरमंडल, पृथ्वी, भारत की भू-आकृति, नदियाँ, दर्रे, झीलें, मानसून, फसलें, खनिज, राष्ट्रीय उद्यान, आपदाएँ, विश्व तथ्य और बिहार — तालिकाएँ, “परीक्षा में ऐसे पूछा जाता है”, ट्रिक, जाल, हर पाठ में क्विज़ और हर मॉड्यूल के बाद टेस्ट।",
  modules: withPractice([G01_PHYSICAL, G02_INDIA_PHYSICAL, G03_INDIA_ECONOMIC, G04_WORLD_ENV_BIHAR], GEOGRAPHY_PRACTICE),
  links: [
    { title: "Bhuvan maps (ISRO)", titleHi: "भुवन मानचित्र (इसरो)", sub: "bhuvan.nrsc.gov.in", subHi: "bhuvan.nrsc.gov.in", href: "https://bhuvan.nrsc.gov.in/" },
    { title: "Geography revision checklist", titleHi: "भूगोल दोहराने की चेकलिस्ट", sub: "With NCERT chapter links", subHi: "एनसीईआरटी अध्याय लिंक सहित", href: "/study-material/subjects/geography" },
    { title: "Free mock tests", titleHi: "निःशुल्क मॉक टेस्ट", sub: "Practise GS questions", subHi: "सामान्य अध्ययन का अभ्यास", href: "/tests?access=free" },
  ],
};
