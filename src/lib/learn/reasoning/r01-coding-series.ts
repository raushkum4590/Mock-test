import type { LearnModule } from "../types";

export const R01_CODING_SERIES: LearnModule = {
  id: "coding-series",
  title: "Coding–decoding, series & machine input–output",
  titleHi: "कूटलेखन–कूटवाचन, श्रेणी एवं मशीन इनपुट–आउटपुट",
  blurb: "Crack letter and number codes, find the rule behind any series, and follow a machine's steps.",
  lessons: [
    {
      id: "coding-decoding",
      title: "Coding–decoding: letter, number and word codes",
      oneLine: "Every code hides one simple rule — a letter shift, a reverse letter, a number for each letter or a word swap — and two letters are enough to find it.",
      minutes: 15,
      blocks: [
        { t: "p", text: "In a coding question a word is written in a secret form, and you must use the **same rule** on a new word. Exams use five main types: **letter shift** (+1, −2 …), **reverse letters** (A ↔ Z), **number codes** (A = 1 …), **substitution** (“sky” is called “sea”) and **sentence codes** (“pit na sa” means “tea is hot”)." },
        {
          t: "table",
          head: ["Letters", "Positions", "Opposite letter"],
          rows: [
            ["A B C D E", "1 2 3 4 5", "Z Y X W V"],
            ["F G H I J", "6 7 8 9 10", "U T S R Q"],
            ["K L M N O", "11 12 13 14 15", "P O N M L"],
            ["P Q R S T", "16 17 18 19 20", "K J I H G"],
            ["U V W X Y Z", "21 22 23 24 25 26", "F E D C B A"],
          ],
          caption: "Write this on your rough sheet before the paper starts",
        },
        {
          t: "formula",
          items: [
            ["Opposite letter", "27 − position (A 1 ↔ Z 26, M 13 ↔ N 14)"],
            ["Position from the end", "27 − position from the start"],
            ["Landmarks", "E J O T Y = 5, 10, 15, 20, 25"],
          ],
        },
        { t: "trick", text: "“EJOTY” fixes every position in seconds: R is just after Q, and Q is two after O (15) → R = 18." },
        { t: "steps", rows: [{ label: "Word", items: ["M", "A", "N", "G", "O"] }, { label: "+1 each", items: ["N", "B", "O", "H", "P"], moved: ["N", "B", "O", "H", "P"] }], caption: "Line the word up over its code — the rule jumps out" },
        { t: "example", title: "Letter shift", steps: ["MANGO → NBOHP: M→N, A→B, N→O … each letter moves +1.", "Apply +1 to APPLE: A→B, P→Q, P→Q, L→M, E→F."], answer: "BQQMF" },
        { t: "example", title: "Reverse (opposite) letters", steps: ["GOLD → TLOW: G (7) → T (20) = 27 − 7. O → L, L → O, D → W: every letter becomes its opposite.", "SILVER: S→H, I→R, L→O, V→E, E→V, R→I."], answer: "HROEVI" },
        { t: "example", title: "Sentence code", steps: ["“pit na sa” = tea is hot; “sa ka la” = hot and cold; “na ja ka” = tea and milk.", "Sentences 1 and 2 share only “hot” and only “sa” → hot = sa.", "Sentences 1 and 3 share “tea” and “na” → tea = na. Sentences 2 and 3 share “and” and “ka” → and = ka.", "What is left in sentence 1: is = pit."], answer: "hot = sa, tea = na, and = ka, is = pit" },
        { t: "trap", text: "Check at least TWO letters before deciding the rule. MANGO → NBOHP looks like +1 from the first letter, but some codes shift odd and even positions differently (+1, −1, +1 …)." },
        { t: "exam", items: ["SSC: one letter-shift or reverse code, one number code (sum of positions)", "Banking: sentence (word) codes with 4–5 sentences", "Substitution: “If water is called air … where do fish live?” — answer with the CODE word", "Mixed: letters reversed and then shifted (e.g. write the word backwards, then +1)"] },
        { t: "recap", items: ["Five types: shift, reverse, number, substitution, sentence", "Opposite letter = 27 − position; EJOTY = 5, 10, 15, 20, 25", "Test the rule on two letters before using it", "Sentence codes: compare two sentences at a time and match the common words"] },
      ],
      quiz: [
        { q: "If PEN is coded as QFO, how is INK coded?", options: ["JOL", "HMJ", "JOK", "KOL"], answer: 0, explain: "Each letter moves one place forward." },
        { q: "In a code, “tea is hot” = “pit na sa” and “hot and cold” = “sa ka la”. What is the code for “hot”?", options: ["pit", "na", "sa", "ka"], answer: 2, explain: "“hot” and “sa” are the only common items." },
        { q: "If A = 26, B = 25 … Z = 1, what is the value of CAB?", options: ["75", "6", "72", "78"], answer: 0, explain: "C = 24, A = 26, B = 25 → 75." },
        { q: "If GOLD is written as TLOW, how is COLD written?", options: ["XLOW", "XLOD", "WLOX", "CLOW"], answer: 0, explain: "Each letter becomes its opposite: C → X." },
      ],
    },
    {
      id: "alphanumeric-series",
      title: "Number, letter & alphanumeric series",
      oneLine: "Look at the differences first, then the ratios, then split the series in two — and for symbol series, count positions with simple addition.",
      minutes: 16,
      blocks: [
        { t: "p", text: "A **series** follows a hidden rule. In number series check, in this order: **differences** (and the differences of differences), **ratios** (×2, ×3), **squares/cubes** (n², n³, n² ± 1), **mixed** steps (×2 + 1) and **alternating** series (two series woven together)." },
        { t: "series", terms: ["4", "7", "12", "19", "28", "?"], gaps: ["+3", "+5", "+7", "+9", "+11"], caption: "The gaps themselves rise by 2" },
        { t: "example", title: "Second differences", steps: ["4, 7, 12, 19, 28, ?", "Differences: 3, 5, 7, 9 — they rise by 2.", "Next difference = 11 → 28 + 11."], answer: "39" },
        { t: "series", terms: ["5", "11", "23", "47", "?"], gaps: ["×2+1", "×2+1", "×2+1", "×2+1"], caption: "When the gaps double (6, 12, 24), try “× 2 + something”" },
        { t: "example", title: "Mixed step", steps: ["5, 11, 23, 47, ?", "Differences 6, 12, 24 double each time — so each term is ×2 + 1.", "47 × 2 + 1."], answer: "95" },
        { t: "p", text: "**Letter series** work the same way on positions: B, E, H, K (+3 each) → N. **Pairs** often move in opposite directions: AZ, BY, CX → DW." },
        { t: "p", text: "**Alphanumeric series** give a line of letters, digits and symbols and ask about positions or neighbours. Example: **A 3 # K 9 P @ 2 M $ 7 R** (12 elements)." },
        {
          t: "formula",
          items: [
            ["x-th to the right of the y-th from the left", "(y + x)-th from the left"],
            ["x-th to the left of the y-th from the left", "(y − x)-th from the left"],
            ["y-th from the right in a line of N", "(N − y + 1)-th from the left"],
          ],
        },
        {
          t: "steps",
          rows: [
            { label: "Element", items: ["A", "3", "#", "K", "9", "P", "@", "2", "M", "$", "7", "R"], moved: ["#", "@"] },
            { label: "Position", items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], moved: ["3", "7"] },
          ],
          caption: "Write positions under the series: 3rd from the left is #, 4 places to its right is the 7th — @",
        },
        { t: "example", title: "Alphanumeric questions", steps: ["4th to the right of the 3rd element from the left → 3 + 4 = 7th from the left = @.", "How many numbers are immediately preceded by a letter? 3 (after A) ✓, 9 (after K) ✓, 2 (after @) ✗, 7 (after $) ✗."], answer: "@ ; 2 numbers" },
        { t: "trap", text: "“Immediately preceded by” means the element just to the LEFT; “immediately followed by” means just to the RIGHT. Mark the series with small numbers (1, 2, 3 …) under each element before counting." },
        { t: "exam", items: ["SSC: missing term in number and letter series (1–2 marks every paper)", "Banking prelims: wrong-number series (find the term that breaks the rule)", "Banking: alphanumeric series — position counting and “how many such pairs”", "Railway: letter-cluster series (AZ, BY …)"] },
        { t: "recap", items: ["Order of checks: differences → ratios → squares/cubes → mixed → alternating", "Letter series = number series on positions", "Same direction add, opposite direction subtract", "N − y + 1 converts a position from the right into one from the left"] },
      ],
      quiz: [
        { q: "4, 7, 12, 19, 28, ?", options: ["37", "39", "40", "41"], answer: 1, explain: "Differences 3, 5, 7, 9, 11." },
        { q: "5, 11, 23, 47, ?", options: ["94", "95", "96", "93"], answer: 1, explain: "Each term × 2 + 1." },
        { q: "B, E, H, K, ?", options: ["M", "N", "O", "L"], answer: 1, explain: "+3 each: K (11) + 3 = N (14)." },
        { q: "In “A 3 # K 9 P @ 2 M $ 7 R”, which element is 4th to the right of the 3rd element from the left?", options: ["P", "@", "2", "9"], answer: 1, explain: "3 + 4 = 7th from the left = @." },
      ],
    },
    {
      id: "machine-input-output",
      title: "Machine input–output",
      oneLine: "A machine rearranges words and numbers one step at a time; compare the input with Step I to find which items move and where, then repeat the rule.",
      minutes: 15,
      blocks: [
        { t: "p", text: "In **input–output** questions a line of words and/or numbers passes through a machine. Each step moves or changes a few items by a fixed rule. You are given the steps for one input and must find a step for a new input, or answer about the final arrangement." },
        { t: "analogy", text: "Think of a teacher arranging students for a photo: in every round she calls one more student to the front in alphabetical order. Find who was called in round 1 and round 2 and you know the whole plan." },
        {
          t: "table",
          head: ["Common rule", "What to look for"],
          rows: [
            ["Alphabetical / number order", "One word and one number move to an end each step"],
            ["Shifting", "Items jump one place left or right each step"],
            ["Calculation", "Numbers are changed (+1, × 2, digit sum) at each step"],
            ["Interchange", "First and last items swap, then second and second-last …"],
          ],
        },
        { t: "example", title: "Working out a machine", steps: ["Rule: each step moves the next word in alphabetical order to the LEFT end and the next number in increasing order to the RIGHT end.", "Input: cat 42 sun 17 arm 35", "Step I: arm cat 42 sun 35 17 (arm and 17 move)", "Step II: cat arm 42 sun 17 35 (cat and 35 move)", "Step III: sun cat arm 17 35 42 (sun and 42 move) — all items placed, so this is the last step."], answer: "3 steps; Step II = cat arm 42 sun 17 35" },
        {
          t: "steps",
          rows: [
            { label: "Input", items: ["cat", "42", "sun", "17", "arm", "35"] },
            { label: "Step I", items: ["arm", "cat", "42", "sun", "35", "17"], moved: ["arm", "17"] },
            { label: "Step II", items: ["cat", "arm", "42", "sun", "17", "35"], moved: ["cat", "35"] },
            { label: "Step III", items: ["sun", "cat", "arm", "17", "35", "42"], moved: ["sun", "42"] },
          ],
          caption: "Highlighted = the items that moved in that step",
        },
        { t: "trap", text: "Do not assume the last step from the number of words. The machine stops when the arrangement is final — sometimes one step before you expect, if an item is already in place." },
        { t: "exam", items: ["Banking prelims and mains: 5 questions on one machine", "Asked: “Which step is …”, “How many steps …”, “Which element is 3rd from the right in Step IV”", "Mains versions add calculations (numbers change in each step)"] },
        { t: "recap", items: ["Compare input with Step I, then Step I with Step II", "Write the rule in one line before answering", "Write every step for the new input — don't skip", "The machine stops when the arrangement is final"] },
      ],
      quiz: [
        { q: "In the machine above (input: cat 42 sun 17 arm 35), what is Step II?", options: ["cat arm 42 sun 17 35", "arm cat 42 sun 35 17", "sun cat arm 17 35 42", "cat arm sun 42 17 35"], answer: 0, explain: "cat moves to the left end and 35 to the right end." },
        { q: "How many steps does that machine need for its input?", options: ["2", "3", "4", "5"], answer: 1, explain: "Three words and three numbers → three steps." },
        { q: "In input–output questions, what should you do first?", options: ["Compare the input with Step I to see which items moved and where", "Start from the last step and guess", "Count the letters in every word", "Add all the numbers"], answer: 0, explain: "The first change reveals the rule." },
      ],
    },
  ],
};
