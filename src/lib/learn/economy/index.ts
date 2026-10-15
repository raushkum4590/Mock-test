import type { Course } from "../types";
import { E01_BASICS } from "./e01-basics";
import { E02_MONEY_BANKING } from "./e02-money-banking";
import { E03_PUBLIC_FINANCE } from "./e03-public-finance";
import { E04_DEVELOPMENT } from "./e04-development";
import { ECONOMY_PRACTICE } from "./practice";
import { withPractice } from "../util";

export const ECONOMY_COURSE: Course = {
  id: "economy",
  title: "Indian Economy made simple",
  titleHi: "भारतीय अर्थव्यवस्था आसान भाषा में",
  short: "Economy",
  shortHi: "अर्थव्यवस्था",
  tagline: "BPSC · SSC · Banking · Railway · State PSC · TET/TRE",
  subtitle: "Economics from zero — GDP and HDI, inflation, RBI, banks and share markets, budget and GST, agriculture and industry, reforms, trade, reports, schemes and Bihar's economy — with village-level examples, formulas, “how exams ask this”, traps, a quiz in every lesson and an exam-level test after every module.",
  subtitleHi: "अर्थशास्त्र शुरुआत से — जीडीपी और एचडीआई, मुद्रास्फीति, आरबीआई, बैंक और शेयर बाज़ार, बजट और जीएसटी, कृषि और उद्योग, सुधार, व्यापार, रिपोर्ट, योजनाएँ और बिहार — आसान उदाहरण, सूत्र, “परीक्षा में ऐसे पूछा जाता है”, जाल, हर पाठ में क्विज़ और हर मॉड्यूल के बाद टेस्ट।",
  modules: withPractice([E01_BASICS, E02_MONEY_BANKING, E03_PUBLIC_FINANCE, E04_DEVELOPMENT], ECONOMY_PRACTICE),
  links: [
    { title: "Economic Survey & Union Budget", titleHi: "आर्थिक सर्वेक्षण एवं केंद्रीय बजट", sub: "indiabudget.gov.in", subHi: "indiabudget.gov.in", href: "https://www.indiabudget.gov.in/" },
    { title: "Economy revision checklist", titleHi: "अर्थव्यवस्था दोहराने की चेकलिस्ट", sub: "With NCERT chapter links", subHi: "एनसीईआरटी अध्याय लिंक सहित", href: "/study-material/subjects/economy" },
    { title: "Current affairs capsule", titleHi: "करंट अफेयर्स कैप्सूल", sub: "RBI, budget & schemes in the news", subHi: "समाचारों में आरबीआई, बजट और योजनाएँ", href: "/study-material/current-affairs/capsule" },
  ],
};
