import type { Course } from "../types";
import { courseLessons, findCourseLesson, lessonSlug } from "../util";
import { M01_DIGITAL } from "./m01-digital";
import { M02_PROGRAMMING } from "./m02-programming";
import { M03_DATA_STRUCTURES } from "./m03-data-structures";
import { M04_ALGORITHMS } from "./m04-algorithms";
import { M05_OS } from "./m05-os";
import { M06_DBMS } from "./m06-dbms";
import { M07_NETWORKS } from "./m07-networks";
import { M08_COA } from "./m08-coa";
import { M09_OOP } from "./m09-oop-cpp";
import { M10_SE } from "./m10-se";
import { M11_TOC } from "./m11-toc-compiler";
import { M12_WEB_TRENDS } from "./m12-web-trends";

/** Computer Science course for BPSC TRE 4.0 (PGT), DSSSB TGT, STET, KVS/NVS and similar papers. */
export const CS_COURSE: Course = {
  id: "computer-science",
  title: "Computer Science — the complete course",
  titleHi: "कंप्यूटर विज्ञान — संपूर्ण कोर्स",
  short: "Computer Science",
  shortHi: "कंप्यूटर विज्ञान",
  tagline: "BPSC TRE 4.0 · STET · DSSSB TGT · KVS/NVS",
  subtitle: "The whole BPSC TRE 4.0 / STET / DSSSB Computer Science syllabus taught in short lessons: one big idea, an everyday picture, solved examples, exam traps, memory tricks and a quick quiz in every lesson.",
  subtitleHi: "बीपीएससी टीआरई 4.0 / एसटीईटी / डीएसएसएसबी कंप्यूटर विज्ञान का पूरा पाठ्यक्रम छोटे पाठों में: हर पाठ में एक मुख्य विचार, आसान उदाहरण, हल किए प्रश्न, परीक्षा के जाल, याद रखने की ट्रिक और त्वरित क्विज़।",
  modules: [
    M01_DIGITAL,
    M02_PROGRAMMING,
    M03_DATA_STRUCTURES,
    M04_ALGORITHMS,
    M05_OS,
    M06_DBMS,
    M07_NETWORKS,
    M08_COA,
    M09_OOP,
    M10_SE,
    M11_TOC,
    M12_WEB_TRENDS,
  ],
  links: [
    { title: "Take a full mock test", titleHi: "पूर्ण मॉक टेस्ट दें", sub: "BPSC TRE 4.0 pattern", subHi: "बीपीएससी टीआरई 4.0 पैटर्न पर", href: "/exams/bpsc-tre" },
    { title: "Syllabus checklist + 65 practice MCQs", titleHi: "पाठ्यक्रम चेकलिस्ट + 65 अभ्यास प्रश्न", sub: "For revision (PDF)", subHi: "दोहराने के लिए (पीडीएफ़)", href: "/study-material/subjects/computer-science" },
    { title: "BPSC TRE 4.0 exam kit", titleHi: "बीपीएससी टीआरई 4.0 परीक्षा किट", sub: "Pattern, GS, 8-week plan", subHi: "पैटर्न, सामान्य अध्ययन, 8 सप्ताह की योजना", href: "/study-material/exams/bpsc-tre-computer-science" },
  ],
};

export { lessonSlug };
export type { LessonRef } from "../util";

/** Every Computer Science lesson in course order. */
export const CS_LESSONS = courseLessons(CS_COURSE);

export const findLesson = (slug: string) => findCourseLesson(CS_COURSE, slug);
