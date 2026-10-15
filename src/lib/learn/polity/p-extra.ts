import type { Lesson } from "../types";

/** Constitution module: the article map, and the Union and its territory. */
export const ARTICLES_TERRITORY: Lesson = {
  id: "articles-territory",
  title: "The article map & India's states and UTs",
  oneLine: "About 60 articles answer most article-number questions — learn them grouped by topic, plus how India's states and union territories were formed.",
  minutes: 20,
  blocks: [
    { t: "p", text: "**Don't memorise 395 articles.** Exams ask the same 50–60 again and again. The trick is to learn them in **groups** — rights together, Parliament together, emergencies together — so that one article reminds you of the next." },
    {
      t: "table",
      head: ["Topic", "Articles to know"],
      rows: [
        ["Union & territory (Part I)", "1 India, that is Bharat, a Union of States · 3 Parliament can form new states / change boundaries"],
        ["Citizenship (Part II)", "5–11"],
        ["Fundamental Rights (Part III)", "12 meaning of “State” · 13 laws violating FRs are void · 14 equality · 15 no discrimination · 16 public jobs · 17 untouchability · 19 six freedoms · 20 conviction · 21 life & liberty · 21A education · 22 arrest · 23 trafficking · 24 child labour · 25–28 religion · 29–30 minorities · 32 constitutional remedies"],
        ["DPSP & Duties (Parts IV, IVA)", "39A free legal aid · 40 panchayats · 44 Uniform Civil Code · 45 early childhood care · 48 agriculture & animals · 48A environment · 50 separate judiciary · 51 international peace · 51A Fundamental Duties"],
        ["Union executive", "52 President · 53 executive power · 54 election · 61 impeachment · 63 Vice-President · 72 pardon · 74 Council of Ministers advises · 75 PM & ministers · 76 Attorney General · 78 PM's duty to inform the President"],
        ["Parliament", "79 Parliament · 80 Rajya Sabha · 81 Lok Sabha · 85 sessions · 100 quorum · 108 joint sitting · 110 money bill · 112 Budget · 123 ordinance"],
        ["Judiciary", "124 Supreme Court · 129 court of record · 131 original jurisdiction · 137 review · 141 SC law binding · 143 advisory · 214 High Courts · 226 HC writs · 233 district judges"],
        ["States", "153 Governor · 155 appointment · 161 Governor's pardon · 163–164 CM & ministers · 169 Legislative Councils · 200 assent to bills · 213 Governor's ordinance"],
        ["Special areas & UTs", "239 UTs · 239AA Delhi · 243 Panchayats · 243P Municipalities · 244 Scheduled & tribal areas"],
        ["Centre–state & money", "245–255 legislative relations · 262 inter-state water disputes · 263 Inter-State Council · 265 no tax without law · 266 Consolidated Fund · 267 Contingency Fund · 275 grants · 279A GST Council · 280 Finance Commission"],
        ["Services & bodies", "300A property · 312 All-India Services · 315 Public Service Commissions · 324 Election Commission · 326 adult suffrage · 330 & 332 reserved seats · 338 SC commission · 343 Hindi official language · 350A mother tongue"],
        ["Emergency & amendment", "352 national · 356 President's Rule · 360 financial · 368 amendment · 370 J&K (made inoperative 2019)"],
      ],
    },
    { t: "trick", text: "“3-2-1 for money”: Art 112 Budget, 110 money bill, 123 ordinance … and “265-266-267” = no tax without law, Consolidated Fund, Contingency Fund — three in a row." },
    { t: "p", text: "**How India's map changed.** In 1950 states were in four categories (Part A, B, C, D). **Potti Sriramulu** died fasting for a Telugu state → **Andhra State (1953)**, the first state formed on the basis of language. The **States Reorganisation Commission (1953)** — **Fazl Ali** (chair), K. M. Panikkar, H. N. Kunzru — led to the **States Reorganisation Act 1956: 14 states and 6 UTs**." },
    {
      t: "table",
      head: ["Year", "New state / change"],
      rows: [
        ["1960", "Bombay split into Maharashtra and Gujarat"],
        ["1963", "Nagaland"],
        ["1966", "Haryana (from Punjab)"],
        ["1971 / 1972", "Himachal Pradesh / Manipur, Tripura, Meghalaya"],
        ["1975", "Sikkim (36th Amendment) — 22nd state"],
        ["1987", "Mizoram, Arunachal Pradesh, Goa"],
        ["2000", "Chhattisgarh (1 Nov), Uttarakhand (9 Nov), **Jharkhand (15 Nov, from Bihar)**"],
        ["2014", "Telangana (2 June) — 29th state"],
        ["2019", "J&K became two UTs — J&K and Ladakh (31 Oct) → 28 states"],
        ["2020", "Dadra & Nagar Haveli and Daman & Diu merged → **8 UTs**"],
      ],
    },
    { t: "p", text: "**Today: 28 states and 8 union territories.** UTs with their own legislature: **Delhi, Puducherry, Jammu & Kashmir**. Under **Article 3**, Parliament can create a state or change its name/boundaries by a **simple majority**, on the President's recommendation, after asking (not obeying) the state legislature's views." },
    { t: "trap", text: "Forming a new state is NOT a constitutional amendment under Art 368 — it needs only a simple majority (Art 4 says so). The state legislature's opinion is not binding." },
    {
      t: "exam",
      items: [
        "Direct article questions: “Article 21A is about…”, “Which article deals with the Inter-State Council?” (263)",
        "“The first state formed on a linguistic basis” → Andhra (1953)",
        "Count questions: number of states (28) and UTs (8); UTs with legislatures",
      ],
    },
    {
      t: "recap",
      items: [
        "Learn articles in groups: FR 12–35, DPSP 36–51, President 52–78, Parliament 79–122, SC 124–147",
        "Money: 110, 112, 265, 266, 267, 280; Emergencies 352, 356, 360; Amendment 368",
        "Andhra 1953 first linguistic state; SRC — Fazl Ali; 1956 Act — 14 states, 6 UTs",
        "28 states, 8 UTs; Jharkhand 15 Nov 2000; Telangana 2014; J&K & Ladakh UTs 2019",
        "Art 3: new states by simple majority",
      ],
    },
  ],
  quiz: [
    { q: "Article 263 deals with:", options: ["Finance Commission", "Inter-State Council", "Election Commission", "Inter-state water disputes"], answer: 1, explain: "Water disputes are Article 262." },
    { q: "The first state created on a linguistic basis was:", options: ["Gujarat", "Andhra", "Kerala", "Maharashtra"], answer: 1, explain: "Andhra State, 1953." },
    { q: "How many union territories does India have today?", options: ["6", "7", "8", "9"], answer: 2, explain: "Since the 2020 merger of Dadra & Nagar Haveli and Daman & Diu." },
    { q: "The Contingency Fund of India is under Article:", options: ["265", "266", "267", "280"], answer: 2, explain: "266 is the Consolidated Fund." },
  ],
};

/** Union module: how Parliament actually works. */
export const PARLIAMENT_WORKING: Lesson = {
  id: "parliament-working",
  title: "How Parliament works: Speaker, motions, committees & anti-defection",
  oneLine: "Parliament controls the government through questions, motions and committees — and the Speaker is the referee who runs the Lok Sabha.",
  minutes: 20,
  blocks: [
    { t: "p", text: "**The Speaker.** Elected by the Lok Sabha members from among themselves. The Speaker runs the house, decides if a bill is a money bill, presides over joint sittings, and decides disqualification under the anti-defection law (this decision can be reviewed by courts — **Kihoto Hollohan case, 1992**). The Speaker votes only to break a tie (**casting vote**). First Speaker: **G. V. Mavalankar**. After a fresh election, a **pro-tem Speaker** (usually the senior-most member, appointed by the President) gives the oath to new members." },
    {
      t: "table",
      head: ["Term", "Meaning"],
      rows: [
        ["Summoning", "The President calls a session"],
        ["Adjournment", "Presiding officer suspends a sitting for hours/days"],
        ["Prorogation", "The President ends a session"],
        ["Dissolution", "Ends the Lok Sabha itself (Rajya Sabha is never dissolved)"],
        ["Quorum", "1/10 of total members must be present (Art 100)"],
        ["Question Hour", "First hour — starred (oral answer, follow-ups allowed), unstarred (written answer), short-notice questions"],
        ["Zero Hour", "Starts at 12 noon — an Indian innovation, not in the rules"],
      ],
    },
    {
      t: "table",
      head: ["Motion", "Key facts"],
      rows: [
        ["No-confidence motion", "Only in Lok Sabha; needs support of 50 members; no reason needs to be given; if passed, the whole government resigns. First moved in 1963 (J. B. Kripalani vs Nehru's govt)"],
        ["Confidence motion", "Moved by the government to prove its majority"],
        ["Censure motion", "Must state reasons; against a minister or the government's policy"],
        ["Adjournment motion", "To discuss an urgent public matter; Lok Sabha only; needs 50 members"],
        ["Calling attention motion", "Indian innovation (1954): draw a minister's attention to an urgent matter"],
        ["Cut motions (budget)", "Policy cut (reduce to ₹1), economy cut, token cut (₹100)"],
      ],
    },
    {
      t: "table",
      head: ["Financial committee", "Members", "Remember"],
      rows: [
        ["Public Accounts Committee (PAC)", "22 (15 LS + 7 RS)", "Examines CAG's audit reports; chairman from the OPPOSITION (convention since 1967)"],
        ["Estimates Committee", "30 (all Lok Sabha)", "Largest committee; suggests economy in spending; no RS members"],
        ["Committee on Public Undertakings", "22 (15 LS + 7 RS)", "Examines PSUs"],
      ],
    },
    { t: "p", text: "**Departmental Standing Committees (24, since 1993)** examine ministries' demands and bills. **Joint Parliamentary Committees (JPC)** are formed for specific issues." },
    { t: "p", text: "**Anti-defection law (10th Schedule, 52nd Amendment 1985).** An MP/MLA is disqualified if he/she **voluntarily gives up party membership** or **votes against the party whip**. An independent who joins a party, or a nominated member who joins a party after 6 months, is also disqualified. **Exception:** a **merger** supported by **2/3** of the party's legislators. The old “split” exception (1/3) was removed by the **91st Amendment (2003)**." },
    { t: "p", text: "**What happens to bills when the Lok Sabha is dissolved?** A bill pending in the Lok Sabha, or passed by LS and pending in RS, **lapses**. A bill pending in the Rajya Sabha that the LS has not passed does **not** lapse. **New Parliament building** was inaugurated on **28 May 2023**." },
    { t: "trap", text: "PAC has Rajya Sabha members; the Estimates Committee does NOT. A no-confidence motion needs no reason; a censure motion must give reasons." },
    {
      t: "exam",
      items: [
        "“Which committee examines the CAG report?” → Public Accounts Committee",
        "“Who appoints the pro-tem Speaker?” → the President",
        "Statement questions on no-confidence vs censure motions",
        "Anti-defection: merger needs 2/3; split exception deleted by 91st Amendment",
      ],
    },
    {
      t: "recap",
      items: [
        "Speaker: casting vote, money-bill certificate, anti-defection decisions (Kihoto Hollohan 1992); first — Mavalankar",
        "Summon/prorogue = President; adjourn = presiding officer; quorum 1/10",
        "No-confidence: LS only, 50 members, no reason; censure needs reasons",
        "PAC 22 (opposition chair, CAG reports); Estimates 30 (all LS, largest)",
        "10th Schedule (52nd, 1985); 2/3 merger; 91st removed split",
      ],
    },
  ],
  quiz: [
    { q: "The Public Accounts Committee examines the reports of the:", options: ["Finance Commission", "CAG", "RBI", "NITI Aayog"], answer: 1, explain: "Its chairman is from the opposition." },
    { q: "Which committee consists of Lok Sabha members only?", options: ["PAC", "Estimates Committee", "Committee on Public Undertakings", "Joint Parliamentary Committee"], answer: 1, explain: "30 members, all from Lok Sabha." },
    { q: "The quorum to hold a sitting of either House is:", options: ["1/3 of members", "1/4 of members", "1/10 of members", "1/2 of members"], answer: 2, explain: "Article 100." },
    { q: "The first Speaker of the Lok Sabha was:", options: ["M. A. Ayyangar", "G. V. Mavalankar", "Hukam Singh", "N. Sanjiva Reddy"], answer: 1, explain: "1952–56." },
  ],
};

/** Union module: High Courts, the collegium, Lok Adalats and tribunals. */
export const JUDICIARY_MORE: Lesson = {
  id: "courts-justice-system",
  title: "High Courts, collegium, Lok Adalats & tribunals",
  oneLine: "Below the Supreme Court sits a whole justice system — High Courts, district courts, Lok Adalats and tribunals — each with its own article and Act.",
  minutes: 15,
  blocks: [
    {
      t: "table",
      head: ["High Courts", "Facts"],
      rows: [
        ["Article", "214 (every state shall have a High Court); Art 231 — one HC for two or more states"],
        ["Appointment", "By the President after consulting the CJI and the state's Governor (Art 217)"],
        ["Retirement", "62 years"],
        ["Writs", "Article 226 — for Fundamental Rights AND other legal rights, so wider than Art 32"],
        ["Oldest", "Calcutta (1862) — Bombay & Madras also in 1862; Patna High Court 1916"],
        ["District judges", "Appointed by the Governor in consultation with the High Court (Art 233)"],
      ],
    },
    { t: "p", text: "**The collegium system** — judges choose judges. It grew out of the “Judges cases”: **Second Judges case (1993)** created the collegium; **Third Judges case (1998)** made it CJI + 4 senior-most judges for the SC. Parliament tried to replace it with the **National Judicial Appointments Commission (99th Amendment, 2014)**, but the SC **struck down the NJAC in 2015** (Fourth Judges case)." },
    {
      t: "table",
      head: ["Body / system", "Remember"],
      rows: [
        ["Lok Adalat", "“People's court” — settles cases by compromise; statutory under the **Legal Services Authorities Act 1987**; first held in Gujarat (1982); its award is final — no appeal; no court fee"],
        ["NALSA", "National Legal Services Authority (1995) gives free legal aid (Art 39A); CJI is patron-in-chief"],
        ["Gram Nyayalaya", "Village courts — Gram Nyayalayas Act 2008"],
        ["Family Courts", "Family Courts Act 1984"],
        ["Tribunals", "Art 323A (administrative — Central Administrative Tribunal 1985) and 323B (other matters) — added by the 42nd Amendment"],
        ["National Green Tribunal", "2010, environment cases"],
        ["Consumer commissions", "Consumer Protection Act 2019 — district, state, national"],
      ],
    },
    { t: "trap", text: "Article 32 itself is a Fundamental Right; Article 226 is not — but HC writ power is WIDER because it also covers other legal rights. NJAC was struck down; the collegium still works." },
    {
      t: "exam",
      items: [
        "“Lok Adalats get statutory status from…” → Legal Services Authorities Act 1987",
        "“Which amendment added tribunals (323A/B)?” → 42nd",
        "“Which case struck down the NJAC?” → Fourth Judges case (2015)",
      ],
    },
    {
      t: "recap",
      items: [
        "HC Art 214, appointment Art 217, writs Art 226, retire 62; Calcutta oldest; Patna 1916",
        "Collegium from Second Judges case (1993); NJAC (99th Amendment) struck down 2015",
        "Lok Adalat — LSA Act 1987, no appeal; NALSA; Gram Nyayalayas 2008",
        "Tribunals 323A/B (42nd); NGT 2010",
      ],
    },
  ],
  quiz: [
    { q: "Lok Adalats got statutory status under the:", options: ["Gram Nyayalayas Act 2008", "Legal Services Authorities Act 1987", "Consumer Protection Act", "Family Courts Act 1984"], answer: 1, explain: "Their awards are final." },
    { q: "Administrative tribunals are provided under Article:", options: ["226", "323A", "312", "262"], answer: 1, explain: "Added by the 42nd Amendment." },
    { q: "The NJAC was declared unconstitutional in:", options: ["1993", "1998", "2014", "2015"], answer: 3, explain: "The collegium continues." },
  ],
};

/** States module: Centre–state relations, UTs and special areas. */
export const CENTRE_STATE: Lesson = {
  id: "centre-state-uts",
  title: "Centre–state relations, UTs & special areas",
  oneLine: "The Constitution divides legislative, administrative and financial power between the Centre and the states — but gives the Centre ways to step into state matters.",
  minutes: 18,
  blocks: [
    { t: "p", text: "**Three kinds of relations:** legislative (who makes laws — Art 245–255), administrative (who runs things — Art 256–263), and financial (who collects and shares money — Art 264–293)." },
    {
      t: "table",
      head: ["When Parliament can make laws on a STATE subject", "Article"],
      rows: [
        ["Rajya Sabha passes a resolution (2/3 present & voting) in the national interest — valid for 1 year at a time", "249"],
        ["During a national emergency", "250"],
        ["Two or more states request it (by resolution)", "252"],
        ["To implement an international treaty", "253"],
        ["During President's Rule in a state", "356/357"],
      ],
    },
    {
      t: "table",
      head: ["Body", "Remember"],
      rows: [
        ["Inter-State Council (Art 263)", "Set up in 1990 on the Sarkaria Commission's advice; chaired by the PM"],
        ["Zonal Councils", "5 councils, statutory (States Reorganisation Act 1956); chaired by the Union Home Minister. North Eastern Council (1971) is separate"],
        ["All-India Services (Art 312)", "IAS, IPS, Indian Forest Service — new ones need a Rajya Sabha resolution"],
        ["Sarkaria Commission", "1983 — Centre–state relations"],
        ["Punchhi Commission", "2007 — Centre–state relations (second)"],
        ["Rajamannar Committee", "1969 — set up by Tamil Nadu"],
      ],
    },
    {
      t: "table",
      head: ["Special area", "Details"],
      rows: [
        ["Article 370 (J&K)", "Gave J&K special status; made inoperative by a Presidential Order on **5 August 2019**; J&K Reorganisation Act → UTs of J&K and Ladakh (31 Oct 2019); upheld by the Supreme Court in December 2023"],
        ["Article 371 & 371A–J", "Special provisions for some states — e.g. 371 Maharashtra & Gujarat, 371A Nagaland, 371F Sikkim"],
        ["5th Schedule", "Scheduled Areas in states like Jharkhand, Odisha, Chhattisgarh — Tribes Advisory Council"],
        ["6th Schedule", "Autonomous District Councils in **Assam, Meghalaya, Tripura, Mizoram**"],
        ["Delhi (Art 239AA)", "National Capital Territory with a legislature — 69th Amendment (1991); police, public order and land stay with the Centre"],
      ],
    },
    { t: "trick", text: "6th Schedule states = “AMTM” — Assam, Meghalaya, Tripura, Mizoram (the same four listed against the 6th Schedule in the schedules table)." },
    { t: "trap", text: "Inter-State Council is constitutional (Art 263); Zonal Councils are statutory (1956 Act). The PM chairs the Inter-State Council; the Home Minister chairs the Zonal Councils." },
    {
      t: "exam",
      items: [
        "“Parliament can legislate on a State List subject if the Rajya Sabha passes a resolution under…” → Art 249",
        "Constitutional vs statutory: Inter-State Council vs Zonal Councils",
        "6th Schedule states; Article 239AA = Delhi",
      ],
    },
    {
      t: "recap",
      items: [
        "Legislative 245–255; administrative 256–263; financial 264–293",
        "Laws on state subjects: 249 (RS), 250 (emergency), 252 (states ask), 253 (treaties)",
        "Inter-State Council (Art 263, 1990, PM) vs Zonal Councils (1956 Act, Home Minister)",
        "Art 370 inoperative 5 Aug 2019; 6th Schedule — AMTM; Delhi 239AA (69th Amendment)",
      ],
    },
  ],
  quiz: [
    { q: "Parliament can make a law on a State List subject in the national interest if the Rajya Sabha passes a resolution under Article:", options: ["249", "250", "252", "253"], answer: 0, explain: "By 2/3 of members present and voting." },
    { q: "Zonal Councils are chaired by the:", options: ["Prime Minister", "Union Home Minister", "President", "Vice-President"], answer: 1, explain: "They are statutory (1956)." },
    { q: "Which of these states is covered by the 6th Schedule?", options: ["Nagaland", "Mizoram", "Manipur", "Sikkim"], answer: 1, explain: "Assam, Meghalaya, Tripura, Mizoram." },
  ],
};

/** Bodies module: elections. */
export const ELECTIONS: Lesson = {
  id: "elections",
  title: "Elections: Election Commission, laws, EVMs & parties",
  oneLine: "India runs the world's largest elections; the Election Commission, two Representation of the People Acts and a few court judgments shape how they work.",
  minutes: 18,
  blocks: [
    {
      t: "table",
      head: ["Election Commission", "Details"],
      rows: [
        ["Article", "324 (Part XV, Arts 324–329)"],
        ["Set up", "25 January 1950 — National Voters' Day (since 2011)"],
        ["Members", "Chief Election Commissioner + 2 Election Commissioners (multi-member permanently since 1993)"],
        ["Appointment", "By the President on a selection committee's advice: PM, Leader of Opposition in Lok Sabha, and a Union Cabinet minister named by the PM (2023 Act)"],
        ["Term", "6 years or until age 65"],
        ["Removal", "CEC — like a Supreme Court judge; other ECs — on the CEC's recommendation"],
        ["First CEC", "Sukumar Sen — first general election 1951–52"],
      ],
    },
    {
      t: "table",
      head: ["Law / reform", "What it does"],
      rows: [
        ["Representation of the People Act 1950", "Electoral rolls, allocation of seats"],
        ["Representation of the People Act 1951", "Conduct of elections, qualifications & disqualifications, corrupt practices"],
        ["61st Amendment (1988, in force 1989)", "Voting age 21 → 18 (Art 326)"],
        ["Voter ID (EPIC)", "Introduced in 1993 under CEC T. N. Seshan, who also enforced the Model Code strictly"],
        ["EVM", "First used in 1982 (Paravur, Kerala)"],
        ["VVPAT", "First used in 2013 (Noksen, Nagaland)"],
        ["NOTA", "2013, after the Supreme Court's PUCL judgment"],
        ["Model Code of Conduct", "Guidelines by the EC — NOT a law; starts when elections are announced"],
        ["Electoral bonds (2018)", "Struck down by the Supreme Court on 15 February 2024 (ADR case)"],
        ["Delimitation", "Arts 82 & 170; number of seats frozen on the 1971 census until the first census after 2026 (84th Amendment)"],
        ["One Nation One Election", "Ram Nath Kovind committee (2024); constitutional amendment bill introduced in December 2024 and sent to a JPC"],
      ],
    },
    { t: "p", text: "**National party** — a party is recognised as national if it (a) gets 6% of votes in 4 or more states AND wins 4 Lok Sabha seats, OR (b) wins 2% of Lok Sabha seats (11) from at least 3 states, OR (c) is a recognised state party in 4 states. After the 2023 review, there are **6 national parties**." },
    { t: "trap", text: "The Model Code of Conduct is not a statute. The CEC can be removed only like an SC judge, but other ECs can be removed on the CEC's recommendation." },
    {
      t: "exam",
      items: [
        "“First Chief Election Commissioner” → Sukumar Sen",
        "“Which Act deals with the conduct of elections and disqualifications?” → RPA 1951 (rolls = RPA 1950)",
        "Firsts: EVM 1982, VVPAT 2013, NOTA 2013, voting age 18 (61st)",
      ],
    },
    {
      t: "recap",
      items: [
        "ECI Art 324; 25 Jan 1950; CEC + 2; 6 years / 65",
        "RPA 1950 rolls; RPA 1951 conduct & disqualification",
        "EVM 1982, VVPAT 2013, NOTA 2013; electoral bonds struck down 2024",
        "Model Code not a law; seats frozen until census after 2026",
      ],
    },
  ],
  quiz: [
    { q: "The first Chief Election Commissioner of India was:", options: ["T. N. Seshan", "Sukumar Sen", "K. V. K. Sundaram", "S. P. Sen Verma"], answer: 1, explain: "He conducted the 1951–52 elections." },
    { q: "Qualifications and disqualifications of MPs are laid down in the:", options: ["RPA 1950", "RPA 1951", "Delimitation Act", "10th Schedule only"], answer: 1, explain: "RPA 1950 deals with electoral rolls." },
    { q: "NOTA was introduced in Indian elections in:", options: ["2009", "2013", "2014", "2019"], answer: 1, explain: "After the PUCL judgment." },
  ],
};

/** Bodies module: statutory bodies, official language and cooperatives. */
export const STATUTORY_LANGUAGE: Lesson = {
  id: "statutory-language",
  title: "Statutory bodies, official language & cooperatives",
  oneLine: "Bodies made by Acts of Parliament — NHRC, CIC, CVC, Lokpal — and the rules about languages are steady sources of exam questions.",
  minutes: 16,
  blocks: [
    {
      t: "table",
      head: ["Body", "Created by", "Remember"],
      rows: [
        ["National Human Rights Commission", "Protection of Human Rights Act 1993", "Chairperson: a retired Chief Justice of India or SC judge"],
        ["Central Information Commission", "Right to Information Act 2005", "RTI reply within 30 days (48 hours if life or liberty is at stake)"],
        ["Central Vigilance Commission", "Set up 1964 (Santhanam Committee); statutory by the CVC Act 2003", "Anti-corruption watchdog"],
        ["Lokpal", "Lokpal and Lokayuktas Act 2013", "First Lokpal: Justice Pinaki Chandra Ghose (2019); chair + up to 8 members, half judicial"],
        ["National Commission for Women", "NCW Act 1990 (set up 1992)", ""],
        ["NCPCR (child rights)", "CPCR Act 2005 (set up 2007)", ""],
        ["National Green Tribunal", "NGT Act 2010", ""],
        ["NIA", "NIA Act 2008", "Anti-terror agency"],
        ["CBI", "Not statutory — executive resolution (1963)", "Works under the DSPE Act 1946"],
      ],
    },
    { t: "p", text: "**Official language — Part XVII (Arts 343–351).** Hindi in **Devanagari** script is the official language of the Union (**Art 343**); English continues under the **Official Languages Act 1963**. **Hindi Diwas — 14 September** (adopted on 14 Sept 1949). **Art 350A**: primary education in the mother tongue. **Art 351**: duty of the Union to develop Hindi." },
    {
      t: "table",
      head: ["8th Schedule (22 languages)", "Added by"],
      rows: [
        ["Original 14 languages", "1950"],
        ["Sindhi", "21st Amendment, 1967"],
        ["Konkani, Manipuri, Nepali", "71st Amendment, 1992"],
        ["Bodo, Dogri, **Maithili**, Santhali", "92nd Amendment, 2003"],
      ],
    },
    { t: "p", text: "**Classical languages (11):** Tamil (2004, the first), Sanskrit (2005), Telugu & Kannada (2008), Malayalam (2013), Odia (2014), and **Marathi, Pali, Prakrit, Assamese, Bengali (October 2024)**." },
    { t: "p", text: "**Cooperative societies — 97th Amendment (2011):** the right to form cooperatives added to **Art 19(1)(c)**, a new DPSP **Art 43B**, and **Part IXB**. A separate **Ministry of Cooperation** was created in 2021." },
    { t: "trap", text: "CBI is NOT a statutory body; NIA is. Maithili (Bihar) entered the 8th Schedule in 2003 (92nd Amendment). Pali and Prakrit — languages of Buddhist and Jain texts — became classical in 2024." },
    {
      t: "exam",
      items: [
        "Constitutional vs statutory vs executive — classify NHRC, CBI, NITI Aayog, Finance Commission",
        "“Maithili was added to the 8th Schedule by…” → 92nd Amendment (2003)",
        "“Which was the first classical language?” → Tamil (2004)",
      ],
    },
    {
      t: "recap",
      items: [
        "NHRC 1993; CIC (RTI 2005); CVC 1964 → statutory 2003; Lokpal 2013 (first: P. C. Ghose)",
        "CBI executive; NIA statutory (2008)",
        "Art 343 Hindi in Devanagari; Hindi Diwas 14 Sept; Art 350A mother tongue",
        "8th Schedule 22; Maithili 2003; 11 classical languages (5 added in 2024)",
        "97th Amendment: cooperatives — 19(1)(c), 43B, Part IXB",
      ],
    },
  ],
  quiz: [
    { q: "Which of these is NOT a statutory body?", options: ["NHRC", "NIA", "CBI", "Lokpal"], answer: 2, explain: "CBI was created by an executive resolution in 1963." },
    { q: "Maithili was included in the 8th Schedule by the:", options: ["71st Amendment", "92nd Amendment", "21st Amendment", "86th Amendment"], answer: 1, explain: "With Bodo, Dogri and Santhali, 2003." },
    { q: "The first language declared “classical” in India was:", options: ["Sanskrit", "Tamil", "Telugu", "Kannada"], answer: 1, explain: "2004." },
    { q: "The right to form cooperative societies was added to Article 19 by the:", options: ["73rd Amendment", "86th Amendment", "97th Amendment", "101st Amendment"], answer: 2, explain: "2011." },
  ],
};
