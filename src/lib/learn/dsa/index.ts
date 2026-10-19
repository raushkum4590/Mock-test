import type { Course } from "../types";
import { DSA01_FOUNDATIONS, DSA02_ARRAYS } from "./d01-foundations-arrays";
import { DSA03_RECURSION, DSA04_SORTING } from "./d02-recursion-sorting";
import { DSA05_LINKED_LISTS, DSA06_STACKS_QUEUES, DSA07_HASHING } from "./d03-lists-stacks-hashing";
import { DSA08_TREES, DSA09_HEAPS } from "./d04-trees-heaps";
import { DSA10_GRAPHS } from "./d05-graphs";
import { DSA11_GREEDY_DP, DSA12_ADVANCED } from "./d06-greedy-dp-advanced";

/** DSA from zero to advanced. Every program in Python, C, C++, Java and JavaScript, with every line explained. */
export const DSA_COURSE: Course = {
  id: "dsa",
  title: "DSA — beginner to advanced",
  titleHi: "डीएसए — शुरुआत से एडवांस तक",
  short: "DSA",
  shortHi: "डीएसए",
  tagline: "Python · C · C++ · Java · JavaScript · Placements & interviews",
  subtitle: "Data Structures and Algorithms from zero, in plain words: every program shown in Python, C, C++, Java and JavaScript with a comment on every line, dry-run tables that trace each step, diagrams, common mistakes, interview questions and a quiz in every lesson.",
  subtitleHi: "आसान भाषा में शुरुआत से डेटा स्ट्रक्चर और एल्गोरिदम: हर प्रोग्राम पाइथन, C, C++, जावा और जावास्क्रिप्ट में, हर लाइन पर टिप्पणी, हर कदम का ड्राई-रन टेबल, चित्र, आम गलतियाँ, इंटरव्यू प्रश्न और हर पाठ में क्विज़।",
  tutorial: true,
  modules: [DSA01_FOUNDATIONS, DSA02_ARRAYS, DSA03_RECURSION, DSA04_SORTING, DSA05_LINKED_LISTS, DSA06_STACKS_QUEUES, DSA07_HASHING, DSA08_TREES, DSA09_HEAPS, DSA10_GRAPHS, DSA11_GREEDY_DP, DSA12_ADVANCED],
  links: [
    { title: "JavaScript course", titleHi: "जावास्क्रिप्ट कोर्स", sub: "Learn the language behind the Try it editor", subHi: "ट्राई इट एडिटर की भाषा सीखें", href: "/study-material/learn/javascript" },
    { title: "Computer Science course", titleHi: "कंप्यूटर विज्ञान कोर्स", sub: "Theory for exams", subHi: "परीक्षा के लिए सिद्धांत", href: "/study-material/learn/computer-science" },
  ],
};
