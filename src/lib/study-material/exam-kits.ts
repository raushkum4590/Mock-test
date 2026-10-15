/**
 * Exam-wise study kits: the exam pattern, a topic map that points every topic
 * to the exact NCERT chapter PDFs (and other free official material), a study
 * plan and links to the mock tests. Everything links out to the publisher;
 * nothing is copied.
 *
 * The topic map follows the NCERT Class 11–12 Computer Science / Informatics
 * Practices syllabus, which BPSC's +2-level Computer Science paper is based on.
 * BPSC publishes the official syllabus at OFFICIAL_SYLLABUS — always check it.
 */
import { chapterUrl } from "./ncert";
import { chapterTitle } from "./ncert-chapters";
import { NIOS_CS, type Bilingual } from "./resources";
import { SUBJECT_GUIDES } from "./subject-guides";

export type KitRef = { label: string; url: string; kind: "ncert" | "nios" | "web" | "app" };
export type KitTopic = { title: Bilingual; weight?: "high" | "medium"; refs: KitRef[] };
export type KitPart = { id: string; title: Bilingual; questions: number; note?: Bilingual; topics: KitTopic[] };
export type ExamKit = {
  id: string;
  patternId: string;
  /** Exam category (/exams/<slug>) whose page links to this kit. */
  categorySlug: string;
  title: Bilingual;
  subtitle: Bilingual;
  officialSyllabus: string;
  mocksHref: string;
  parts: KitPart[];
  plan: { week: number; focus: Bilingual }[];
  tips: Bilingual[];
};

const OFFICIAL_SYLLABUS = "https://bpsc.bihar.gov.in/syllabus/";

/** "Class 12 CS · Ch 3 Stack" → official chapter PDF. */
const ch = (code: string, n: number): KitRef => {
  const cls = code[0] === "k" ? 11 : 12;
  const book = code.slice(2, 4) === "cs" ? "CS" : "IP";
  return { label: `Class ${cls} ${book} · Ch ${n}: ${chapterTitle(code, n) ?? ""}`.trim(), url: chapterUrl(code, n), kind: "ncert" };
};
const web = (label: string, url: string, kind: KitRef["kind"] = "web"): KitRef => ({ label, url, kind });
const t = (en: string, hi: string, refs: KitRef[], weight?: KitTopic["weight"]): KitTopic => ({ title: { en, hi }, refs, ...(weight ? { weight } : {}) });

const NIOS = web("NIOS Computer Science (330)", NIOS_CS, "nios");
/** Module n of the Computer Science subject guide (notes, hot topics and practice MCQs). */
const guide = (n: number): KitRef => web(`CS guide · Module ${n}: ${SUBJECT_GUIDES.find((g) => g.id === "computer-science")!.modules[n - 1]!.title.en} + MCQs`, `/study-material/subjects/computer-science#m${n}`, "app");
const NPTEL = web("NPTEL free courses", "https://nptel.ac.in/courses");

export const EXAM_KITS: ExamKit[] = [
  {
    id: "bpsc-tre-computer-science",
    patternId: "bpsc-tre",
    categorySlug: "bpsc-tre",
    title: { en: "BPSC TRE 4.0 — Computer Science (PGT, Class 11–12)", hi: "बीपीएससी टीआरई 4.0 — कंप्यूटर विज्ञान (पीजीटी, कक्षा 11–12)" },
    subtitle: {
      en: "Everything for the Computer Science teacher exam in one place: topic-wise NCERT chapters, free official material, an 8-week plan and full mock tests.",
      hi: "कंप्यूटर विज्ञान शिक्षक परीक्षा की पूरी तैयारी एक जगह: विषयवार एनसीईआरटी अध्याय, निःशुल्क आधिकारिक सामग्री, 8 सप्ताह की योजना और पूर्ण मॉक टेस्ट।",
    },
    officialSyllabus: OFFICIAL_SYLLABUS,
    mocksHref: "/exams/bpsc-tre",
    parts: [
      {
        id: "cs",
        title: { en: "Part III — Computer Science", hi: "भाग III — कंप्यूटर विज्ञान" },
        questions: 80,
        note: {
          en: "Decides your merit — set at graduate (B.Tech/BCA) level, well beyond NCERT. DBMS, OS, networks, data structures and C++ OOP carry the most questions.",
          hi: "मेरिट यही तय करता है — स्तर स्नातक (बी.टेक/बीसीए) का, एनसीईआरटी से काफ़ी आगे। डीबीएमएस, ओएस, नेटवर्क, डेटा संरचना और C++ OOP से सबसे अधिक प्रश्न।",
        },
        topics: [
          t("Computer fundamentals: number systems, CPU, memory hierarchy, generations", "कंप्यूटर मूल बातें: संख्या पद्धति, सीपीयू, मेमोरी पदानुक्रम, पीढ़ियाँ", [guide(1), guide(6), ch("kecs1", 1), ch("kecs1", 2)], "medium"),
          t("Digital electronics: Boolean algebra, De Morgan, flip-flops, counters, MUX", "डिजिटल इलेक्ट्रॉनिक्स: बूलियन बीजगणित, डी मॉर्गन, फ़्लिप-फ़्लॉप, काउंटर, MUX", [guide(1)], "medium"),
          t("Operating systems: scheduling, deadlock & Banker's algorithm, paging, page replacement, thrashing", "ऑपरेटिंग सिस्टम: शेड्यूलिंग, डेडलॉक व बैंकर्स एल्गोरिद्म, पेजिंग, पेज रिप्लेसमेंट, थ्रैशिंग", [guide(3), NIOS, NPTEL], "high"),
          t("Programming: OOP in C++ (overriding, virtual functions, abstract classes) & Python", "प्रोग्रामिंग: C++ में OOP (ओवरराइडिंग, वर्चुअल फ़ंक्शन, एब्स्ट्रैक्ट क्लास) एवं पायथन", [guide(9), guide(2), ch("kecs1", 5), ch("kecs1", 7)], "high"),
          t("Data structures & algorithms: arrays, linked lists, stacks, queues, BST, graphs, sorting, complexity", "डेटा संरचना एवं एल्गोरिद्म: ऐरे, लिंक्ड लिस्ट, स्टैक, क्यू, BST, ग्राफ़, सॉर्टिंग, जटिलता", [guide(2), guide(8), ch("lecs1", 3), ch("lecs1", 4), ch("lecs1", 5), ch("lecs1", 6)], "high"),
          t("DBMS: SQL & joins, functional dependencies, normalisation (3NF vs BCNF), ACID, isolation levels, indexing", "डीबीएमएस: SQL व जॉइन, फ़ंक्शनल डिपेंडेंसी, नॉर्मलाइज़ेशन (3NF बनाम BCNF), ACID, आइसोलेशन लेवल, इंडेक्सिंग", [guide(4), ch("lecs1", 8), ch("lecs1", 9)], "high"),
          t("Networking: OSI & TCP/IP, devices, ARP, subnetting, protocols & ports, CSMA/CD, flow control", "नेटवर्किंग: OSI व TCP/IP, उपकरण, ARP, सबनेटिंग, प्रोटोकॉल व पोर्ट, CSMA/CD, फ़्लो कंट्रोल", [guide(5), ch("lecs1", 10), ch("lecs1", 11)], "high"),
          t("Software engineering: SDLC & models (spiral), testing, cyclomatic complexity, cohesion & coupling", "सॉफ़्टवेयर इंजीनियरिंग: SDLC व मॉडल (स्पाइरल), टेस्टिंग, साइक्लोमैटिक जटिलता, कोहेज़न व कपलिंग", [guide(9)], "medium"),
          t("Compilers & theory of computation: phases of a compiler, automata", "कंपाइलर एवं संगणना सिद्धांत: कंपाइलर के चरण, ऑटोमेटा", [guide(7)], "medium"),
          t("Web technology & internet", "वेब प्रौद्योगिकी एवं इंटरनेट", [guide(10), ch("leip1", 5)], "medium"),
          t("Emerging trends & IoT (AI, cloud, blockchain, big data)", "उभरती प्रवृत्तियाँ एवं आईओटी (एआई, क्लाउड, ब्लॉकचेन, बिग डेटा)", [ch("kecs1", 3), ch("keip1", 2)], "medium"),
          t("Cyber security, ethics & IT Act", "साइबर सुरक्षा, नैतिकता एवं आईटी अधिनियम", [ch("lecs1", 12), ch("kecs1", 11)], "medium"),
        ],
      },
      {
        id: "gs",
        title: { en: "Part II — General Studies", hi: "भाग II — सामान्य अध्ययन" },
        questions: 40,
        note: { en: "Counts for merit. Bihar-specific questions and current affairs are common.", hi: "मेरिट में गिना जाता है। बिहार से जुड़े प्रश्न और समसामयिकी आम हैं।" },
        topics: [
          t("Indian history & national movement", "भारतीय इतिहास एवं राष्ट्रीय आंदोलन", [web("NCERT History books", "/study-material/ncert?subject=history", "app")], "high"),
          t("Geography of India & Bihar", "भारत एवं बिहार का भूगोल", [web("NCERT Geography books", "/study-material/ncert?subject=geography", "app")], "medium"),
          t("Polity & Constitution", "राजव्यवस्था एवं संविधान", [web("NCERT Polity books", "/study-material/ncert?subject=polity", "app"), web("Constitution of India (official text)", "https://legislative.gov.in/constitution-of-india/")], "high"),
          t("Economy", "अर्थव्यवस्था", [web("NCERT Economics books", "/study-material/ncert?subject=economics", "app")], "medium"),
          t("General science", "सामान्य विज्ञान", [web("NCERT Science books", "/study-material/ncert?subject=science", "app")], "medium"),
          t("Current affairs (last 12 months)", "समसामयिकी (पिछले 12 महीने)", [web("Current affairs capsule (PDF)", "/study-material/current-affairs/capsule", "app"), web("Daily current affairs", "/study-material/current-affairs", "app")], "high"),
          t("Reasoning & elementary maths", "तर्कशक्ति एवं प्रारंभिक गणित", [web("NCERT Maths books", "/study-material/ncert?subject=maths", "app")], "medium"),
        ],
      },
      {
        id: "lang",
        title: { en: "Part I — Language (qualifying)", hi: "भाग I — भाषा (अर्हक)" },
        questions: 30,
        note: { en: "Qualifying only (30% needed); marks are not added to merit. Grammar and comprehension.", hi: "केवल अर्हक (30% आवश्यक); अंक मेरिट में नहीं जुड़ते। व्याकरण और बोध।" },
        topics: [t("Hindi / English grammar & comprehension", "हिंदी / अंग्रेज़ी व्याकरण एवं अपठित बोध", [web("Practice in the full mock tests", "/exams/bpsc-tre", "app")])],
      },
    ],
    plan: [
      { week: 1, focus: { en: "Computer fundamentals, number systems & digital logic (guide modules 1, 6)", hi: "कंप्यूटर मूल बातें, संख्या पद्धति एवं डिजिटल लॉजिक (गाइड मॉड्यूल 1, 6)" } },
      { week: 2, focus: { en: "Programming: C/C++ OOP and Python output questions (modules 2, 9)", hi: "प्रोग्रामिंग: C/C++ OOP एवं पायथन आउटपुट प्रश्न (मॉड्यूल 2, 9)" } },
      { week: 3, focus: { en: "Data structures & algorithms, complexity (modules 2, 8) · GS: polity", hi: "डेटा संरचना एवं एल्गोरिद्म, जटिलता (मॉड्यूल 2, 8) · सामान्य अध्ययन: राजव्यवस्था" } },
      { week: 4, focus: { en: "Operating systems with numericals (module 3) · GS: history", hi: "ऑपरेटिंग सिस्टम संख्यात्मक सहित (मॉड्यूल 3) · सामान्य अध्ययन: इतिहास" } },
      { week: 5, focus: { en: "DBMS: SQL, normalisation, transactions (module 4) · Mock test 1", hi: "डीबीएमएस: SQL, नॉर्मलाइज़ेशन, ट्रांज़ैक्शन (मॉड्यूल 4) · मॉक टेस्ट 1" } },
      { week: 6, focus: { en: "Networking: models, subnetting, protocols (module 5) · GS: geography, Bihar", hi: "नेटवर्किंग: मॉडल, सबनेटिंग, प्रोटोकॉल (मॉड्यूल 5) · सामान्य अध्ययन: भूगोल, बिहार" } },
      { week: 7, focus: { en: "Software engineering, compilers, web, emerging trends (modules 7, 9, 10) · current affairs capsule", hi: "सॉफ़्टवेयर इंजीनियरिंग, कंपाइलर, वेब, उभरती प्रवृत्तियाँ (मॉड्यूल 7, 9, 10) · समसामयिकी कैप्सूल" } },
      { week: 8, focus: { en: "Full mock tests every other day; redo every wrong quick-check question", hi: "हर दूसरे दिन पूर्ण मॉक टेस्ट; त्वरित अभ्यास के हर गलत प्रश्न को दोबारा हल करें" } },
    ],
    tips: [
      { en: "Negative marking is reported differently (TRE 3.0 had none; some TRE 4.0 reports say −⅓). Check the advertisement — if there is a penalty, skip questions where you cannot eliminate two options.", hi: "ऋणात्मक अंकन की जानकारी अलग-अलग है (टीआरई 3.0 में नहीं था; कुछ टीआरई 4.0 रिपोर्टें −⅓ बताती हैं)। विज्ञापन देखें — दंड हो तो दो विकल्प हटाए बिना प्रश्न न करें।" },
      { en: "Merit is counted on 120 marks (Parts II + III); Part I language only needs the qualifying score.", hi: "मेरिट 120 अंकों (भाग II + III) पर बनती है; भाग I भाषा में केवल अर्हक अंक चाहिए।" },
      { en: "Practise questions daily instead of re-reading notes — every guide module has a quick check.", hi: "नोट्स दोहराने के बजाय रोज़ प्रश्न हल करें — गाइड के हर मॉड्यूल में त्वरित अभ्यास है।" },
      { en: "Python output questions are common: run small snippets yourself instead of only reading.", hi: "पायथन आउटपुट वाले प्रश्न आम हैं: केवल पढ़ें नहीं, छोटे कोड स्वयं चलाकर देखें।" },
      { en: "For SQL, learn the order SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY and aggregate functions.", hi: "SQL में SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY क्रम और एग्रीगेट फ़ंक्शन याद करें।" },
      { en: "Part I is only qualifying — don't over-invest; secure 30% and spend the time on Part III.", hi: "भाग I केवल अर्हक है — 30% सुनिश्चित करें और बाकी समय भाग III को दें।" },
    ],
  },
];

export const findKit = (id: string) => EXAM_KITS.find((k) => k.id === id);
