/**
 * Create the HTML Basics mock test (15 MCQs, bilingual, with explanations).
 *
 *   npm run mock:html [-- --dry-run]
 *
 * Idempotent: skipped if the exam code already exists. --dry-run validates the
 * questions without touching the database.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { examCategories, examSectionQuestions, examSections, exams, questionOptions, questions } from "@db/schema";
import { closeDb, getDb } from "@/lib/db/client";
import { audit, SYSTEM_ACTOR } from "@/server/services/audit-service";
import type { GenQuestion } from "./mock-series/core";
import { validate } from "./mock-series/series";

const CODE = "HTML-BASICS-01";
const CATEGORY = { slug: "web-development", nameEn: "Web Development", nameHi: "वेब डेवलपमेंट" };
const SECTION = { code: "HTML", titleEn: "HTML", titleHi: "HTML", subject: "HTML", marksCorrect: 1, marksWrong: 0 };

type Q = Omit<GenQuestion, "key" | "subject" | "topic" | "difficulty"> & { difficulty?: GenQuestion["difficulty"] };

const QUESTIONS: Q[] = [
  {
    en: "What does HTML stand for?",
    hi: "HTML का पूरा नाम क्या है?",
    options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
    correct: 0,
    explanationEn: "HTML = HyperText Markup Language, the standard language for structuring web pages.",
    explanationHi: "HTML = HyperText Markup Language, जो Web Pages की संरचना (structure) बनाने की मानक भाषा है।",
  },
  {
    en: "Which declaration must appear at the very top of an HTML5 document?",
    hi: "HTML5 Document में सबसे ऊपर कौन-सा Declaration होना चाहिए?",
    options: ["<!DOCTYPE html>", "<html5>", "<?xml version=\"1.0\"?>", "<meta html5>"],
    correct: 0,
    explanationEn: "<!DOCTYPE html> tells the browser to render the page in HTML5 standards mode.",
    explanationHi: "<!DOCTYPE html> Browser को बताता है कि Page को HTML5 Standards Mode में दिखाना है।",
  },
  {
    en: "Which tag creates the largest heading?",
    hi: "सबसे बड़ा Heading कौन-सा Tag बनाता है?",
    options: ["<h6>", "<heading>", "<h1>", "<head>"],
    correct: 2,
    explanationEn: "Headings go from <h1> (largest, most important) to <h6> (smallest).",
    explanationHi: "Headings <h1> (सबसे बड़ा) से <h6> (सबसे छोटा) तक होते हैं।",
  },
  {
    en: "Which tag is used to create a hyperlink?",
    hi: "Hyperlink बनाने के लिए कौन-सा Tag उपयोग होता है?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correct: 1,
    explanationEn: "The anchor tag <a href=\"...\"> creates a hyperlink. <link> connects external resources like CSS.",
    explanationHi: "Anchor Tag <a href=\"...\"> से Hyperlink बनता है। <link> का उपयोग CSS जैसी External Files जोड़ने में होता है।",
  },
  {
    en: "Which attribute of the <img> tag gives alternative text for an image?",
    hi: "<img> Tag का कौन-सा Attribute Image का वैकल्पिक Text देता है?",
    options: ["title", "src", "alt", "text"],
    correct: 2,
    explanationEn: "alt text is shown if the image fails to load and is read by screen readers.",
    explanationHi: "alt Text तब दिखता है जब Image Load न हो, और Screen Readers इसे पढ़ते हैं।",
  },
  {
    en: "Which tag creates an ordered (numbered) list?",
    hi: "Ordered (क्रमांकित) List कौन-सा Tag बनाता है?",
    options: ["<ul>", "<ol>", "<li>", "<dl>"],
    correct: 1,
    explanationEn: "<ol> is an ordered list, <ul> an unordered (bulleted) list, and <li> is each list item.",
    explanationHi: "<ol> Ordered List है, <ul> Unordered (Bullet) List है, और <li> हर List Item है।",
  },
  {
    en: "Which tag inserts a line break?",
    hi: "Line Break डालने के लिए कौन-सा Tag है?",
    options: ["<break>", "<lb>", "<hr>", "<br>"],
    correct: 3,
    explanationEn: "<br> is an empty tag that moves content to the next line. <hr> draws a horizontal rule.",
    explanationHi: "<br> एक Empty Tag है जो Content को अगली Line में ले जाता है। <hr> Horizontal Line बनाता है।",
  },
  {
    en: "In a table, which tag defines a table row?",
    hi: "Table में Row किस Tag से बनती है?",
    options: ["<td>", "<tr>", "<th>", "<row>"],
    correct: 1,
    explanationEn: "<tr> is a table row, <td> a data cell and <th> a header cell.",
    explanationHi: "<tr> Table Row है, <td> Data Cell है और <th> Header Cell है।",
  },
  {
    en: "Which attribute merges two or more columns of a table cell?",
    hi: "Table Cell के दो या अधिक Columns को कौन-सा Attribute मिलाता है?",
    options: ["rowspan", "merge", "colspan", "span"],
    correct: 2,
    explanationEn: "colspan joins cells across columns; rowspan joins cells across rows.",
    explanationHi: "colspan Columns को मिलाता है; rowspan Rows को मिलाता है।",
  },
  {
    en: "Which <input> type hides the characters a user types?",
    hi: "कौन-सा <input> Type User द्वारा Type किए गए अक्षरों को छिपाता है?",
    options: ["hidden", "password", "secret", "text"],
    correct: 1,
    explanationEn: "type=\"password\" masks the characters. type=\"hidden\" is not shown on the page at all.",
    explanationHi: "type=\"password\" अक्षरों को छिपाकर दिखाता है। type=\"hidden\" Page पर दिखता ही नहीं।",
  },
  {
    en: "Which <form> attribute specifies where the form data is sent?",
    hi: "<form> का कौन-सा Attribute बताता है कि Form Data कहाँ भेजा जाएगा?",
    options: ["method", "target", "action", "submit"],
    correct: 2,
    explanationEn: "action is the URL that receives the data; method (GET/POST) is how it is sent.",
    explanationHi: "action वह URL है जहाँ Data जाता है; method (GET/POST) बताता है कि Data कैसे भेजा जाए।",
  },
  {
    en: "Which of these is a semantic HTML5 element?",
    hi: "इनमें से कौन-सा HTML5 Semantic Element है?",
    options: ["<div>", "<span>", "<b>", "<article>"],
    correct: 3,
    explanationEn: "<article>, <header>, <nav>, <section> and <footer> describe their meaning. <div> and <span> are generic.",
    explanationHi: "<article>, <header>, <nav>, <section>, <footer> अपना अर्थ बताते हैं। <div> और <span> Generic हैं।",
  },
  {
    en: "Which tag is used to embed a video in HTML5?",
    hi: "HTML5 में Video जोड़ने के लिए कौन-सा Tag है?",
    options: ["<media>", "<movie>", "<video>", "<embed-video>"],
    correct: 2,
    explanationEn: "<video src=\"...\" controls> plays video natively. <audio> does the same for sound.",
    explanationHi: "<video src=\"...\" controls> से Video चलता है। Audio के लिए <audio> Tag है।",
  },
  {
    en: "Which of the following is an inline element by default?",
    hi: "इनमें से कौन-सा Element Default रूप से Inline होता है?",
    options: ["<div>", "<p>", "<span>", "<section>"],
    correct: 2,
    explanationEn: "<span> stays within the line. <div>, <p> and <section> are block elements that start on a new line.",
    explanationHi: "<span> Line के अंदर ही रहता है। <div>, <p>, <section> Block Elements हैं जो नई Line से शुरू होते हैं।",
  },
  {
    en: "Which attribute makes a link open in a new browser tab?",
    hi: "किस Attribute से Link नए Browser Tab में खुलता है?",
    options: ["target=\"_blank\"", "target=\"_self\"", "rel=\"new\"", "href=\"_new\""],
    correct: 0,
    explanationEn: "target=\"_blank\" opens the link in a new tab; _self (the default) opens it in the same tab.",
    explanationHi: "target=\"_blank\" Link को नए Tab में खोलता है; _self (Default) उसी Tab में खोलता है।",
  },
];

const ALL: GenQuestion[] = QUESTIONS.map((q, i) => ({
  ...q,
  key: `${CODE}-${i + 1}`,
  subject: SECTION.subject,
  topic: "HTML Basics",
  difficulty: q.difficulty ?? "EASY",
}));

async function main() {
  const problems = ALL.flatMap((q) => validate(q).map((p) => `${q.key}: ${p}`));
  if (problems.length) throw new Error(problems.join("\n"));
  console.log(`${CODE}: ${ALL.length} questions OK`);
  if (process.argv.includes("--dry-run")) return;

  const db = getDb();
  const [exists] = await db.select({ id: exams.id }).from(exams).where(eq(exams.code, CODE));
  if (exists) {
    console.log(`${CODE} already exists, skipped`);
    return;
  }
  await db.insert(examCategories).values(CATEGORY).onConflictDoNothing({ target: examCategories.slug });
  const [category] = await db.select({ id: examCategories.id }).from(examCategories).where(eq(examCategories.slug, CATEGORY.slug));

  await db.transaction(async (tx) => {
    const [exam] = await tx
      .insert(exams)
      .values({
        code: CODE,
        examType: "OTHER",
        titleEn: "HTML Basics – Mock Test 01",
        titleHi: "HTML बेसिक्स – मॉक टेस्ट 01",
        instructionsEn: "15 questions, 15 minutes. 1 mark for each correct answer, no negative marking.",
        instructionsHi: "15 प्रश्न, 15 मिनट। प्रत्येक सही उत्तर पर 1 अंक, कोई नकारात्मक अंकन नहीं।",
        defaultDurationMinutes: 15,
        status: "READY",
        allowAnswerReview: true,
        slug: "html-basics-mock-01",
        descriptionEn: "15 HTML MCQs with explanations: document structure, headings, links, images, lists, tables, forms, semantic and media tags.",
        descriptionHi: "HTML के 15 महत्वपूर्ण MCQ, हर प्रश्न के साथ Explanation।",
        categoryId: category!.id,
        testKind: "TOPIC",
        isPublic: true,
        accessLevel: "FREE",
        timed: true,
      })
      .returning({ id: exams.id });
    const [section] = await tx
      .insert(examSections)
      .values({ examId: exam!.id, ...SECTION, position: 1 })
      .returning({ id: examSections.id });
    const qRows = await tx
      .insert(questions)
      .values(
        ALL.map((q, qi) => ({
          code: `${CODE}-${String(qi + 1).padStart(3, "0")}`,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          textEn: q.en,
          textHi: q.hi ?? null,
          explanationEn: q.explanationEn ?? null,
          explanationHi: q.explanationHi ?? null,
          source: "EdQity HTML Basics",
          license: "Original",
        })),
      )
      .returning({ id: questions.id });
    await tx.insert(questionOptions).values(
      ALL.flatMap((q, qi) =>
        q.options.map((o, oi) => ({ questionId: qRows[qi]!.id, position: oi + 1, textEn: o, textHi: q.optionsHi?.[oi] ?? null, isCorrect: oi === q.correct })),
      ),
    );
    await tx.insert(examSectionQuestions).values(qRows.map((row, qi) => ({ sectionId: section!.id, questionId: row.id, position: qi + 1 })));
    await audit(tx, { ...SYSTEM_ACTOR, label: "html-basics" }, "exam.create", { type: "exam", id: exam!.id }, { code: CODE });
  });
  console.log(`${CODE} created`);
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
