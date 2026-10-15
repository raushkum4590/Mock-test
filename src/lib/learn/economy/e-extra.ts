import type { Lesson } from "../types";

/** Basics module: growth vs development, indices and curves. */
export const GROWTH_DEVELOPMENT: Lesson = {
  id: "growth-development",
  title: "Growth vs development, HDI, SDGs & famous curves",
  oneLine: "Growth means the economy got bigger (more GDP); development means people's lives actually got better — health, education, freedom.",
  minutes: 15,
  blocks: [
    { t: "analogy", text: "A village's total income doubles because one factory owner gets very rich, but children still don't go to school and there's no hospital. That is **growth without development**." },
    {
      t: "table",
      head: ["Growth", "Development"],
      rows: [
        ["Quantitative — more output", "Qualitative — better lives"],
        ["Measured by GDP / per-capita income", "Measured by HDI, literacy, life expectancy, poverty"],
        ["Can happen without development", "Needs growth AND fair distribution"],
      ],
    },
    {
      t: "table",
      head: ["Index / measure", "By", "Measures"],
      rows: [
        ["Human Development Index (HDI)", "UNDP (since 1990, idea of Mahbub ul Haq; Amartya Sen contributed)", "Long & healthy life (life expectancy), knowledge (schooling), decent standard of living (GNI per capita, PPP)"],
        ["Multidimensional Poverty Index", "UNDP & Oxford (OPHI); NITI Aayog for India", "Health, education, living standards"],
        ["Gini coefficient", "—", "Inequality: 0 = perfect equality, 1 = perfect inequality (shown with the Lorenz curve)"],
        ["Purchasing Power Parity (PPP)", "—", "Compares incomes by what money can buy locally; India is the 3rd largest economy by PPP"],
      ],
    },
    { t: "p", text: "**Sustainable Development Goals (SDGs)** — **17 goals**, adopted by the UN in **September 2015**, to be achieved by **2030** (Goal 1: no poverty; Goal 2: zero hunger; Goal 13: climate action…). They replaced the 8 Millennium Development Goals (2000–2015). NITI Aayog publishes India's **SDG India Index**." },
    {
      t: "table",
      head: ["Curve", "Shows"],
      rows: [
        ["Lorenz curve", "Income inequality (used for the Gini coefficient)"],
        ["Kuznets curve", "Inequality first rises, then falls as an economy grows (inverted U)"],
        ["Laffer curve", "Raising tax rates beyond a point REDUCES tax revenue"],
        ["Phillips curve", "Trade-off: lower unemployment ↔ higher inflation"],
        ["Engel's law", "As income rises, the SHARE spent on food falls"],
      ],
    },
    { t: "trick", text: "“Laffer = tax”, “Phillips = inflation vs jobs”, “Lorenz/Gini = inequality”, “Kuznets = inverted U”." },
    { t: "trap", text: "HDI uses GNI per capita (PPP) — not GDP. A Gini coefficient of 0 means perfect EQUALITY, not inequality." },
    {
      t: "exam",
      items: [
        "“HDI is published by…” → UNDP; its three dimensions",
        "Match curve ↔ idea (Laffer–tax; Phillips–inflation & unemployment)",
        "SDGs: 17 goals, 2015 → 2030",
      ],
    },
    {
      t: "recap",
      items: [
        "Growth = more GDP; development = better lives",
        "HDI (UNDP): health, education, GNI per capita PPP",
        "Gini 0 = equal; Lorenz curve; Kuznets inverted U; Laffer = tax; Phillips = inflation vs unemployment",
        "SDGs: 17 goals, 2015–2030; SDG India Index by NITI Aayog",
      ],
    },
  ],
  quiz: [
    { q: "Which curve shows that very high tax rates can reduce tax revenue?", options: ["Phillips curve", "Laffer curve", "Lorenz curve", "Kuznets curve"], answer: 1, explain: "Arthur Laffer." },
    { q: "How many Sustainable Development Goals are there?", options: ["8", "12", "17", "21"], answer: 2, explain: "Adopted in 2015, target 2030." },
    { q: "A Gini coefficient of 0 means:", options: ["Perfect inequality", "Perfect equality", "No GDP growth", "Zero inflation"], answer: 1, explain: "1 means perfect inequality." },
  ],
};

/** Money & banking module: financial markets, regulators and payment systems. */
export const FINANCIAL_MARKETS: Lesson = {
  id: "financial-markets",
  title: "Share market, regulators, insurance, pensions & digital payments",
  oneLine: "Businesses raise money in the money market (short term) and the capital market (long term) — each corner of the financial world has its own regulator.",
  minutes: 18,
  blocks: [
    {
      t: "table",
      head: ["Market", "Meaning", "Examples"],
      rows: [
        ["Money market", "Borrowing/lending for up to 1 year", "Treasury bills, commercial paper, call money — regulated by RBI"],
        ["Capital market", "Long-term money", "Shares, bonds, debentures — regulated by SEBI"],
        ["Primary market", "New shares sold for the first time", "IPO (Initial Public Offering)"],
        ["Secondary market", "Existing shares traded among investors", "Stock exchanges"],
      ],
    },
    {
      t: "table",
      head: ["Regulator", "Set up", "Regulates"],
      rows: [
        ["RBI", "1935", "Banks, money market, NBFCs, payments"],
        ["SEBI", "1988; statutory powers from 1992", "Stock markets, mutual funds"],
        ["IRDAI", "1999 Act (works from Hyderabad)", "Insurance"],
        ["PFRDA", "2003; statutory 2013", "Pensions — National Pension System"],
        ["NABARD", "1982", "Rural & agricultural credit (refinance)"],
      ],
    },
    {
      t: "table",
      head: ["Stock market facts", "Remember"],
      rows: [
        ["BSE (Bombay Stock Exchange)", "1875 — Asia's oldest; index **SENSEX** = 30 companies"],
        ["NSE (National Stock Exchange)", "1992; index **NIFTY 50** = 50 companies"],
        ["Bull / bear market", "Bull = prices rising; bear = prices falling"],
        ["GIFT City (Gujarat)", "India's first International Financial Services Centre"],
      ],
    },
    {
      t: "table",
      head: ["Scheme", "Year", "Benefit"],
      rows: [
        ["National Pension System", "2004 (for new govt staff), opened to all in 2009", "Market-linked pension"],
        ["Atal Pension Yojana", "2015", "₹1,000–5,000 monthly pension for unorganised workers"],
        ["PM Jeevan Jyoti Bima Yojana", "2015", "₹2 lakh life cover, ₹436 a year"],
        ["PM Suraksha Bima Yojana", "2015", "₹2 lakh accident cover, ₹20 a year"],
        ["Unified Pension Scheme", "From 1 April 2025", "Assured pension option for central government employees under NPS"],
      ],
    },
    {
      t: "table",
      head: ["Payment system", "Remember"],
      rows: [
        ["NEFT", "Batches; any amount; available 24×7 since 2019"],
        ["RTGS", "Real-time, large transfers — minimum ₹2 lakh"],
        ["IMPS", "Instant, 24×7, by NPCI"],
        ["UPI", "2016 — NPCI; instant phone-to-phone payments; the world's largest real-time payment system"],
        ["RuPay", "India's own card network (NPCI)"],
        ["e-Rupee (CBDC)", "RBI's digital currency — pilots began in 2022 (wholesale Nov, retail Dec)"],
      ],
    },
    { t: "trap", text: "SENSEX has 30 stocks; NIFTY has 50. RTGS has a ₹2 lakh MINIMUM. NPCI (not RBI directly) runs UPI, IMPS and RuPay." },
    {
      t: "exam",
      items: [
        "Match regulator ↔ sector (IRDAI–insurance; PFRDA–pension; SEBI–capital market)",
        "“SENSEX is the index of…” → BSE, 30 stocks",
        "Scheme ↔ benefit (PMSBY ₹20 accident cover; APY pension)",
      ],
    },
    {
      t: "recap",
      items: [
        "Money market ≤ 1 year (RBI); capital market long term (SEBI); IPO = primary market",
        "SEBI 1988/1992; IRDAI 1999; PFRDA 2003/2013; NABARD 1982",
        "BSE 1875, SENSEX 30; NSE 1992, NIFTY 50",
        "APY, PMJJBY, PMSBY (2015); NPS 2004; UPS 2025",
        "NEFT, RTGS (₹2 lakh min), IMPS, UPI 2016 (NPCI), e-Rupee 2022",
      ],
    },
  ],
  quiz: [
    { q: "SENSEX is based on how many companies?", options: ["30", "50", "100", "500"], answer: 0, explain: "NIFTY has 50." },
    { q: "The pension sector is regulated by:", options: ["SEBI", "IRDAI", "PFRDA", "NABARD"], answer: 2, explain: "Pension Fund Regulatory and Development Authority." },
    { q: "UPI is operated by:", options: ["RBI", "SBI", "NPCI", "SEBI"], answer: 2, explain: "National Payments Corporation of India." },
    { q: "The minimum amount for an RTGS transfer is:", options: ["₹50,000", "₹1 lakh", "₹2 lakh", "No minimum"], answer: 2, explain: "RTGS is for large-value transfers." },
  ],
};

/** Money & banking module: bank types, NPAs and committees. */
export const BANKING_REFORMS: Lesson = {
  id: "banks-npa-committees",
  title: "Types of banks, bad loans (NPAs) & committees",
  oneLine: "India has many kinds of banks, each built for a purpose — and a few laws and committees decide how bad loans are recovered and banks are reformed.",
  minutes: 16,
  blocks: [
    {
      t: "table",
      head: ["Bank type", "Remember"],
      rows: [
        ["Scheduled banks", "Listed in the 2nd Schedule of the RBI Act"],
        ["Regional Rural Banks (RRBs)", "From 2 October 1975 (Narasimham working group); first: Prathama Bank, Moradabad; owned by Centre 50%, sponsor bank 35%, state 15%"],
        ["Small Finance Banks", "Lend to small businesses & farmers"],
        ["Payments Banks", "Take deposits up to ₹2 lakh, can't give loans (Nachiket Mor committee idea)"],
        ["Cooperative banks", "Owned by members; regulated by RBI and state registrars"],
        ["NBFCs", "Lend but cannot take demand deposits or issue cheques"],
      ],
    },
    { t: "p", text: "**NPA (Non-Performing Asset)** — a loan on which interest/principal is **overdue for more than 90 days**. Tools to recover bad loans: **SARFAESI Act 2002** (banks can seize security without court), **Debt Recovery Tribunals**, and the **Insolvency and Bankruptcy Code (IBC) 2016** — a time-bound process (cases decided by the NCLT). Bank deposits are insured by **DICGC up to ₹5 lakh** per depositor per bank (since 2020)." },
    { t: "p", text: "**Basel norms** are international rules (from the Basel Committee in Switzerland) about how much capital banks must keep against risk — India follows **Basel III**." },
    {
      t: "table",
      head: ["Committee", "Subject"],
      rows: [
        ["Narasimham I (1991) & II (1998)", "Banking-sector reforms"],
        ["Raja Chelliah (1991)", "Tax reforms"],
        ["R. N. Malhotra (1993)", "Insurance reforms → IRDA"],
        ["S. S. Tarapore (1997, 2006)", "Capital account convertibility"],
        ["Vijay Kelkar (2002)", "Tax reforms"],
        ["Nachiket Mor (2013)", "Financial inclusion → payments banks"],
        ["Urjit Patel (2014)", "Monetary policy framework → inflation targeting"],
        ["Bimal Jalan (2019)", "RBI's economic capital (surplus transfer)"],
        ["Suresh Tendulkar (2009) / C. Rangarajan (2014)", "Poverty estimation"],
      ],
    },
    {
      t: "table",
      head: ["RBI people", "Name"],
      rows: [
        ["First Governor", "Osborne Smith (1935)"],
        ["First Indian Governor", "C. D. Deshmukh"],
        ["Governor who later became PM", "Manmohan Singh"],
        ["Governor (since December 2024)", "Sanjay Malhotra"],
      ],
    },
    { t: "trap", text: "A loan becomes an NPA after 90 days, not 30 or 180. Payments banks CANNOT lend. DICGC cover is ₹5 lakh (raised from ₹1 lakh in 2020)." },
    {
      t: "exam",
      items: [
        "Match committee ↔ subject (Narasimham–banking; Malhotra–insurance; Tarapore–capital account)",
        "“SARFAESI / IBC / DRT” — what each does",
        "Payments bank vs small finance bank statements",
      ],
    },
    {
      t: "recap",
      items: [
        "RRBs 1975 (Prathama Bank); payments banks no loans, ₹2 lakh deposit limit",
        "NPA = 90 days overdue; SARFAESI 2002; IBC 2016 (NCLT); DICGC ₹5 lakh",
        "Narasimham (banks), Chelliah & Kelkar (tax), Malhotra (insurance), Tarapore (convertibility), Urjit Patel (inflation targeting)",
        "First Indian RBI Governor C. D. Deshmukh; current Sanjay Malhotra",
      ],
    },
  ],
  quiz: [
    { q: "A loan is classified as an NPA if payment is overdue for more than:", options: ["30 days", "60 days", "90 days", "180 days"], answer: 2, explain: "90 days." },
    { q: "The Malhotra Committee is associated with reforms in:", options: ["Banking", "Insurance", "Taxation", "Agriculture"], answer: 1, explain: "1993 — led to IRDA." },
    { q: "Regional Rural Banks were set up in:", options: ["1969", "1975", "1982", "1991"], answer: 1, explain: "2 October 1975." },
    { q: "The first Indian Governor of the RBI was:", options: ["Osborne Smith", "C. D. Deshmukh", "Benegal Rama Rau", "Manmohan Singh"], answer: 1, explain: "1943–49." },
  ],
};

/** Public finance module: agriculture, food security and industry. */
export const AGRI_INDUSTRY: Lesson = {
  id: "agriculture-industry",
  title: "Agriculture, food security & industrial policy",
  oneLine: "The government supports farmers with MSP, cheap credit and insurance, feeds the poor through the PDS, and guides industry through industrial policies and incentives.",
  minutes: 18,
  blocks: [
    {
      t: "table",
      head: ["Farm support", "Remember"],
      rows: [
        ["MSP", "Announced for 22 crops on the advice of the CACP (1965)"],
        ["Food Corporation of India", "1965 — buys, stores and moves food grains"],
        ["Kisan Credit Card", "1998 — cheap crop loans"],
        ["PM Fasal Bima Yojana", "2016 — crop insurance; farmer pays 2% (kharif), 1.5% (rabi), 5% (commercial/horticulture)"],
        ["Soil Health Card", "2015"],
        ["e-NAM", "2016 — online national agricultural market"],
        ["PM-KISAN", "2019 — ₹6,000 a year"],
      ],
    },
    { t: "p", text: "**Food security.** The **National Food Security Act 2013** covers up to **75% of rural and 50% of urban** people: **5 kg of grain per person per month**; **Antyodaya** (poorest) families get **35 kg per family**. Since January 2024 this grain is **free** under **PM Garib Kalyan Anna Yojana** (for five years). The **Public Distribution System (PDS)** delivers it through ration shops; **One Nation One Ration Card** lets migrants use their card anywhere." },
    {
      t: "table",
      head: ["Industrial policy", "Key point"],
      rows: [
        ["Industrial Policy Resolution 1948", "Mixed economy; first policy"],
        ["Industrial Policy Resolution 1956", "Industries in 3 schedules (A — state only); called the “economic constitution of India”"],
        ["New Industrial Policy 1991", "Licensing abolished for most industries; public-sector reservation cut; FDI allowed — part of LPG"],
        ["SEZ Act", "2005 — Special Economic Zones"],
        ["Make in India", "25 September 2014"],
        ["Production Linked Incentive (PLI)", "2020 — rewards extra production in key sectors"],
      ],
    },
    {
      t: "table",
      head: ["MSME (from 1 April 2025)", "Investment up to", "Turnover up to"],
      rows: [
        ["Micro", "₹2.5 crore", "₹10 crore"],
        ["Small", "₹25 crore", "₹100 crore"],
        ["Medium", "₹125 crore", "₹500 crore"],
      ],
    },
    { t: "p", text: "**Eight core industries** (about 40% of the Index of Industrial Production): **coal, crude oil, natural gas, refinery products, fertilisers, steel, cement, electricity**. **Refinery products** have the biggest weight. The **IIP** is released by the **NSO**." },
    { t: "trick", text: "Core 8 — “CCN-RF-SCE”: Coal, Crude, Natural gas, Refinery, Fertiliser, Steel, Cement, Electricity." },
    { t: "trap", text: "NFSA gives 5 kg per PERSON, but Antyodaya gets 35 kg per FAMILY. The 1956 resolution, not 1991, is called the “economic constitution”." },
    {
      t: "exam",
      items: [
        "“Which of these is NOT a core industry?” (e.g. textiles, automobiles are NOT)",
        "NFSA entitlements; MSP–CACP; FCI 1965",
        "Industrial policies: 1948, 1956, 1991 — match the feature",
      ],
    },
    {
      t: "recap",
      items: [
        "MSP (CACP), FCI 1965, KCC 1998, PMFBY 2016 (2/1.5/5%), e-NAM 2016",
        "NFSA 2013: 5 kg/person, AAY 35 kg/family; free under PMGKAY since 2024",
        "IPR 1948, IPR 1956 (economic constitution), NIP 1991; SEZ 2005; PLI 2020",
        "MSME 2025 limits; core 8 — refinery products biggest weight",
      ],
    },
  ],
  quiz: [
    { q: "Under the NFSA, an Antyodaya family gets per month:", options: ["5 kg", "25 kg", "35 kg", "50 kg"], answer: 2, explain: "Others get 5 kg per person." },
    { q: "MSP is announced on the recommendation of the:", options: ["FCI", "CACP", "NABARD", "NITI Aayog"], answer: 1, explain: "Commission for Agricultural Costs and Prices." },
    { q: "Which of these is NOT one of the eight core industries?", options: ["Cement", "Fertilisers", "Textiles", "Steel"], answer: 2, explain: "Textiles are not in the core 8." },
    { q: "Which policy is called the “economic constitution of India”?", options: ["IPR 1948", "IPR 1956", "NIP 1991", "SEZ Act 2005"], answer: 1, explain: "It reserved key industries for the state." },
  ],
};

/** Development module: global reports and organisations. */
export const REPORTS_ORGS: Lesson = {
  id: "reports-organisations",
  title: "Who publishes which report & international groupings",
  oneLine: "“Which organisation publishes the … report?” and “Where is the headquarters of …?” are asked in almost every exam — one table each.",
  minutes: 14,
  blocks: [
    {
      t: "table",
      head: ["Report / index", "Published by"],
      rows: [
        ["World Economic Outlook; Global Financial Stability Report", "IMF"],
        ["World Development Report", "World Bank"],
        ["Human Development Report", "UNDP"],
        ["Global Gender Gap Report; Global Risks Report", "World Economic Forum (WEF)"],
        ["World Investment Report", "UNCTAD"],
        ["Global Innovation Index", "WIPO"],
        ["World Happiness Report", "UN SDSN with Gallup & Oxford Wellbeing Research Centre"],
        ["Global Hunger Index", "Concern Worldwide & Welthungerhilfe"],
        ["State of Food Security and Nutrition", "FAO (with IFAD, UNICEF, WFP, WHO)"],
        ["World Energy Outlook", "International Energy Agency (IEA)"],
        ["Economic Survey of India", "Ministry of Finance (Chief Economic Adviser)"],
        ["Financial Stability Report; Report on Currency & Finance", "RBI"],
      ],
    },
    {
      t: "table",
      head: ["Grouping", "Founded", "HQ / India link"],
      rows: [
        ["SAARC", "1985 (Dhaka)", "HQ Kathmandu; 8 members"],
        ["ASEAN", "1967", "HQ Jakarta; India is a dialogue partner (Act East)"],
        ["BIMSTEC", "1997", "HQ Dhaka; 7 Bay of Bengal countries"],
        ["SCO", "2001", "India a full member since 2017"],
        ["BRICS", "First summit 2009 (South Africa joined 2010)", "Expanded from 2024 (Egypt, Ethiopia, Iran, UAE; Indonesia in 2025)"],
        ["G20", "1999", "India's presidency 2023 — New Delhi summit; African Union became a permanent member"],
        ["OPEC", "1960", "HQ Vienna — oil exporters"],
        ["WTO / IMF / World Bank", "1995 / 1944 / 1944", "Geneva / Washington DC / Washington DC"],
      ],
    },
    { t: "trap", text: "The Human Development Report is by UNDP, not the World Bank. The Global Hunger Index is NOT a UN report." },
    {
      t: "exam",
      items: [
        "Match report ↔ publisher (very frequent)",
        "Match grouping ↔ headquarters (SAARC–Kathmandu; ASEAN–Jakarta; BIMSTEC–Dhaka; OPEC–Vienna)",
        "G20 2023 under India's presidency — African Union joined",
      ],
    },
    {
      t: "recap",
      items: [
        "IMF: World Economic Outlook; World Bank: World Development Report; UNDP: HDR",
        "WEF: Gender Gap, Global Risks; UNCTAD: World Investment Report; WIPO: Innovation Index",
        "SAARC Kathmandu; ASEAN Jakarta; BIMSTEC Dhaka; OPEC Vienna; WTO Geneva",
        "G20 New Delhi 2023 — African Union admitted",
      ],
    },
  ],
  quiz: [
    { q: "The World Economic Outlook is published by the:", options: ["World Bank", "IMF", "WEF", "UNCTAD"], answer: 1, explain: "Twice a year." },
    { q: "The headquarters of SAARC is at:", options: ["New Delhi", "Dhaka", "Kathmandu", "Colombo"], answer: 2, explain: "SAARC was founded at Dhaka in 1985." },
    { q: "The Global Gender Gap Report is published by:", options: ["UNDP", "UN Women", "World Economic Forum", "World Bank"], answer: 2, explain: "WEF also publishes the Global Risks Report." },
    { q: "During India's G20 presidency (2023), which body became a permanent member?", options: ["ASEAN", "European Union", "African Union", "SAARC"], answer: 2, explain: "At the New Delhi summit." },
  ],
};
