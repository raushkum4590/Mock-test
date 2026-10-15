/**
 * Create the Tally Prime Payroll mock test (15 MCQs, bilingual, with explanations).
 *
 *   npm run mock:tally [-- --dry-run]
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

const CODE = "TALLY-PAYROLL-01";
const CATEGORY = { slug: "tally-prime", nameEn: "Tally Prime", nameHi: "टैली प्राइम" };
const SECTION = { code: "PAYROLL", titleEn: "Tally Prime Payroll", titleHi: "टैली प्राइम पेरोल", subject: "Tally Prime", marksCorrect: 1, marksWrong: 0 };

type Q = Omit<GenQuestion, "key" | "subject" | "topic" | "difficulty"> & { difficulty?: GenQuestion["difficulty"] };

const QUESTIONS: Q[] = [
  {
    en: "What is the main purpose of Payroll?",
    hi: "Payroll का मुख्य उद्देश्य क्या है?",
    options: ["Stock Management", "Employee Salary Management", "GST Return Filing", "Sales Management"],
    optionsHi: ["Stock Management", "Employee Salary Management", "GST Return Filing", "Sales Management"],
    correct: 1,
    explanationEn: "Payroll manages employees' salary, attendance and deductions.",
    explanationHi: "Payroll का काम कर्मचारियों की Salary, Attendance और Deductions को manage करना है।",
  },
  {
    en: "What does Gross Salary mean?",
    hi: "Gross Salary का अर्थ क्या है?",
    options: ["Salary after deductions", "Only Basic Salary", "Total earnings before deductions", "Only Bonus"],
    optionsHi: ["कटौती के बाद Salary", "केवल Basic Salary", "कटौती से पहले कुल Earnings", "केवल Bonus"],
    correct: 2,
    explanationEn: "Gross Salary = Basic + HRA + DA + Allowances, before any deduction.",
    explanationHi: "Gross Salary = Basic + HRA + DA + Allowances आदि। इसमें कोई कटौती नहीं होती।",
  },
  {
    en: "How is Net Salary calculated?",
    hi: "Net Salary कैसे Calculate की जाती है?",
    options: ["Gross Salary + Deductions", "Gross Salary − Deductions", "Basic Salary − HRA", "Basic Salary + PF"],
    correct: 1,
    explanationEn: "Take-home salary = Gross Salary − (PF + ESI + TDS etc.).",
    explanationHi: "कर्मचारी के हाथ में आने वाली Salary = Gross Salary − (PF + ESI + TDS आदि)।",
  },
  {
    en: "Why is Payroll enabled in Tally Prime?",
    hi: "Tally Prime में Payroll Enable क्यों किया जाता है?",
    options: ["To activate Payroll features", "To delete the company", "To turn off GST", "To remove stock"],
    optionsHi: ["Payroll Features सक्रिय करने के लिए", "Company Delete करने के लिए", "GST बंद करने के लिए", "Stock हटाने के लिए"],
    correct: 0,
    explanationEn: "Only after setting Payroll to Yes in F11 (Features) do Employees, Pay Heads etc. appear.",
    explanationHi: "F11 (Features) में जाकर Payroll को \"Yes\" करने पर ही Employees, Pay Heads आदि दिखाई देते हैं।",
  },
  {
    en: "What is entered in the Employee Master?",
    hi: "Employee Master में क्या दर्ज किया जाता है?",
    options: ["Customer Details", "Employee Details", "Stock Details", "Vendor Invoice"],
    correct: 1,
    explanationEn: "Employee Master stores name, designation, joining date, PAN, bank details, PF number etc.",
    explanationHi: "Employee Master में Name, Designation, Joining Date, PAN, Bank Details, PF No. आदि भरे जाते हैं।",
  },
  {
    en: "What is a Pay Head used for?",
    hi: "Pay Head का उपयोग किसलिए होता है?",
    options: ["To define salary components", "For bank reconciliation", "For stock transfer", "For GST payment"],
    optionsHi: ["Salary Components निर्धारित करने के लिए", "Bank Reconciliation के लिए", "Stock Transfer के लिए", "GST Payment के लिए"],
    correct: 0,
    explanationEn: "Pay Heads are the salary components: Basic, HRA, PF, Bonus, Professional Tax etc.",
    explanationHi: "Pay Head से Salary के हिस्से बनते हैं, जैसे Basic, HRA, PF, Bonus, Professional Tax।",
  },
  {
    en: "Basic Salary is which type of Pay Head?",
    hi: "Basic Salary किस प्रकार का Pay Head है?",
    options: ["Deduction", "Earning", "Liability Payment Only", "Inventory"],
    correct: 1,
    explanationEn: "Basic Salary is what the employee earns, so it is an \"Earnings for Employees\" Pay Head.",
    explanationHi: "Basic Salary कर्मचारी की कमाई है, इसलिए यह \"Earnings for Employees\" वाला Pay Head है।",
  },
  {
    en: "Employee PF Contribution is which type of item?",
    hi: "Employee PF Contribution किस प्रकार की मद है?",
    options: ["Earning", "Deduction", "Sales", "Fixed Asset"],
    correct: 1,
    explanationEn: "The employee's share of PF is deducted from salary, so it is an \"Employees' Statutory Deductions\" Pay Head.",
    explanationHi: "Employee का PF हिस्सा Salary से काटा जाता है, इसलिए यह \"Employees' Statutory Deductions\" है।",
  },
  {
    en: "What is the Attendance Voucher used for?",
    hi: "Attendance Voucher का उपयोग किसलिए होता है?",
    options: ["To record attendance", "To record sales", "To deposit GST", "To purchase stock"],
    optionsHi: ["Attendance रिकॉर्ड करने के लिए", "Sales रिकॉर्ड करने के लिए", "GST जमा करने के लिए", "Stock खरीदने के लिए"],
    correct: 0,
    explanationEn: "The Attendance Voucher (Ctrl+F5) records present/absent days and OT hours.",
    explanationHi: "Attendance Voucher (Ctrl+F5) में Present/Absent days और OT hours दर्ज होते हैं।",
  },
  {
    en: "What does Overtime (OT) mean?",
    hi: "Overtime (OT) का अर्थ क्या है?",
    options: ["Absence", "Work beyond the fixed hours", "Salary deduction", "Annual leave"],
    optionsHi: ["अनुपस्थिति", "निर्धारित समय से अतिरिक्त काम", "Salary Deduction", "Annual Leave"],
    correct: 1,
    explanationEn: "Work done after normal working hours is overtime and is paid separately.",
    explanationHi: "Normal working hours के बाद किया गया काम Overtime कहलाता है, जिसका अलग भुगतान होता है।",
  },
  {
    en: "OT is 5 hours and the rate is ₹100 per hour. What is the OT amount?",
    hi: "OT 5 घंटे है और Rate ₹100 प्रति घंटा है। OT Amount कितना होगा?",
    options: ["₹100", "₹400", "₹500", "₹1,000"],
    correct: 2,
    explanationEn: "OT Amount = Hours × Rate = 5 × ₹100 = ₹500.",
    explanationHi: "OT Amount = Hours × Rate = 5 × ₹100 = ₹500",
  },
  {
    en: "What is the Payroll Voucher used for?",
    hi: "Payroll Voucher का उपयोग किसलिए होता है?",
    options: ["To record salary and payroll transactions", "Only to view stock", "To search a GSTIN", "To create a sales order"],
    optionsHi: ["Salary और Payroll Transactions दर्ज करने के लिए", "केवल Stock देखने के लिए", "GSTIN खोजने के लिए", "Sales Order बनाने के लिए"],
    correct: 0,
    explanationEn: "Salary is processed through the Payroll Voucher (Ctrl+F4), which applies earnings and deductions.",
    explanationHi: "Payroll Voucher (Ctrl+F4) से Salary Process होती है, यानी Earnings और Deductions apply होते हैं।",
  },
  {
    en: "Salary Expense is which type of account?",
    hi: "Salary Expense किस प्रकार का Account है?",
    options: ["Income", "Expense", "Fixed Asset", "Capital"],
    correct: 1,
    explanationEn: "Salary is an expense for the company and falls under the Indirect Expenses group.",
    explanationHi: "Company के लिए Salary एक खर्च है, इसलिए यह \"Indirect Expenses\" group में आता है।",
  },
  {
    en: "Salary is ₹30,000 and deductions are ₹3,000. What is the Net Salary?",
    hi: "Salary ₹30,000 और Deductions ₹3,000 हैं। Net Salary कितनी होगी?",
    options: ["₹27,000", "₹30,000", "₹33,000", "₹3,000"],
    correct: 0,
    explanationEn: "Net Salary = ₹30,000 − ₹3,000 = ₹27,000.",
    explanationHi: "Net Salary = ₹30,000 − ₹3,000 = ₹27,000",
  },
  {
    en: "What is the main use of Payroll Reports?",
    hi: "Payroll Reports का मुख्य उपयोग क्या है?",
    options: ["Analysing salary and employee cost", "Only filing GST returns", "Buying stock", "Receiving customer payments"],
    optionsHi: ["Salary और Employee Cost का विश्लेषण", "केवल GST Return भरना", "Stock खरीदना", "Customer Payment लेना"],
    correct: 0,
    explanationEn: "Pay Slip, Pay Sheet, Attendance Sheet and PF/ESI reports are used to analyse payroll.",
    explanationHi: "Pay Slip, Pay Sheet, Attendance Sheet और PF/ESI Reports से Payroll का विश्लेषण होता है।",
  },
];

const ALL: GenQuestion[] = QUESTIONS.map((q, i) => ({
  ...q,
  key: `${CODE}-${i + 1}`,
  subject: SECTION.subject,
  topic: "Payroll",
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
        titleEn: "Tally Prime Payroll – Mock Test 01",
        titleHi: "टैली प्राइम पेरोल – मॉक टेस्ट 01",
        instructionsEn: "15 questions, 15 minutes. 1 mark for each correct answer, no negative marking.",
        instructionsHi: "15 प्रश्न, 15 मिनट। प्रत्येक सही उत्तर पर 1 अंक, कोई नकारात्मक अंकन नहीं।",
        defaultDurationMinutes: 15,
        status: "READY",
        allowAnswerReview: true,
        slug: "tally-prime-payroll-mock-01",
        descriptionEn: "Top 15 Tally Prime Payroll MCQs with explanations: Pay Heads, Employee Master, Attendance and Payroll Vouchers, OT and Net Salary.",
        descriptionHi: "Tally Prime Payroll के 15 महत्वपूर्ण MCQ, हर प्रश्न के साथ Explanation।",
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
          source: "EdQity Tally Prime Payroll",
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
    await audit(tx, { ...SYSTEM_ACTOR, label: "tally-payroll" }, "exam.create", { type: "exam", id: exam!.id }, { code: CODE });
  });
  console.log(`${CODE} created`);
}

main()
  .catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
