import type { LessonMcq } from "../types";

const DS = ["I alone is sufficient", "II alone is sufficient", "Either alone is sufficient", "Both together are needed"] as LessonMcq["options"];
const TWO = ["Only I follows", "Only II follows", "Both follow", "Neither follows"] as LessonMcq["options"];
const TRUE2 = ["Only I is true", "Only II is true", "Either I or II is true", "Neither is true"] as LessonMcq["options"];

/** Exam-level module tests for the Reasoning course, keyed by module id. */
export const REASONING_COURSE_PRACTICE: Record<string, LessonMcq[]> = {
  "coding-series": [
    { q: "If ROSE is coded as 6821 and CHAIR as 73456, how is SEARCH coded?", options: ["214673", "214763", "241673", "214637"], answer: 0, explain: "S2 E1 A4 R6 C7 H3." },
    { q: "If each letter of TABLE is replaced by the letter two places ahead, the code is:", options: ["VCDNG", "VCDMG", "UCDNG", "VDCNG"], answer: 0, explain: "T→V, A→C, B→D, L→N, E→G." },
    { q: "In a code, “come here” = “ka la” and “here we go” = “la pa ta”. What is the code for “here”?", options: ["ka", "la", "pa", "ta"], answer: 1, explain: "The only common word and code." },
    { q: "If DOG = 26 (sum of letter positions), then CAT = ?", options: ["24", "26", "23", "25"], answer: 0, explain: "3 + 1 + 20." },
    { q: "2, 3, 5, 9, 17, ?", options: ["31", "33", "34", "35"], answer: 1, explain: "Differences 1, 2, 4, 8, 16." },
    { q: "120, 99, 80, 63, 48, ?", options: ["35", "36", "37", "33"], answer: 0, explain: "11² − 1, 10² − 1 … 6² − 1." },
    { q: "Z, X, U, Q, ?", options: ["M", "L", "K", "N"], answer: 1, explain: "−2, −3, −4, −5: Q (17) − 5 = L (12)." },
    { q: "AB, DE, GH, ?", options: ["IJ", "JK", "KL", "HI"], answer: 1, explain: "Each pair starts three letters later." },
    { q: "Which letter is 7th to the right of the 10th letter from the left in the English alphabet?", options: ["P", "Q", "R", "O"], answer: 1, explain: "10 + 7 = 17th = Q." },
    { q: "Which letter is 5th to the left of the 8th letter from the right in the English alphabet?", options: ["N", "M", "O", "X"], answer: 0, explain: "8th from the right = 19th (S); 19 − 5 = 14th = N." },
    { q: "1, 8, 27, 64, ?", options: ["100", "125", "144", "216"], answer: 1, explain: "Cubes: 5³ = 125." },
  ],
  "relations-direction": [
    { q: "A is B's brother. C is A's mother. D is C's father. How is A related to D?", options: ["Grandson", "Son", "Grandfather", "Nephew"], answer: 0, explain: "A is the son of D's daughter." },
    { q: "Pointing to a girl, Raj says, “She is the only daughter of my father's only son.” Raj has no brothers or sisters. Who is the girl to Raj?", options: ["Sister", "Daughter", "Niece", "Cousin"], answer: 1, explain: "His father's only son is Raj himself." },
    { q: "X's mother is the only sister of Y, and Y is a man. How is Y related to X?", options: ["Maternal uncle", "Father", "Brother", "Grandfather"], answer: 0, explain: "Mother's brother." },
    { q: "Q is the son of P. R is the daughter of Q. S is the mother of P. How is R related to S?", options: ["Granddaughter", "Great-granddaughter", "Daughter", "Niece"], answer: 1, explain: "S → P → Q → R: three generations down." },
    { q: "M is N's wife. N is O's son. How is M related to O?", options: ["Daughter", "Daughter-in-law", "Sister", "Mother"], answer: 1, explain: "Wife of O's son." },
    { q: "Ram walks 15 m south, turns right and walks 20 m. How far is he from the start?", options: ["35 m", "25 m", "5 m", "30 m"], answer: 1, explain: "√(15² + 20²) = 25." },
    { q: "Facing south, Ajay turns 135° clockwise. Which direction is he facing now?", options: ["North-west", "North-east", "South-west", "South-east"], answer: 0, explain: "South → west (90°) → north-west (45° more)." },
    { q: "Town B is east of town A. Town C is north of B. Town D is west of C. In which direction is D from B?", options: ["North-east", "North-west", "South-west", "South"], answer: 1, explain: "D is north of B's line and to its west." },
    { q: "At 9 a.m. the shadow of a pole falls to Rina's left. Which direction is she facing?", options: ["North", "South", "East", "West"], answer: 0, explain: "Morning shadow points west; west on her left → she faces north." },
    { q: "A man goes 3 km north, 4 km east and then 3 km south. How far is he from the start?", options: ["4 km", "10 km", "7 km", "5 km"], answer: 0, explain: "North and south cancel; 4 km east." },
    { q: "Neha walks 5 km east, turns right and walks 5 km, then turns right again and walks 5 km. In which direction is she from the start?", options: ["North", "South", "East", "West"], answer: 1, explain: "East 5, south 5, west 5 → 5 km south of the start." },
  ],
  "syllogism-inequality": [
    { q: "Statements: All cars are buses. Some buses are trains. Conclusions: I. Some cars are trains. II. Some trains are buses.", options: TWO, answer: 1, explain: "All + Some gives nothing for cars; II is the reverse of statement 2." },
    { q: "Statements: No fruit is a vegetable. Some vegetables are green. Conclusions: I. Some green things are not fruits. II. No fruit is green.", options: TWO, answer: 0, explain: "The green vegetables are green things that are not fruits." },
    { q: "Statements: All lions are tigers. No tiger is a cat. Conclusions: I. No lion is a cat. II. Some cats are lions.", options: TWO, answer: 0, explain: "All + No = No." },
    { q: "Statements: All A are B. All B are C. Conclusions: I. All C are A. II. Some C are A.", options: TWO, answer: 1, explain: "All A are C, so some C are A — not all." },
    { q: "Statements: Some doctors are teachers. Some teachers are singers. Conclusions: I. Some doctors are singers. II. No doctor is a singer.", options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither follows"], answer: 2, explain: "Some + Some is not definite, and I and II form a complementary pair." },
    { q: "Statement: Some pens are blue. Conclusion: All pens being blue is a possibility.", options: ["Follows", "Does not follow", "Contradicts the statement", "Cannot be judged"], answer: 0, explain: "Nothing forbids it." },
    { q: "Statement: M > N ≥ O < P. Conclusions: I. M > O  II. P > N", options: TRUE2, answer: 0, explain: "N ≥ O < P breaks the chain for P and N." },
    { q: "Statement: A ≤ B < C = D. Conclusions: I. D > A  II. B < D", options: ["Only I is true", "Only II is true", "Both are true", "Neither is true"], answer: 2, explain: "Same-direction chain: A < D and B < D." },
    { q: "Statement: J = K ≥ L > M. Conclusions: I. J > M  II. L < J", options: TRUE2, answer: 0, explain: "J ≥ L only, so “L < J” is not definite." },
    { q: "Statement: P < Q > R. Conclusions: I. P > R  II. P < R", options: TRUE2, answer: 3, explain: "Opposite signs; P = R is also possible, so not even either–or." },
    { q: "Statement: G ≥ H = I. Conclusions: I. G > I  II. G = I", options: TRUE2, answer: 2, explain: "G ≥ I, so exactly one of the two holds." },
  ],
  arrangements: [
    { q: "Seven people sit in a row facing north. D is exactly in the middle. How many people sit to D's right?", options: ["2", "3", "4", "6"], answer: 1, explain: "D is 4th of 7." },
    { q: "In a row facing north, P is 5th and Q is 8th from the left. How many people sit between them?", options: ["2", "3", "1", "4"], answer: 0, explain: "|8 − 5| − 1 = 2." },
    { q: "Six people sit around a circle. Counting clockwise, how many people sit between M and the person exactly opposite M?", options: ["1", "2", "3", "4"], answer: 1, explain: "Opposite is 3 seats away → 2 in between." },
    { q: "A, B, C, D and E sit around a circle facing the centre. B is to the immediate left of A, C to the immediate left of B, and D to the immediate left of C. Who is to the immediate right of A?", options: ["D", "E", "C", "B"], answer: 1, explain: "Clockwise A, B, C, D, E — A's right (anticlockwise) is E." },
    { q: "Five people live on floors 1 (lowest) to 5. K is on floor 3, L just above K, M on the lowest floor, and N below O. Who lives on floor 5?", options: ["N", "O", "L", "M"], answer: 1, explain: "Floors 2 and 5 are left; N is below O." },
    { q: "In that building, who lives just below K?", options: ["N", "M", "O", "L"], answer: 0, explain: "N is on floor 2." },
    { q: "Some people sit in a row facing north. X is 6th from the left end and 3rd from the right end. How many people are in the row?", options: ["8", "9", "7", "10"], answer: 0, explain: "6 + 3 − 1 = 8." },
    { q: "Eight people sit around a circle facing OUTSIDE. Moving to a person's left means moving:", options: ["Clockwise", "Anticlockwise", "Across the table", "Two seats at a time"], answer: 1, explain: "Facing out reverses the inside rule." },
    { q: "P, Q, R, S and T attend on different days, Monday to Friday. P is on Wednesday, Q the day after P, R on Monday, and S not on Friday. On which day is T?", options: ["Tuesday", "Friday", "Thursday", "Monday"], answer: 1, explain: "S takes Tuesday, leaving Friday for T." },
    { q: "In that schedule, who attends on Tuesday?", options: ["S", "T", "R", "Q"], answer: 0, explain: "S is not on Friday, so S = Tuesday." },
    { q: "Five boxes V, W, X, Y and Z are stacked. V is at the bottom, two boxes are between V and W, X is just above W, and Y is just above V. Which box is 3rd from the bottom?", options: ["Y", "Z", "W", "X"], answer: 1, explain: "V 1, Y 2, W 4, X 5 → Z is 3rd." },
  ],
  "critical-ds": [
    { q: "Statement: “Carry an umbrella; it may rain today.” Which is an assumption?", options: ["An umbrella can protect from rain", "It always rains", "Umbrellas are expensive", "The listener owns a car"], answer: 0, explain: "The advice makes sense only if umbrellas help." },
    { q: "Statement: Many students failed the maths exam. Courses of action: I. The school should find out why and hold extra classes. II. Maths should be removed from the syllabus.", options: TWO, answer: 0, explain: "II is extreme and doesn't solve the problem." },
    { q: "Should mobile phones be banned in classrooms? Arguments: I. Yes, they distract students during lessons. II. No, every student has one.", options: ["Only I is strong", "Only II is strong", "Both are strong", "Neither is strong"], answer: 0, explain: "II is about popularity, not merit." },
    { q: "Sales of air coolers rose sharply this month. What is the most likely cause?", options: ["A heat wave hit the region", "Schools reopened", "Petrol prices fell", "A cricket match was played"], answer: 0, explain: "Heat directly raises demand for coolers." },
    { q: "Claim: “Students who eat breakfast score higher, so breakfast improves scores.” Which statement STRENGTHENS it?", options: ["In a trial, students randomly given breakfast scored higher than similar students who were not", "Breakfast is the first meal of the day", "Some students skip lunch", "Scores were higher in 2020"], answer: 0, explain: "A fair trial rules out other causes." },
    { q: "The government will give free bicycles to girls who join Class 9. What is the most likely effect?", options: ["More girls may join and stay in secondary school", "Bicycle factories will close", "Boys will stop going to school", "Exams will be cancelled"], answer: 0, explain: "Easier travel helps girls attend school." },
    { q: "How old is Mohan? I. Mohan is twice as old as Sohan. II. Sohan is 15.", options: DS, answer: 3, explain: "Together: 30." },
    { q: "Is n even? I. n is divisible by 4. II. n is a prime number greater than 2.", options: DS, answer: 2, explain: "I gives “yes”, II gives a definite “no” — each alone decides." },
    { q: "What is the area of a rectangle? I. Its perimeter is 20 cm. II. Its length is 6 cm.", options: DS, answer: 3, explain: "Together: width 4 cm, area 24 cm²." },
    { q: "What is the price of one pen? I. 5 pens cost ₹50. II. A pen and a pencil together cost ₹15.", options: DS, answer: 0, explain: "I gives ₹10; II has two unknowns." },
    { q: "What is Rahul's rank in class? I. Rahul is ahead of Mohit. II. Mohit is 10th.", options: ["I alone is sufficient", "Both together are needed", "Either alone is sufficient", "Even both together are not sufficient"], answer: 3, explain: "Rahul could be anywhere from 1st to 9th." },
  ],
};
