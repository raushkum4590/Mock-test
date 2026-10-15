/**
 * NCERT textbook catalogue for the Study Material section.
 *
 * COPYRIGHT: NCERT books are "All rights reserved". We only LINK to the
 * official PDFs on ncert.nic.in — never copy, re-host or embed them
 * (ncert.nic.in also blocks framing with X-Frame-Options: SAMEORIGIN).
 *
 * Book codes and chapter counts were checked against ncert.nic.in on
 * 2026-10-10 (chapter PDFs are `<code><NN>.pdf`, the whole book is
 * `<code>dd.zip`). Re-check with `npx tsx scripts/check-ncert-links.ts`.
 * Class 9 Social Science is not at the usual address (new books being
 * released), so it is linked to NCERT's own textbook page instead.
 */

export type StudySubject = "history" | "geography" | "polity" | "economics" | "science" | "maths" | "computer";

export type NcertEdition = { code: string; chapters: number; title: string };

export type NcertBook = {
  id: string;
  cls: number;
  subjects: StudySubject[];
  /** Older syllabus edition still published by NCERT (widely used for competitive exams). */
  previous?: boolean;
  en?: NcertEdition;
  hi?: NcertEdition;
};

export const NCERT_BASE = "https://ncert.nic.in/textbook/pdf/";
export const NCERT_TEXTBOOK_PAGE = "https://ncert.nic.in/textbook.php";

export const chapterUrl = (code: string, chapter: number) => `${NCERT_BASE}${code}${String(chapter).padStart(2, "0")}.pdf`;
export const fullBookUrl = (code: string) => `${NCERT_BASE}${code}dd.zip`;

const SS: StudySubject[] = ["history", "geography", "polity", "economics"];

const book = (
  id: string,
  cls: number,
  subjects: StudySubject[],
  en: [string, number, string] | null,
  hi: [string, number, string] | null,
  previous = false,
): NcertBook => ({
  id,
  cls,
  subjects,
  ...(previous ? { previous } : {}),
  ...(en ? { en: { code: en[0], chapters: en[1], title: en[2] } } : {}),
  ...(hi ? { hi: { code: hi[0], chapters: hi[1], title: hi[2] } } : {}),
});

export const NCERT_BOOKS: NcertBook[] = [
  // --- Class 6 -----------------------------------------------------------------------
  book("6-ss", 6, SS, ["fees1", 14, "Exploring Society: India and Beyond"], ["fhes1", 14, "समाज का अध्ययन: भारत और उसके आगे"]),
  book("6-sci", 6, ["science"], ["fecu1", 12, "Curiosity (Science)"], ["fhcu1", 12, "जिज्ञासा (विज्ञान)"]),
  book("6-math", 6, ["maths"], ["fegp1", 10, "Ganita Prakash (Mathematics)"], ["fhgp1", 10, "गणित प्रकाश"]),

  // --- Class 7 -----------------------------------------------------------------------
  book("7-ss-1", 7, SS, ["gees1", 12, "Exploring Society: India and Beyond – Part 1"], ["ghes1", 12, "समाज का अध्ययन: भारत और उसके आगे – भाग 1"]),
  book("7-ss-2", 7, SS, ["gees2", 8, "Exploring Society: India and Beyond – Part 2"], ["ghes2", 8, "समाज का अध्ययन: भारत और उसके आगे – भाग 2"]),
  book("7-sci", 7, ["science"], ["gecu1", 12, "Curiosity (Science)"], ["ghcu1", 12, "जिज्ञासा (विज्ञान)"]),
  book("7-math-1", 7, ["maths"], ["gegp1", 8, "Ganita Prakash – Part 1"], ["ghgp1", 8, "गणित प्रकाश – भाग 1"]),
  book("7-math-2", 7, ["maths"], ["gegp2", 7, "Ganita Prakash – Part 2"], ["ghgp2", 7, "गणित प्रकाश – भाग 2"]),
  book("7-hist-old", 7, ["history"], ["gess1", 8, "Our Pasts – II (History)"], ["ghss1", 8, "हमारे अतीत – II (इतिहास)"], true),
  book("7-geo-old", 7, ["geography"], ["gess2", 7, "Our Environment (Geography)"], ["ghss2", 7, "हमारा पर्यावरण (भूगोल)"], true),
  book("7-pol-old", 7, ["polity"], ["gess3", 8, "Social and Political Life – II"], ["ghss3", 8, "सामाजिक एवं राजनीतिक जीवन – II"], true),
  book("7-sci-old", 7, ["science"], ["gesc1", 13, "Science"], ["ghsc1", 13, "विज्ञान"], true),
  book("7-math-old", 7, ["maths"], null, ["ghmh1", 13, "गणित"], true),

  // --- Class 8 -----------------------------------------------------------------------
  book("8-ss-1", 8, SS, ["hees1", 7, "Exploring Society: India and Beyond – Part 1"], ["hhes1", 7, "समाज का अध्ययन: भारत और उसके आगे – भाग 1"]),
  book("8-ss-2", 8, SS, ["hees2", 8, "Exploring Society: India and Beyond – Part 2"], null),
  book("8-sci", 8, ["science"], ["hecu1", 13, "Curiosity (Science)"], ["hhcu1", 13, "जिज्ञासा (विज्ञान)"]),
  book("8-math-1", 8, ["maths"], ["hegp1", 7, "Ganita Prakash – Part 1"], ["hhgp1", 7, "गणित प्रकाश – भाग 1"]),
  book("8-math-2", 8, ["maths"], ["hegp2", 7, "Ganita Prakash – Part 2"], ["hhgp2", 7, "गणित प्रकाश – भाग 2"]),
  book("8-hist-old", 8, ["history"], ["hess2", 8, "Our Pasts – III (History)"], ["hhss1", 8, "हमारे अतीत – III (इतिहास)"], true),
  book("8-pol-old", 8, ["polity"], ["hess3", 8, "Social and Political Life – III"], ["hhss3", 8, "सामाजिक एवं राजनीतिक जीवन – III"], true),
  book("8-geo-old", 8, ["geography"], ["hess4", 5, "Resources and Development (Geography)"], ["hhss4", 5, "संसाधन एवं विकास (भूगोल)"], true),
  book("8-sci-old", 8, ["science"], ["hesc1", 13, "Science"], ["hhsc1", 13, "विज्ञान"], true),
  book("8-math-old", 8, ["maths"], ["hemh1", 13, "Mathematics"], ["hhmh1", 13, "गणित"], true),

  // --- Class 9 (Social Science: see NCERT_TEXTBOOK_PAGE) --------------------------------
  book("9-sci", 9, ["science"], ["iesc1", 13, "Science"], ["ihsc1", 13, "विज्ञान"]),
  book("9-math", 9, ["maths"], ["iemh1", 8, "Mathematics"], ["ihmh1", 8, "गणित"]),

  // --- Class 10 ----------------------------------------------------------------------
  book("10-hist", 10, ["history"], ["jess3", 5, "India and the Contemporary World – II (History)"], ["jhss3", 5, "भारत और समकालीन विश्व – II (इतिहास)"]),
  book("10-geo", 10, ["geography"], ["jess1", 7, "Contemporary India – II (Geography)"], ["jhss1", 7, "समकालीन भारत – II (भूगोल)"]),
  book("10-pol", 10, ["polity"], ["jess4", 5, "Democratic Politics – II"], ["jhss4", 5, "लोकतांत्रिक राजनीति – II"]),
  book("10-eco", 10, ["economics"], ["jess2", 5, "Understanding Economic Development"], ["jhss2", 5, "आर्थिक विकास की समझ"]),
  book("10-sci", 10, ["science"], ["jesc1", 13, "Science"], ["jhsc1", 13, "विज्ञान"]),
  book("10-math", 10, ["maths"], ["jemh1", 14, "Mathematics"], ["jhmh1", 14, "गणित"]),

  // --- Class 11 ----------------------------------------------------------------------
  book("11-hist", 11, ["history"], ["kehs1", 7, "Themes in World History"], ["khhs1", 7, "विश्व इतिहास के कुछ विषय"]),
  book("11-geo-1", 11, ["geography"], ["kegy2", 14, "Fundamentals of Physical Geography"], ["khgy2", 14, "भौतिक भूगोल के मूल सिद्धांत"]),
  book("11-geo-2", 11, ["geography"], ["kegy1", 6, "India: Physical Environment"], ["khgy1", 6, "भारत: भौतिक पर्यावरण"]),
  book("11-pol-1", 11, ["polity"], ["keps2", 10, "Indian Constitution at Work"], ["khps2", 10, "भारत का संविधान: सिद्धांत और व्यवहार"]),
  book("11-pol-2", 11, ["polity"], ["keps1", 8, "Political Theory"], ["khps1", 8, "राजनीतिक सिद्धांत"]),
  book("11-eco-1", 11, ["economics"], ["keec1", 8, "Indian Economic Development"], ["khec1", 8, "भारतीय अर्थव्यवस्था का विकास"]),
  book("11-eco-2", 11, ["economics"], ["kest1", 8, "Statistics for Economics"], ["khst1", 8, "अर्थशास्त्र में सांख्यिकी"]),
  // Computer Science / Informatics Practices are published in English only.
  book("11-cs", 11, ["computer"], ["kecs1", 11, "Computer Science"], null),
  book("11-ip", 11, ["computer"], ["keip1", 8, "Informatics Practices"], null),

  // --- Class 12 ----------------------------------------------------------------------
  book("12-hist-1", 12, ["history"], ["lehs1", 4, "Themes in Indian History – Part I"], ["lhhs1", 4, "भारतीय इतिहास के कुछ विषय – भाग I"]),
  book("12-hist-2", 12, ["history"], ["lehs2", 4, "Themes in Indian History – Part II"], ["lhhs2", 4, "भारतीय इतिहास के कुछ विषय – भाग II"]),
  book("12-hist-3", 12, ["history"], ["lehs3", 4, "Themes in Indian History – Part III"], ["lhhs3", 4, "भारतीय इतिहास के कुछ विषय – भाग III"]),
  book("12-geo-1", 12, ["geography"], ["legy1", 8, "Fundamentals of Human Geography"], ["lhgy1", 8, "मानव भूगोल के मूल सिद्धांत"]),
  book("12-geo-2", 12, ["geography"], ["legy2", 9, "India: People and Economy"], ["lhgy2", 9, "भारत: लोग और अर्थव्यवस्था"]),
  book("12-pol-1", 12, ["polity"], ["leps2", 8, "Politics in India since Independence"], ["lhps2", 8, "स्वतंत्र भारत में राजनीति"]),
  book("12-pol-2", 12, ["polity"], ["leps1", 7, "Contemporary World Politics"], ["lhps1", 8, "समकालीन विश्व राजनीति"]),
  book("12-eco-1", 12, ["economics"], ["leec1", 6, "Introductory Macroeconomics"], ["lhec1", 6, "समष्टि अर्थशास्त्र: एक परिचय"]),
  book("12-eco-2", 12, ["economics"], ["leec2", 5, "Introductory Microeconomics"], ["lhec2", 5, "व्यष्टि अर्थशास्त्र: एक परिचय"]),
  book("12-cs", 12, ["computer"], ["lecs1", 13, "Computer Science"], null),
  book("12-ip", 12, ["computer"], ["leip1", 7, "Informatics Practices"], null),
];

export const NCERT_CLASSES = [6, 7, 8, 9, 10, 11, 12] as const;

export type NcertFilter = { cls?: number; subject?: StudySubject; medium?: "en" | "hi" };

export function filterNcertBooks({ cls, subject, medium }: NcertFilter): NcertBook[] {
  return NCERT_BOOKS.filter((b) => (cls ? b.cls === cls : true) && (subject ? b.subjects.includes(subject) : true) && (medium ? !!b[medium] : true));
}
