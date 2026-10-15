/**
 * Subject guides ("master syllabus" booklets): numbered modules with the
 * topics exams ask, a tip on how they are asked, and links to the exact free
 * official material — NCERT chapter PDFs (English and Hindi medium), NIOS,
 * NPTEL and government sites. Nothing is copied; everything links out.
 *
 * The Computer Science outline is a master syllabus covering BPSC TRE, DSSSB TGT,
 * KVS/NVS, UGC NET and technical posts; not every topic appears in every exam,
 * so each guide links the official syllabus to confirm against.
 */
import { chapterUrl, NCERT_BOOKS } from "./ncert";
import { chapterTitle, NCERT_CHAPTERS } from "./ncert-chapters";
import { shuffleOptions } from "@/lib/learn/shuffle";
import { CS_PRACTICE, type GuideMcq } from "./cs-practice";
import { REASONING_PRACTICE } from "./reasoning-practice";
import { NIOS_CS, type Bilingual } from "./resources";

export type GuideRef = {
  kind: "ncert" | "nios" | "web" | "app";
  label: Bilingual;
  url: string;
  /** Hindi-medium PDF of the same NCERT chapter, when NCERT publishes one. */
  hiUrl?: string;
};
export type GuideModule = {
  title: Bilingual;
  topics: string[];
  tip: Bilingual;
  refs: GuideRef[];
  /** Concepts asked again and again in recent papers. */
  hot?: string[];
  /** Practice questions with explanations. */
  mcqs?: GuideMcq[];
};
export type SubjectGuide = {
  id: string;
  title: Bilingual;
  subtitle: Bilingual;
  /** Exams that test this subject heavily. */
  exams: string;
  modules: GuideModule[];
  official?: { label: string; url: string }[];
  practice: { label: Bilingual; href: string }[];
  /** "How to use this for each exam" table. */
  examFocus?: { exam: string; focus: Bilingual }[];
  /** Daily routine blocks. */
  routine?: { minutes: number; what: Bilingual; how: Bilingual }[];
  note?: Bilingual;
};

const b = (en: string, hi: string): Bilingual => ({ en, hi });

/** An NCERT chapter by catalogue book id ("10-hist") and chapter number. */
function nc(bookId: string, n: number): GuideRef {
  const book = NCERT_BOOKS.find((x) => x.id === bookId);
  if (!book) throw new Error(`Unknown NCERT book ${bookId}`);
  const main = book.en ?? book.hi!;
  if (n < 1 || n > main.chapters) throw new Error(`${bookId} has no chapter ${n}`);
  const titles = NCERT_CHAPTERS[bookId]?.[n - 1];
  const enTitle = titles?.[0] ?? `Chapter ${n}`;
  // Hindi PDF only when the Hindi edition has the same chapters (chapterTitle checks the counts).
  const hiSame = book.hi && book.en ? chapterTitle(book.hi.code, n) : null;
  const hiTitle = hiSame ?? titles?.[1] ?? `अध्याय ${n}`;
  return {
    kind: "ncert",
    label: b(`Class ${book.cls} · ${enTitle}`, `कक्षा ${book.cls} · ${hiTitle}`),
    url: chapterUrl(main.code, n),
    ...(hiSame ? { hiUrl: chapterUrl(book.hi!.code, n) } : {}),
  };
}
const many = (bookId: string, ...chapters: number[]) => chapters.map((n) => nc(bookId, n));
const web = (en: string, hi: string, url: string, kind: GuideRef["kind"] = "web"): GuideRef => ({ kind, label: b(en, hi), url });
const nios = (en: string, hi: string, url: string) => web(en, hi, url, "nios");
const app = (en: string, hi: string, href: string) => web(en, hi, href, "app");
const mod = (title: Bilingual, topics: string[], tip: Bilingual, refs: GuideRef[]): GuideModule => ({ title, topics, tip, refs });

const NPTEL = web("NPTEL – free IIT/IISc courses", "एनपीटीईएल – निःशुल्क आईआईटी पाठ्यक्रम", "https://nptel.ac.in/courses");
const NIOS_CS_REF = nios("NIOS Computer Science (330)", "एनआईओएस कंप्यूटर विज्ञान (330)", NIOS_CS);
const NIOS_SR = "https://www.nios.ac.in/online-course-material/sr-secondary-courses/";
const CA = app("Current affairs capsule", "समसामयिकी कैप्सूल", "/study-material/current-affairs/capsule");
const MOCKS = app("Free mock tests", "निःशुल्क मॉक टेस्ट", "/tests?access=free");
const QUANT = app("Quantitative aptitude guide", "मात्रात्मक योग्यता गाइड", "/study-material/subjects/maths");

export const SUBJECT_GUIDES: SubjectGuide[] = [
  // ======================================================================== Computer Science
  {
    id: "computer-science",
    title: b("Computer Science — master course", "कंप्यूटर विज्ञान — मास्टर कोर्स"),
    subtitle: b(
      "One course for BPSC TRE 4.0, DSSSB TGT, KVS/NVS, UGC NET and technical posts: study each topic once, then add your exam's general sections.",
      "बीपीएससी टीआरई 4.0, डीएसएसएसबी टीजीटी, केवीएस/एनवीएस, यूजीसी नेट और तकनीकी पदों के लिए एक कोर्स: हर विषय एक बार पढ़ें, फिर अपनी परीक्षा के सामान्य खंड जोड़ें।",
    ),
    exams: "BPSC TRE · DSSSB TGT/PGT · KVS · NVS · UGC NET · SSC IMD · NIC",
    official: [
      { label: "BPSC – official syllabus page", url: "https://bpsc.bihar.gov.in/syllabus/" },
      { label: "DSSSB TGT Computer Science – Directorate of Education (PDF)", url: "https://dsssb.delhi.gov.in/sites/default/files/DSSSB/universal-tab/pc_56-24.pdf" },
      { label: "DSSSB TGT Computer Science – NDMC (PDF)", url: "https://dsssb.delhi.gov.in/sites/default/files/DSSSB/universal-tab/tgt_computer_science_in_ndmc.pdf" },
    ],
    examFocus: [
      { exam: "BPSC TRE 4.0 Computer Science", focus: b("Technical CS + prescribed language and general studies sections", "तकनीकी सीएस + निर्धारित भाषा व सामान्य अध्ययन खंड") },
      { exam: "DSSSB TGT Computer Science", focus: b("Technical syllabus + the prescribed general section", "तकनीकी पाठ्यक्रम + निर्धारित सामान्य खंड") },
      { exam: "KVS / NVS teaching", focus: b("Technical CS + the relevant teaching and general sections", "तकनीकी सीएस + संबंधित शिक्षण व सामान्य खंड") },
      { exam: "UGC NET Computer Science", focus: b("Deeper theory, algorithms, mathematics and research aptitude — check eligibility", "गहन सिद्धांत, एल्गोरिद्म, गणित और शोध अभिवृत्ति — पात्रता जाँचें") },
      { exam: "NIC / technical recruitments", focus: b("Core CS: algorithms, OS, DBMS, networks + the post's own syllabus", "मूल सीएस: एल्गोरिद्म, ओएस, डीबीएमएस, नेटवर्क + पद का अपना पाठ्यक्रम") },
    ],
    routine: [
      { minutes: 90, what: b("Learn one technical topic", "एक तकनीकी विषय सीखें"), how: b("Understand concepts, formulas, diagrams and examples.", "अवधारणाएँ, सूत्र, आरेख और उदाहरण समझें।") },
      { minutes: 45, what: b("Solve MCQs & previous-year questions", "एमसीक्यू एवं पिछले वर्षों के प्रश्न हल करें"), how: b("Practise questions from teaching and technical exams.", "शिक्षण और तकनीकी परीक्षाओं के प्रश्नों का अभ्यास करें।") },
      { minutes: 30, what: b("Revise and record mistakes", "दोहराएँ और गलतियाँ लिखें"), how: b("Keep short notes, formulas and a wrong-answer notebook.", "छोटे नोट्स, सूत्र और गलत-उत्तर नोटबुक रखें।") },
      { minutes: 15, what: b("Teaching / general section", "शिक्षण / सामान्य खंड"), how: b("Rotate through the extra sections your target exams require.", "अपनी परीक्षाओं के अतिरिक्त खंड बारी-बारी से पढ़ें।") },
    ],
    note: b(
      "This is a master topic framework, not a claim that every topic appears in every exam. Check eligibility for each teaching post — a B.Tech in CSE or an STET does not by itself make you eligible for every DSSSB TGT post; teaching qualifications and degree combinations matter.",
      "यह एक मास्टर विषय ढाँचा है, यह दावा नहीं कि हर विषय हर परीक्षा में आता है। हर शिक्षक पद की पात्रता जाँचें — केवल बी.टेक (सीएसई) या एसटीईटी से हर डीएसएसएसबी टीजीटी पद की पात्रता नहीं बनती; शिक्षण योग्यता और डिग्री संयोजन मायने रखते हैं।",
    ),
    practice: [
      { label: b("BPSC TRE 4.0 CS mock tests", "बीपीएससी टीआरई 4.0 सीएस मॉक टेस्ट"), href: "/exams/bpsc-tre" },
      { label: b("DSSSB TGT CS mock tests", "डीएसएसएसबी टीजीटी सीएस मॉक टेस्ट"), href: "/exams/dsssb" },
      { label: b("SSC IMD Computer Science mocks", "एसएससी आईएमडी कंप्यूटर विज्ञान मॉक"), href: "/exams/ssc-imd-sa" },
      { label: b("BPSC TRE 4.0 CS exam kit", "बीपीएससी टीआरई 4.0 सीएस परीक्षा किट"), href: "/study-material/exams/bpsc-tre-computer-science" },
    ],
    modules: [
      mod(
        b("Computer fundamentals & digital logic", "कंप्यूटर मूल बातें एवं डिजिटल लॉजिक"),
        ["Number systems: binary, octal, decimal, hexadecimal", "Binary arithmetic, 1's/2's complement, codes (BCD, Gray, ASCII, Unicode)", "Boolean algebra, logic gates, truth tables", "K-map and Boolean simplification", "Combinational & sequential circuits", "Flip-flops (SR, JK, D, T), registers, counters, multiplexers"],
        b("Asked as quick calculations: convert numbers, find a 2's complement, give a gate's output. NAND/NOR are universal gates.", "त्वरित गणना के रूप में: संख्या बदलें, 2's कॉम्प्लिमेंट, गेट का आउटपुट। NAND/NOR सार्वभौमिक गेट हैं।"),
        [...many("11-cs", 1, 2), nc("11-ip", 1), NIOS_CS_REF, NPTEL],
      ),
      mod(
        b("Programming & data structures", "प्रोग्रामिंग एवं डेटा संरचना"),
        ["Algorithms, flowcharts, pseudocode", "Python: data types, control flow, functions, strings, lists, tuples, dictionaries", "C: operators, loops, functions, pointers, recursion, arrays, structures, file handling", "Exception & file handling", "Stack, queue, linked list, hashing", "Trees, BST, heaps, graphs; BFS & DFS", "C++/Java OOP basics", "Output prediction & debugging MCQs"],
        b("The biggest scorer. Expect “What is the output?” snippets — run small programs yourself instead of only reading.", "सबसे अधिक अंक वाला भाग। “आउटपुट क्या होगा?” वाले प्रश्न — केवल पढ़ें नहीं, छोटे प्रोग्राम स्वयं चलाएँ।"),
        [...many("11-cs", 4, 5, 6, 7, 8, 9, 10), ...many("12-cs", 1, 2, 3, 4), web("Official Python tutorial", "आधिकारिक पायथन ट्यूटोरियल", "https://docs.python.org/3/tutorial/"), NIOS_CS_REF],
      ),
      mod(
        b("Operating systems", "ऑपरेटिंग सिस्टम"),
        ["Processes & threads", "CPU scheduling (FCFS, SJF, Round Robin, priority)", "Synchronisation, semaphores, critical section", "Deadlocks: conditions, prevention, banker's algorithm", "Paging, segmentation, virtual memory", "Page replacement (FIFO, LRU, Optimal)", "Thrashing; internal vs external fragmentation, compaction", "File systems & disk scheduling", "Linux basics & commands"],
        b("Numericals are common: average waiting time for a schedule, number of page faults for FIFO/LRU.", "संख्यात्मक प्रश्न आम हैं: शेड्यूल का औसत प्रतीक्षा समय, FIFO/LRU में पेज फ़ॉल्ट।"),
        [NIOS_CS_REF, NPTEL],
      ),
      mod(
        b("DBMS & SQL", "डीबीएमएस एवं SQL"),
        ["ER diagrams & relational model", "Keys, constraints, relational algebra", "SQL: SELECT, inner & outer joins, GROUP BY/HAVING, subqueries, aggregate functions", "Functional dependencies, Armstrong's axioms & normalisation (1NF–BCNF, 3NF vs BCNF)", "Transactions, ACID, concurrency control, isolation levels (read uncommitted → serializable)", "Indexing, B-trees and B+ trees"],
        b("Learn the clause order SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY; normal-form and key questions repeat every year.", "क्लॉज़ क्रम SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY याद करें; नॉर्मल फ़ॉर्म और की वाले प्रश्न हर वर्ष आते हैं।"),
        [...many("12-cs", 7, 8, 9), ...many("11-ip", 7, 8), nc("12-ip", 1), NPTEL],
      ),
      mod(
        b("Computer networks & security", "कंप्यूटर नेटवर्क एवं सुरक्षा"),
        ["OSI and TCP/IP models", "Ethernet, LAN/MAN/WAN, network devices", "IPv4/IPv6, IP classes, subnetting, routing", "TCP, UDP, DNS, HTTP, FTP, SMTP, DHCP and port numbers", "ARP/RARP, ICMP; switching, sliding-window flow control, error & congestion control", "Medium access: CSMA/CD (Ethernet) vs CSMA/CA (Wi-Fi)", "Cryptography, authentication, digital signatures, firewalls"],
        b("Match the layer ↔ protocol ↔ device; memorise common port numbers (HTTP 80, HTTPS 443, FTP 21, SMTP 25, DNS 53).", "लेयर ↔ प्रोटोकॉल ↔ डिवाइस मिलाएँ; सामान्य पोर्ट नंबर याद करें (HTTP 80, HTTPS 443, FTP 21, SMTP 25, DNS 53)।"),
        [...many("12-cs", 10, 11, 12), nc("12-ip", 5), NPTEL],
      ),
      mod(
        b("Computer organisation & architecture", "कंप्यूटर संगठन एवं आर्किटेक्चर"),
        ["CPU, ALU, control unit", "Instruction formats & addressing modes", "Registers, buses, instruction cycle", "Pipelining & hazards", "Cache, RAM, ROM, memory hierarchy", "Interrupts, DMA, I/O organisation"],
        b("Expect addressing-mode identification and cache numericals (hit ratio, average access time).", "एड्रेसिंग मोड पहचान और कैश संख्यात्मक (हिट अनुपात, औसत एक्सेस समय) अपेक्षित।"),
        [nc("11-cs", 1), NIOS_CS_REF, NPTEL],
      ),
      mod(
        b("Theory of computation & compiler design", "संगणना सिद्धांत एवं कंपाइलर डिज़ाइन"),
        ["Sets, relations, functions, formal languages", "Regular expressions & finite automata (DFA, NFA)", "Context-free grammars & pushdown automata", "Turing machines & decidability", "Phases of a compiler; lexical analysis, parsing, syntax trees", "Intermediate code & runtime environments"],
        b("Mostly for UGC NET / PGT-level papers: minimum DFA states and “which language is regular?” questions.", "मुख्यतः यूजीसी नेट / पीजीटी स्तर: न्यूनतम DFA अवस्थाएँ और “कौन-सी भाषा रेगुलर है?” प्रश्न।"),
        [NPTEL],
      ),
      mod(
        b("Algorithms", "एल्गोरिद्म"),
        ["Time & space complexity; Big-O, Ω, Θ", "Linear & binary search", "Sorting algorithms and their complexity", "Recursion, divide and conquer", "Greedy algorithms & dynamic programming", "BFS, DFS, shortest paths (Dijkstra vs Bellman-Ford), minimum spanning trees (Kruskal, Prim)"],
        b("Keep one table of best/average/worst complexity for every sort and search — it answers many questions.", "हर सॉर्ट और सर्च की सर्वश्रेष्ठ/औसत/सबसे खराब जटिलता की एक तालिका बनाएँ — कई प्रश्न इसी से हल होते हैं।"),
        [...many("12-cs", 5, 6), NPTEL],
      ),
      mod(
        b("Software engineering & OOP (C++)", "सॉफ़्टवेयर इंजीनियरिंग एवं OOP (C++)"),
        [
          "Encapsulation, inheritance, polymorphism, abstraction",
          "C++: overloading vs overriding, virtual functions, abstract classes, virtual destructors, constructors",
          "UML & object-oriented design",
          "SDLC, waterfall, spiral, Agile",
          "Requirements, testing (black/white box), debugging, maintenance",
          "Metrics: cyclomatic complexity, cohesion & coupling, COCOMO",
        ],
        b("Definitions and “which model suits…” questions; know each testing type and SDLC model by its key feature.", "परिभाषाएँ और “कौन-सा मॉडल उपयुक्त…” प्रश्न; हर टेस्टिंग प्रकार और SDLC मॉडल की मुख्य विशेषता जानें।"),
        [NIOS_CS_REF, NPTEL],
      ),
      mod(
        b("Web technology & internet", "वेब प्रौद्योगिकी एवं इंटरनेट"),
        ["HTML, CSS, JavaScript, DOM", "Client–server architecture, web servers", "XML, DTD, parsers", "HTTP, browsers, internet services", "Website design, publishing, basic web security", "E-commerce & mobile computing"],
        b("Tag/attribute and HTTP status-code questions (200, 301, 404, 500) are easy marks.", "टैग/एट्रिब्यूट और HTTP स्टेटस कोड (200, 301, 404, 500) वाले प्रश्न आसान अंक हैं।"),
        [nc("12-ip", 5), web("MDN – Learn web development", "MDN – वेब डेवलपमेंट सीखें", "https://developer.mozilla.org/en-US/docs/Learn"), web("W3C web standards", "W3C वेब मानक", "https://www.w3.org/standards/")],
      ),
      mod(
        b("Discrete mathematics, statistics & numerical methods", "विविक्त गणित, सांख्यिकी एवं संख्यात्मक विधियाँ"),
        ["Logic, sets, relations, functions, counting", "Permutations, combinations, probability", "Graph theory & trees", "Descriptive statistics & distributions", "Matrices, numerical errors, interpolation", "Numerical methods & basic calculus"],
        b("Probability and counting questions are short — practise formulas until they are automatic.", "प्रायिकता और गणना के प्रश्न छोटे होते हैं — सूत्रों का अभ्यास करें।"),
        [...many("10-math", 13, 14), ...many("11-eco-2", 5, 6), nios("NIOS Mathematics (311)", "एनआईओएस गणित (311)", `${NIOS_SR}Mathematics-(311).aspx`), NPTEL],
      ),
      mod(
        b("Teaching & general sections", "शिक्षण एवं सामान्य खंड"),
        ["Teaching aptitude & pedagogy; child development where prescribed", "Classroom management & assessment", "Hindi and English", "General awareness, reasoning, quantitative aptitude", "ICT & educational technology"],
        b("These sections decide selection in close contests — give them 15 minutes every day.", "कड़ी प्रतिस्पर्धा में यही खंड चयन तय करते हैं — रोज़ 15 मिनट दें।"),
        [app("History, Geography & other subject guides", "इतिहास, भूगोल व अन्य विषय गाइड", "/study-material/subjects"), CA, app("NCERT books", "एनसीईआरटी पुस्तकें", "/study-material/ncert")],
      ),
    ],
  },

  // ======================================================================== History
  {
    id: "history",
    title: b("History — ancient to modern", "इतिहास — प्राचीन से आधुनिक"),
    subtitle: b("Chronological modules with the exact NCERT chapters (old and new books) for each period.", "कालक्रम से मॉड्यूल, हर काल के लिए सटीक एनसीईआरटी अध्याय (पुरानी और नई पुस्तकें)।"),
    exams: "UPSC · State PSC · SSC · Railway · TET/TRE · Police",
    practice: [{ label: b("Free mock tests", "निःशुल्क मॉक टेस्ट"), href: "/tests?access=free" }],
    modules: [
      mod(b("Prehistory & Harappan civilisation", "प्रागैतिहास एवं हड़प्पा सभ्यता"), ["Stone ages, sources of history", "Harappan cities, town planning, sites and rivers", "Trade, crafts, decline"], b("Site ↔ river ↔ present state matching (e.g. Lothal–Bhogava–Gujarat) is a favourite.", "स्थल ↔ नदी ↔ वर्तमान राज्य मिलान (जैसे लोथल–भोगवा–गुजरात) प्रिय प्रश्न है।"), [nc("6-ss", 4), nc("6-ss", 6), nc("12-hist-1", 1), nios("NIOS History (315)", "एनआईओएस इतिहास (315)", `${NIOS_SR}History-(315).aspx`)]),
      mod(b("Vedic age, Mahajanapadas & Mauryas", "वैदिक काल, महाजनपद एवं मौर्य"), ["Vedic literature & society", "16 Mahajanapadas, rise of Magadha", "Buddhism & Jainism", "Mauryan empire, Ashoka's dhamma & edicts"], b("Asked as: capital of a Mahajanapada, Buddhist councils (place–king), Ashokan edicts.", "पूछा जाता है: महाजनपद की राजधानी, बौद्ध संगीतियाँ (स्थान–राजा), अशोक के अभिलेख।"), [...many("7-ss-1", 4, 5), ...many("12-hist-1", 2, 3)]),
      mod(b("Post-Mauryan, Guptas & Sangam age", "मौर्योत्तर, गुप्त एवं संगम काल"), ["Kushanas, Satavahanas, Sangam kingdoms", "Gupta administration, art, science", "Literature & travellers (Fa-Hien)"], b("Who wrote what (Kalidasa, Aryabhata, Varahamihira) and which dynasty built what.", "किसने क्या लिखा (कालिदास, आर्यभट, वराहमिहिर) और किस वंश ने क्या बनवाया।"), [...many("7-ss-1", 6, 7), nc("12-hist-1", 4)]),
      mod(b("Early medieval India & Delhi Sultanate", "पूर्व-मध्यकालीन भारत एवं दिल्ली सल्तनत"), ["Rajputs, Palas, Pratiharas, Rashtrakutas, Cholas", "Delhi Sultanate dynasties and reforms", "Administration & economy"], b("Ruler ↔ reform (e.g. Alauddin's market control) and dynasty order are asked often.", "शासक ↔ सुधार (जैसे अलाउद्दीन का बाज़ार नियंत्रण) और वंश क्रम अक्सर पूछे जाते हैं।"), [...many("7-ss-2", 3, 4), ...many("7-hist-old", 2, 3)]),
      mod(b("Mughals, Vijayanagara, Marathas & regional states", "मुग़ल, विजयनगर, मराठा एवं क्षेत्रीय राज्य"), ["Mughal rulers, mansabdari, revenue", "Vijayanagara & Bahmani", "Rise of the Marathas", "18th-century regional powers"], b("Battles (year–between whom) and administrative terms (mansab, jagir, chauth) are classic questions.", "युद्ध (वर्ष–किनके बीच) और प्रशासनिक शब्द (मनसब, जागीर, चौथ) क्लासिक प्रश्न हैं।"), [nc("7-hist-old", 4), ...many("12-hist-2", 3, 4), ...many("8-ss-1", 2, 3), nc("7-hist-old", 8)]),
      mod(b("Bhakti–Sufi movements & medieval culture", "भक्ति–सूफ़ी आंदोलन एवं मध्यकालीन संस्कृति"), ["Bhakti saints & their regions", "Sufi silsilas", "Regional cultures, architecture"], b("Saint ↔ region ↔ language matching.", "संत ↔ क्षेत्र ↔ भाषा मिलान।"), [nc("12-hist-2", 2), ...many("7-hist-old", 6, 7), nc("8-ss-2", 8)]),
      mod(b("Company rule & the Revolt of 1857", "कंपनी शासन एवं 1857 का विद्रोह"), ["Battles of Plassey & Buxar", "Revenue systems (Permanent, Ryotwari, Mahalwari)", "Tribal & peasant revolts", "1857: centres, leaders, causes"], b("Revolt centre ↔ leader ↔ British officer who suppressed it.", "विद्रोह केंद्र ↔ नेता ↔ दमन करने वाला ब्रिटिश अधिकारी।"), [...many("8-hist-old", 2, 3, 4, 5), nc("8-ss-1", 4), ...many("12-hist-3", 1, 2)]),
      mod(b("Reform movements & the national movement", "सुधार आंदोलन एवं राष्ट्रीय आंदोलन"), ["Social & religious reformers", "INC, moderates & extremists", "Gandhian movements (Champaran → Quit India)", "Revolutionaries, partition & independence"], b("Chronology (put events in order) and “who founded…” are the most common forms.", "कालक्रम (घटनाओं का क्रम) और “किसने स्थापना की…” सबसे आम रूप हैं।"), [...many("8-hist-old", 6, 7, 8), nc("10-hist", 2), nc("12-hist-3", 3), nc("8-ss-2", 2)]),
      mod(b("Making of the Constitution & India after 1947", "संविधान निर्माण एवं 1947 के बाद का भारत"), ["Constituent Assembly & committees", "Integration of states", "Nation building"], b("Committee ↔ chairman and key dates (26 Nov 1949, 26 Jan 1950).", "समिति ↔ अध्यक्ष और प्रमुख तिथियाँ (26 नवंबर 1949, 26 जनवरी 1950)।"), [nc("12-hist-3", 4), nc("12-pol-1", 1)]),
      mod(b("World history", "विश्व इतिहास"), ["Nationalism in Europe", "Industrial revolution & global economy", "Print culture", "Early societies & empires"], b("UPSC/State PSC ask causes & outcomes; SSC asks “which revolution/when”.", "यूपीएससी/राज्य पीएससी कारण व परिणाम पूछते हैं; एसएससी “कौन-सी क्रांति/कब”।"), [...many("10-hist", 1, 3, 4, 5), ...many("11-hist", 1, 2, 7)]),
      mod(b("Art & culture", "कला एवं संस्कृति"), ["Temple & Indo-Islamic architecture", "Dance, music, painting", "Religions, festivals, heritage sites"], b("Monument ↔ builder ↔ city, dance ↔ state, UNESCO sites.", "स्मारक ↔ निर्माता ↔ शहर, नृत्य ↔ राज्य, यूनेस्को स्थल।"), [nc("12-hist-1", 4), nc("8-ss-2", 3), nc("7-ss-2", 5), nios("NIOS Indian Culture & Heritage (223)", "एनआईओएस भारतीय संस्कृति एवं विरासत (223)", "https://www.nios.ac.in/online-course-material/secondary-courses/indian-culture-and-heritage-(223)-syllabus.aspx"), web("UNESCO World Heritage sites in India", "भारत में यूनेस्को विश्व धरोहर स्थल", "https://whc.unesco.org/en/statesparties/in")]),
    ],
  },

  // ======================================================================== Geography
  {
    id: "geography",
    title: b("Geography — physical, Indian & world", "भूगोल — भौतिक, भारत एवं विश्व"),
    subtitle: b("From the Earth's interior to India's resources, with maps and environment.", "पृथ्वी की आंतरिक संरचना से भारत के संसाधनों तक, मानचित्र एवं पर्यावरण सहित।"),
    exams: "UPSC · State PSC · SSC · Railway · Defence · TET/TRE",
    practice: [{ label: b("Free mock tests", "निःशुल्क मॉक टेस्ट"), href: "/tests?access=free" }],
    modules: [
      mod(b("The Earth & the universe", "पृथ्वी एवं ब्रह्मांड"), ["Solar system, latitudes & longitudes", "Origin & interior of the Earth", "Continents & oceans, plate tectonics"], b("Layers of the Earth and their depths/compositions are frequent one-liners.", "पृथ्वी की परतें और उनकी गहराई/संरचना अक्सर पूछी जाती हैं।"), [...many("6-ss", 1, 2), ...many("11-geo-1", 2, 3, 4)]),
      mod(b("Landforms & geomorphology", "स्थलरूप एवं भू-आकृति विज्ञान"), ["Weathering, erosion, deposition", "Mountains, plateaus, plains", "Rivers, glaciers, wind & coastal landforms"], b("Landform ↔ agent (e.g. delta–river, moraine–glacier).", "स्थलरूप ↔ कारक (जैसे डेल्टा–नदी, हिमोढ़–हिमनद)।"), [nc("6-ss", 3), ...many("11-geo-1", 5, 6), ...many("7-geo-old", 2, 3)]),
      mod(b("Atmosphere & climate", "वायुमंडल एवं जलवायु"), ["Layers & composition of the atmosphere", "Insolation, pressure belts, winds", "Humidity, clouds, precipitation", "World climates & climate change"], b("Layer ↔ feature (ozone in stratosphere), local winds ↔ region.", "परत ↔ विशेषता (ओज़ोन समताप मंडल में), स्थानीय पवनें ↔ क्षेत्र।"), [...many("11-geo-1", 7, 8, 9, 10, 11), nc("7-ss-1", 2), nc("7-geo-old", 4)]),
      mod(b("Oceans", "महासागर"), ["Ocean relief, temperature, salinity", "Currents, tides, waves"], b("Warm vs cold currents and where they flow.", "गर्म बनाम ठंडी धाराएँ और उनका प्रवाह क्षेत्र।"), [...many("11-geo-1", 12, 13), nc("7-geo-old", 5)]),
      mod(b("India — location & physiography", "भारत — स्थिति एवं भू-आकृति"), ["Location, neighbours, states", "Himalaya, plains, plateau, coasts, islands", "Drainage: Himalayan & peninsular rivers"], b("River ↔ origin ↔ tributaries and passes ↔ states are asked every year.", "नदी ↔ उद्गम ↔ सहायक नदियाँ और दर्रे ↔ राज्य हर वर्ष पूछे जाते हैं।"), [...many("11-geo-2", 1, 2, 3), nc("7-ss-1", 1), nc("7-ss-2", 2)]),
      mod(b("India — climate, soils & vegetation", "भारत — जलवायु, मृदा एवं वनस्पति"), ["Monsoon mechanism & seasons", "Soil types & their regions", "Natural vegetation & wildlife"], b("Soil ↔ crop ↔ region and forest type ↔ rainfall.", "मृदा ↔ फसल ↔ क्षेत्र और वन प्रकार ↔ वर्षा।"), [...many("11-geo-2", 4, 5), nc("7-ss-1", 3), nc("8-geo-old", 2)]),
      mod(b("Resources, agriculture, minerals & industry", "संसाधन, कृषि, खनिज एवं उद्योग"), ["Land & water resources", "Crops, seasons, revolutions in agriculture", "Minerals & energy", "Industries & their locations"], b("Largest producer state of a crop/mineral is a top question.", "किसी फसल/खनिज का सबसे बड़ा उत्पादक राज्य शीर्ष प्रश्न है।"), [...many("10-geo", 1, 2, 3, 4, 5, 6), ...many("12-geo-2", 3, 4, 5), ...many("8-geo-old", 3, 4)]),
      mod(b("Population & settlements", "जनसंख्या एवं बस्तियाँ"), ["Census facts: density, sex ratio, literacy", "Migration & urbanisation", "Human settlements"], b("Census ranking questions (highest/lowest state) — use the official Census site.", "जनगणना रैंकिंग प्रश्न (सबसे अधिक/कम राज्य) — आधिकारिक जनगणना साइट देखें।"), [...many("12-geo-1", 2, 3), ...many("12-geo-2", 1, 2), ...many("8-ss-2", 6, 7), web("Census of India", "भारत की जनगणना", "https://censusindia.gov.in/")]),
      mod(b("Economic activities, transport & trade", "आर्थिक क्रियाएँ, परिवहन एवं व्यापार"), ["Primary to quaternary activities", "Roads, railways, ports, airports", "International trade"], b("Longest/first transport facts and major ports ↔ states.", "सबसे लंबा/पहला परिवहन तथ्य और प्रमुख बंदरगाह ↔ राज्य।"), [...many("12-geo-1", 4, 5, 6, 7, 8), ...many("12-geo-2", 7, 8), nc("10-geo", 7)]),
      mod(b("World geography & maps", "विश्व भूगोल एवं मानचित्र"), ["Continents, major regions", "Deserts, grasslands, major rivers", "Map-based location questions"], b("Keep a blank map and mark straits, deserts and rivers as you read.", "एक खाली मानचित्र रखें और पढ़ते समय जलडमरूमध्य, मरुस्थल और नदियाँ अंकित करें।"), [nc("8-ss-2", 1), ...many("7-geo-old", 6, 7), web("ISRO Bhuvan (maps)", "इसरो भुवन (मानचित्र)", "https://bhuvan.nrsc.gov.in/"), web("Survey of India", "भारतीय सर्वेक्षण विभाग", "https://surveyofindia.gov.in/")]),
      mod(b("Environment, biodiversity & disasters", "पर्यावरण, जैव-विविधता एवं आपदाएँ"), ["Ecosystems, biodiversity hotspots", "Protected areas & conservation", "Natural hazards & disaster management"], b("National park ↔ state and Ramsar/biosphere facts appear in every GA section.", "राष्ट्रीय उद्यान ↔ राज्य और रामसर/बायोस्फीयर तथ्य हर सामान्य ज्ञान खंड में आते हैं।"), [nc("11-geo-1", 14), nc("11-geo-2", 6), nc("8-ss-1", 1), nc("10-geo", 2), nios("NIOS Geography (316)", "एनआईओएस भूगोल (316)", `${NIOS_SR}Geography-(316).aspx`)]),
    ],
  },

  // ======================================================================== Polity
  {
    id: "polity",
    title: b("Polity & Constitution", "राजव्यवस्था एवं संविधान"),
    subtitle: b("The Constitution article by article, institutions and how government works.", "संविधान अनुच्छेदवार, संस्थाएँ और सरकार कैसे काम करती है।"),
    exams: "UPSC · State PSC · SSC · Banking · Police · TET/TRE",
    practice: [{ label: b("Free mock tests", "निःशुल्क मॉक टेस्ट"), href: "/tests?access=free" }],
    modules: [
      mod(b("Making & philosophy of the Constitution", "संविधान का निर्माण एवं दर्शन"), ["Constituent Assembly", "Preamble & salient features", "Sources of the Constitution"], b("Borrowed feature ↔ country is asked very often.", "उधार ली गई विशेषता ↔ देश बहुत बार पूछा जाता है।"), [...many("11-pol-1", 1, 10), nc("12-hist-3", 4), nc("7-ss-1", 10), web("Constitution of India (official text)", "भारत का संविधान (आधिकारिक पाठ)", "https://legislative.gov.in/constitution-of-india/")]),
      mod(b("Fundamental rights, DPSP & duties", "मौलिक अधिकार, नीति निदेशक तत्व एवं कर्तव्य"), ["Articles 12–35", "Directive principles", "Fundamental duties (Art. 51A)", "Writs"], b("Article number ↔ right is the classic question.", "अनुच्छेद संख्या ↔ अधिकार क्लासिक प्रश्न है।"), [nc("11-pol-1", 2), nc("8-ss-2", 5), nc("8-pol-old", 1)]),
      mod(b("Elections & representation", "चुनाव एवं प्रतिनिधित्व"), ["Election Commission", "Electoral systems, delimitation", "Anti-defection law"], b("Who appoints/removes the CEC; what the 52nd/91st amendments did.", "मुख्य चुनाव आयुक्त की नियुक्ति/हटाना; 52वाँ/91वाँ संशोधन।"), [nc("11-pol-1", 3), nc("8-ss-1", 5), web("Election Commission of India", "भारत निर्वाचन आयोग", "https://eci.gov.in/")]),
      mod(b("Union executive & Parliament", "संघीय कार्यपालिका एवं संसद"), ["President, Vice-President, PM, Council of Ministers", "Lok Sabha, Rajya Sabha, sessions, bills", "Parliamentary committees"], b("Qualifications, terms and “who presides over the joint sitting?”.", "योग्यताएँ, कार्यकाल और “संयुक्त बैठक की अध्यक्षता कौन करता है?”"), [...many("11-pol-1", 4, 5), nc("8-ss-1", 6), nc("8-pol-old", 3), web("PRS Bill Track", "पीआरएस बिल ट्रैक", "https://prsindia.org/billtrack")]),
      mod(b("Judiciary", "न्यायपालिका"), ["Supreme Court & High Courts", "Judicial review, PIL", "Subordinate courts"], b("Jurisdictions (original/appellate/advisory) and judges' appointment/removal.", "क्षेत्राधिकार (मूल/अपीलीय/सलाहकारी) और न्यायाधीशों की नियुक्ति/हटाना।"), [nc("11-pol-1", 6), nc("8-ss-2", 4), nc("8-pol-old", 4)]),
      mod(b("Federalism & local government", "संघवाद एवं स्थानीय शासन"), ["Centre–state relations, schedules", "Panchayati Raj (73rd) & municipalities (74th)"], b("Schedule ↔ content and 73rd/74th amendment details.", "अनुसूची ↔ विषय और 73वें/74वें संशोधन का विवरण।"), [...many("11-pol-1", 7, 8), nc("10-pol", 2), ...many("6-ss", 10, 11, 12)]),
      mod(b("Amendments & a living Constitution", "संशोधन एवं जीवंत संविधान"), ["Amendment procedure (Art. 368)", "Landmark amendments & cases (basic structure)"], b("Amendment number ↔ change (e.g. 42nd, 44th, 86th, 101st).", "संशोधन संख्या ↔ परिवर्तन (जैसे 42वाँ, 44वाँ, 86वाँ, 101वाँ)।"), [nc("11-pol-1", 9), web("India Code – Central Acts", "इंडिया कोड – केंद्रीय अधिनियम", "https://www.indiacode.nic.in/")]),
      mod(b("Political theory & Indian politics", "राजनीतिक सिद्धांत एवं भारतीय राजनीति"), ["Freedom, equality, justice, rights, citizenship, secularism", "Politics since independence", "Democracy & social issues"], b("Concept questions in TET/TRE and State PSC mains-style prelims.", "टीईटी/टीआरई और राज्य पीएससी में अवधारणात्मक प्रश्न।"), [...many("11-pol-2", 2, 3, 6, 8), ...many("12-pol-1", 2, 6), ...many("10-pol", 1, 3, 4, 5)]),
      mod(b("International relations", "अंतरराष्ट्रीय संबंध"), ["UN & international organisations", "India's foreign policy & neighbours", "Groupings (BRICS, SCO, G20, QUAD)"], b("Headquarters, founding years, India's membership.", "मुख्यालय, स्थापना वर्ष, भारत की सदस्यता।"), [...many("12-pol-2", 3, 4, 7), nc("12-pol-1", 4), web("Ministry of External Affairs", "विदेश मंत्रालय", "https://www.mea.gov.in/press-releases.htm"), CA]),
    ],
  },

  // ======================================================================== Economy
  {
    id: "economy",
    title: b("Economy — concepts to current", "अर्थव्यवस्था — अवधारणा से वर्तमान तक"),
    subtitle: b("Core concepts from NCERT plus banking, budget and the economy today.", "एनसीईआरटी की मूल अवधारणाएँ, साथ में बैंकिंग, बजट और आज की अर्थव्यवस्था।"),
    exams: "Banking · Insurance · UPSC · State PSC · SSC",
    practice: [{ label: b("Banking mock tests", "बैंकिंग मॉक टेस्ट"), href: "/tests" }],
    modules: [
      mod(b("National income & basic concepts", "राष्ट्रीय आय एवं मूल अवधारणाएँ"), ["GDP, GNP, NDP, NNP; nominal vs real", "Methods of measuring national income", "Development indicators, HDI"], b("Definitions and formulas (NNP at factor cost = national income).", "परिभाषाएँ और सूत्र (साधन लागत पर एनएनपी = राष्ट्रीय आय)।"), [...many("12-eco-1", 1, 2), nc("10-eco", 1)]),
      mod(b("Sectors & planning", "क्षेत्रक एवं नियोजन"), ["Primary, secondary, tertiary sectors", "Five-Year Plans to NITI Aayog", "Indian economy 1950–90"], b("Plan ↔ focus/model and NITI Aayog facts.", "योजना ↔ लक्ष्य/मॉडल और नीति आयोग तथ्य।"), [nc("10-eco", 2), ...many("11-eco-1", 1, 2)]),
      mod(b("Money, banking & the RBI", "मुद्रा, बैंकिंग एवं आरबीआई"), ["Functions of money, credit", "Commercial banks, RBI & monetary policy tools (repo, CRR, SLR)", "Financial inclusion"], b("Banking exams: rate definitions, RBI governors, bank mergers, penalties (see the CA capsule's banking corner).", "बैंकिंग परीक्षाएँ: दरों की परिभाषा, आरबीआई गवर्नर, बैंक विलय, जुर्माने (सीए कैप्सूल का बैंकिंग कॉर्नर देखें)।"), [nc("12-eco-1", 3), nc("10-eco", 3), nc("7-ss-2", 8), nc("7-ss-1", 11), web("RBI press releases", "आरबीआई प्रेस विज्ञप्तियाँ", "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx"), CA]),
      mod(b("Budget, fiscal policy & taxes", "बजट, राजकोषीय नीति एवं कर"), ["Government budget, deficits", "Direct & indirect taxes, GST", "Fiscal policy"], b("Types of deficit and their formulas; GST council facts.", "घाटे के प्रकार और सूत्र; जीएसटी परिषद तथ्य।"), [nc("12-eco-1", 5), web("Union Budget", "केंद्रीय बजट", "https://www.indiabudget.gov.in/"), web("Economic Survey", "आर्थिक सर्वेक्षण", "https://www.indiabudget.gov.in/economicsurvey/")]),
      mod(b("Reforms, globalisation & external sector", "सुधार, वैश्वीकरण एवं बाह्य क्षेत्र"), ["LPG reforms of 1991", "Globalisation & WTO", "Balance of payments, exchange rate"], b("Year of reforms, committees, BoP components.", "सुधारों का वर्ष, समितियाँ, भुगतान संतुलन के घटक।"), [nc("11-eco-1", 3), nc("10-eco", 4), nc("12-eco-1", 6)]),
      mod(b("Human capital, employment & rural development", "मानव पूँजी, रोज़गार एवं ग्रामीण विकास"), ["Education & health as capital", "Employment, informal sector", "Rural credit, agricultural marketing, organic farming"], b("Scheme ↔ ministry ↔ target group.", "योजना ↔ मंत्रालय ↔ लक्षित समूह।"), [...many("11-eco-1", 4, 5, 6)]),
      mod(b("Environment & sustainable development", "पर्यावरण एवं धारणीय विकास"), ["Sustainable development", "India and its neighbours compared"], b("UPSC/State PSC: concepts and comparisons.", "यूपीएससी/राज्य पीएससी: अवधारणाएँ और तुलना।"), [...many("11-eco-1", 7, 8)]),
      mod(b("Microeconomics & statistics", "व्यष्टि अर्थशास्त्र एवं सांख्यिकी"), ["Demand, supply, elasticity", "Production & costs, market forms", "Central tendency, correlation, index numbers"], b("Teaching (PGT Economics) and RBI/NABARD papers go deeper here.", "शिक्षण (पीजीटी अर्थशास्त्र) और आरबीआई/नाबार्ड पेपर यहाँ गहराई से पूछते हैं।"), [...many("12-eco-2", 2, 3, 4, 5), ...many("11-eco-2", 5, 6, 7), nios("NIOS Economics (318)", "एनआईओएस अर्थशास्त्र (318)", `${NIOS_SR}Economics-(318).aspx`)]),
    ],
  },

  // ======================================================================== Science
  {
    id: "science",
    title: b("General Science", "सामान्य विज्ञान"),
    subtitle: b("Physics, chemistry and biology at the level SSC, Railway and TET papers ask.", "भौतिकी, रसायन और जीव विज्ञान — एसएससी, रेलवे और टीईटी स्तर पर।"),
    exams: "Railway · SSC · State PSC · TET/TRE · Defence",
    practice: [{ label: b("Railway & SSC mocks", "रेलवे एवं एसएससी मॉक"), href: "/tests" }],
    modules: [
      mod(b("Motion, force, work & energy", "गति, बल, कार्य एवं ऊर्जा"), ["Speed, velocity, acceleration", "Newton's laws, friction, pressure", "Work, energy, power, simple machines"], b("SI units and formulas; Railway papers love unit ↔ quantity questions.", "SI इकाइयाँ और सूत्र; रेलवे पेपर इकाई ↔ राशि प्रश्न पसंद करते हैं।"), [...many("9-sci", 4, 6, 7), ...many("8-sci", 5, 6), ...many("8-sci-old", 8, 9)]),
      mod(b("Light, sound, electricity & magnetism", "प्रकाश, ध्वनि, विद्युत एवं चुंबकत्व"), ["Reflection, refraction, lenses, human eye", "Sound waves", "Current, Ohm's law, magnetic effects"], b("Mirror/lens uses and defects of vision are frequent.", "दर्पण/लेंस के उपयोग और दृष्टि दोष अक्सर पूछे जाते हैं।"), [...many("10-sci", 9, 10, 11, 12), nc("9-sci", 10), ...many("8-sci", 4, 10)]),
      mod(b("Matter, elements & chemical reactions", "द्रव्य, तत्व एवं रासायनिक अभिक्रियाएँ"), ["States & nature of matter, mixtures", "Atoms, molecules, structure of the atom", "Chemical reactions & equations"], b("Element symbols, atomic numbers and types of reactions.", "तत्वों के प्रतीक, परमाणु क्रमांक और अभिक्रियाओं के प्रकार।"), [...many("9-sci", 5, 8, 9), ...many("8-sci", 7, 8, 9), nc("10-sci", 1)]),
      mod(b("Acids, bases, metals & carbon", "अम्ल, क्षार, धातु एवं कार्बन"), ["pH, indicators, salts", "Metals, non-metals, corrosion", "Carbon compounds"], b("Common names ↔ chemical formulas (baking soda, plaster of Paris).", "सामान्य नाम ↔ रासायनिक सूत्र (बेकिंग सोडा, प्लास्टर ऑफ़ पेरिस)।"), [...many("10-sci", 2, 3, 4), ...many("7-sci", 2, 4)]),
      mod(b("Cell, life processes & human body", "कोशिका, जैव प्रक्रम एवं मानव शरीर"), ["Cell & tissues", "Nutrition, respiration, transport, excretion", "Control & coordination, hormones"], b("Organ ↔ function, gland ↔ hormone.", "अंग ↔ कार्य, ग्रंथि ↔ हार्मोन।"), [...many("9-sci", 2, 3), ...many("10-sci", 5, 6), ...many("7-sci", 9, 10)]),
      mod(b("Reproduction, heredity & diversity", "जनन, आनुवंशिकता एवं विविधता"), ["Reproduction in plants & animals", "Heredity, Mendel", "Classification of living things"], b("Scientist ↔ discovery and classification examples.", "वैज्ञानिक ↔ खोज और वर्गीकरण के उदाहरण।"), [...many("10-sci", 7, 8), ...many("9-sci", 11, 12), nc("6-sci", 2)]),
      mod(b("Health, microbes & nutrition", "स्वास्थ्य, सूक्ष्मजीव एवं पोषण"), ["Diseases & their causes", "Vitamins & deficiency diseases", "Microorganisms"], b("Disease ↔ pathogen ↔ vaccine and vitamin ↔ deficiency disease.", "रोग ↔ रोगाणु ↔ टीका और विटामिन ↔ कमी से रोग।"), [...many("8-sci", 2, 3), nc("8-sci-old", 2), nc("6-sci", 3)]),
      mod(b("Environment & space", "पर्यावरण एवं अंतरिक्ष"), ["Ecosystems, food chains, pollution", "Earth, moon, solar system, ISRO missions"], b("Recent ISRO missions come from current affairs — see the capsule.", "हाल के इसरो मिशन समसामयिकी से आते हैं — कैप्सूल देखें।"), [nc("10-sci", 13), nc("9-sci", 13), ...many("8-sci", 11, 12, 13), web("ISRO missions", "इसरो मिशन", "https://www.isro.gov.in/"), CA]),
    ],
  },

  // ======================================================================== Maths
  {
    id: "maths",
    title: b("Quantitative aptitude & maths", "मात्रात्मक योग्यता एवं गणित"),
    subtitle: b("Every quant topic of SSC, Banking and Railway mapped to the NCERT chapter that teaches it.", "एसएससी, बैंकिंग और रेलवे का हर क्वांट विषय, उसे पढ़ाने वाले एनसीईआरटी अध्याय से जुड़ा।"),
    exams: "SSC · Banking · Railway · Insurance · Police",
    practice: [{ label: b("Free mock tests", "निःशुल्क मॉक टेस्ट"), href: "/tests?access=free" }],
    modules: [
      mod(b("Number system", "संख्या पद्धति"), ["Integers, rational & real numbers", "HCF & LCM, divisibility", "Squares, cubes, powers, surds"], b("Remainder and unit-digit questions take seconds once rules are learnt.", "शेषफल और इकाई अंक प्रश्न नियम सीखने के बाद सेकंडों में हल होते हैं।"), [nc("10-math", 1), ...many("8-math-old", 1, 5, 6, 10), nc("9-math", 3)]),
      mod(b("Percentage, profit & loss, interest", "प्रतिशत, लाभ-हानि एवं ब्याज"), ["Percentages", "Profit, loss, discount", "Simple & compound interest"], b("Highest-weight arithmetic in SSC and Banking prelims.", "एसएससी और बैंकिंग प्रारंभिक में सर्वाधिक भार वाला अंकगणित।"), [nc("8-math-old", 7), nc("7-math-old", 7)]),
      mod(b("Ratio, proportion, time & work, speed", "अनुपात, समानुपात, समय-कार्य, चाल"), ["Ratio & proportion, partnership, mixtures", "Time & work, pipes", "Speed, distance, time; trains & boats"], b("Use the LCM method for time & work; relative speed for trains.", "समय-कार्य के लिए LCM विधि; रेलगाड़ियों के लिए सापेक्ष चाल।"), [nc("8-math-old", 11), nc("8-math-1", 7), nc("8-math-2", 3)]),
      mod(b("Algebra", "बीजगणित"), ["Polynomials & identities", "Linear & quadratic equations", "Arithmetic progressions"], b("SSC CGL: identities like a³+b³ and x + 1/x types.", "एसएससी सीजीएल: a³+b³ और x + 1/x प्रकार की सर्वसमिकाएँ।"), [...many("10-math", 2, 3, 4, 5), nc("8-math-old", 8), nc("9-math", 4)]),
      mod(b("Geometry & coordinate geometry", "ज्यामिति एवं निर्देशांक ज्यामिति"), ["Lines & angles, triangles, quadrilaterals, circles", "Similarity & congruence", "Coordinate geometry"], b("Triangle centres and circle theorems are SSC favourites.", "त्रिभुज के केंद्र और वृत्त प्रमेय एसएससी के प्रिय विषय हैं।"), [...many("10-math", 6, 7, 10), nc("8-math-old", 3), nc("9-math", 1)]),
      mod(b("Mensuration", "क्षेत्रमिति"), ["Area & perimeter", "Surface area & volume of solids", "Areas related to circles"], b("Keep a one-page formula sheet for 2D and 3D shapes.", "2D और 3D आकृतियों के सूत्रों की एक पृष्ठ की सूची रखें।"), [...many("10-math", 11, 12), nc("8-math-old", 9), nc("9-math", 6)]),
      mod(b("Trigonometry", "त्रिकोणमिति"), ["Ratios & identities", "Heights & distances"], b("Standard-angle values and identities answer most questions.", "मानक कोणों के मान और सर्वसमिकाएँ अधिकांश प्रश्न हल करती हैं।"), [...many("10-math", 8, 9)]),
      mod(b("Statistics, probability & data interpretation", "सांख्यिकी, प्रायिकता एवं आँकड़ा व्याख्या"), ["Mean, median, mode", "Probability", "Tables, bar & pie charts (DI)"], b("Banking mains DI: approximate quickly; don't calculate exactly.", "बैंकिंग मेन्स डीआई: शीघ्र अनुमान लगाएँ; सटीक गणना न करें।"), [...many("10-math", 13, 14), nc("8-math-old", 4), nc("9-math", 7), ...many("11-eco-2", 3, 4)]),
    ],
  },

  // ======================================================================== Reasoning
  {
    id: "reasoning",
    title: b("Reasoning — verbal & non-verbal", "तर्कशक्ति — शाब्दिक एवं अशाब्दिक"),
    subtitle: b(
      "Every reasoning question type of SSC, Banking and Railway papers: the rule behind it, the shortcut, and practice MCQs.",
      "एसएससी, बैंकिंग और रेलवे पेपरों का हर तर्कशक्ति प्रश्न-प्रकार: उसका नियम, शॉर्टकट और अभ्यास प्रश्न।",
    ),
    exams: "SSC CGL/CHSL/MTS/GD · IBPS/SBI PO & Clerk · RRB NTPC/Group D · Police · Defence",
    official: [
      { label: "SSC – exam notices and syllabus", url: "https://ssc.gov.in/" },
      { label: "IBPS – recruitment notifications", url: "https://www.ibps.in/" },
    ],
    examFocus: [
      { exam: "SSC CGL / CHSL / MTS", focus: b("Analogy, classification, series, coding, non-verbal figures — fast one-liners", "सादृश्यता, वर्गीकरण, श्रेणी, कूटलेखन, अशाब्दिक आकृतियाँ — त्वरित प्रश्न") },
      { exam: "IBPS / SBI PO & Clerk", focus: b("Seating & floor puzzles, syllogism, inequality, blood relations, direction", "बैठक व मंज़िल पहेलियाँ, न्याय-वाक्य, असमानता, रक्त संबंध, दिशा") },
      { exam: "RRB NTPC / Group D", focus: b("Series, coding, calendar & clock, Venn diagrams, ranking", "श्रेणी, कूटलेखन, कैलेंडर व घड़ी, वेन आरेख, क्रम") },
      { exam: "Banking mains", focus: b("Critical reasoning, data sufficiency, long puzzles", "आलोचनात्मक तर्क, आँकड़ा पर्याप्तता, लंबी पहेलियाँ") },
    ],
    routine: [
      { minutes: 30, what: b("Learn one question type", "एक प्रश्न-प्रकार सीखें"), how: b("Read the rule and the shortcut, then solve the quick check below it.", "नियम और शॉर्टकट पढ़ें, फिर नीचे का त्वरित अभ्यास हल करें।") },
      { minutes: 30, what: b("Timed practice", "समयबद्ध अभ्यास"), how: b("20 questions in 15 minutes; mark the ones that took longer than a minute.", "15 मिनट में 20 प्रश्न; एक मिनट से अधिक लेने वाले प्रश्न चिह्नित करें।") },
      { minutes: 30, what: b("One puzzle a day", "रोज़ एक पहेली"), how: b("Draw the grid or seating diagram every time — never solve puzzles in your head.", "हर बार ग्रिड या बैठक आरेख बनाएँ — पहेलियाँ कभी मन में हल न करें।") },
    ],
    practice: [{ label: b("Free mock tests", "निःशुल्क मॉक टेस्ट"), href: "/tests?access=free" }],
    modules: [
      mod(
        b("Analogy, classification & coding–decoding", "सादृश्यता, वर्गीकरण एवं कूटलेखन–कूटवाचन"),
        ["Word, number and letter analogies", "Odd one out (classification)", "Letter-shift and reverse-alphabet coding", "Number coding and substitution", "Letter positions and alphabet tricks (EJOTY = 5, 10, 15, 20, 25)"],
        b("Write the alphabet with positions (A1 … Z26) at the top of your rough sheet before the paper starts.", "पेपर शुरू होने से पहले रफ़ शीट पर स्थान सहित वर्णमाला (A1 … Z26) लिख लें।"),
        [MOCKS],
      ),
      mod(
        b("Number & letter series", "संख्या एवं अक्षर श्रेणी"),
        ["Difference, ratio and mixed series", "Squares, cubes and n² ± 1 patterns", "Alternating (interleaved) series", "Letter and alphanumeric series", "Missing and wrong term"],
        b("Check differences first; if they grow fast, check ratios; if they zig-zag, split into two series.", "पहले अंतर देखें; तेज़ी से बढ़ें तो अनुपात; ऊपर-नीचे हों तो दो श्रेणियों में बाँटें।"),
        [nc("10-math", 5), nc("9-math", 8), QUANT],
      ),
      mod(
        b("Blood relations", "रक्त संबंध"),
        ["Pointing and introducing statements", "Coded relations (+, −, ×, ÷)", "Family trees with three generations", "Questions where gender cannot be determined"],
        b("Draw a tree: men as squares, women as circles, a double line for marriage and a vertical line for generations.", "वृक्ष बनाएँ: पुरुष वर्ग, महिला वृत्त, विवाह के लिए दोहरी रेखा, पीढ़ी के लिए खड़ी रेखा।"),
        [MOCKS],
      ),
      mod(
        b("Direction sense & distance", "दिशा ज्ञान एवं दूरी"),
        ["Eight directions and turns", "Shortest distance (Pythagoras)", "Shadow questions", "Degree turns, clockwise and anticlockwise", "Rotated or renamed directions"],
        b("Always draw the path on paper with north at the top; turn left/right from where the person is facing, not from the page.", "हमेशा उत्तर ऊपर रखकर रास्ता बनाएँ; बाएँ/दाएँ व्यक्ति के मुख की ओर से मुड़ें, पृष्ठ से नहीं।"),
        [nc("9-math", 1), MOCKS],
      ),
      mod(
        b("Order, ranking & seating arrangement", "क्रम, रैंकिंग एवं बैठक व्यवस्था"),
        ["Rank from left/right and total in a row", "Interchanging positions", "Linear seating (one row, two rows)", "Circular and square tables, facing in/out", "Floor and box arrangements", "Comparison (taller, heavier, richer)"],
        b("In circles facing the centre, a person's left is clockwise; facing outside, it is anticlockwise.", "केंद्र की ओर मुख वाले वृत्त में बायाँ = दक्षिणावर्त; बाहर की ओर मुख में बायाँ = वामावर्त।"),
        [MOCKS],
      ),
      mod(
        b("Syllogism & inequalities", "न्याय-वाक्य एवं असमानता"),
        ["All / Some / No statements with Venn diagrams", "“Some … not” and possibility conclusions", "Either–or cases", "Direct and coded inequalities"],
        b("Draw the least-overlap Venn diagram; a conclusion follows only if it is true in every possible diagram.", "न्यूनतम ओवरलैप वाला वेन आरेख बनाएँ; निष्कर्ष तभी सही है जब हर संभव आरेख में सही हो।"),
        [MOCKS],
      ),
      mod(
        b("Puzzles, calendar & clock", "पहेलियाँ, कैलेंडर एवं घड़ी"),
        ["Grid puzzles (person–day–colour)", "Odd days, leap years, day of a given date", "Angle between the hands", "Hands coinciding, opposite and at right angles", "Mirror and fast/slow clocks"],
        b("For puzzles, fill the definite facts first and then eliminate; for clocks remember θ = |30H − 5.5M|.", "पहेलियों में पहले निश्चित तथ्य भरें, फिर हटाएँ; घड़ी के लिए θ = |30H − 5.5M| याद रखें।"),
        [MOCKS],
      ),
      mod(
        b("Non-verbal reasoning", "अशाब्दिक तर्कशक्ति"),
        ["Mirror and water images", "Paper folding and cutting", "Embedded and completing figures", "Counting triangles and squares", "Dice and cubes (painted-cube counts)", "Figure series and analogies"],
        b("SSC sets 5–8 figure questions — count lines and corners systematically, and learn the painted-cube formulas.", "एसएससी में 5–8 आकृति प्रश्न आते हैं — रेखाएँ व कोने क्रम से गिनें और रंगे घन के सूत्र याद करें।"),
        [nc("9-math", 1), MOCKS],
      ),
      mod(
        b("Critical reasoning & data sufficiency", "आलोचनात्मक तर्क एवं आँकड़ा पर्याप्तता"),
        ["Statement and assumption", "Statement and course of action", "Strong and weak arguments", "Cause and effect, inferences", "Data sufficiency (two statements)"],
        b("Banking mains favourite: reject options that are extreme (“all”, “only”, “never”) or that bring in outside facts.", "बैंकिंग मेन्स का प्रिय विषय: अतिवादी (“सभी”, “केवल”, “कभी नहीं”) या बाहरी तथ्य वाले विकल्प छोड़ें।"),
        [MOCKS],
      ),
    ],
    note: b(
      "All explanations and practice questions here are original. Confirm the latest section pattern in your exam's official notification.",
      "यहाँ की सभी व्याख्याएँ और अभ्यास प्रश्न मौलिक हैं। नवीनतम खंड पैटर्न अपनी परीक्षा की आधिकारिक अधिसूचना में जाँचें।",
    ),
  },
];

// Hot topics and practice MCQs for the guides that have them (one entry per module).
for (const [guideId, practice, prefix] of [
  ["computer-science", CS_PRACTICE, "cs"],
  ["reasoning", REASONING_PRACTICE, "rs"],
] as const) {
  const guide = SUBJECT_GUIDES.find((g) => g.id === guideId)!;
  if (practice.length !== guide.modules.length) throw new Error(`${guideId} practice must have one entry per module`);
  guide.modules.forEach((mo, i) => {
    const p = practice[i]!;
    mo.hot = p.hot;
    mo.mcqs = p.mcqs.map((q, j) => {
      const id = `${prefix}-${i + 1}-${j + 1}`;
      return shuffleOptions({ ...q, id }, id) as GuideMcq;
    });
  });
}

export const findGuide = (id: string) => SUBJECT_GUIDES.find((g) => g.id === id);
