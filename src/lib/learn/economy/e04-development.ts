import type { LearnModule } from "../types";
import { REPORTS_ORGS } from "./e-extra";

export const E04_DEVELOPMENT: LearnModule = {
  id: "development",
  title: "Planning, reforms, trade, schemes & Bihar's economy",
  titleHi: "योजना, सुधार, व्यापार, योजनाएँ एवं बिहार की अर्थव्यवस्था",
  blurb: "Five-Year Plans to NITI Aayog, the 1991 reforms, the external sector, poverty and welfare schemes, and the economy of Bihar.",
  lessons: [
    {
      id: "planning-reforms",
      title: "Five-Year Plans & the 1991 reforms",
      oneLine: "After independence India planned its growth in Five-Year Plans; in 1991 a crisis pushed it to open up — Liberalisation, Privatisation, Globalisation (LPG).",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Why plan?** In 1947 India was poor, with little industry. Inspired by the USSR, India set up the **Planning Commission (15 March 1950)** with the **Prime Minister as chairman**, and made **Five-Year Plans** from 1951 to 2017." },
        {
          t: "table",
          head: ["Plan", "Years", "Focus / remember"],
          rows: [
            ["1st", "1951–56", "Agriculture, irrigation; Harrod–Domar model; successful"],
            ["2nd", "1956–61", "Heavy industry; P. C. Mahalanobis model; Bhilai, Rourkela, Durgapur steel plants"],
            ["3rd", "1961–66", "Self-reliance; failed due to the 1962 & 1965 wars and drought"],
            ["Plan holiday", "1966–69", "Three annual plans; Green Revolution begins"],
            ["5th", "1974–79", "“Garibi Hatao” (remove poverty)"],
            ["8th", "1992–97", "After 1991 reforms; human development"],
            ["12th (last)", "2012–17", "Faster, more inclusive and sustainable growth"],
          ],
        },
        { t: "p", text: "**NITI Aayog** (National Institution for Transforming India) replaced the Planning Commission on **1 January 2015**. It is a **think tank** (it gives advice, not money) — chaired by the **Prime Minister**; the first Vice-Chairman was **Arvind Panagariya**. It follows “cooperative federalism” — all Chief Ministers sit in its Governing Council." },
        { t: "p", text: "**The 1991 crisis.** In 1991 India had foreign-exchange reserves enough for only about **two weeks of imports** and had to pledge gold. PM **P. V. Narasimha Rao** and Finance Minister **Dr Manmohan Singh** launched the **New Economic Policy (LPG):**" },
        {
          t: "table",
          head: ["L-P-G", "What changed"],
          rows: [
            ["Liberalisation", "Ended most industrial licensing (“licence raj”); fewer controls"],
            ["Privatisation", "Reduced the public sector's role; disinvestment of PSUs"],
            ["Globalisation", "Lower import duties, more foreign investment (FDI), rupee made convertible on the current account"],
          ],
        },
        { t: "trap", text: "NITI Aayog does NOT allocate funds to states (the Planning Commission did). The 2nd Plan used the Mahalanobis model; the 1st used Harrod–Domar." },
        {
          t: "recap",
          items: [
            "Planning Commission 15 March 1950; 12 Plans, 1951–2017",
            "1st agriculture (Harrod–Domar); 2nd heavy industry (Mahalanobis); 5th Garibi Hatao",
            "NITI Aayog 1 Jan 2015 — think tank, PM chair",
            "1991: BoP crisis → LPG reforms (Rao & Manmohan Singh)",
          ],
        },
      ],
      quiz: [
        { q: "The 2nd Five-Year Plan was based on the model of:", options: ["Harrod–Domar", "P. C. Mahalanobis", "Gandhian", "Lewis"], answer: 1, explain: "Focus on heavy industry." },
        { q: "NITI Aayog replaced the Planning Commission in:", options: ["2012", "2014", "2015", "2017"], answer: 2, explain: "1 January 2015." },
        { q: "The 1991 reforms were introduced when the Finance Minister was:", options: ["Yashwant Sinha", "P. Chidambaram", "Pranab Mukherjee", "Manmohan Singh"], answer: 3, explain: "Under PM P. V. Narasimha Rao." },
      ],
    },
    {
      id: "external-sector",
      title: "Trade, balance of payments & world institutions",
      oneLine: "The balance of payments is India's account with the rest of the world — money coming in versus money going out.",
      minutes: 14,
      blocks: [
        {
          t: "table",
          head: ["Account", "Includes"],
          rows: [
            ["Current account", "Trade in goods (exports/imports) + services (IT, tourism) + remittances (money sent home by Indians abroad) + interest/dividends"],
            ["Capital account", "Investment and loans — FDI, FPI, external borrowing"],
          ],
        },
        { t: "p", text: "**Trade deficit** = imports of goods > exports of goods (India usually has one — crude oil and gold are big imports). **India is the world's largest receiver of remittances.** **FDI** (Foreign Direct Investment) = buying a lasting stake/control in a company — stable. **FPI** (Foreign Portfolio Investment) = buying shares/bonds for returns — “hot money”, can leave quickly." },
        { t: "p", text: "**Exchange rate.** When ₹1 buys fewer dollars, the rupee has **depreciated** (by market forces) — exports become cheaper for foreigners, imports dearer. When a government deliberately lowers the value, it is **devaluation** (India devalued in 1966 and 1991)." },
        {
          t: "table",
          head: ["Institution", "Remember"],
          rows: [
            ["IMF & World Bank", "Created at the Bretton Woods conference, 1944; HQ Washington DC. IMF helps with balance-of-payments problems; World Bank funds development"],
            ["WTO", "1 January 1995, replaced GATT (1947); HQ Geneva"],
            ["Asian Development Bank", "1966; HQ Manila"],
            ["New Development Bank (BRICS bank)", "2015; HQ Shanghai; first president K. V. Kamath"],
            ["Asian Infrastructure Investment Bank", "2016; HQ Beijing"],
          ],
        },
        { t: "trap", text: "Depreciation happens by the market; devaluation is done deliberately by the government/central bank. Remittances are part of the CURRENT account." },
        {
          t: "recap",
          items: [
            "Current account: goods, services, remittances; capital account: FDI, FPI, loans",
            "FDI stable, FPI “hot money”; India top remittance receiver",
            "Depreciation (market) vs devaluation (deliberate — 1966, 1991)",
            "IMF & World Bank 1944 (Bretton Woods); WTO 1995 Geneva; NDB Shanghai",
          ],
        },
      ],
      quiz: [
        { q: "Remittances from Indians working abroad are recorded in the:", options: ["Capital account", "Current account", "Fiscal account", "Reserve account"], answer: 1, explain: "They are current transfers." },
        { q: "The WTO came into existence in:", options: ["1944", "1947", "1991", "1995"], answer: 3, explain: "1 January 1995, replacing GATT." },
        { q: "Which investment is called “hot money”?", options: ["FDI", "FPI", "ODA", "ECB"], answer: 1, explain: "Portfolio investment can leave quickly." },
      ],
    },
    REPORTS_ORGS,
    {
      id: "poverty-schemes",
      title: "Poverty, unemployment & government schemes",
      oneLine: "Schemes are the government's tools against poverty and unemployment — exams ask the launch year, the ministry and the main benefit.",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Measuring poverty.** The **poverty line** is the minimum income needed for basic needs. Committees: **Lakdawala (1993)**, **Tendulkar (2009)** — 21.9% poor in 2011-12, **Rangarajan (2014)**. Today **NITI Aayog's Multidimensional Poverty Index (MPI)** looks at health, education and living standards — it estimated that about **24.8 crore people** moved out of multidimensional poverty between 2013-14 and 2022-23." },
        {
          t: "table",
          head: ["Type of unemployment", "Meaning"],
          rows: [
            ["Disguised", "More people working than needed (common in farming)"],
            ["Seasonal", "Work only in certain seasons (farm labourers)"],
            ["Structural", "Skills don't match the jobs available"],
            ["Frictional", "Temporary — between leaving one job and joining another"],
          ],
        },
        { t: "p", text: "Unemployment is measured by the **Periodic Labour Force Survey (PLFS)** of the NSO — now released monthly and quarterly." },
        {
          t: "table",
          head: ["Scheme", "Year", "Main point"],
          rows: [
            ["MGNREGA", "2005 (Act), 2006 started", "100 days of guaranteed wage work per rural household per year"],
            ["Pradhan Mantri Jan Dhan Yojana", "2014", "Bank account for every family — financial inclusion"],
            ["Make in India / Swachh Bharat", "2014", "Manufacturing / cleanliness (launched 2 October 2014)"],
            ["Digital India / Skill India / Mudra", "2015", "Mudra: loans to small businesses (Shishu, Kishore, Tarun, Tarun Plus)"],
            ["Startup India / Stand-Up India / Ujjwala", "2016", "Ujjwala: free LPG connections to poor women"],
            ["Ayushman Bharat (PM-JAY)", "2018", "Health cover of ₹5 lakh per family per year; extended to all senior citizens 70+ in 2024"],
            ["PM-KISAN", "2019", "₹6,000 a year to farmers in 3 instalments, straight to bank accounts (DBT)"],
            ["PM Garib Kalyan Anna Yojana", "2020", "Free food grains under the National Food Security Act (2013)"],
            ["PM Vishwakarma", "2023", "Support for traditional artisans"],
          ],
        },
        { t: "trap", text: "MGNREGA guarantees 100 days of work per HOUSEHOLD, not per person. PM-KISAN pays ₹6,000 per year, in three ₹2,000 instalments." },
        {
          t: "recap",
          items: [
            "Poverty committees: Lakdawala, Tendulkar, Rangarajan; NITI Aayog MPI",
            "Disguised, seasonal, structural, frictional unemployment; PLFS",
            "MGNREGA 2005 (100 days/household); Jan Dhan 2014; Ayushman Bharat 2018 (₹5 lakh); PM-KISAN 2019 (₹6,000)",
            "Ujjwala 2016 (LPG); Mudra 2015; PM Vishwakarma 2023",
          ],
        },
      ],
      quiz: [
        { q: "MGNREGA guarantees how many days of work in a year?", options: ["50", "100", "150", "200"], answer: 1, explain: "Per rural household." },
        { q: "Under PM-KISAN, a farmer family gets per year:", options: ["₹2,000", "₹4,000", "₹6,000", "₹12,000"], answer: 2, explain: "Three instalments of ₹2,000." },
        { q: "Ayushman Bharat PM-JAY gives a health cover of up to:", options: ["₹1 lakh", "₹2 lakh", "₹3 lakh", "₹5 lakh"], answer: 3, explain: "Per family per year." },
      ],
    },
    {
      id: "bihar-economy",
      title: "Economy of Bihar",
      oneLine: "Bihar is one of India's fastest-growing states, but it starts from the lowest per-capita income — its economy rests on agriculture, services and remittances.",
      minutes: 14,
      blocks: [
        { t: "p", text: "**The big picture.** After Jharkhand separated in **2000**, Bihar lost most of its minerals and heavy industry. Today its economy is driven by **services** (trade, transport, construction), **agriculture** (which employs most people), and money sent home by migrant workers. Bihar's per-capita income is the **lowest among major states**, but its growth rate has often been **above the national average**. The yearly **Bihar Economic Survey** is presented by the state Finance Department before the state budget." },
        {
          t: "table",
          head: ["Bihar's farm strengths", "Remember"],
          rows: [
            ["Makhana (fox nut)", "Bihar grows about 85–90% of India's makhana; Mithila makhana got a GI tag (2022); a National Makhana Board was announced in the Union Budget 2025-26"],
            ["Litchi", "Muzaffarpur's Shahi litchi (GI tag); Bihar is India's top litchi producer"],
            ["Vegetables & fruits", "A leading producer of okra, potato, onion, guava, mango (Jardalu mango of Bhagalpur — GI)"],
            ["Maize", "Major rabi-maize producer in the Kosi–Purnia belt"],
            ["Agriculture roadmaps", "Bihar has run Agriculture Roadmaps since 2008 (4th roadmap 2023–28)"],
          ],
        },
        {
          t: "table",
          head: ["State scheme / fact", "Remember"],
          rows: [
            ["Jeevika (Bihar Rural Livelihoods Project)", "Women's self-help groups — one of the largest SHG networks in India"],
            ["Mukhyamantri Balika Cycle Yojana", "Bicycles for girls in Class 9 — boosted girls' school enrolment"],
            ["Saat Nischay (Seven Resolves)", "Har Ghar Bijli, Har Ghar Nal ka Jal, paved lanes, toilets, student credit card, etc."],
            ["Prohibition", "Bihar has had liquor prohibition since April 2016"],
            ["Caste survey", "Bihar released its caste-based survey in October 2023"],
            ["Industry", "Barauni oil refinery (IOCL, 1964) and fertiliser plant; Bihar Industrial Investment Promotion Policy"],
          ],
        },
        { t: "trap", text: "Bihar has the lowest per-capita income, but that does not mean slow growth — its GSDP growth rate is often among the highest. Read “per capita” vs “growth” carefully in questions." },
        {
          t: "recap",
          items: [
            "Services + agriculture + remittances; minerals went to Jharkhand in 2000",
            "Lowest per-capita income among major states; growth often above national average",
            "Makhana (85–90%, GI, Makhana Board 2025), Shahi litchi, Jardalu mango; maize in Kosi belt",
            "Jeevika SHGs, Balika Cycle Yojana, Saat Nischay, prohibition 2016, caste survey 2023",
          ],
        },
      ],
      quiz: [
        { q: "Bihar produces about 85–90% of India's:", options: ["Litchi", "Makhana", "Maize", "Jute"], answer: 1, explain: "Mithila makhana also has a GI tag." },
        { q: "Jeevika in Bihar is related to:", options: ["Women's self-help groups", "Road building", "Liquor prohibition", "Solar energy"], answer: 0, explain: "Bihar Rural Livelihoods Project." },
        { q: "The oil refinery in Bihar is at:", options: ["Haldia", "Barauni", "Digboi", "Bongaigaon"], answer: 1, explain: "IOCL Barauni, 1964." },
      ],
    },
  ],
};
