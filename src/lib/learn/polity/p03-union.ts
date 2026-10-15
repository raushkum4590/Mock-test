import type { LearnModule } from "../types";
import { JUDICIARY_MORE, PARLIAMENT_WORKING } from "./p-extra";

export const P03_UNION: LearnModule = {
  id: "union",
  title: "The Union government",
  titleHi: "संघ सरकार",
  blurb: "President, Prime Minister, Parliament and the Supreme Court — who does what, and how they are chosen and removed.",
  lessons: [
    {
      id: "president-vp",
      title: "The President & the Vice-President",
      oneLine: "The President is the constitutional head of India — every action is taken in the President's name, but real power lies with the Prime Minister and ministers.",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Two kinds of head.** India's President is the **nominal (constitutional) head**; the Prime Minister is the **real head**. Under **Article 74**, the President acts on the **aid and advice of the Council of Ministers** headed by the PM — like the British monarch." },
        {
          t: "table",
          head: ["About the President", "Details"],
          rows: [
            ["Article", "52 — there shall be a President of India"],
            ["Elected by", "An electoral college of ELECTED members of both Houses of Parliament + ELECTED members of state Legislative Assemblies (and of Delhi and Puducherry)"],
            ["Voting system", "Proportional representation by single transferable vote (secret ballot)"],
            ["Qualifications", "Citizen of India, at least 35 years old, qualified to be a Lok Sabha member, holds no office of profit"],
            ["Term", "5 years; can be re-elected"],
            ["Oath given by", "The Chief Justice of India"],
            ["Resignation to", "The Vice-President"],
            ["Removal", "Impeachment for “violation of the Constitution” (Article 61) — charge in either House, passed by 2/3 of the TOTAL membership of each House"],
          ],
        },
        {
          t: "table",
          head: ["Power", "Article", "Meaning"],
          rows: [
            ["Pardon", "72", "Can pardon, reduce or suspend punishment — even a death sentence"],
            ["Ordinance", "123", "Can make a temporary law when Parliament is not in session"],
            ["National emergency", "352", "War, external aggression or armed rebellion"],
            ["President's Rule", "356", "When a state's government can't run according to the Constitution"],
            ["Financial emergency", "360", "Never used so far"],
            ["Appointments", "—", "PM, ministers, judges, Governors, CAG, Election Commissioners, Attorney General"],
          ],
        },
        { t: "p", text: "**The Vice-President (Article 63)** — the second-highest office. Elected by **all members (elected AND nominated) of both Houses of Parliament** only; minimum age 35; term 5 years. The VP is the **ex-officio Chairman of the Rajya Sabha** and acts as President when the office is vacant. First VP: **Dr S. Radhakrishnan**." },
        { t: "trap", text: "Nominated MPs and MLCs do NOT vote in the President's election, but nominated MPs DO vote in the Vice-President's election. State MLAs vote only for the President." },
        {
          t: "recap",
          items: [
            "President = constitutional head; acts on ministers' advice (Art 74)",
            "Elected by elected MPs + elected MLAs; age 35; 5 years; oath by CJI",
            "Impeachment (Art 61): 2/3 of total membership of each House",
            "Pardon 72, ordinance 123, emergencies 352/356/360",
            "Vice-President (Art 63): elected by all MPs; Chairman of Rajya Sabha",
          ],
        },
      ],
      quiz: [
        { q: "The President's pardoning power is under Article:", options: ["72", "123", "352", "356"], answer: 0, explain: "Article 72; ordinances are under 123." },
        { q: "Who administers the oath to the President?", options: ["Vice-President", "Prime Minister", "Chief Justice of India", "Speaker"], answer: 2, explain: "The Chief Justice of India." },
        { q: "The ex-officio Chairman of the Rajya Sabha is the:", options: ["Speaker", "Vice-President", "President", "Prime Minister"], answer: 1, explain: "The Vice-President." },
      ],
    },
    {
      id: "pm-council",
      title: "The Prime Minister & the Council of Ministers",
      oneLine: "The Prime Minister leads the government; the whole Council of Ministers stands or falls together because it is collectively responsible to the Lok Sabha.",
      minutes: 12,
      blocks: [
        { t: "p", text: "**How does someone become PM?** The President appoints as PM the leader who can win the support (majority) of the **Lok Sabha** (Article 75). Other ministers are appointed by the President on the PM's advice. A minister must become an MP within **6 months**." },
        { t: "p", text: "**Collective responsibility (Article 75(3)):** the Council of Ministers is responsible to the **Lok Sabha** as a team. If the Lok Sabha passes a **no-confidence motion**, the whole government must resign — not just one minister." },
        { t: "analogy", text: "The cabinet is like a cricket team with the PM as captain: decisions are taken together, and if the team loses the confidence of the people's house, the whole team goes out." },
        {
          t: "table",
          head: ["Rank of minister", "Meaning"],
          rows: [["Cabinet ministers", "Head the most important ministries; form the Cabinet"], ["Ministers of State (independent charge)", "Head a smaller ministry on their own"], ["Ministers of State", "Assist cabinet ministers"]],
        },
        { t: "p", text: "**Size limit:** the total number of ministers (including the PM) cannot exceed **15% of the Lok Sabha's strength** — added by the **91st Amendment (2003)**, which also strengthened the anti-defection law." },
        { t: "p", text: "**NITI Aayog** (2015) replaced the **Planning Commission** (1950). Both were created by an executive (cabinet) resolution — neither is constitutional or statutory. The PM is the chairperson of NITI Aayog." },
        {
          t: "recap",
          items: [
            "PM appointed by the President (Art 75) — must command a Lok Sabha majority",
            "Collective responsibility to the Lok Sabha; no-confidence motion → whole government resigns",
            "Ministers must become MPs within 6 months",
            "Council of Ministers ≤ 15% of Lok Sabha (91st Amendment 2003)",
            "NITI Aayog (2015) replaced the Planning Commission; PM is chairperson",
          ],
        },
      ],
      quiz: [
        { q: "The Council of Ministers is collectively responsible to the:", options: ["President", "Rajya Sabha", "Lok Sabha", "Supreme Court"], answer: 2, explain: "Article 75(3)." },
        { q: "The size of the Council of Ministers is limited to 15% of the Lok Sabha by the:", options: ["42nd Amendment", "52nd Amendment", "91st Amendment", "73rd Amendment"], answer: 2, explain: "2003." },
      ],
    },
    {
      id: "parliament",
      title: "Parliament: Lok Sabha, Rajya Sabha & how laws are made",
      oneLine: "Parliament = President + Rajya Sabha + Lok Sabha; the directly elected Lok Sabha is the more powerful house, especially over money.",
      minutes: 20,
      blocks: [
        { t: "p", text: "**Article 79:** Parliament consists of the **President**, the **Rajya Sabha** (Council of States, upper house) and the **Lok Sabha** (House of the People, lower house). The President is part of Parliament because no bill becomes law without the President's assent." },
        {
          t: "table",
          head: ["", "Lok Sabha", "Rajya Sabha"],
          rows: [
            ["Represents", "The people (directly elected)", "The states (elected by state MLAs)"],
            ["Maximum strength", "552 by the Constitution; 543 elected seats today", "250 — 238 elected + 12 nominated by the President (art, literature, science, social service)"],
            ["Term", "5 years (can be dissolved earlier)", "Permanent — never dissolved; one-third of members retire every 2 years; each member's term is 6 years"],
            ["Minimum age", "25", "30"],
            ["Presiding officer", "Speaker (elected by members)", "Chairman = Vice-President of India"],
            ["Money bills", "Introduced only here", "Can only recommend changes within 14 days"],
            ["No-confidence motion", "Only here", "No"],
          ],
        },
        { t: "p", text: "The 2 seats nominated for Anglo-Indians in the Lok Sabha were ended by the **104th Amendment (2020)**." },
        { t: "p", text: "**How a bill becomes a law:** a bill is introduced → **first reading** (introduced) → **second reading** (discussion, often a committee looks at it, clause-by-clause voting) → **third reading** (passed) → sent to the other House, which goes through the same steps → **President's assent** → it becomes an **Act**." },
        {
          t: "table",
          head: ["Type of bill", "Remember"],
          rows: [
            ["Ordinary bill", "Can start in either House; if the Houses disagree, the President can call a JOINT SITTING (Article 108), chaired by the Speaker"],
            ["Money bill (Article 110)", "Only about taxes, borrowing, spending; introduced ONLY in the Lok Sabha with the President's recommendation; the SPEAKER decides whether a bill is a money bill; Rajya Sabha can delay only 14 days; no joint sitting"],
            ["Constitution amendment bill (Article 368)", "Needs a special majority in EACH House separately; no joint sitting; the President must give assent"],
          ],
        },
        { t: "p", text: "**Budget:** the Constitution calls it the **Annual Financial Statement (Article 112)**. **Sessions:** usually three — Budget (Feb–May), Monsoon (July–Sept), Winter (Nov–Dec); the gap between two sessions cannot exceed **6 months**." },
        { t: "p", text: "**Question Hour** is the first hour of a sitting, when MPs ask ministers questions. **Zero Hour** (starting at 12 noon) is an Indian practice — not mentioned in the rules — for raising urgent matters." },
        { t: "trap", text: "Joint sittings are possible for ordinary bills only — never for money bills or constitutional amendments. And the Speaker, not the President, certifies a money bill." },
        {
          t: "recap",
          items: [
            "Parliament = President + Rajya Sabha + Lok Sabha (Art 79)",
            "Lok Sabha: 543 elected, 5 years, age 25, Speaker; Rajya Sabha: max 250 (12 nominated), permanent, 6-year terms, age 30",
            "Money bill (Art 110): only in Lok Sabha, Speaker certifies, RS delay 14 days",
            "Joint sitting (Art 108) for ordinary bills only, chaired by the Speaker",
            "Budget = Annual Financial Statement (Art 112); gap between sessions ≤ 6 months",
          ],
        },
      ],
      quiz: [
        { q: "Who decides whether a bill is a money bill?", options: ["President", "Speaker of the Lok Sabha", "Finance Minister", "Chairman of the Rajya Sabha"], answer: 1, explain: "The Speaker's decision is final." },
        { q: "How many members can the President nominate to the Rajya Sabha?", options: ["2", "10", "12", "14"], answer: 2, explain: "12, for art, literature, science and social service." },
        { q: "A joint sitting of Parliament is presided over by the:", options: ["President", "Vice-President", "Speaker of the Lok Sabha", "Prime Minister"], answer: 2, explain: "Article 108." },
      ],
    },
    PARLIAMENT_WORKING,
    {
      id: "judiciary",
      title: "The Supreme Court & the judiciary",
      oneLine: "The Supreme Court is the guardian of the Constitution: it settles disputes, protects Fundamental Rights and can strike down unconstitutional laws.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**India has one integrated judiciary:** Supreme Court at the top → High Courts in the states → district and subordinate courts. Decisions of the Supreme Court are binding on all courts (**Article 141**)." },
        {
          t: "table",
          head: ["About the Supreme Court", "Details"],
          rows: [
            ["Article", "124; inaugurated 28 January 1950"],
            ["Strength", "Chief Justice + 33 other judges (34 in all) — set by Parliament"],
            ["Appointment", "By the President, through the collegium system (CJI + senior judges recommend)"],
            ["Retirement age", "65 (High Court judges: 62)"],
            ["Removal", "By the President after Parliament passes a motion by a special majority in each House, on proved misbehaviour or incapacity"],
            ["First Chief Justice", "H. J. Kania"],
          ],
        },
        {
          t: "table",
          head: ["Jurisdiction (power to hear cases)", "Meaning"],
          rows: [
            ["Original (Article 131)", "Disputes between the Centre and states, or between states, start directly in the SC"],
            ["Writ (Article 32)", "Protection of Fundamental Rights"],
            ["Appellate", "Hears appeals against High Court judgments"],
            ["Advisory (Article 143)", "The President can ask the SC's opinion on a legal question (the opinion is not binding)"],
          ],
        },
        { t: "p", text: "**Judicial review** — the power to check whether a law or government action follows the Constitution, and to strike it down if not. **Public Interest Litigation (PIL)** lets anyone approach the court for the public good, even if not personally affected — started in the 1980s by Justices P. N. Bhagwati and V. R. Krishna Iyer." },
        { t: "p", text: "**High Courts:** Article 214; judges retire at 62. Some states share one High Court. The **Patna High Court** was established in 1916." },
        {
          t: "recap",
          items: [
            "Integrated judiciary; SC decisions binding (Art 141)",
            "SC: Art 124, CJI + 33 judges, retire at 65; HC judges at 62",
            "Original (131), writ (32), appellate, advisory (143) jurisdiction",
            "Judicial review; PIL (Bhagwati, Krishna Iyer)",
            "First CJI H. J. Kania; Patna High Court 1916",
          ],
        },
      ],
      quiz: [
        { q: "Supreme Court judges retire at the age of:", options: ["60", "62", "65", "70"], answer: 2, explain: "High Court judges retire at 62." },
        { q: "The advisory jurisdiction of the Supreme Court is under Article:", options: ["131", "143", "32", "226"], answer: 1, explain: "The President may seek its opinion." },
        { q: "The first Chief Justice of India was:", options: ["H. J. Kania", "M. Patanjali Sastri", "B. K. Mukherjea", "S. R. Das"], answer: 0, explain: "Harilal J. Kania." },
      ],
    },
    JUDICIARY_MORE,
  ],
};
