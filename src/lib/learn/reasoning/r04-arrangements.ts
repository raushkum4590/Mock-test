import type { LearnModule } from "../types";

export const R04_ARRANGEMENTS: LearnModule = {
  id: "arrangements",
  title: "Seating arrangement & puzzles",
  titleHi: "बैठक व्यवस्था एवं पहेलियाँ",
  blurb: "Linear and circular seating, floor, box and schedule puzzles, and the longer mains-level puzzles.",
  lessons: [
    {
      id: "linear-seating",
      title: "Linear seating: rows and ranks",
      oneLine: "Number the seats, place the fixed clues first, and remember that people facing south have their left and right reversed on your diagram.",
      minutes: 16,
      blocks: [
        { t: "p", text: "In **linear seating** people sit in a row (or two rows facing each other). Draw numbered seats 1, 2, 3 … from left to right on your paper, then fill them." },
        {
          t: "table",
          head: ["Facing", "Their right is …", "Their left is …"],
          rows: [
            ["North (away from you)", "Your right on the diagram", "Your left on the diagram"],
            ["South (towards you)", "Your LEFT on the diagram", "Your RIGHT on the diagram"],
          ],
        },
        { t: "formula", items: [["Total in a row", "position from left + position from right − 1"], ["Position from the right", "total − position from left + 1"], ["People between seats p and q", "|p − q| − 1"]] },
        { t: "example", title: "Six people in a row, facing north", steps: ["A sits third from the left → A = 3.", "B is second to the right of A → B = 5. D is to the immediate left of A → D = 2.", "C sits at an end but not next to B → seat 6 is next to B, so C = 1.", "E is not at an end → E = 4, and F = 6."], answer: "C D A E B F" },
        { t: "seats", shape: "row", seats: ["C", "D", "A", "E", "B", "F"], facing: "north", mark: ["A", "B"], caption: "A (seat 3) and B (seat 5): “second to the right” leaves one person (E) between them" },
        { t: "trap", text: "“Second to the right” means one person sits in between. “Immediate right” means right next to them. Read each clue for these words." },
        { t: "exam", items: ["SSC / Railway: rank in a row, total number of students, interchange of positions", "Banking: 6–8 people in a row facing north or south (mixed facing)", "Two parallel rows facing each other — each person faces someone in the other row"] },
        { t: "recap", items: ["Number the seats from the left", "Fixed positions first, relative clues next, negative clues last", "Facing south: left and right are reversed on paper", "Total = left rank + right rank − 1"] },
      ],
      quiz: [
        { q: "In the row C D A E B F, who sits between A and B?", options: ["D", "E", "F", "C"], answer: 1, explain: "A = 3, B = 5, E = 4." },
        { q: "People sitting in a row face south (towards you as you look at your diagram). Their right hand is on:", options: ["Your left as you look at the diagram", "Your right as you look at the diagram", "The north side of the row", "It depends on the number of people"], answer: 0, explain: "They face you, so left and right are swapped." },
        { q: "In a row of 25 people facing north, R is 10th from the left. What is R's position from the right?", options: ["15", "16", "14", "17"], answer: 1, explain: "25 − 10 + 1 = 16." },
      ],
    },
    {
      id: "circular-seating",
      title: "Circular and square tables",
      oneLine: "Facing the centre, a person's left is clockwise and right is anticlockwise; facing outwards it flips — fix one person and place the rest around them.",
      minutes: 16,
      blocks: [
        { t: "p", text: "In **circular seating** nobody sits at an “end”, so fix the first person anywhere and place the others relative to them. Number the seats 0, 1, 2 … clockwise." },
        {
          t: "table",
          head: ["Everyone faces …", "Left means", "Right means"],
          rows: [
            ["The centre (inside)", "Clockwise", "Anticlockwise"],
            ["Outside (away from the centre)", "Anticlockwise", "Clockwise"],
          ],
        },
        { t: "seats", shape: "circle", seats: ["1", "2", "3", "4", "5", "6", "7", "8"], facing: "out", caption: "Everyone facing outside (ticks point outwards): the rule flips — left is now anticlockwise" },
        { t: "example", title: "Six friends around a round table, facing the centre", steps: ["Put A at seat 0. D sits opposite A → seat 3.", "B is second to the left of A → left is clockwise → seat 2.", "C is to the immediate left of D → seat 4.", "E sits next to B → seat 1 (the only free seat next to B). F takes seat 5."], answer: "Clockwise: A, E, B, D, C, F — E is opposite C" },
        { t: "seats", shape: "circle", seats: ["A", "E", "B", "D", "C", "F"], facing: "in", mark: ["E", "C"], caption: "Clockwise from the top; with six people the opposite seat is three places away — E faces C" },
        { t: "p", text: "With an **even** number of people everyone has someone exactly opposite (n/2 seats away). **Square tables** have people at the four corners and/or the middle of the four sides — treat it like a circle of 8 with seats 0–7." },
        { t: "trap", text: "When some people face the centre and some face outside (mixed facing), apply the left/right rule for EACH person separately." },
        { t: "exam", items: ["Banking prelims: 8 people around a circle or square table (5 questions)", "Mixed facing (some inside, some outside)", "Combined with an attribute (each person likes a different fruit)", "“How many people sit between X and Y when counted from the left of X?”"] },
        { t: "recap", items: ["Fix one person, number seats clockwise", "Facing centre: left = clockwise; facing out: left = anticlockwise", "Opposite = n/2 seats away (even n)", "Mixed facing: apply the rule person by person"] },
      ],
      quiz: [
        { q: "In the round table above (clockwise A, E, B, D, C, F), who sits opposite E?", options: ["C", "F", "D", "B"], answer: 0, explain: "E is seat 1, opposite is seat 4 = C." },
        { q: "People sit around a circle facing the centre. Moving to someone's left means moving:", options: ["Clockwise", "Anticlockwise", "Across the table", "It depends on the number of people"], answer: 0, explain: "Facing inside, left is clockwise." },
        { q: "Eight people sit around a circle. How many people sit between a person and the person exactly opposite, counting one way round?", options: ["2", "3", "4", "5"], answer: 1, explain: "Opposite is 4 seats away, so 3 people sit in between." },
      ],
    },
    {
      id: "puzzles",
      title: "Floor, box and schedule puzzles",
      oneLine: "Put the categories in a table, fill the definite clues first, use the negative clues to eliminate, and only then try cases.",
      minutes: 16,
      blocks: [
        { t: "p", text: "Puzzles ask you to match people with floors, boxes, days, months or attributes. The method is always the same: **draw the table → definite clues → relative clues → negative clues → cases**." },
        { t: "example", title: "Floor puzzle", steps: ["Five people P, Q, R, S, T live on floors 1 (lowest) to 5, one on each floor.", "P lives on the top floor → P = 5. Q lives just below P → Q = 4.", "R lives on an odd floor but not floor 1 → R = 3.", "S lives below T → S = 1, T = 2."], answer: "1 S, 2 T, 3 R, 4 Q, 5 P" },
        { t: "stack", items: ["S", "T", "R", "Q", "P"], label: "Floor", mark: ["S", "T"], caption: "Draw the building top-down; the last clue (S below T) fills floors 1 and 2" },
        { t: "example", title: "Schedule puzzle", steps: ["P, Q, R, S, T attend a class on different days, Monday to Friday.", "P is on Wednesday; Q is on the day after P → Thursday. R is on Monday.", "S is not on Friday → S = Tuesday, so T = Friday."], answer: "Mon R, Tue S, Wed P, Thu Q, Fri T" },
        { t: "trick", text: "Mark negative clues with a ✗ in the table (“S is not on Friday”). When a row has only one blank left, that blank is the answer." },
        { t: "trap", text: "Check whether floor 1 is the lowest or the ground floor is 0 — the question always says. “Above” is not “immediately above”." },
        { t: "exam", items: ["Banking prelims: 2–3 puzzle sets (floor, box, month/day, designation)", "SSC: small grid puzzles (4–5 people, one attribute)", "Asked: “Who lives on floor 3?”, “How many people live between X and Y?”, “Which is true?”"] },
        { t: "recap", items: ["Table first, then definite → relative → negative clues", "✗ marks for negative clues", "Read “lowest floor = 1” and “immediately” carefully", "Branch into cases only when stuck"] },
      ],
      quiz: [
        { q: "In the floor puzzle above, who lives on floor 2?", options: ["S", "T", "R", "Q"], answer: 1, explain: "S is below T, and floors 1 and 2 are left." },
        { q: "In that puzzle, how many people live between S and Q?", options: ["1", "2", "3", "0"], answer: 1, explain: "S = 1, Q = 4 → T and R are between." },
        { q: "What should you do first in any puzzle?", options: ["Place the definite clues (fixed positions) before the others", "Try every possible case from the start", "Read the questions and guess", "Start with the last clue"], answer: 0, explain: "Definite clues fix the frame." },
      ],
    },
    {
      id: "mains-puzzles",
      title: "Mains-level seating and puzzles",
      oneLine: "Mains puzzles hide the number of people or add a second attribute — find the total first, draw every possible case, and cut cases with later clues.",
      minutes: 18,
      blocks: [
        { t: "p", text: "Banking **mains** puzzles are longer: an **unknown number of people** (“some people sit in a row”), **two or three attributes** (person + city + age) and clues that allow **two positions**. The basic method stays the same, but you must handle cases." },
        { t: "example", title: "Unknown number of people", steps: ["Some people sit in a row facing north. A is 4th from the left end.", "B sits at the right end, and exactly two people sit between A and B.", "B's seat = 4 + 2 + 1 = 7 — and B is at the end."], answer: "7 people in the row" },
        { t: "seats", shape: "row", seats: ["·", "·", "·", "A", "·", "·", "B"], facing: "north", mark: ["A", "B"], caption: "Fill in what you know; the empty seats tell you the total" },
        { t: "example", title: "Case branching", steps: ["Clue: “X sits third from one of the ends.” Draw Case 1 (X = 3rd from left) and Case 2 (X = 3rd from right).", "Continue placing other clues in both cases side by side.", "A later clue (e.g. “Y sits at the left end and is not next to X's neighbour”) fails in one case — cross it out."], answer: "Keep only the case that satisfies every clue" },
        {
          t: "table",
          head: ["Seat", "Person", "City", "Age"],
          rows: [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""]],
          caption: "Two-attribute layout — one row per seat or floor, one column per attribute",
        },
        { t: "trap", text: "Do not erase a case until a clue clearly breaks it. Many wrong answers come from dropping the correct case too early." },
        { t: "exam", items: ["IBPS / SBI PO mains: 2–3 long puzzles (5 questions each)", "Uncertain number of people in a row or circle", "Floor + flat (two flats per floor), box + colour + weight", "Questions: “Which of the following is true?”, “Four are alike in a certain way — find the odd one”"] },
        { t: "recap", items: ["Find the total number of people first when it is not given", "Write Case 1 / Case 2 side by side", "Cut a case only when a clue breaks it", "Use a table: rows = positions, columns = attributes"] },
      ],
      quiz: [
        { q: "Some people sit in a row facing north. A is 4th from the left end, B is at the right end, and exactly two people sit between A and B. How many people are in the row?", options: ["6", "7", "8", "9"], answer: 1, explain: "B = 4 + 3 = 7th seat, at the end." },
        { q: "A clue allows two positions (“sits third from one of the ends”). You should:", options: ["Draw both cases and eliminate one using later clues", "Always choose the left end", "Ignore the clue", "Assume the middle seat"], answer: 0, explain: "Cases are cut by later clues." },
        { q: "In a two-attribute puzzle (person + city), the best layout is:", options: ["A table with positions as rows and attributes as columns", "A single line of names", "A Venn diagram", "A number series"], answer: 0, explain: "A grid keeps every attribute visible." },
      ],
    },
  ],
};
