import type { Course } from "../types";
import { JB01_START, JB02_STRINGS_NUMBERS, JB03_CONTROL } from "./b01-basics";
import { JB04_FUNCTIONS, JB05_ARRAYS_OBJECTS, JB06_DOM } from "./b02-functions-dom";
import { JB07_ASYNC, JB08_MODERN, JB09_PROJECTS, JB10_JOB_READY } from "./b03-async-projects";

/** JavaScript for beginners, job-ready: one idea per lesson, Try it Yourself examples, projects and interview prep. */
export const JAVASCRIPT_COURSE: Course = {
  id: "javascript",
  title: "JavaScript — beginner to job-ready",
  titleHi: "जावास्क्रिप्ट — शुरुआत से नौकरी तक",
  short: "JavaScript",
  shortHi: "जावास्क्रिप्ट",
  tagline: "Beginner friendly · Projects · Interview prep · Web developer jobs",
  subtitle: "Learn JavaScript from zero in plain words: one idea per lesson, Try it Yourself examples, common mistakes, interview questions and a quiz in every lesson, then build 3 portfolio projects (todo list, quiz app, GitHub finder) and prepare for interviews.",
  subtitleHi: "आसान भाषा में शुरुआत से जावास्क्रिप्ट सीखें: हर पाठ में एक विचार, स्वयं आज़माएँ उदाहरण, आम गलतियाँ, इंटरव्यू प्रश्न और क्विज़, फिर 3 पोर्टफ़ोलियो प्रोजेक्ट (टूडू लिस्ट, क्विज़ ऐप, गिटहब फ़ाइंडर) बनाकर इंटरव्यू की तैयारी करें।",
  tutorial: true,
  modules: [JB01_START, JB02_STRINGS_NUMBERS, JB03_CONTROL, JB04_FUNCTIONS, JB05_ARRAYS_OBJECTS, JB06_DOM, JB07_ASYNC, JB08_MODERN, JB09_PROJECTS, JB10_JOB_READY],
  links: [
    { title: "React course", titleHi: "रिएक्ट कोर्स", sub: "Next step: build apps with React", subHi: "अगला कदम: रिएक्ट से ऐप बनाएँ", href: "/study-material/learn/react" },
    { title: "Computer Science course", titleHi: "कंप्यूटर विज्ञान कोर्स", sub: "Programming, data structures, web and more", subHi: "प्रोग्रामिंग, डेटा स्ट्रक्चर, वेब और बहुत कुछ", href: "/study-material/learn/computer-science" },
  ],
};
