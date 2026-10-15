import type { LearnModule } from "../types";
import { AGRI_INDUSTRY } from "./e-extra";

export const E03_PUBLIC_FINANCE: LearnModule = {
  id: "public-finance",
  title: "Budget, taxes, GST, agriculture & industry",
  titleHi: "बजट, कर, जीएसटी, कृषि एवं उद्योग",
  blurb: "How the government earns and spends, what the different deficits mean, how taxes and GST work, and how it supports farmers and industry.",
  lessons: [
    {
      id: "budget-deficits",
      title: "The Union Budget & deficits",
      oneLine: "The Budget is the government's yearly plan of income and spending; when it spends more than it earns, the gap is a deficit.",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Your family budget vs the government's.** Your family earns a salary (income), pays rent and food (regular spending) and maybe buys a house (an asset). The government does the same on a huge scale. Its yearly plan is the **Union Budget** — in the Constitution, the **Annual Financial Statement (Article 112)**, presented on **1 February** by the **Finance Minister**. The financial year runs **1 April – 31 March**." },
        {
          t: "table",
          head: ["Part", "Revenue (does not create/reduce assets)", "Capital (creates assets or liabilities)"],
          rows: [
            ["Receipts", "Taxes, fees, dividends from PSUs, interest received", "Borrowing, loan recoveries, disinvestment (selling PSU shares)"],
            ["Expenditure", "Salaries, pensions, interest payments, subsidies", "Building roads, dams, buying machines, giving loans"],
          ],
        },
        {
          t: "formula",
          items: [
            ["Revenue deficit", "Revenue expenditure − revenue receipts"],
            ["Fiscal deficit (most important)", "Total expenditure − total receipts EXCLUDING borrowings = how much the government must borrow"],
            ["Primary deficit", "Fiscal deficit − interest payments"],
            ["Effective revenue deficit", "Revenue deficit − grants for creating capital assets"],
          ],
        },
        { t: "example", title: "Find the primary deficit", steps: ["Suppose fiscal deficit = ₹16 lakh crore.", "Interest payments on old loans = ₹12 lakh crore.", "Primary deficit = 16 − 12 = ₹4 lakh crore.", "Meaning: only ₹4 lakh crore of new borrowing is for this year's own needs — the rest goes to pay interest on past loans."], answer: "Primary deficit = fiscal deficit − interest payments" },
        { t: "p", text: "**FRBM Act (2003)** — Fiscal Responsibility and Budget Management Act — sets targets to keep the fiscal deficit under control. **Other budget words:** **Vote on account** — temporary permission to spend before the full budget passes; **Outcome budget** — links spending to results; **Gender budget** — spending for women; **Zero-based budgeting** — every expense is justified from zero. From **2017**, the **Railway Budget was merged** into the Union Budget and the budget date moved to 1 February." },
        { t: "trap", text: "Fiscal deficit EXCLUDES borrowings from receipts (that's why it shows the borrowing need). Primary deficit = fiscal deficit minus INTEREST, not minus revenue deficit." },
        {
          t: "recap",
          items: [
            "Budget = Annual Financial Statement (Art 112), 1 February; FY 1 April–31 March",
            "Revenue vs capital receipts/expenditure",
            "Fiscal deficit = borrowing need; primary = fiscal − interest; revenue = rev. exp − rev. receipts",
            "FRBM Act 2003; Rail budget merged 2017",
          ],
        },
      ],
      quiz: [
        { q: "Primary deficit equals:", options: ["Fiscal deficit − interest payments", "Revenue deficit − interest", "Fiscal deficit + interest", "Total expenditure − tax revenue"], answer: 0, explain: "It removes the burden of past interest." },
        { q: "Which of these is a capital receipt?", options: ["Income tax", "GST", "Disinvestment", "Dividend from a PSU"], answer: 2, explain: "Selling PSU shares reduces the government's assets." },
        { q: "The FRBM Act was passed in:", options: ["1991", "2000", "2003", "2017"], answer: 2, explain: "Fiscal Responsibility and Budget Management Act, 2003." },
      ],
    },
    {
      id: "taxes-gst",
      title: "Taxes, GST & the Finance Commission",
      oneLine: "Direct taxes are paid by the person who bears them (income tax); indirect taxes are passed on to the buyer (GST) — and GST made India “one nation, one tax”.",
      minutes: 16,
      blocks: [
        {
          t: "table",
          head: ["Direct tax", "Indirect tax"],
          rows: [
            ["Paid directly to the government by the person/company who bears it", "Collected by the seller and passed on to the buyer in the price"],
            ["Income tax, corporation tax", "GST, customs duty, excise on petrol/liquor"],
            ["Usually PROGRESSIVE — richer people pay a higher rate", "Usually REGRESSIVE — rich and poor pay the same rate on the same item"],
          ],
        },
        { t: "p", text: "**GST (Goods and Services Tax)** came into force on **1 July 2017** through the **101st Constitutional Amendment (2016)**. It replaced many taxes (central excise, service tax, VAT, entry tax…) with one tax collected at every stage, with credit for tax already paid (**input tax credit**) — so tax is not charged on tax. It is a **destination-based** tax: the state where goods are consumed gets the tax." },
        {
          t: "table",
          head: ["GST part", "Collected by"],
          rows: [
            ["CGST", "Centre (sale within a state)"],
            ["SGST / UTGST", "State / Union Territory (sale within a state)"],
            ["IGST", "Centre, then shared — on sales BETWEEN states and on imports"],
          ],
        },
        { t: "p", text: "**GST Council (Article 279A)** decides rates; its chairperson is the **Union Finance Minister**, and state finance ministers are members. Decisions need a **three-fourths majority** of weighted votes (Centre ⅓, all states ⅔). **GST rates:** from **22 September 2025** (“next-gen GST”), most goods fall in two main slabs — **5% and 18%** — with a special **40%** rate for luxury and “sin” goods, replacing the old 5/12/18/28 structure. Petrol, diesel and alcohol for drinking are still outside GST." },
        { t: "p", text: "**Finance Commission (Article 280)** — appointed every 5 years to recommend how the **divisible pool of central taxes** is shared with states (**vertical** sharing) and among states (**horizontal** sharing). The 15th FC (chair **N. K. Singh**) gave states **41%**. The **16th Finance Commission** (chair **Arvind Panagariya**) covers **2026–31**." },
        { t: "trap", text: "The GST Council is chaired by the Union FINANCE MINISTER, not the Prime Minister. GST came on 1 July 2017, but the amendment (101st) was passed in 2016." },
        {
          t: "recap",
          items: [
            "Direct (income tax) = progressive; indirect (GST) = regressive",
            "GST: 1 July 2017, 101st Amendment, destination-based, input tax credit",
            "CGST + SGST within a state; IGST between states",
            "GST Council Art 279A, chaired by Union FM, ¾ majority; slabs 5% & 18% (+40%) from 22 Sept 2025",
            "Finance Commission Art 280; 15th N. K. Singh (41%); 16th Arvind Panagariya (2026–31)",
          ],
        },
      ],
      quiz: [
        { q: "GST was introduced through the:", options: ["99th Amendment", "100th Amendment", "101st Amendment", "103rd Amendment"], answer: 2, explain: "Passed in 2016; GST started on 1 July 2017." },
        { q: "The GST Council is chaired by the:", options: ["Prime Minister", "Union Finance Minister", "RBI Governor", "President"], answer: 1, explain: "State finance ministers are members." },
        { q: "Which of these is a direct tax?", options: ["GST", "Customs duty", "Income tax", "Excise duty"], answer: 2, explain: "Paid by the person who bears it." },
      ],
    },
    AGRI_INDUSTRY,
  ],
};
