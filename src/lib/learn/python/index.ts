import type { Course } from "../types";
import { PY01_START, PY02_VARIABLES, PY03_OPERATORS_STRINGS, PY04_CONTROL } from "./p01-basics";
import { PY05_LISTS, PY06_DICTS_SETS, PY07_FUNCTIONS, PY08_PYTHONIC } from "./p02-collections-functions";
import { PY09_ERRORS_FILES, PY10_OOP, PY11_MODULES } from "./p03-errors-oop-modules";
import { PY12_ADVANCED, PY13_PROJECTS, PY14_JOB_READY } from "./p04-advanced-projects";

/** Python from zero to job-ready: one idea per lesson, every example run and its output shown, projects and interview prep. */
export const PYTHON_COURSE: Course = {
  id: "python",
  title: "Python — beginner to job-ready",
  titleHi: "पाइथन — शुरुआत से नौकरी तक",
  short: "Python",
  shortHi: "पाइथन",
  tagline: "Beginner friendly · Projects · Interview prep · Python developer and data jobs",
  subtitle: "Learn Python from zero in plain words: one idea per lesson, every example with its real output, line-by-line comments, dry-run tables, common mistakes, interview questions and a quiz in every lesson, then build projects and prepare for interviews.",
  subtitleHi: "आसान भाषा में शुरुआत से पाइथन सीखें: हर पाठ में एक विचार, हर उदाहरण का असली आउटपुट, हर लाइन पर टिप्पणी, ड्राई-रन टेबल, आम गलतियाँ, इंटरव्यू प्रश्न और क्विज़, फिर प्रोजेक्ट बनाकर इंटरव्यू की तैयारी करें।",
  tutorial: true,
  modules: [PY01_START, PY02_VARIABLES, PY03_OPERATORS_STRINGS, PY04_CONTROL, PY05_LISTS, PY06_DICTS_SETS, PY07_FUNCTIONS, PY08_PYTHONIC, PY09_ERRORS_FILES, PY10_OOP, PY11_MODULES, PY12_ADVANCED, PY13_PROJECTS, PY14_JOB_READY],
  links: [
    { title: "DSA course", titleHi: "डीएसए कोर्स", sub: "Data structures and algorithms with Python code", subHi: "पाइथन कोड के साथ डेटा स्ट्रक्चर और एल्गोरिदम", href: "/study-material/learn/dsa" },
    { title: "JavaScript course", titleHi: "जावास्क्रिप्ट कोर्स", sub: "Add web front ends to your skills", subHi: "वेब फ्रंट-एंड भी सीखें", href: "/study-material/learn/javascript" },
  ],
};
