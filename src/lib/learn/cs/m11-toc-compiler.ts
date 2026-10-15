import type { LearnModule } from "../types";

export const M11_TOC: LearnModule = {
  id: "toc-compiler",
  title: "Theory of computation & compilers",
  titleHi: "संगणना सिद्धांत एवं कंपाइलर",
  blurb: "Which machines can recognise which patterns, and how a compiler turns your code into machine code.",
  lessons: [
    {
      id: "automata",
      title: "Automata & the Chomsky hierarchy",
      oneLine: "An automaton is an imaginary machine that reads a string and says YES or NO; machines with more memory can recognise more complicated patterns.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**Three basic words.** An **alphabet** is a set of symbols, e.g. {0, 1}. A **string** is a sequence of those symbols, e.g. 0110. A **language** is a set of strings, e.g. “all binary strings ending in 1”." },
        { t: "p", text: "**What is an automaton?** A simple imaginary machine that reads a string one symbol at a time, moves between **states**, and at the end says **accept** (the string is in the language) or **reject**." },
        { t: "analogy", text: "A turnstile at a metro gate is a finite automaton: two states (Locked, Unlocked). Insert a token → Unlocked. Push through → Locked again. It remembers nothing except which state it is in." },
        { t: "p", text: "**DFA (Deterministic Finite Automaton)** — for each state and each input symbol there is exactly ONE next state. **NFA (Non-deterministic)** — there may be several possible next states (or none). Surprisingly, DFAs and NFAs are **equally powerful**: any NFA can be converted into a DFA (the DFA may need up to 2ⁿ states)." },
        {
          t: "example",
          title: "Build a DFA that accepts binary strings ending in 1",
          steps: [
            "We only need to remember one thing: was the LAST symbol a 1?",
            "State q0 = “last symbol was 0, or nothing read yet” (start state, not accepting).",
            "State q1 = “last symbol was 1” (accepting).",
            "From ANY state: reading 1 → go to q1; reading 0 → go to q0.",
            "Test 0101: q0 →0→ q0 →1→ q1 →0→ q0 →1→ q1 → ends in q1 → ACCEPT ✓. Test 110: ends in q0 → REJECT ✓.",
          ],
          answer: "2 states are enough",
        },
        { t: "p", text: "**Regular expressions** describe the same languages that finite automata accept: `a*` = zero or more a's, `a+` = one or more, `a|b` = a or b, `(ab)*` = ab repeated. Example: `(0|1)*1` = binary strings ending in 1." },
        { t: "p", text: "**The limit of finite automata:** they have no memory except their states, so they cannot COUNT without limit. The language aⁿbⁿ (n a's followed by exactly n b's, like aabb) needs counting — a finite automaton can't do it. A **pushdown automaton (PDA)** adds a **stack**: push for each a, pop for each b, accept if the stack is empty." },
        { t: "p", text: "**The Chomsky hierarchy** — four levels of languages, each recognised by a more powerful machine:" },
        {
          t: "table",
          head: ["Type", "Language / grammar", "Machine", "Memory", "Example"],
          rows: [
            ["Type 3", "Regular", "Finite automaton (DFA/NFA)", "None — only states", "Strings ending in 1"],
            ["Type 2", "Context-free", "Pushdown automaton", "One stack", "aⁿbⁿ, balanced brackets"],
            ["Type 1", "Context-sensitive", "Linear bounded automaton", "Tape as long as the input", "aⁿbⁿcⁿ"],
            ["Type 0", "Recursively enumerable (unrestricted)", "Turing machine", "Infinite tape", "Anything computable"],
          ],
        },
        { t: "trick", text: "Each level contains the one below: Regular ⊂ Context-free ⊂ Context-sensitive ⊂ Recursively enumerable. More memory → more power." },
        { t: "p", text: "**Turing machine** — the most powerful model: a head reading and writing on an infinite tape. Anything a real computer can compute, a Turing machine can too. Some problems are **undecidable** — no algorithm can solve them for every input. The famous one is the **halting problem**: deciding whether ANY given program will eventually stop." },
        {
          t: "recap",
          items: [
            "Alphabet → strings → language; an automaton accepts or rejects strings",
            "DFA and NFA are equally powerful (subset construction)",
            "Regular → FA; context-free → PDA (stack); context-sensitive → LBA; recursively enumerable → Turing machine",
            "aⁿbⁿ is context-free but not regular",
            "The halting problem is undecidable",
          ],
        },
      ],
      quiz: [
        { q: "Which machine recognises context-free languages?", options: ["Finite automaton", "Pushdown automaton", "Only a Turing machine", "Mealy machine"], answer: 1, explain: "The stack handles nesting and counting." },
        { q: "The language {aⁿbⁿ | n ≥ 0} is:", options: ["Regular", "Context-free but not regular", "Not context-free", "Finite"], answer: 1, explain: "It needs counting → a stack, not just states." },
        { q: "The halting problem is:", options: ["Decidable", "Undecidable", "Regular", "Solvable by a DFA"], answer: 1, explain: "Turing proved it undecidable." },
      ],
    },
    {
      id: "compiler-phases",
      title: "How a compiler works: the six phases",
      oneLine: "A compiler is an assembly line: characters → tokens → grammar tree → meaning check → intermediate code → better code → machine code.",
      minutes: 16,
      blocks: [
        { t: "p", text: "A compiler translates a high-level program into machine code in stages, called **phases**. Follow the line `sum = a + 10;` through each one:" },
        {
          t: "table",
          head: ["Phase", "What it does", "For sum = a + 10;"],
          rows: [
            ["1. Lexical analysis (scanner)", "Groups characters into TOKENS; removes spaces and comments", "sum | = | a | + | 10 | ;  → 6 tokens"],
            ["2. Syntax analysis (parser)", "Checks the GRAMMAR; builds a parse/syntax tree", "assignment → identifier = expression ;"],
            ["3. Semantic analysis", "Checks MEANING: are variables declared? do types match?", "Are sum and a declared? Is int + int okay?"],
            ["4. Intermediate code generation", "Machine-independent simple code", "t1 = a + 10 ; sum = t1  (three-address code)"],
            ["5. Code optimisation", "Make it faster/smaller", "sum = a + 10  (temporary t1 removed)"],
            ["6. Code generation", "Target machine/assembly code", "MOV R1, a ; ADD R1, #10 ; MOV sum, R1"],
          ],
          caption: "The symbol table (names, types, scopes) and the error handler are used by every phase",
        },
        { t: "trick", text: "“Little Students Should Interest Our Classes” — Lexical, Syntax, Semantic, Intermediate code, Optimisation, Code generation." },
        {
          t: "example",
          title: "How many tokens in: int x = a + 10;",
          steps: ["Split at every meaningful unit: int | x | = | a | + | 10 | ;", "Keywords (int), identifiers (x, a), operators (=, +), constants (10) and punctuation (;) are all tokens."],
          answer: "7 tokens",
        },
        { t: "p", text: "**Which error is caught where?**" },
        {
          t: "table",
          head: ["Error", "Phase that catches it"],
          rows: [["Illegal character like @ in a variable name", "Lexical"], ["Missing semicolon or bracket", "Syntax"], ["Using an undeclared variable; adding a string to an int", "Semantic"]],
        },
        {
          t: "points",
          items: [
            "Front end (phases 1–4) depends on the SOURCE language; back end (5–6) depends on the TARGET machine",
            "Parsers: top-down (recursive descent, LL(1)) and bottom-up (shift-reduce, LR, SLR, LALR, CLR)",
            "Tools: Lex/Flex generates the lexical analyser; Yacc/Bison generates an LALR parser",
            "Optimisations: constant folding (2 * 3 → 6), dead-code elimination, common sub-expression elimination, loop-invariant code motion",
            "Cross-compiler: runs on one machine, produces code for another (e.g. PC → mobile chip)",
          ],
        },
        {
          t: "recap",
          items: [
            "Lexical (tokens) → Syntax (grammar tree) → Semantic (meaning/types) → Intermediate code → Optimisation → Code generation",
            "Symbol table is shared by all phases",
            "Missing ; = syntax error; undeclared variable = semantic error",
            "Lex → scanner; Yacc → LALR parser",
          ],
        },
      ],
      quiz: [
        { q: "Which phase removes comments and whitespace?", options: ["Syntax analysis", "Lexical analysis", "Code generation", "Semantic analysis"], answer: 1, explain: "The scanner ignores them while making tokens." },
        { q: "Type checking happens in:", options: ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Code optimisation"], answer: 2, explain: "Meaning, not just grammar." },
        { q: "YACC generates which kind of parser?", options: ["LL(1)", "Recursive descent", "LALR", "Operator precedence only"], answer: 2, explain: "Yet Another Compiler-Compiler → LALR(1)." },
      ],
    },
  ],
};
