/**
 * Reasoning practice for the subject guide: per module, the question types
 * SSC / Banking / Railway papers ask again and again, and original exam-style
 * MCQs with a one-line explanation. Order matches the modules of the
 * Reasoning guide (see subject-guides.ts).
 */
import type { GuideMcq } from "./cs-practice";

type Practice = { hot: string[]; mcqs: Omit<GuideMcq, "id">[] };

const m = (q: string, options: GuideMcq["options"], answer: GuideMcq["answer"], explain: string) => ({ q, options, answer, explain });

/** Index = module number − 1. */
export const REASONING_PRACTICE: Practice[] = [
  // 1 Analogy, classification & coding–decoding
  {
    hot: ["Letter-shift coding (+1, −1, reverse)", "Number analogies (square, cube, n² ± 1)", "Odd one out by category or property", "Substitution coding ('sky' is called 'sea')", "Letter positions A = 1 … Z = 26 and reverse (A = 26)"],
    mcqs: [
      m("If CAT is coded as DBU, how is DOG coded?", ["EPH", "CNF", "EPI", "DPH"], 0, "Each letter moves one place forward: D→E, O→P, G→H."),
      m("Doctor : Hospital :: Teacher : ?", ["Student", "School", "Book", "Class"], 1, "Workplace relation: a doctor works in a hospital, a teacher in a school."),
      m("Find the odd one out: 27, 64, 125, 144", ["27", "64", "125", "144"], 3, "27, 64 and 125 are perfect cubes (3³, 4³, 5³); 144 is 12², not a cube."),
      m("Find the odd one out: Apple, Mango, Potato, Banana", ["Apple", "Mango", "Potato", "Banana"], 2, "Potato is a vegetable; the rest are fruits."),
      m("In a code language 'sky' is called 'sea', 'sea' is called 'water' and 'water' is called 'air'. Where do fish live?", ["Sea", "Water", "Air", "Sky"], 2, "Fish live in water, and water is called 'air' in this code."),
      m("If A = 1, B = 2, C = 3 …, what is the value of BAD?", ["6", "7", "8", "9"], 1, "B + A + D = 2 + 1 + 4 = 7."),
      m("8 : 64 :: 5 : ?", ["10", "15", "25", "125"], 2, "The second number is the square of the first: 5² = 25."),
    ],
  },
  // 2 Number & letter series
  {
    hot: ["Differences and second differences", "n², n³, n² ± 1 patterns", "Multiply-then-add series (×2 + 1)", "Alternating series (two series interleaved)", "Letter gaps and opposite letters (A–Z, B–Y)", "Wrong-term questions"],
    mcqs: [
      m("2, 6, 12, 20, 30, ?", ["36", "40", "42", "48"], 2, "Terms are n(n + 1): 6 × 7 = 42 (differences 4, 6, 8, 10, 12)."),
      m("3, 9, 27, 81, ?", ["162", "243", "324", "241"], 1, "Each term is multiplied by 3: 81 × 3 = 243."),
      m("1, 4, 9, 16, 25, ?", ["30", "35", "36", "49"], 2, "Squares of 1, 2, 3 …: 6² = 36."),
      m("A, C, F, J, O, ?", ["S", "T", "U", "V"], 2, "Gaps grow +2, +3, +4, +5, +6: O (15) + 6 = U (21)."),
      m("AZ, BY, CX, ?", ["DV", "DW", "EW", "DX"], 1, "First letter goes forward, second goes backward: D and W (opposite letters)."),
      m("Find the wrong term: 2, 5, 10, 17, 26, 38, 50", ["10", "17", "26", "38"], 3, "The pattern is n² + 1: the sixth term should be 6² + 1 = 37, not 38."),
      m("7, 10, 8, 11, 9, 12, ?", ["10", "11", "13", "7"], 0, "Alternately +3 and −2: 12 − 2 = 10."),
    ],
  },
  // 3 Blood relations
  {
    hot: ["Pointing / introducing statements", "Coded relations (A + B, A × B)", "Family-tree puzzles with genders", "Gender that cannot be determined", "Generation counting (grandfather ↔ grandson)"],
    mcqs: [
      m("Pointing to a man, Rita says, “He is the son of my mother's only son.” How is the man related to Rita?", ["Brother", "Nephew", "Son", "Cousin"], 1, "Her mother's only son is Rita's brother; his son is her nephew."),
      m("A is B's sister. C is B's mother. D is C's father. How is A related to D?", ["Granddaughter", "Daughter", "Niece", "Grandmother"], 0, "A is C's daughter and D is C's father, so A is D's granddaughter."),
      m("P is the brother of Q and Q is the sister of R. How is R related to P?", ["Brother", "Sister", "Sibling — gender cannot be determined", "Cousin"], 2, "R is P's sibling, but R's gender is never given."),
      m("My father's sister's husband is my:", ["Uncle", "Brother-in-law", "Cousin", "Grandfather"], 0, "Father's sister is an aunt; her husband is an uncle (phupha)."),
      m("Introducing a woman, Aman says, “Her mother is the only daughter of my mother.” How is Aman related to the woman?", ["Father", "Brother", "Maternal uncle", "Grandfather"], 2, "The only daughter of Aman's mother is Aman's sister, so Aman is the woman's maternal uncle."),
      m("If A + B means A is the son of B and A × B means A is the wife of B, what does P + Q × R mean?", ["P is the son of R", "P is the brother of R", "P is the father of R", "P is the nephew of R"], 0, "P is Q's son and Q is R's wife, so P is R's son."),
    ],
  },
  // 4 Direction sense & distance
  {
    hot: ["Right/left turns from the current facing", "Pythagoras for the shortest distance (3-4-5, 6-8-10)", "Shadow questions (sun in the east at sunrise)", "Clockwise / anticlockwise turns by degrees", "Rotated direction codes (SE becomes N)"],
    mcqs: [
      m("Ravi walks 5 km north, turns right and walks 3 km, then turns right again and walks 5 km. How far is he from the start?", ["3 km", "5 km", "8 km", "13 km"], 0, "North 5, east 3, south 5: he ends 3 km east of the start."),
      m("A man walks 3 km east and then 4 km north. How far is he from the start?", ["7 km", "5 km", "1 km", "6 km"], 1, "√(3² + 4²) = 5 km."),
      m("A person facing north turns 90° clockwise and then 180° anticlockwise. Which direction is the person facing now?", ["North", "East", "South", "West"], 3, "North → east (90° clockwise) → west (180°)."),
      m("Shortly after sunrise, Sita's shadow falls to her right. Which direction is she facing?", ["North", "South", "East", "West"], 1, "The sun is in the east, so the shadow points west; if west is on her right she faces south."),
      m("If south-east is called north and north-east is called west, what is west called?", ["North-east", "South-west", "South-east", "North-west"], 2, "Every direction is turned 135° anticlockwise: west becomes south-east."),
      m("A walks 10 m south, turns left and walks 10 m, then turns left again and walks 20 m. In which direction is A from the start?", ["North-east", "South-east", "North-west", "East"], 0, "South 10, east 10, north 20: A ends 10 m east and 10 m north — north-east."),
    ],
  },
  // 5 Order, ranking & seating arrangement
  {
    hot: ["Total = left rank + right rank − 1", "Interchanged positions", "Linear seating facing north/south", "Circular seating facing the centre (left = clockwise)", "Comparison chains (taller/heavier)"],
    mcqs: [
      m("Ravi is 12th from the top and 18th from the bottom in his class. How many students are in the class?", ["30", "29", "28", "31"], 1, "12 + 18 − 1 = 29."),
      m("In a row of 40 children, A is 15th from the left. What is A's position from the right?", ["25", "26", "24", "27"], 1, "40 − 15 + 1 = 26."),
      m("Five friends sit in a row facing north. C is at the left end and E at the right end. D sits between C and A, and B is to the immediate right of A. Who is in the middle?", ["D", "A", "B", "E"], 1, "Left to right: C, D, A, B, E — A is third."),
      m("A is taller than B, C is taller than A, and D is shorter than B. Who is the tallest?", ["A", "B", "C", "D"], 2, "C > A > B > D."),
      m("In a row, A is 7th from the left and B is 12th from the right. When they swap places, A becomes 22nd from the left. How many people are in the row?", ["31", "32", "33", "34"], 2, "B's old place is 22nd from the left and 12th from the right: 22 + 12 − 1 = 33."),
    ],
  },
  // 6 Syllogism & inequalities
  {
    hot: ["Venn diagrams for All / Some / No", "“Some … not” and possibility cases", "Either–or (complementary pairs)", "Coded inequalities (@, #, $)", "Chain rule: an opposite sign breaks the chain"],
    mcqs: [
      m("Statements: All cats are dogs. All dogs are birds. Conclusions: I. All cats are birds. II. Some birds are cats.", ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"], 2, "Cats ⊂ dogs ⊂ birds, so all cats are birds and some birds are cats."),
      m("Statements: Some pens are books. No book is a bag. Conclusions: I. Some pens are not bags. II. No pen is a bag.", ["Only I follows", "Only II follows", "Both follow", "Neither follows"], 0, "The pens that are books cannot be bags; other pens may or may not be bags."),
      m("Statements: All roses are flowers. Some flowers are red. Conclusions: I. Some roses are red. II. Some flowers are roses.", ["Only I follows", "Only II follows", "Both follow", "Neither follows"], 1, "The red flowers may not include roses; but since all roses are flowers, some flowers are roses."),
      m("Statement: P > Q ≥ R = S < T. Conclusions: I. P > S  II. T > R", ["Only I is true", "Only II is true", "Both are true", "Neither is true"], 2, "P > Q ≥ R = S gives P > S; T > S = R gives T > R."),
      m("Statement: A ≥ B > C ≥ D. Conclusions: I. A > D  II. D > B", ["Only I is true", "Only II is true", "Both are true", "Neither is true"], 0, "A ≥ B > C ≥ D gives A > D; D is below B, so II is false."),
      m("Statement: M ≤ N < O < P. Conclusions: I. N > P  II. M < O", ["Only I is true", "Only II is true", "Both are true", "Neither is true"], 1, "N < O < P, so I is false; M ≤ N < O gives M < O."),
    ],
  },
  // 7 Puzzles, calendar & clock
  {
    hot: ["Odd days (normal year 1, leap year 2)", "Day after n days = n mod 7", "Clock angle = |30H − 5.5M|", "Hands coincide 22 times a day", "Grid puzzles: fill fixed facts first, then eliminate"],
    mcqs: [
      m("What is the angle between the hands of a clock at 3:30?", ["75°", "90°", "60°", "105°"], 0, "|30 × 3 − 5.5 × 30| = |90 − 165| = 75°."),
      m("If 1 January 2023 was a Sunday, what day was 1 January 2024?", ["Sunday", "Monday", "Tuesday", "Saturday"], 1, "2023 is not a leap year: 365 days = 1 odd day, so Sunday + 1 = Monday."),
      m("How many odd days are there in a leap year?", ["0", "1", "2", "3"], 2, "366 = 52 weeks + 2 days."),
      m("How many times do the hands of a clock coincide in 24 hours?", ["24", "22", "44", "12"], 1, "11 times in every 12 hours (only once between 11 and 1), so 22 times a day."),
      m("If today is Wednesday, what day will it be after 75 days?", ["Sunday", "Monday", "Tuesday", "Friday"], 1, "75 = 10 weeks + 5 days; Wednesday + 5 = Monday."),
      m("At what time between 4 and 5 o'clock are the hands of a clock together?", ["4:20", "4:21 9/11", "4:22 2/11", "4:24"], 1, "Minutes past 4 = (60/11) × 4 = 240/11 = 21 9/11."),
      m("A, B, C and D each like a different colour: red, blue, green or yellow. A likes neither red nor blue. B likes green. C does not like red. Who likes red?", ["A", "B", "C", "D"], 3, "B = green, so A = yellow; C is not red, so C = blue and D = red."),
    ],
  },
  // 8 Non-verbal reasoning
  {
    hot: ["Mirror image of a clock = 11:60 − time", "Painted-cube counts (corners 8, edges 12(n−2), none (n−2)³)", "Counting triangles and squares", "Dice: opposite faces from two positions", "Paper folding & cutting, embedded figures"],
    mcqs: [
      m("On a standard die, the numbers on opposite faces always add up to:", ["6", "7", "8", "9"], 1, "1–6, 2–5 and 3–4 are opposite, each pair totalling 7."),
      m("A clock shows 3:15. What time does its mirror image show?", ["9:45", "8:45", "8:15", "9:15"], 1, "Mirror time = 11:60 − 3:15 = 8:45."),
      m("A cube painted on all faces is cut into 27 equal small cubes. How many small cubes have exactly two faces painted?", ["8", "12", "6", "1"], 1, "Edge cubes: 12 × (3 − 2) = 12."),
      m("In the same 27-cube block, how many small cubes have no face painted?", ["0", "1", "6", "8"], 1, "Only the centre cube: (3 − 2)³ = 1."),
      m("How many squares of all sizes are there in a 3 × 3 grid?", ["9", "13", "14", "10"], 2, "9 small + 4 of size 2 × 2 + 1 of size 3 × 3 = 14."),
      m("Which capital letter looks the same in a vertical mirror?", ["B", "A", "N", "R"], 1, "A is symmetric about its vertical axis."),
      m("A line drawn from one vertex of a triangle to the opposite side makes how many triangles in total?", ["2", "3", "4", "5"], 1, "Two small triangles plus the original large one."),
    ],
  },
  // 9 Critical reasoning & data sufficiency
  {
    hot: ["Statement–assumption (what must be taken for granted)", "Course of action: practical, relevant, not extreme", "Strong vs weak arguments", "Cause & effect", "Data sufficiency: test each statement alone, then together"],
    mcqs: [
      m("Advertisement: “Use our soap for glowing skin.” Assumptions: I. People want glowing skin. II. People do not use soap.", ["Only I is implicit", "Only II is implicit", "Both are implicit", "Neither is implicit"], 0, "The ad assumes people want glowing skin; nothing suggests people don't use soap."),
      m("Question: What is R's age? I. R is 5 years older than S. II. S is 20 years old.", ["I alone is sufficient", "II alone is sufficient", "Both I and II together are needed", "Neither is sufficient"], 2, "Neither statement alone gives R's age; together R = 20 + 5 = 25."),
      m("Statement: Heavy rain has flooded the city's roads. Courses of action: I. The municipality should clear the drains. II. All schools in the country should close.", ["Only I follows", "Only II follows", "Both follow", "Neither follows"], 0, "I is practical and relevant; II is extreme and nationwide for a local problem."),
      m("Statement: The government has cut the price of LPG. What is the most likely effect?", ["LPG demand may rise", "Petrol prices fall", "Rainfall increases", "Wheat exports stop"], 0, "A lower price usually raises demand; the other options are unrelated."),
      m("Should exams be held online? Arguments: I. Yes, it saves paper. II. No, I don't like computers.", ["Only I is strong", "Only II is strong", "Both are strong", "Neither is strong"], 0, "I gives a relevant reason; II is a personal preference, so it is weak."),
      m("In data sufficiency, when statement I alone answers the question but statement II alone does not, the answer is:", ["Statement I alone is sufficient", "Statement II alone is sufficient", "Both together are needed", "Either alone is sufficient"], 0, "Only statement I is enough by itself."),
    ],
  },
];
