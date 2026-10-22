/**
 * Create the Tally Prime Cost Centre mock test (10 MCQs, bilingual, with explanations).
 *
 *   npm run mock:tally-cost-centre [-- --dry-run]
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

const CODE = "TALLY-COSTCENTRE-01";
const CATEGORY = { slug: "tally-prime", nameEn: "Tally Prime", nameHi: "टैली प्राइम" };
const SECTION = { code: "COSTCENTRE", titleEn: "Tally Prime Cost Centre", titleHi: "टैली प्राइम कॉस्ट सेंटर", subject: "Tally Prime", marksCorrect: 1, marksWrong: 0 };

type Q = Omit<GenQuestion, "key" | "subject" | "topic" | "difficulty"> & { difficulty?: GenQuestion["difficulty"] };

const QUESTIONS: Q[] = [
  {
    en: "What is the main purpose of a Cost Centre in Tally Prime?",
    hi: "Tally Prime में Cost Centre का मुख्य उद्देश्य क्या है?",
    options: ["Filing GST Returns", "Analysing expenses and income by department or project", "Printing invoices", "Creating stock"],
    optionsHi: ["GST Return भरना", "विभाग या प्रोजेक्ट के अनुसार खर्चों और आय का विश्लेषण करना", "Invoice Print करना", "Stock बनाना"],
    correct: 1,
    explanationEn: "A Cost Centre is a unit (department, project, branch) to which income and expenses are allocated so they can be analysed separately.",
    explanationHi: "Cost Centre एक इकाई (Department, Project, Branch) है जिसमें आय और खर्च Allocate किए जाते हैं ताकि उनका अलग-अलग विश्लेषण हो सके।",
  },
  {
    en: "Which option is used to create a Cost Centre in Tally Prime?",
    hi: "Tally Prime में Cost Centre बनाने के लिए किस विकल्प का उपयोग किया जाता है?",
    options: ["Create Cost Centre", "Create Stock Item", "Create Godown", "Create Voucher"],
    correct: 0,
    explanationEn: "Gateway of Tally → Create → Cost Centre (or Alt+G → Create Master → Cost Centre).",
    explanationHi: "Gateway of Tally → Create → Cost Centre (या Alt+G → Create Master → Cost Centre)।",
  },
  {
    en: "What is the main purpose of a Cost Centre Group?",
    hi: "Cost Centre Group का मुख्य उद्देश्य क्या है?",
    options: ["Organising Cost Centres into groups", "Setting the GST rate", "Changing the stock price", "Deleting a ledger"],
    optionsHi: ["Cost Centres को समूह में व्यवस्थित करना", "GST Rate निर्धारित करना", "Stock की कीमत बदलना", "Ledger Delete करना"],
    correct: 0,
    explanationEn: "A Cost Centre can be placed \"Under\" another (primary) Cost Centre, building a group hierarchy whose totals roll up.",
    explanationHi: "किसी Cost Centre को दूसरे (Primary) Cost Centre के \"Under\" रखकर समूह बनाया जाता है, जिससे Totals ऊपर तक जुड़ते हैं।",
  },
  {
    en: "Which of the following is an example of a Cost Centre Group?",
    hi: "निम्नलिखित में से Cost Centre Group का उदाहरण कौन-सा है?",
    options: ["Departments", "GSTIN", "Invoice Number", "Bank Statement"],
    correct: 0,
    explanationEn: "\"Departments\" can be a group holding Sales, Production, Admin etc. as individual Cost Centres.",
    explanationHi: "\"Departments\" एक Group हो सकता है जिसके अंदर Sales, Production, Admin आदि Cost Centres होते हैं।",
  },
  {
    en: "What is the main purpose of a Cost Category?",
    hi: "Cost Category का मुख्य उद्देश्य क्या है?",
    options: ["Analysing expenses on different bases", "Filing GST", "Buying stock", "Creating a bank account"],
    optionsHi: ["खर्चों का अलग-अलग आधार पर विश्लेषण करना", "GST भरना", "Stock खरीदना", "Bank Account बनाना"],
    correct: 0,
    explanationEn: "Cost Categories let the same expense be analysed on parallel bases, e.g. by Department and by Project at the same time.",
    explanationHi: "Cost Category से एक ही खर्च का समानांतर आधारों पर विश्लेषण होता है, जैसे एक साथ Department-wise और Project-wise।",
  },
  {
    en: "A company wants to track expenses department-wise and project-wise. Which feature will be useful?",
    hi: "एक कंपनी खर्च को Department-wise और Project-wise ट्रैक करना चाहती है। किस सुविधा का उपयोग उपयोगी होगा?",
    options: ["Cost Category and Cost Centres", "Only Stock Group", "Only Ledger Group", "Only Voucher Class"],
    optionsHi: ["Cost Category और Cost Centres", "केवल Stock Group", "केवल Ledger Group", "केवल Voucher Class"],
    correct: 0,
    explanationEn: "Create two Cost Categories (Department, Project), each with its own Cost Centres, and allocate every expense in both.",
    explanationHi: "दो Cost Categories (Department, Project) बनाएं, हर एक में अपने Cost Centres हों, और हर खर्च दोनों में Allocate करें।",
  },
  {
    en: "Which of the following is an example of a Cost Centre?",
    hi: "निम्नलिखित में से Cost Centre का उदाहरण कौन-सा है?",
    options: ["Sales Department", "Sundry Debtors", "CGST", "Purchase Ledger"],
    correct: 0,
    explanationEn: "Sales Department is a unit of the business; the others are ledgers or groups, not Cost Centres.",
    explanationHi: "Sales Department व्यवसाय की एक इकाई है; बाकी सभी Ledger या Group हैं, Cost Centre नहीं।",
  },
  {
    en: "What must be done in Tally Prime to use the Cost Centre feature?",
    hi: "Cost Centre सुविधा का उपयोग करने के लिए Tally Prime में क्या करना आवश्यक है?",
    options: ["Enable Cost Centres", "Turn off GST", "Remove stock", "Close the company"],
    optionsHi: ["Cost Centres को Enable करना", "GST बंद करना", "Stock हटाना", "Company बंद करना"],
    correct: 0,
    explanationEn: "F11 (Company Features) → Accounting → set \"Enable Cost Centres\" to Yes.",
    explanationHi: "F11 (Company Features) → Accounting → \"Enable Cost Centres\" को Yes करें।",
  },
  {
    en: "Which report is useful for analysing expenses by Cost Centre?",
    hi: "Cost Centre के अनुसार खर्चों का विश्लेषण करने के लिए कौन-सी रिपोर्ट उपयोगी है?",
    options: ["Cost Centre Reports", "Stock Summary", "Day Book", "Bank Reconciliation"],
    correct: 0,
    explanationEn: "Display More Reports → Statements of Accounts → Cost Centres shows Category Summary, Cost Centre Break-up etc.",
    explanationHi: "Display More Reports → Statements of Accounts → Cost Centres में Category Summary, Cost Centre Break-up आदि मिलते हैं।",
  },
  {
    en: "When is Cost Centre allocation usually done?",
    hi: "Cost Centre Allocation सामान्यतः कब किया जाता है?",
    options: ["While making the related voucher entry", "Only while creating the company", "During GST registration", "While creating a stock item"],
    optionsHi: ["संबंधित Voucher Entry करते समय", "केवल Company बनाते समय", "GST Registration करते समय", "Stock Item बनाते समय"],
    correct: 0,
    explanationEn: "When a ledger with cost centres applicable is used in a voucher, the allocation screen opens to split the amount across Cost Centres.",
    explanationHi: "Voucher में Cost Centre Applicable Ledger चुनने पर Allocation Screen खुलती है, जहाँ Amount को Cost Centres में बाँटा जाता है।",
  },
];

const ALL: GenQuestion[] = QUESTIONS.map((q, i) => ({
  ...q,
  key: `${CODE}-${i + 1}`,
  subject: SECTION.subject,
  topic: "Cost Centre",
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
        titleEn: "Tally Prime Cost Centre – Mock Test 01",
        titleHi: "टैली प्राइम कॉस्ट सेंटर – मॉक टेस्ट 01",
        instructionsEn: "10 questions, 10 minutes. 1 mark for each correct answer, no negative marking.",
        instructionsHi: "10 प्रश्न, 10 मिनट। प्रत्येक सही उत्तर पर 1 अंक, कोई नकारात्मक अंकन नहीं।",
        defaultDurationMinutes: 10,
        status: "READY",
        allowAnswerReview: true,
        slug: "tally-prime-cost-centre-mock-01",
        descriptionEn: "10 Tally Prime Cost Centre MCQs with explanations: Cost Centres, Groups, Cost Categories, allocation and reports.",
        descriptionHi: "Tally Prime Cost Centre के 10 महत्वपूर्ण MCQ, हर प्रश्न के साथ Explanation।",
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
          source: "EdQity Tally Prime Cost Centre",
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
    await audit(tx, { ...SYSTEM_ACTOR, label: "tally-cost-centre" }, "exam.create", { type: "exam", id: exam!.id }, { code: CODE });
  });
  console.log(`${CODE} created`);
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
