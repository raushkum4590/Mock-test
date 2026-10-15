/**
 * Free, official study resources linked from the Study Material section.
 *
 * Only government / official sources are listed. Their content stays on the
 * publisher's site: we link out and never copy text, PDFs or images.
 * Newspapers (The Hindu, Times of India, …) are copyrighted and are not
 * fetched or listed; licensed content would need a syndication agreement.
 */
import type { StudySubject } from "./ncert";

export type Bilingual = { en: string; hi: string };
export type ResourceLink = { title: Bilingual; url: string; note?: Bilingual };

export const SUBJECT_LABELS: Record<StudySubject, Bilingual> = {
  history: { en: "History", hi: "इतिहास" },
  geography: { en: "Geography", hi: "भूगोल" },
  polity: { en: "Polity & Constitution", hi: "राजव्यवस्था एवं संविधान" },
  economics: { en: "Economy", hi: "अर्थव्यवस्था" },
  science: { en: "General Science", hi: "सामान्य विज्ञान" },
  maths: { en: "Mathematics", hi: "गणित" },
  computer: { en: "Computer Science", hi: "कंप्यूटर विज्ञान" },
};

export const NIOS_CS = "https://www.nios.ac.in/online-course-material/sr-secondary-courses/Computer-Science-(330).aspx";

const link = (en: string, hi: string, url: string, note?: [string, string]): ResourceLink => ({
  title: { en, hi },
  url,
  ...(note ? { note: { en: note[0], hi: note[1] } } : {}),
});

/** Official references per subject (in addition to the NCERT books). */
export const SUBJECT_REFERENCES: Record<StudySubject, ResourceLink[]> = {
  history: [
    link("Archaeological Survey of India", "भारतीय पुरातत्व सर्वेक्षण", "https://asi.nic.in/", ["Monuments, excavations, protected sites", "स्मारक, उत्खनन, संरक्षित स्थल"]),
    link("UNESCO World Heritage Sites in India", "भारत में यूनेस्को विश्व धरोहर स्थल", "https://whc.unesco.org/en/statesparties/in", ["Site list with year of inscription", "स्थलों की सूची एवं वर्ष"]),
    link("NIOS Senior Secondary – History", "एनआईओएस उच्चतर माध्यमिक – इतिहास", "https://www.nios.ac.in/online-course-material/sr-secondary-courses.aspx"),
  ],
  geography: [
    link("India-WRIS (rivers, basins, dams)", "इंडिया-डब्ल्यूआरआईएस (नदियाँ, बेसिन, बाँध)", "https://indiawris.gov.in/wris/"),
    link("ISRO Bhuvan (maps)", "इसरो भुवन (मानचित्र)", "https://bhuvan.nrsc.gov.in/"),
    link("Survey of India", "भारतीय सर्वेक्षण विभाग", "https://surveyofindia.gov.in/"),
    link("Census of India", "भारत की जनगणना", "https://censusindia.gov.in/", ["Population, literacy, sex ratio", "जनसंख्या, साक्षरता, लिंगानुपात"]),
  ],
  polity: [
    link("Constitution of India (official text)", "भारत का संविधान (आधिकारिक पाठ)", "https://legislative.gov.in/constitution-of-india/"),
    link("India Code – Central Acts", "इंडिया कोड – केंद्रीय अधिनियम", "https://www.indiacode.nic.in/"),
    link("PRS Bill Track", "पीआरएस बिल ट्रैक", "https://prsindia.org/billtrack", ["Bills and Acts passed by Parliament", "संसद द्वारा पारित विधेयक एवं अधिनियम"]),
    link("Election Commission of India", "भारत निर्वाचन आयोग", "https://eci.gov.in/"),
    link("President of India", "भारत के राष्ट्रपति", "https://presidentofindia.gov.in/"),
  ],
  economics: [
    link("Economic Survey", "आर्थिक सर्वेक्षण", "https://www.indiabudget.gov.in/economicsurvey/"),
    link("Union Budget", "केंद्रीय बजट", "https://www.indiabudget.gov.in/"),
    link("RBI press releases", "आरबीआई प्रेस विज्ञप्तियाँ", "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx", ["Banking awareness", "बैंकिंग जागरूकता"]),
    link("SEBI media & notifications", "सेबी मीडिया एवं अधिसूचनाएँ", "https://www.sebi.gov.in/media-and-notifications.html"),
  ],
  science: [
    link("ISRO – missions", "इसरो – मिशन", "https://www.isro.gov.in/"),
    link("Department of Science & Technology", "विज्ञान एवं प्रौद्योगिकी विभाग", "https://dst.gov.in/"),
    link("NIOS Secondary – Science", "एनआईओएस माध्यमिक – विज्ञान", "https://www.nios.ac.in/online-course-material/secondary-courses.aspx"),
  ],
  maths: [link("NIOS Secondary – Mathematics", "एनआईओएस माध्यमिक – गणित", "https://www.nios.ac.in/online-course-material/secondary-courses.aspx")],
  computer: [
    link("NIOS Senior Secondary – Computer Science (330)", "एनआईओएस उच्चतर माध्यमिक – कंप्यूटर विज्ञान (330)", NIOS_CS, ["Free study material by lesson", "पाठवार निःशुल्क सामग्री"]),
    link("NPTEL – free IIT/IISc courses", "एनपीटीईएल – आईआईटी/आईआईएससी के निःशुल्क पाठ्यक्रम", "https://nptel.ac.in/courses", ["Operating systems, DBMS, data structures, networks", "ऑपरेटिंग सिस्टम, डीबीएमएस, डेटा संरचना, नेटवर्क"]),
    link("Official Python tutorial", "आधिकारिक पायथन ट्यूटोरियल", "https://docs.python.org/3/tutorial/"),
  ],
};

/** Other free study material (all subjects). */
export const GENERAL_RESOURCES: ResourceLink[] = [
  link("NCERT textbooks (official site)", "एनसीईआरटी पाठ्यपुस्तकें (आधिकारिक साइट)", "https://ncert.nic.in/textbook.php", ["All classes, subjects and mediums", "सभी कक्षाएँ, विषय और माध्यम"]),
  link("ePathshala (NCERT e-books)", "ई-पाठशाला (एनसीईआरटी ई-पुस्तकें)", "https://epathshala.nic.in/"),
  link("NIOS – Secondary (Class 10) material", "एनआईओएस – माध्यमिक (कक्षा 10) सामग्री", "https://www.nios.ac.in/online-course-material/secondary-courses.aspx"),
  link("NIOS – Senior Secondary (Class 12) material", "एनआईओएस – उच्चतर माध्यमिक (कक्षा 12) सामग्री", "https://www.nios.ac.in/online-course-material/sr-secondary-courses.aspx"),
  link("SWAYAM (free government courses)", "स्वयं (निःशुल्क सरकारी पाठ्यक्रम)", "https://swayam.gov.in/"),
  link("National Digital Library of India", "भारतीय राष्ट्रीय डिजिटल पुस्तकालय", "https://ndl.iitkgp.ac.in/"),
  link("Know India", "भारत को जानें", "https://knowindia.india.gov.in/", ["States, culture, national symbols", "राज्य, संस्कृति, राष्ट्रीय प्रतीक"]),
  link("National Portal of India", "भारत का राष्ट्रीय पोर्टल", "https://www.india.gov.in/"),
  link("Publications Division (Yojana, Kurukshetra, India Year Book)", "प्रकाशन विभाग (योजना, कुरुक्षेत्र, भारत वार्षिकी)", "https://www.publicationsdivision.nic.in/"),
];

/** Current-affairs sources: live RSS feed (optional) plus the archive page. */
export type NewsSource = {
  id: string;
  name: Bilingual;
  /** Short label shown next to each headline. */
  short: string;
  feed?: string;
  archive: string;
  lang: "en" | "hi";
  use: Bilingual;
  /** false = too technical for the exam view (still listed under "All headlines"). */
  examView?: boolean;
};

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "pib",
    short: "PIB",
    name: { en: "PIB – Press Information Bureau", hi: "पीआईबी – पत्र सूचना कार्यालय" },
    feed: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    archive: "https://www.pib.gov.in/allRel.aspx",
    // The feed currently serves Hindi titles regardless of the Lang parameter.
    lang: "hi",
    use: { en: "Government schemes, appointments, events — all exams", hi: "सरकारी योजनाएँ, नियुक्तियाँ, घटनाएँ — सभी परीक्षाएँ" },
  },
  {
    id: "air",
    short: "AIR",
    name: { en: "All India Radio News", hi: "आकाशवाणी समाचार" },
    feed: "https://newsonair.gov.in/rss-feeds/",
    archive: "https://newsonair.gov.in/",
    lang: "en",
    use: { en: "Daily national news", hi: "दैनिक राष्ट्रीय समाचार" },
  },
  {
    id: "rbi-press",
    short: "RBI",
    name: { en: "RBI press releases", hi: "आरबीआई प्रेस विज्ञप्तियाँ" },
    feed: "https://www.rbi.org.in/pressreleases_rss.xml",
    archive: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
    lang: "en",
    use: { en: "Banking & financial awareness — IBPS, SBI, RBI, NABARD, LIC", hi: "बैंकिंग एवं वित्तीय जागरूकता — आईबीपीएस, एसबीआई, आरबीआई, नाबार्ड, एलआईसी" },
  },
  {
    id: "rbi-notifications",
    short: "RBI",
    examView: false,
    name: { en: "RBI notifications", hi: "आरबीआई अधिसूचनाएँ" },
    feed: "https://www.rbi.org.in/notifications_rss.xml",
    archive: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
    lang: "en",
    use: { en: "Circulars and rules for banks", hi: "बैंकों के लिए परिपत्र एवं नियम" },
  },
  {
    id: "mea",
    short: "MEA",
    name: { en: "Ministry of External Affairs", hi: "विदेश मंत्रालय" },
    archive: "https://www.mea.gov.in/press-releases.htm",
    lang: "en",
    use: { en: "International relations, visits, agreements", hi: "अंतरराष्ट्रीय संबंध, यात्राएँ, समझौते" },
  },
  {
    id: "prs",
    short: "PRS",
    name: { en: "PRS Legislative Research", hi: "पीआरएस लेजिस्लेटिव रिसर्च" },
    archive: "https://prsindia.org/billtrack",
    lang: "en",
    use: { en: "Bills and Acts", hi: "विधेयक एवं अधिनियम" },
  },
  {
    id: "pmindia",
    short: "PMO",
    name: { en: "Prime Minister's Office", hi: "प्रधानमंत्री कार्यालय" },
    archive: "https://www.pmindia.gov.in/en/",
    lang: "en",
    use: { en: "PM's programmes and announcements", hi: "प्रधानमंत्री के कार्यक्रम एवं घोषणाएँ" },
  },
];

export const pick = (b: Bilingual, lang: "en" | "hi") => b[lang] || b.en;
