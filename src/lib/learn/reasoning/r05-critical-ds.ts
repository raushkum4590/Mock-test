import type { LearnModule } from "../types";

export const R05_CRITICAL_DS: LearnModule = {
  id: "critical-ds",
  title: "Critical reasoning & data sufficiency",
  titleHi: "आलोचनात्मक तर्क एवं आँकड़ा पर्याप्तता",
  blurb: "Assumptions, arguments, courses of action, cause and effect, and deciding whether data is enough.",
  lessons: [
    {
      id: "critical-reasoning",
      title: "Critical reasoning: assumptions, arguments and actions",
      oneLine: "Stay inside the statement: pick what it must take for granted, what is practical and relevant, and reject anything extreme or outside the given facts.",
      minutes: 16,
      blocks: [
        { t: "p", text: "Critical-reasoning questions give a short statement and ask what follows from it. The golden rule: **use only what the statement says plus common sense** — no outside facts." },
        {
          t: "table",
          head: ["Type", "Question asked", "How to judge"],
          rows: [
            ["Assumption", "What is taken for granted?", "Without it the statement makes no sense"],
            ["Inference", "What is probably true?", "Follows from the facts, not from opinion"],
            ["Course of action", "What should be done?", "Practical, solves the problem, not extreme"],
            ["Strong / weak argument", "Is the reason good?", "Strong = relevant and important; weak = opinion, popularity, ‘everyone does it’"],
            ["Cause and effect", "Which caused which?", "The cause comes first and can explain the effect"],
            ["Strengthen / weaken", "Which fact supports or hurts the claim?", "It must hit the link between evidence and conclusion"],
          ],
        },
        { t: "example", title: "Weakening a claim", steps: ["Claim: “Road accidents fell after helmets were made compulsory in City X, so the helmet rule reduced accidents.”", "Look for another reason accidents could have fallen.", "“In the same months the city's busiest highway was closed for repairs” — less traffic could explain the fall."], answer: "The highway closure weakens the claim most" },
        {
          t: "steps",
          rows: [
            { label: "Evidence", items: ["Helmets made compulsory", "Accidents fell"] },
            { label: "Claim", items: ["Helmets", "→ caused →", "fewer accidents"], moved: ["→ caused →"] },
            { label: "Weaken", items: ["Highway closed", "→ less traffic →", "fewer accidents"], moved: ["→ less traffic →"] },
          ],
          caption: "Weakeners attack the highlighted link with another cause; strengtheners rule other causes out",
        },
        { t: "trap", text: "Options with extreme words (“all”, “only”, “never”, “immediately ban”) are usually wrong for assumptions and courses of action. Soft words (“may”, “should examine”) are usually safer." },
        { t: "exam", items: ["Banking mains: strengthen/weaken, inferences, cause and effect (5–7 questions)", "SSC / Railway: statement–assumption and course of action", "State PSC (CSAT): arguments and assumptions"] },
        { t: "recap", items: ["Use only the statement + common sense", "Assumption = must be true for the statement to make sense", "Course of action: practical, relevant, not extreme", "Weaken by giving another cause; strengthen by ruling other causes out"] },
      ],
      quiz: [
        { q: "Statement: “The company will raise salaries to keep its staff.” Which is an assumption?", options: ["Higher pay may help stop employees from leaving", "The company is losing money", "All employees will leave", "Salaries were never raised before"], answer: 0, explain: "The plan only makes sense if pay affects staying." },
        { q: "Claim: “The new helmet rule reduced road accidents in City X.” Which statement WEAKENS it most?", options: ["In the same period, the city's busiest highway was closed for repairs", "Many riders now wear helmets", "Helmets protect the head", "The rule was announced on TV"], answer: 0, explain: "It gives another cause for the fall." },
        { q: "Which kind of wording usually signals a wrong course of action?", options: ["Extreme words such as “ban everything immediately”", "“Should examine the matter”", "“May consider”", "“Should find out the reason”"], answer: 0, explain: "Courses of action should be practical and measured." },
      ],
    },
    {
      id: "data-sufficiency",
      title: "Data sufficiency",
      oneLine: "You don't have to find the answer — only decide whether statement I, statement II, either, or both together are enough to find it.",
      minutes: 14,
      blocks: [
        { t: "p", text: "Each question has a question and two statements. Test **I alone**, then **II alone**, then **both together**. Stop calculating as soon as you know the answer can be found." },
        {
          t: "table",
          head: ["Option", "Meaning"],
          rows: [
            ["I alone", "I answers it, II does not"],
            ["II alone", "II answers it, I does not"],
            ["Either alone", "Each statement alone answers it"],
            ["Both together", "Neither alone, but both together do"],
            ["Not even together", "Even both together are not enough"],
          ],
        },
        { t: "example", title: "One statement is enough", steps: ["What is x? I. 2x + 3 = 11. II. x² = 16.", "I: x = 4 — one value, sufficient.", "II: x = 4 or −4 — two values, not sufficient."], answer: "I alone is sufficient" },
        { t: "example", title: "Both together", steps: ["Who is the tallest of P, Q, R? I. P is taller than Q. II. R is shorter than Q.", "I alone says nothing about R; II alone says nothing about P.", "Together: P > Q > R."], answer: "Both together are needed (P is tallest)" },
        { t: "series", terms: ["P", "Q", "R"], gaps: [">", ">"], caption: "Statement I gives the first link, II the second — only together do they make a full chain" },
        { t: "trap", text: "A “No” is also an answer. If a statement proves that n is NOT even, it is sufficient — the question only asks whether the data can decide." },
        { t: "exam", items: ["Banking prelims and mains: DS in reasoning (ranking, direction, blood relation, coding)", "Quant DS: values, ages, speed, area", "Three-statement versions in mains (I and II, II and III …)"] },
        { t: "recap", items: ["I alone → II alone → together", "Don't solve fully — decide only", "One unique value = sufficient; two possible values = not", "A definite “No” is also sufficient"] },
      ],
      quiz: [
        { q: "What is x? I. 2x + 3 = 11  II. x² = 16", options: ["I alone is sufficient", "II alone is sufficient", "Either alone is sufficient", "Both together are needed"], answer: 0, explain: "II gives ±4." },
        { q: "Who is the tallest among P, Q and R? I. P is taller than Q. II. R is shorter than Q.", options: ["I alone is sufficient", "II alone is sufficient", "Either alone is sufficient", "Both together are needed"], answer: 3, explain: "Together: P > Q > R." },
        { q: "What is the speed of a train? I. It covers 120 km in 2 hours. II. It covers 300 km in 5 hours.", options: ["I alone is sufficient", "II alone is sufficient", "Either alone is sufficient", "Both together are needed"], answer: 2, explain: "Each gives 60 km/h." },
        { q: "In data sufficiency you should:", options: ["Decide whether the data can answer the question, without always calculating it", "Always calculate the exact answer", "Use outside knowledge to fill gaps", "Combine the statements before testing them alone"], answer: 0, explain: "Sufficiency, not the value, is asked." },
      ],
    },
  ],
};
