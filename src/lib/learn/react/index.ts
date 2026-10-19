import type { Course } from "../types";
import { RB01_START, RB02_JS } from "./b01-start";
import { RB03_JSX, RB04_COMPONENTS } from "./b02-jsx-components";
import { RB05_STATE, RB06_HOOKS } from "./b03-state-hooks";
import { RB07_DATA, RB08_ROUTING, RB09_PROJECTS, RB10_JOB_READY } from "./b04-data-projects";

/** React for beginners, job-ready: one idea per lesson, Try it Yourself examples, projects and interview prep. */
export const REACT_COURSE: Course = {
  id: "react",
  title: "React — beginner to job-ready",
  titleHi: "रिएक्ट — शुरुआत से नौकरी तक",
  short: "React",
  shortHi: "रिएक्ट",
  tagline: "Beginner friendly · Projects · Interview prep · Front-end jobs",
  subtitle: "Learn React from zero in plain words: one idea per lesson, Try it Yourself examples, common mistakes, interview questions and a quiz in every lesson, then build 3 portfolio projects (todo app, GitHub finder, shopping cart) and get ready for your first front-end job.",
  subtitleHi: "आसान भाषा में शुरुआत से रिएक्ट सीखें: हर पाठ में एक विचार, स्वयं आज़माएँ उदाहरण, आम गलतियाँ, इंटरव्यू प्रश्न और क्विज़, फिर 3 पोर्टफ़ोलियो प्रोजेक्ट (टूडू ऐप, गिटहब फ़ाइंडर, शॉपिंग कार्ट) बनाकर पहली फ़्रंट-एंड नौकरी की तैयारी करें।",
  tutorial: true,
  modules: [RB01_START, RB02_JS, RB03_JSX, RB04_COMPONENTS, RB05_STATE, RB06_HOOKS, RB07_DATA, RB08_ROUTING, RB09_PROJECTS, RB10_JOB_READY],
  links: [
    { title: "JavaScript course", titleHi: "जावास्क्रिप्ट कोर्स", sub: "Strengthen the language React is built on", subHi: "रिएक्ट की भाषा को मज़बूत करें", href: "/study-material/learn/javascript" },
    { title: "Computer Science course", titleHi: "कंप्यूटर विज्ञान कोर्स", sub: "Programming, data structures, web and more", subHi: "प्रोग्रामिंग, डेटा स्ट्रक्चर, वेब और बहुत कुछ", href: "/study-material/learn/computer-science" },
  ],
};
