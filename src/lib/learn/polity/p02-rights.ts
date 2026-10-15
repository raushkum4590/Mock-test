import type { LearnModule } from "../types";

export const P02_RIGHTS: LearnModule = {
  id: "rights",
  title: "Citizens: rights, duties & directive principles",
  titleHi: "नागरिक: अधिकार, कर्तव्य एवं नीति निदेशक तत्व",
  blurb: "What the Constitution guarantees you, what it asks of you, and what it asks the government to aim for.",
  lessons: [
    {
      id: "fundamental-rights",
      title: "Fundamental Rights (Articles 12–35)",
      oneLine: "Fundamental Rights are guarantees that protect every person from misuse of power by the government — and you can go straight to the Supreme Court if they are violated.",
      minutes: 20,
      blocks: [
        { t: "p", text: "**What makes them “fundamental”?** They are written in **Part III** of the Constitution, they limit what the government can do, and they are **justiciable** — if they are violated, you can go to court. Originally there were 7; the **Right to Property** was removed by the **44th Amendment (1978)** and is now only a legal right under **Article 300A**. So today there are **6**." },
        {
          t: "table",
          head: ["Right", "Articles", "Key points"],
          rows: [
            ["1. Right to Equality", "14–18", "14 equality before law; 15 no discrimination on religion, race, caste, sex, place of birth; 16 equal opportunity in public jobs; 17 untouchability abolished; 18 titles abolished (Bharat Ratna etc. are awards, not titles)"],
            ["2. Right to Freedom", "19–22", "19 six freedoms — speech & expression, peaceful assembly, association, movement, residence, profession; 20 protection in conviction (no double punishment, no forced self-incrimination); 21 life and personal liberty; 21A free education for ages 6–14; 22 protection on arrest"],
            ["3. Right against Exploitation", "23–24", "23 no human trafficking or forced labour (begar); 24 no child below 14 in factories, mines or hazardous work"],
            ["4. Right to Freedom of Religion", "25–28", "Freedom to profess, practise and propagate religion; manage religious affairs; no religious instruction in fully state-funded schools"],
            ["5. Cultural & Educational Rights", "29–30", "Minorities can protect their language/culture and run their own educational institutions"],
            ["6. Right to Constitutional Remedies", "32", "Go directly to the Supreme Court to enforce rights — Ambedkar called it “the heart and soul of the Constitution”"],
          ],
        },
        { t: "trick", text: "Six rights = “E F E R C C” — Equality, Freedom, Exploitation (against), Religion, Culture & education, Constitutional remedies." },
        { t: "p", text: "**Article 21 grew over time.** Through court judgments, the “right to life” now includes the right to live with dignity, privacy (**Puttaswamy case, 2017**), clean environment, livelihood, health, speedy trial and more. **Article 21A** (free and compulsory education for children aged 6–14) was added by the **86th Amendment (2002)**; the Right to Education Act came in 2009." },
        { t: "p", text: "**Writs — the court's orders to protect rights.** The Supreme Court issues them under **Article 32**; High Courts under **Article 226** (High Courts can also use them for other legal rights, so their power is wider)." },
        {
          t: "table",
          head: ["Writ", "Literal meaning", "Used when"],
          rows: [
            ["Habeas Corpus", "“You may have the body”", "Someone is detained illegally — produce the person before the court"],
            ["Mandamus", "“We command”", "An official/body must perform a duty it is avoiding"],
            ["Prohibition", "“To forbid”", "A higher court stops a lower court from going beyond its powers (during the case)"],
            ["Certiorari", "“To be certified / informed”", "A higher court cancels a lower court's order already passed"],
            ["Quo Warranto", "“By what authority?”", "Someone holds a public office illegally"],
          ],
        },
        { t: "trap", text: "Some rights are only for CITIZENS (Articles 15, 16, 19, 29, 30); others, like Articles 14, 20, 21, are for everyone, including foreigners. And the Right to Property is no longer a Fundamental Right." },
        {
          t: "recap",
          items: [
            "Part III, Articles 12–35; 6 rights now (property removed by 44th Amendment 1978 → Art 300A)",
            "14–18 equality, 19–22 freedom, 23–24 against exploitation, 25–28 religion, 29–30 culture & education, 32 remedies",
            "Article 19 — six freedoms; Article 21 — life & liberty (includes privacy); 21A — education 6–14 (86th Amendment)",
            "Writs: Habeas corpus, Mandamus, Prohibition, Certiorari, Quo warranto (SC Art 32, HC Art 226)",
          ],
        },
      ],
      quiz: [
        { q: "Which Article abolishes untouchability?", options: ["14", "15", "17", "18"], answer: 2, explain: "Article 17." },
        { q: "Which writ is issued to release a person detained illegally?", options: ["Mandamus", "Habeas Corpus", "Certiorari", "Quo Warranto"], answer: 1, explain: "“Produce the body” before the court." },
        { q: "The Right to Property was removed from Fundamental Rights by the:", options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "86th Amendment"], answer: 1, explain: "1978; now Article 300A." },
      ],
    },
    {
      id: "dpsp-duties-citizenship",
      title: "Directive Principles, Fundamental Duties & citizenship",
      oneLine: "Directive Principles are goals for the government (not enforceable in court); Fundamental Duties are what citizens owe the nation.",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Directive Principles of State Policy (DPSP)** — **Part IV, Articles 36–51**, borrowed from **Ireland**. They are instructions to the government for making laws and policies that create a welfare state. Unlike Fundamental Rights, they are **non-justiciable** — a court cannot force the government to follow them." },
        { t: "analogy", text: "Fundamental Rights are like the brakes on a car — they stop the government from harming you. Directive Principles are like the GPS destination — they tell the government where it should be heading." },
        {
          t: "table",
          head: ["Type", "Examples (Article)"],
          rows: [
            ["Socialist", "Adequate livelihood, equal pay for equal work (39); free legal aid (39A); right to work, education and public help (41); living wage (43)"],
            ["Gandhian", "Village panchayats (40); cottage industries (43); prohibition of intoxicating drinks (47); ban on cow slaughter (48)"],
            ["Liberal-intellectual", "Uniform Civil Code (44); early childhood care up to 6 years (45); protect the environment (48A); separate judiciary from executive (50); international peace (51)"],
          ],
        },
        { t: "p", text: "**Fundamental Duties** — **Part IVA, Article 51A**, added by the **42nd Amendment (1976)** on the recommendation of the **Swaran Singh Committee**; idea taken from the **USSR**. Originally **10** duties; the **11th** (parents/guardians to provide education to children aged 6–14) was added by the **86th Amendment (2002)**. Examples: respect the Constitution, national flag and anthem; protect the sovereignty and unity of India; protect the environment; develop scientific temper; safeguard public property." },
        { t: "p", text: "**Citizenship — Part II, Articles 5–11.** India has **single citizenship**. The **Citizenship Act, 1955** says citizenship can be acquired by **birth, descent, registration, naturalisation** and **incorporation of territory**. Citizenship is lost by renunciation, termination (taking another country's citizenship) or deprivation." },
        { t: "trap", text: "DPSP are not enforceable in courts, but the Constitution calls them “fundamental in the governance of the country”. The 11th Fundamental Duty came in 2002 (86th Amendment), the same amendment that added Article 21A." },
        {
          t: "recap",
          items: [
            "DPSP: Part IV, Arts 36–51, from Ireland, non-justiciable — goals for a welfare state",
            "Art 40 panchayats, 44 Uniform Civil Code, 48A environment, 50 separate judiciary",
            "Fundamental Duties: Part IVA, Art 51A, 42nd Amendment 1976, Swaran Singh Committee, from USSR; now 11",
            "Citizenship: Part II, Arts 5–11; Citizenship Act 1955; single citizenship",
          ],
        },
      ],
      quiz: [
        { q: "Fundamental Duties were added by the:", options: ["42nd Amendment", "44th Amendment", "73rd Amendment", "86th Amendment"], answer: 0, explain: "1976, on the Swaran Singh Committee's recommendation." },
        { q: "The Uniform Civil Code is mentioned in Article:", options: ["40", "44", "48A", "51A"], answer: 1, explain: "A Directive Principle." },
        { q: "Directive Principles are:", options: ["Enforceable in court", "Non-justiciable", "Part of Part III", "Only for states"], answer: 1, explain: "Courts cannot enforce them." },
      ],
    },
  ],
};
