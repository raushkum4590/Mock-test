import type { LearnModule } from "../types";
import { CENTRE_STATE } from "./p-extra";

export const P04_STATES_LOCAL: LearnModule = {
  id: "states-local",
  title: "States, federalism, emergencies & local government",
  titleHi: "राज्य, संघवाद, आपातकाल एवं स्थानीय शासन",
  blurb: "How states are governed, how power is shared with the Centre, what happens in an emergency, and panchayats and municipalities.",
  lessons: [
    {
      id: "state-government",
      title: "State government: Governor, Chief Minister & legislature",
      oneLine: "Each state has a mini-version of the Union: a Governor (nominal head), a Chief Minister (real head) and a legislature.",
      minutes: 12,
      blocks: [
        {
          t: "table",
          head: ["Union level", "State level"],
          rows: [["President (nominal head)", "Governor (nominal head)"], ["Prime Minister (real head)", "Chief Minister (real head)"], ["Parliament (Lok Sabha + Rajya Sabha)", "Legislative Assembly (Vidhan Sabha) + in some states a Legislative Council (Vidhan Parishad)"], ["Supreme Court", "High Court"]],
        },
        { t: "p", text: "**Governor:** appointed by the **President** (idea from Canada) and holds office “during the pleasure of the President” — normally 5 years. Minimum age 35. One person can be Governor of two or more states. The Governor appoints the Chief Minister and acts on the advice of the state's council of ministers, but has some **discretionary powers** (e.g. reporting to the President that a state government has failed, which can lead to President's Rule)." },
        { t: "p", text: "**Legislative Councils** exist in only **six states**: Andhra Pradesh, Telangana, Uttar Pradesh, **Bihar**, Maharashtra and Karnataka. Parliament can create or abolish a council if the state assembly asks by a special majority (Article 169)." },
        {
          t: "recap",
          items: [
            "Governor: appointed by the President, “during pleasure”, age 35, nominal head",
            "Chief Minister: real head, appointed by the Governor",
            "Legislative Councils in 6 states: AP, Telangana, UP, Bihar, Maharashtra, Karnataka",
          ],
        },
      ],
      quiz: [
        { q: "The Governor of a state is appointed by the:", options: ["Chief Minister", "President", "Prime Minister", "State legislature"], answer: 1, explain: "And holds office during the President's pleasure." },
        { q: "Which of these states has a Legislative Council?", options: ["Rajasthan", "Bihar", "Gujarat", "West Bengal"], answer: 1, explain: "Bihar is one of six states with a Vidhan Parishad." },
      ],
    },
    CENTRE_STATE,
    {
      id: "federalism-emergency",
      title: "Centre–state relations & emergency provisions",
      oneLine: "India is a federation with a strong Centre — and in an emergency the Constitution lets the Centre take over even more power.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Federal but with a unitary tilt.** Power is shared between the Centre and states through the three lists of the 7th Schedule, but the Centre is stronger: Parliament can make laws on state subjects in some cases, Governors are appointed by the Centre, residuary powers belong to the Centre, and emergencies centralise power. That's why India is called **“quasi-federal”** or a **“Union of States”** (Article 1)." },
        {
          t: "table",
          head: ["Emergency", "Article", "Grounds", "Parliament's approval within", "Used?"],
          rows: [
            ["National emergency", "352", "War, external aggression or ARMED REBELLION (“internal disturbance” was replaced by the 44th Amendment, 1978)", "1 month (special majority)", "1962 (China war), 1971 (Pakistan war), 1975 (internal disturbance)"],
            ["President's Rule (state emergency)", "356", "The state government can't be run according to the Constitution", "2 months; can last up to 3 years with approvals", "Many times; the S. R. Bommai case (1994) limited its misuse"],
            ["Financial emergency", "360", "Threat to India's financial stability or credit", "2 months", "Never used"],
          ],
        },
        { t: "p", text: "**During a national emergency**, Parliament can make laws on state subjects and the Centre can direct states. Article 19 freedoms are suspended automatically during war/external aggression; other rights can be suspended by presidential order — except **Articles 20 and 21**, which can never be suspended (44th Amendment)." },
        { t: "trap", text: "Financial emergency (Art 360) has never been declared. The 1975 emergency was on the ground of “internal disturbance”, which was later replaced by “armed rebellion”." },
        {
          t: "recap",
          items: [
            "Quasi-federal; Article 1: India is a “Union of States”",
            "Art 352 national emergency: war, external aggression, armed rebellion; used 1962, 1971, 1975",
            "Art 356 President's Rule — S. R. Bommai case (1994) checked misuse",
            "Art 360 financial emergency — never used",
            "Articles 20 and 21 can never be suspended",
          ],
        },
      ],
      quiz: [
        { q: "Which emergency has never been declared in India?", options: ["National", "President's Rule", "Financial", "None — all have been used"], answer: 2, explain: "Article 360 has never been used." },
        { q: "Which Articles can NOT be suspended even during a national emergency?", options: ["14 and 19", "20 and 21", "19 and 21", "32 and 226"], answer: 1, explain: "Since the 44th Amendment (1978)." },
      ],
    },
    {
      id: "local-government",
      title: "Panchayati Raj & municipalities",
      oneLine: "Local government brings democracy to the village and the town: panchayats in rural areas and municipalities in cities, made constitutional in 1992.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Why local government?** Problems like village roads, drinking water or street lights are best solved by people who live there. Gandhi called village self-rule “Gram Swaraj”." },
        { t: "p", text: "**History:** the **Balwant Rai Mehta Committee (1957)** recommended a **three-tier Panchayati Raj**. It was first started at **Nagaur, Rajasthan, on 2 October 1959** by Nehru. It became part of the Constitution through the **73rd Amendment (1992)**, in force from **24 April 1993** — now celebrated as **National Panchayati Raj Day**." },
        {
          t: "table",
          head: ["73rd Amendment (Panchayats)", "Details"],
          rows: [
            ["Part / articles", "Part IX, Articles 243–243O"],
            ["Schedule", "11th Schedule — 29 subjects"],
            ["Three tiers", "Village (Gram Panchayat), block/intermediate (Panchayat Samiti), district (Zila Parishad) — states with less than 20 lakh population may skip the middle tier"],
            ["Gram Sabha", "All adult voters of the village — the base of the system"],
            ["Term", "5 years; elections by the State Election Commission"],
            ["Reservation", "SC/ST in proportion to population; at least one-third of seats for women (many states, starting with Bihar in 2006, give 50%)"],
            ["Money", "State Finance Commission every 5 years"],
          ],
        },
        {
          t: "table",
          head: ["74th Amendment (Municipalities)", "Details"],
          rows: [["Part / articles", "Part IXA, Articles 243P–243ZG"], ["Schedule", "12th Schedule — 18 subjects"], ["Types", "Nagar Panchayat (area changing from rural to urban), Municipal Council (smaller towns), Municipal Corporation (big cities)"]],
        },
        { t: "trick", text: "73 → villages → 11th schedule → 29 subjects. 74 → towns → 12th schedule → 18 subjects. (Bigger number of subjects goes with the smaller amendment number.)" },
        {
          t: "recap",
          items: [
            "Balwant Rai Mehta Committee 1957 → three tiers; first at Nagaur, Rajasthan, 2 Oct 1959",
            "73rd Amendment 1992: Part IX, 11th Schedule, 29 subjects; in force 24 April 1993",
            "74th Amendment: Part IXA, 12th Schedule, 18 subjects",
            "One-third seats for women (Bihar first to give 50%, 2006); State Election Commission; 5-year term",
          ],
        },
      ],
      quiz: [
        { q: "Panchayati Raj was first introduced at:", options: ["Nagaur (Rajasthan)", "Patna (Bihar)", "Anand (Gujarat)", "Shimla"], answer: 0, explain: "2 October 1959." },
        { q: "The 11th Schedule contains how many subjects?", options: ["18", "22", "29", "52"], answer: 2, explain: "29 subjects for panchayats." },
        { q: "National Panchayati Raj Day is observed on:", options: ["2 October", "24 April", "26 November", "15 August"], answer: 1, explain: "The 73rd Amendment came into force on 24 April 1993." },
      ],
    },
  ],
};
