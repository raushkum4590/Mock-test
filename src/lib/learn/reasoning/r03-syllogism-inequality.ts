import type { LearnModule } from "../types";

export const R03_SYLLOGISM_INEQUALITY: LearnModule = {
  id: "syllogism-inequality",
  title: "Syllogism & inequality",
  titleHi: "न्याय-वाक्य एवं असमानता",
  blurb: "Venn diagrams for All / Some / No statements, and the chain rule for > ≥ = ≤ <.",
  lessons: [
    {
      id: "syllogism",
      title: "Syllogism with Venn diagrams",
      oneLine: "A conclusion follows only if it is true in EVERY Venn diagram the statements allow — so draw the least-overlap picture and test it.",
      minutes: 18,
      blocks: [
        { t: "p", text: "A **syllogism** gives two or three statements (treat them as true, even if they sound silly) and asks which conclusions **must** follow. Draw circles for each group and overlap them only as much as the statements force." },
        {
          t: "table",
          head: ["Statement", "Venn picture", "What follows by itself"],
          rows: [
            ["All A are B", "A circle inside B", "Some B are A (not “All B are A”)"],
            ["Some A are B", "A and B overlap", "Some B are A"],
            ["No A is B", "A and B apart", "No B is A"],
            ["Some A are not B", "Part of A outside B", "Nothing about B"],
          ],
        },
        {
          t: "table",
          head: ["Statement 1 + Statement 2", "Definite conclusion"],
          rows: [
            ["All A are B + All B are C", "All A are C"],
            ["All A are B + No B is C", "No A is C"],
            ["Some A are B + All B are C", "Some A are C"],
            ["Some A are B + No B is C", "Some A are not C"],
            ["No A is B + All B are C", "Some C are not A"],
            ["All A are B + Some B are C", "No definite conclusion between A and C"],
            ["Some A are B + Some B are C", "No definite conclusion between A and C"],
          ],
          caption: "Combination rules — the middle term (B) must link the two statements",
        },
        { t: "example", title: "Two conclusions", steps: ["Statements: Some books are pens. All pens are bags.", "Some + All = Some → Some books are bags (I follows).", "“All bags are books”? Bags may be much bigger than books — not definite (II does not follow)."], answer: "Only I follows" },
        {
          t: "venn",
          circles: [
            { label: "Bags", x: 125, y: 62, r: 52 },
            { label: "Pens", x: 128, y: 72, r: 22 },
            { label: "Books", x: 82, y: 70, r: 36 },
          ],
          caption: "Pens sit inside Bags; Books touch Pens, so some Books are surely Bags — but most Bags are outside Books",
        },
        { t: "p", text: "**Possibility** conclusions (“All A being C is a possibility”) follow if you can draw at least one valid diagram where they are true, and no statement forbids it. **Either–or:** when two conclusions have the same two terms, neither follows alone, and together they cover every case (Some A are C / No A is C), answer “either I or II follows”." },
        { t: "trap", text: "“All roses are flowers; some flowers are red” does NOT mean some roses are red — the red flowers could all be non-roses. Draw it before answering." },
        {
          t: "venn",
          circles: [
            { label: "Flowers", x: 105, y: 60, r: 52 },
            { label: "Roses", x: 82, y: 68, r: 21 },
            { label: "Red", x: 162, y: 60, r: 32 },
          ],
          caption: "A valid picture where no rose is red — so “Some roses are red” does not follow",
        },
        { t: "exam", items: ["SSC: two statements, two conclusions (“only I / only II / both / neither”)", "Banking prelims: three statements, possibility conclusions, “only a few” type statements", "Either–or pairs: Some A are B / No A is B", "Reverse syllogism: choose the statements that make given conclusions true"] },
        { t: "recap", items: ["Treat statements as true; draw least-overlap Venn diagrams", "All → Some (reverse); Some ↔ Some; No ↔ No; Some not → nothing", "All + All = All; All + No = No; Some + All = Some; Some + No = Some not", "Possibility follows if not forbidden; either–or for complementary pairs"] },
      ],
      quiz: [
        { q: "Statements: All pens are pencils. All pencils are erasers. Conclusion: All pens are erasers.", options: ["Follows", "Does not follow", "Follows only as a possibility", "The statements contradict each other"], answer: 0, explain: "All + All = All." },
        { q: "Statements: Some books are pens. All pens are bags. Conclusions: I. Some books are bags. II. All bags are books.", options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], answer: 0, explain: "Some + All = Some." },
        { q: "Statements: No cat is a dog. All dogs are animals. Which conclusion definitely follows?", options: ["No animal is a cat", "Some animals are not cats", "All animals are cats", "Some cats are dogs"], answer: 1, explain: "No + All → Some C are not A: the dogs are animals that are not cats." },
        { q: "Statements: All rings are gold. No gold is silver. Conclusion: No ring is silver.", options: ["Follows", "Does not follow", "Is only a possibility", "Contradicts the statements"], answer: 0, explain: "All + No = No." },
      ],
    },
    {
      id: "inequality",
      title: "Inequalities: direct and coded",
      oneLine: "Join two letters through a chain only when every sign between them points the same way; one opposite sign breaks the chain.",
      minutes: 14,
      blocks: [
        { t: "p", text: "Inequality questions give a chain such as **P ≥ Q > R ≤ S** and ask which conclusions are definitely true." },
        {
          t: "table",
          head: ["Signs in the chain", "Result"],
          rows: [
            ["> and >", ">"],
            ["> and ≥ (or ≥ and >)", ">"],
            ["≥ and ≥", "≥"],
            ["= with any sign", "That sign"],
            ["> and < (opposite directions)", "No relation"],
          ],
        },
        { t: "series", terms: ["P", "Q", "R", "S"], gaps: ["≥", ">", "≤"], caption: "P → R: ≥ then > point the same way ✓. Q → S: > then ≤ point opposite ways ✗" },
        { t: "example", title: "Direct inequality", steps: ["P ≥ Q > R ≤ S", "P and R: ≥ then > (same direction) → P > R ✓", "S and Q: Q > R ≤ S — the signs face opposite ways → no relation."], answer: "P > R is true; nothing is known about S and Q" },
        { t: "example", title: "Either–or", steps: ["X ≥ Y = Z → X ≥ Z.", "Conclusion I: X > Z — not definite. Conclusion II: X = Z — not definite.", "But one of them must be true, because X ≥ Z means X > Z or X = Z."], answer: "Either I or II is true" },
        { t: "p", text: "**Coded inequalities** replace signs with symbols (“A @ B means A > B, A # B means A = B …”). First rewrite every statement with real signs, then solve as above." },
        { t: "trap", text: "In exams, if the chain gives A > B, the conclusion “A ≥ B” is usually marked FALSE — the conclusion must match the exact relation. Check the instructions of your paper." },
        { t: "exam", items: ["Banking prelims: 3–5 questions every paper", "Combined chains: two statements joined through a common letter", "Either–or pairs (A > B, A = B)", "Coded symbols (@, #, $, %, &)"] },
        { t: "recap", items: ["Same-direction signs combine; opposite signs break the chain", "> with ≥ gives >; = passes the other sign through", "Either–or when A ≥ B and the conclusions are A > B and A = B", "Decode symbols first"] },
      ],
      quiz: [
        { q: "Statement: A > B ≥ C = D. Is “A > D” true?", options: ["True", "False", "Cannot be determined", "Only if B = C"], answer: 0, explain: "All signs point the same way; > wins." },
        { q: "Statement: P ≥ Q > R ≤ S. Conclusions: I. P > R  II. S > Q", options: ["Only I is true", "Only II is true", "Both are true", "Neither is true"], answer: 0, explain: "Q > R ≤ S breaks the chain for S and Q." },
        { q: "Statement: X ≥ Y = Z. Conclusions: I. X > Z  II. X = Z", options: ["Only I is true", "Only II is true", "Either I or II is true", "Neither is true"], answer: 2, explain: "X ≥ Z — one of the two must hold." },
        { q: "If “A @ B” means A > B and “A # B” means A = B, what does P @ Q # R tell us about P and R?", options: ["P > R", "P < R", "P = R", "No relation"], answer: 0, explain: "P > Q = R." },
      ],
    },
  ],
};
