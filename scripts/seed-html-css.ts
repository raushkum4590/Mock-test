/**
 * Create the HTML & CSS mock test (20 MCQs in two sections, bilingual, with explanations).
 * It sits in the web-development category, so guests can take it with just a name.
 *
 *   npm run mock:html-css [-- --dry-run]
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

const CODE = "HTML-CSS-01";
const CATEGORY = { slug: "web-development", nameEn: "Web Development", nameHi: "वेब डेवलपमेंट" };

type Q = Omit<GenQuestion, "key" | "subject" | "topic" | "difficulty"> & { difficulty?: GenQuestion["difficulty"] };

const HTML: Q[] = [
  {
    en: "Which element holds metadata such as the page title and linked stylesheets?",
    hi: "Page Title और Linked Stylesheets जैसा Metadata किस Element में रहता है?",
    options: ["<body>", "<head>", "<header>", "<meta>"],
    correct: 1,
    explanationEn: "<head> contains <title>, <meta>, <link> and <style>. <header> is a visible page section inside <body>.",
    explanationHi: "<head> में <title>, <meta>, <link> और <style> रहते हैं। <header> तो <body> के अंदर दिखने वाला भाग है।",
  },
  {
    en: "Which tag correctly links an external CSS file?",
    hi: "External CSS File को सही तरीके से कौन-सा Tag जोड़ता है?",
    options: ["<link rel=\"stylesheet\" href=\"style.css\">", "<style src=\"style.css\">", "<css href=\"style.css\">", "<script href=\"style.css\">"],
    correct: 0,
    explanationEn: "<link rel=\"stylesheet\" href=\"...\"> inside <head> loads an external stylesheet. <style> is for CSS written in the page itself.",
    explanationHi: "<head> में <link rel=\"stylesheet\" href=\"...\"> External Stylesheet Load करता है। <style> Page के अंदर लिखी CSS के लिए है।",
  },
  {
    en: "Which tag marks text as strongly important (usually shown in bold)?",
    hi: "कौन-सा Tag Text को अत्यधिक महत्वपूर्ण बताता है (आमतौर पर Bold दिखता है)?",
    options: ["<b>", "<em>", "<mark>", "<strong>"],
    correct: 3,
    explanationEn: "<strong> carries meaning (importance) and is bold by default; <b> is bold with no extra meaning; <em> means emphasis (italic).",
    explanationHi: "<strong> महत्व का अर्थ देता है और Default रूप से Bold होता है; <b> केवल Bold है; <em> Emphasis (Italic) है।",
  },
  {
    en: "Which attribute value must be unique within a single HTML page?",
    hi: "किस Attribute का मान पूरे HTML Page में Unique होना चाहिए?",
    options: ["class", "name", "id", "style"],
    correct: 2,
    explanationEn: "An id identifies exactly one element. A class can be shared by many elements.",
    explanationHi: "id केवल एक Element को पहचानता है। class कई Elements में एक साथ उपयोग हो सकती है।",
  },
  {
    en: "Which element creates a drop-down list in a form?",
    hi: "Form में Drop-down List कौन-सा Element बनाता है?",
    options: ["<select>", "<list>", "<dropdown>", "<input type=\"list\">"],
    correct: 0,
    explanationEn: "<select> holds <option> elements and renders as a drop-down list.",
    explanationHi: "<select> के अंदर <option> Elements होते हैं और यह Drop-down List के रूप में दिखता है।",
  },
  {
    en: "Which element is used for a multi-line text input?",
    hi: "कई Lines का Text Input लेने के लिए कौन-सा Element है?",
    options: ["<input type=\"text\">", "<textarea>", "<input type=\"multiline\">", "<textbox>"],
    correct: 1,
    explanationEn: "<textarea> accepts multiple lines; its size can be set with rows and cols.",
    explanationHi: "<textarea> कई Lines का Text लेता है; इसका आकार rows और cols से तय होता है।",
  },
  {
    en: "Which attribute stops a form from being submitted while a field is empty?",
    hi: "कौन-सा Attribute Field खाली होने पर Form को Submit होने से रोकता है?",
    options: ["validate", "mandatory", "checked", "required"],
    correct: 3,
    explanationEn: "required is a built-in HTML5 validation attribute; the browser blocks submission until the field is filled.",
    explanationHi: "required HTML5 का Built-in Validation Attribute है; Field भरे बिना Browser Form Submit नहीं होने देता।",
  },
  {
    en: "Clicking which element's text moves focus to its connected input field?",
    hi: "किस Element के Text पर Click करने से उससे जुड़े Input Field पर Focus चला जाता है?",
    options: ["<legend>", "<span>", "<label>", "<caption>"],
    correct: 2,
    explanationEn: "<label for=\"email\"> is tied to the input with id=\"email\"; clicking the label focuses the input and helps screen readers.",
    explanationHi: "<label for=\"email\"> उस Input से जुड़ता है जिसका id=\"email\" है; Label पर Click करने से Input पर Focus आता है।",
  },
  {
    en: "Which semantic element is meant for a block of navigation links?",
    hi: "Navigation Links के समूह के लिए कौन-सा Semantic Element है?",
    options: ["<nav>", "<menu-bar>", "<links>", "<aside>"],
    correct: 0,
    explanationEn: "<nav> marks the main navigation. <aside> is for side content related to the page.",
    explanationHi: "<nav> मुख्य Navigation के लिए है। <aside> Page से जुड़ी साइड सामग्री के लिए है।",
  },
  {
    en: "What is the correct way to write a comment in HTML?",
    hi: "HTML में Comment लिखने का सही तरीका क्या है?",
    options: ["// comment", "<!-- comment -->", "/* comment */", "# comment"],
    correct: 1,
    explanationEn: "HTML comments are written as <!-- ... -->. /* ... */ is a CSS comment and // is used in JavaScript.",
    explanationHi: "HTML Comment <!-- ... --> से लिखा जाता है। /* ... */ CSS Comment है और // JavaScript में उपयोग होता है।",
  },
];

const CSS: Q[] = [
  {
    en: "What does CSS stand for?",
    hi: "CSS का पूरा नाम क्या है?",
    options: ["Computer Style Sheets", "Creative Style System", "Colorful Style Sheets", "Cascading Style Sheets"],
    correct: 3,
    explanationEn: "CSS = Cascading Style Sheets. \"Cascading\" means several rules can apply and are resolved by priority.",
    explanationHi: "CSS = Cascading Style Sheets। \"Cascading\" का अर्थ है कई Rules लागू हो सकते हैं और प्राथमिकता से तय होते हैं।",
  },
  {
    en: "Which selector targets the element with id=\"menu\"?",
    hi: "id=\"menu\" वाले Element को कौन-सा Selector चुनता है?",
    options: [".menu", "menu", "#menu", "*menu"],
    correct: 2,
    explanationEn: "# selects by id, . selects by class, and a bare name such as p selects by tag.",
    explanationHi: "# id से चुनता है, . class से चुनता है, और केवल नाम (जैसे p) Tag से चुनता है।",
  },
  {
    en: "Which property changes the text colour of an element?",
    hi: "Element के Text का रंग कौन-सी Property बदलती है?",
    options: ["color", "font-color", "text-color", "background-color"],
    correct: 0,
    explanationEn: "color sets the text colour; background-color sets the colour behind the content.",
    explanationHi: "color Text का रंग तय करती है; background-color Content के पीछे का रंग तय करती है।",
  },
  {
    en: "In the CSS box model, which area lies between the content and the border?",
    hi: "CSS Box Model में Content और Border के बीच कौन-सा भाग होता है?",
    options: ["margin", "padding", "outline", "spacing"],
    correct: 1,
    explanationEn: "From inside out: content → padding → border → margin. Margin is the space outside the border.",
    explanationHi: "अंदर से बाहर: content → padding → border → margin। Margin Border के बाहर की जगह है।",
  },
  {
    en: "Which style source wins when the same property is set in several places with equal importance?",
    hi: "एक ही Property कई जगह समान महत्व के साथ दी हो तो किसकी Style लागू होती है?",
    options: ["External stylesheet", "Internal <style> block", "Browser default", "Inline style attribute"],
    correct: 3,
    explanationEn: "An inline style=\"...\" has the highest specificity; only !important can override it.",
    explanationHi: "Inline style=\"...\" की Specificity सबसे अधिक होती है; केवल !important ही इसे Override कर सकता है।",
  },
  {
    en: "Which display value turns an element into a flex container?",
    hi: "कौन-सी display Value किसी Element को Flex Container बनाती है?",
    options: ["display: block", "display: inline", "display: flex", "display: grid-flex"],
    correct: 2,
    explanationEn: "display: flex lays out the element's children in a row or column; justify-content and align-items then align them.",
    explanationHi: "display: flex अपने Child Elements को Row या Column में रखता है; justify-content और align-items से Alignment होता है।",
  },
  {
    en: "Which position value fixes an element relative to the browser window, even while scrolling?",
    hi: "कौन-सी position Value Element को Browser Window के सापेक्ष स्थिर रखती है, Scroll करने पर भी?",
    options: ["fixed", "absolute", "relative", "static"],
    correct: 0,
    explanationEn: "position: fixed stays put in the viewport. absolute is placed relative to the nearest positioned ancestor and scrolls with the page.",
    explanationHi: "position: fixed Viewport में एक ही जगह रहता है। absolute निकटतम Positioned Parent के सापेक्ष होता है और Page के साथ Scroll होता है।",
  },
  {
    en: "Which CSS feature applies styles only when the screen matches a condition, such as a maximum width?",
    hi: "कौन-सी CSS सुविधा Style तभी लागू करती है जब Screen किसी शर्त (जैसे अधिकतम चौड़ाई) से मेल खाए?",
    options: ["@import", "@media", "@font-face", "@keyframes"],
    correct: 1,
    explanationEn: "@media (max-width: 600px) { ... } is a media query, the basis of responsive design.",
    explanationHi: "@media (max-width: 600px) { ... } एक Media Query है, जो Responsive Design का आधार है।",
  },
  {
    en: "Which property makes text bold?",
    hi: "Text को Bold कौन-सी Property बनाती है?",
    options: ["text-style: bold", "font-style: bold", "text-weight: bold", "font-weight: bold"],
    correct: 3,
    explanationEn: "font-weight: bold (or 700). font-style is for italic, and text-style / text-weight are not CSS properties.",
    explanationHi: "font-weight: bold (या 700)। font-style Italic के लिए है, और text-style / text-weight CSS Properties नहीं हैं।",
  },
  {
    en: "Which unit is relative to the font size of the root (<html>) element?",
    hi: "कौन-सी Unit Root (<html>) Element के Font Size के सापेक्ष होती है?",
    options: ["px", "em", "rem", "vh"],
    correct: 2,
    explanationEn: "rem = root em. em is relative to the parent's font size, px is absolute, and vh is 1% of the viewport height.",
    explanationHi: "rem = root em। em Parent के Font Size के सापेक्ष है, px Absolute है, और vh Viewport की ऊँचाई का 1% है।",
  },
];

const SECTIONS = [
  { code: "HTML", titleEn: "HTML", titleHi: "HTML", subject: "HTML", topic: "HTML", items: HTML },
  { code: "CSS", titleEn: "CSS", titleHi: "CSS", subject: "CSS", topic: "CSS", items: CSS },
];

const BY_SECTION = SECTIONS.map((s) => ({
  ...s,
  questions: s.items.map(
    (q, i): GenQuestion => ({ ...q, key: `${CODE}-${s.code}-${i + 1}`, subject: s.subject, topic: s.topic, difficulty: q.difficulty ?? "EASY" }),
  ),
}));
const ALL = BY_SECTION.flatMap((s) => s.questions);

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
        titleEn: "HTML & CSS – Mock Test 01",
        titleHi: "HTML और CSS – मॉक टेस्ट 01",
        instructionsEn: "20 questions in two sections (HTML, CSS), 20 minutes. 1 mark for each correct answer, no negative marking.",
        instructionsHi: "दो Sections (HTML, CSS) में 20 प्रश्न, 20 मिनट। प्रत्येक सही उत्तर पर 1 अंक, कोई नकारात्मक अंकन नहीं।",
        defaultDurationMinutes: 20,
        status: "READY",
        allowAnswerReview: true,
        slug: "html-css-mock-01",
        descriptionEn: "20 MCQs with explanations: HTML document structure, forms and semantic tags; CSS selectors, box model, cascade, flexbox, positioning, media queries and units.",
        descriptionHi: "HTML और CSS के 20 महत्वपूर्ण MCQ, हर प्रश्न के साथ Explanation।",
        categoryId: category!.id,
        testKind: "TOPIC",
        isPublic: true,
        accessLevel: "FREE",
        timed: true,
      })
      .returning({ id: exams.id });

    let code = 0;
    for (const [si, s] of BY_SECTION.entries()) {
      const [section] = await tx
        .insert(examSections)
        .values({ examId: exam!.id, code: s.code, titleEn: s.titleEn, titleHi: s.titleHi, subject: s.subject, marksCorrect: 1, marksWrong: 0, position: si + 1 })
        .returning({ id: examSections.id });
      const qRows = await tx
        .insert(questions)
        .values(
          s.questions.map((q) => ({
            code: `${CODE}-${String(++code).padStart(3, "0")}`,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            textEn: q.en,
            textHi: q.hi ?? null,
            explanationEn: q.explanationEn ?? null,
            explanationHi: q.explanationHi ?? null,
            source: "EdQity HTML & CSS",
            license: "Original",
          })),
        )
        .returning({ id: questions.id });
      await tx.insert(questionOptions).values(
        s.questions.flatMap((q, qi) =>
          q.options.map((o, oi) => ({ questionId: qRows[qi]!.id, position: oi + 1, textEn: o, textHi: q.optionsHi?.[oi] ?? null, isCorrect: oi === q.correct })),
        ),
      );
      await tx.insert(examSectionQuestions).values(qRows.map((row, qi) => ({ sectionId: section!.id, questionId: row.id, position: qi + 1 })));
    }
    await audit(tx, { ...SYSTEM_ACTOR, label: "html-css" }, "exam.create", { type: "exam", id: exam!.id }, { code: CODE });
  });
  console.log(`${CODE} created`);
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
