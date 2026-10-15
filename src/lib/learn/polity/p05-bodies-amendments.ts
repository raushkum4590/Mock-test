import type { LearnModule } from "../types";
import { ELECTIONS, STATUTORY_LANGUAGE } from "./p-extra";

export const P05_BODIES_AMENDMENTS: LearnModule = {
  id: "bodies-amendments",
  title: "Constitutional bodies, amendments & landmark cases",
  titleHi: "संवैधानिक निकाय, संशोधन एवं ऐतिहासिक मामले",
  blurb: "The independent watchdogs of Indian democracy, how the Constitution is changed, and the court cases every exam asks about.",
  lessons: [
    {
      id: "constitutional-bodies",
      title: "Election Commission, CAG, UPSC & other bodies",
      oneLine: "Constitutional bodies are independent referees — they conduct elections, audit government money and recruit officers without government interference.",
      minutes: 14,
      blocks: [
        { t: "p", text: "**Constitutional vs non-constitutional.** A **constitutional body** is created by the Constitution itself (so it can only be changed by amending the Constitution). A **statutory body** is created by a law of Parliament. An **executive body** is created by a government order." },
        {
          t: "table",
          head: ["Body", "Article", "Job"],
          rows: [
            ["Election Commission", "324", "Conducts elections to Parliament, state legislatures, President and Vice-President; formed 25 January 1950 (National Voters' Day)"],
            ["Comptroller & Auditor General (CAG)", "148", "Audits all government spending — “guardian of the public purse”"],
            ["Union Public Service Commission (UPSC)", "315", "Recruits officers for central services (IAS, IPS etc.)"],
            ["Finance Commission", "280", "Every 5 years recommends how tax money is shared between the Centre and states"],
            ["Attorney General", "76", "Highest law officer of India; can speak in Parliament but not vote"],
            ["Advocate General (state)", "165", "Highest law officer of a state"],
            ["GST Council", "279A", "Decides GST rates (added by the 101st Amendment, 2016)"],
            ["National Commission for SCs / STs / Backward Classes", "338 / 338A / 338B", "Protect the rights of these groups"],
          ],
        },
        {
          t: "table",
          head: ["Not constitutional — but often asked", "Type"],
          rows: [["NITI Aayog (2015)", "Executive (cabinet resolution)"], ["Planning Commission (1950–2014)", "Executive"], ["National Human Rights Commission (1993)", "Statutory"], ["Central Vigilance Commission", "Statutory"], ["Lokpal (2013 Act)", "Statutory"], ["CBI", "Executive (works under the DSPE Act)"]],
        },
        { t: "trap", text: "NITI Aayog and the old Planning Commission were NOT constitutional bodies. The Finance Commission IS (Article 280)." },
        {
          t: "recap",
          items: [
            "Election Commission Art 324 (25 Jan 1950); CAG Art 148; UPSC Art 315; Finance Commission Art 280",
            "Attorney General Art 76 (speaks in Parliament, no vote); Advocate General Art 165",
            "GST Council Art 279A (101st Amendment)",
            "NITI Aayog = executive body; NHRC = statutory",
          ],
        },
      ],
      quiz: [
        { q: "The Comptroller and Auditor General is appointed under Article:", options: ["148", "280", "324", "76"], answer: 0, explain: "CAG — Article 148." },
        { q: "Which of these is NOT a constitutional body?", options: ["Election Commission", "Finance Commission", "NITI Aayog", "UPSC"], answer: 2, explain: "NITI Aayog was set up by a cabinet resolution in 2015." },
        { q: "The highest law officer of India is the:", options: ["Chief Justice", "Attorney General", "Solicitor General", "Law Minister"], answer: 1, explain: "Article 76." },
      ],
    },
    ELECTIONS,
    STATUTORY_LANGUAGE,
    {
      id: "amendments-cases",
      title: "Amending the Constitution & landmark judgments",
      oneLine: "The Constitution can be changed by Parliament (Article 368) — but the Supreme Court has said its “basic structure” can never be destroyed.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**How is the Constitution amended? (Article 368)** There are three ways, depending on how important the provision is:" },
        {
          t: "table",
          head: ["Method", "Needed", "Examples"],
          rows: [
            ["Simple majority", "Like an ordinary law (technically outside Art 368)", "Creating new states, changing state names/borders, citizenship rules"],
            ["Special majority", "Majority of total membership AND 2/3 of members present and voting, in EACH House", "Fundamental Rights, DPSP — most amendments"],
            ["Special majority + ratification", "Above + approval by at least half of the state legislatures", "Election of the President, Supreme Court/High Courts, distribution of powers, GST"],
          ],
        },
        {
          t: "table",
          head: ["Amendment", "Year", "What it did"],
          rows: [
            ["1st", "1951", "Added the 9th Schedule (protect land-reform laws)"],
            ["7th", "1956", "Reorganised states on a linguistic basis"],
            ["42nd", "1976", "“Mini-constitution”: Socialist, Secular, Integrity in the Preamble; Fundamental Duties"],
            ["44th", "1978", "Right to Property removed from FRs; “armed rebellion” replaced “internal disturbance”"],
            ["52nd", "1985", "Anti-defection law (10th Schedule)"],
            ["61st", "1989", "Voting age reduced from 21 to 18"],
            ["73rd / 74th", "1992", "Panchayats / municipalities"],
            ["86th", "2002", "Article 21A (education 6–14) and 11th Fundamental Duty"],
            ["101st", "2016", "Goods and Services Tax (GST)"],
            ["103rd", "2019", "10% reservation for economically weaker sections (EWS)"],
            ["104th", "2020", "Ended Anglo-Indian nominations; extended SC/ST reservation in legislatures"],
            ["106th", "2023", "One-third reservation for women in the Lok Sabha and state assemblies (Nari Shakti Vandan Adhiniyam)"],
          ],
        },
        { t: "p", text: "**Landmark Supreme Court cases:**" },
        {
          t: "table",
          head: ["Case", "Year", "Held that…"],
          rows: [
            ["Golaknath", "1967", "Parliament cannot amend Fundamental Rights (later overruled)"],
            ["Kesavananda Bharati", "1973", "Parliament can amend any part, but NOT the “basic structure” of the Constitution; the Preamble is part of the Constitution"],
            ["Maneka Gandhi", "1978", "Article 21 widened — any law depriving liberty must be fair, just and reasonable"],
            ["Minerva Mills", "1980", "Balance between FRs and DPSP is part of the basic structure; judicial review is basic structure"],
            ["Indra Sawhney (Mandal case)", "1992", "OBC reservation valid; total reservation normally capped at 50%; “creamy layer” excluded"],
            ["S. R. Bommai", "1994", "Limits on President's Rule; secularism is basic structure"],
            ["Vishaka", "1997", "Guidelines against sexual harassment at the workplace"],
            ["Shreya Singhal", "2015", "Struck down Section 66A of the IT Act (free speech)"],
            ["K. S. Puttaswamy", "2017", "Right to privacy is a Fundamental Right (part of Article 21)"],
          ],
        },
        { t: "trick", text: "“Kesavananda = Key-structure” — the Basic Structure doctrine (1973)." },
        {
          t: "recap",
          items: [
            "Art 368: simple, special, special + half the states",
            "42nd (1976) mini-constitution; 44th (1978) property removed; 52nd (1985) anti-defection; 61st (1989) vote at 18",
            "86th (2002) Art 21A; 101st (2016) GST; 103rd (2019) EWS; 106th (2023) women's reservation",
            "Kesavananda Bharati 1973 = basic structure; Puttaswamy 2017 = privacy; Indra Sawhney 1992 = 50% cap",
          ],
        },
      ],
      quiz: [
        { q: "The “basic structure” doctrine was laid down in:", options: ["Golaknath case", "Kesavananda Bharati case", "Minerva Mills case", "Maneka Gandhi case"], answer: 1, explain: "1973." },
        { q: "The voting age was lowered from 21 to 18 by the:", options: ["42nd Amendment", "52nd Amendment", "61st Amendment", "73rd Amendment"], answer: 2, explain: "1989." },
        { q: "Which case declared the right to privacy a Fundamental Right?", options: ["Vishaka", "K. S. Puttaswamy", "Shreya Singhal", "S. R. Bommai"], answer: 1, explain: "2017, under Article 21." },
      ],
    },
  ],
};
