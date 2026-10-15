import type { Course } from "../types";
import { P01_CONSTITUTION } from "./p01-constitution";
import { P02_RIGHTS } from "./p02-rights";
import { P03_UNION } from "./p03-union";
import { P04_STATES_LOCAL } from "./p04-states-local";
import { P05_BODIES_AMENDMENTS } from "./p05-bodies-amendments";
import { POLITY_PRACTICE } from "./practice";
import { withPractice } from "../util";

export const POLITY_COURSE: Course = {
  id: "polity",
  title: "Indian Polity & Constitution",
  titleHi: "भारतीय राजव्यवस्था एवं संविधान",
  short: "Polity",
  shortHi: "राजव्यवस्था",
  tagline: "BPSC · UPSC · SSC · State PSC · TET/TRE · Banking",
  subtitle: "The Constitution explained in plain words — from how it was written to Parliament, courts, elections, panchayats and amendments — with an article map, “how exams ask this”, traps, memory tricks, a quiz in every lesson and an exam-level test after every module.",
  subtitleHi: "संविधान आसान शब्दों में — निर्माण से लेकर संसद, न्यायालय, चुनाव, पंचायत और संशोधन तक — अनुच्छेद मानचित्र, “परीक्षा में ऐसे पूछा जाता है”, जाल, ट्रिक, हर पाठ में क्विज़ और हर मॉड्यूल के बाद परीक्षा-स्तर का टेस्ट।",
  modules: withPractice([P01_CONSTITUTION, P02_RIGHTS, P03_UNION, P04_STATES_LOCAL, P05_BODIES_AMENDMENTS], POLITY_PRACTICE),
  links: [
    { title: "Constitution of India (official text)", titleHi: "भारत का संविधान (आधिकारिक पाठ)", sub: "legislative.gov.in", subHi: "legislative.gov.in", href: "https://legislative.gov.in/constitution-of-india/" },
    { title: "Polity revision checklist", titleHi: "राजव्यवस्था दोहराने की चेकलिस्ट", sub: "With NCERT chapter links", subHi: "एनसीईआरटी अध्याय लिंक सहित", href: "/study-material/subjects/polity" },
    { title: "Free mock tests", titleHi: "निःशुल्क मॉक टेस्ट", sub: "Practise GS questions", subHi: "सामान्य अध्ययन का अभ्यास", href: "/tests?access=free" },
  ],
};
