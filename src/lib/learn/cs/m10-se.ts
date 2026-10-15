import type { LearnModule } from "../types";

export const M10_SE: LearnModule = {
  id: "software-engineering",
  title: "Software engineering",
  titleHi: "सॉफ़्टवेयर इंजीनियरिंग",
  blurb: "How real software is planned, built, tested and measured — explained like building a house.",
  lessons: [
    {
      id: "sdlc-models",
      title: "SDLC & software development models",
      oneLine: "Every model follows the same six steps — plan, design, build, test, deliver, maintain — they only differ in how often and in what order you go round them.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**What is software engineering?** Writing a 50-line program is easy. Building banking software with 10 lakh lines, 100 programmers and a deadline needs a disciplined process — that process is software engineering." },
        { t: "p", text: "**SDLC (Software Development Life Cycle)** — the stages every software project goes through:" },
        {
          t: "table",
          head: ["Stage", "Question it answers", "House-building comparison"],
          rows: [
            ["1. Requirements (analysis)", "WHAT should the software do?", "How many rooms does the family want?"],
            ["2. Design", "HOW will it be built (modules, database, screens)?", "The architect's drawing"],
            ["3. Coding (implementation)", "Write the program", "Building the walls"],
            ["4. Testing", "Does it work correctly?", "Inspection before handing over"],
            ["5. Deployment", "Install it for users", "Family moves in"],
            ["6. Maintenance", "Fix bugs, add features, adapt to changes", "Repairs and new rooms over the years"],
          ],
          caption: "Maintenance usually costs the most over a product's whole life",
        },
        { t: "p", text: "The **SRS (Software Requirements Specification)** document lists **functional requirements** (what the system does — “students can download admit cards”) and **non-functional requirements** (how well — speed, security, usability). A **feasibility study** first checks whether the project is technically, economically and operationally possible." },
        { t: "p", text: "**Development models** — different ways of moving through the stages:" },
        {
          t: "table",
          head: ["Model", "How it works", "Use it when"],
          rows: [
            ["Waterfall", "Each stage once, in strict order; no going back", "Requirements are clear and won't change"],
            ["V-model", "Each development stage has a matching testing stage (verification & validation)", "Safety-critical systems (medical, aviation)"],
            ["Prototype", "Build a quick rough model, let users try it, then build the real thing", "Users aren't sure what they want"],
            ["Incremental", "Deliver the software in working pieces, adding features each time", "Early partial delivery is useful"],
            ["Spiral (Boehm)", "Repeated loops; every loop includes RISK ANALYSIS", "Large, expensive, high-risk projects"],
            ["RAD", "Very fast development using reusable components", "Tight deadlines, modular system"],
            ["Agile (Scrum, XP)", "Short cycles (sprints of 1–4 weeks), working software each sprint, constant customer feedback", "Requirements keep changing"],
          ],
        },
        { t: "trick", text: "Spiral = Risk. Prototype = unclear requirements. Waterfall = fixed requirements. Agile = changing requirements. V-model = testing for every stage." },
        { t: "p", text: "**Design tools:** **DFD (Data Flow Diagram)** shows how data moves through the system — level 0 is called the **context diagram** (the whole system as one bubble). **UML** diagrams (use-case, class, sequence, activity) are used for object-oriented design." },
        {
          t: "recap",
          items: [
            "SDLC: requirements → design → coding → testing → deployment → maintenance",
            "SRS = functional + non-functional requirements",
            "Waterfall fixed; prototype unclear; spiral risk; agile changing; V-model testing per stage",
            "DFD level 0 = context diagram",
          ],
        },
      ],
      quiz: [
        { q: "Which model explicitly includes risk analysis in each loop?", options: ["Waterfall", "Spiral", "V-model", "RAD"], answer: 1, explain: "Boehm's spiral model is risk-driven." },
        { q: "When requirements are unclear at the start, use the:", options: ["Waterfall model", "Prototype model", "V-model", "Big-bang model"], answer: 1, explain: "A prototype helps users discover what they want." },
        { q: "Which SDLC phase usually costs the most over a product's life?", options: ["Design", "Coding", "Testing", "Maintenance"], answer: 3, explain: "Software is fixed and changed for years after release." },
      ],
    },
    {
      id: "testing-metrics",
      title: "Testing, cohesion & coupling, and metrics",
      oneLine: "Testing finds mistakes before users do; good design has modules that each do one job well (high cohesion) and depend on each other little (low coupling).",
      minutes: 18,
      blocks: [
        { t: "p", text: "**Two ways of testing:**" },
        {
          t: "table",
          head: ["", "Black-box testing", "White-box testing"],
          rows: [
            ["Looks at", "Only inputs and outputs — not the code", "The code inside — every path and branch"],
            ["Done by", "Testers, users", "Developers"],
            ["Techniques", "Equivalence partitioning, boundary value analysis", "Statement, branch and path coverage; cyclomatic complexity"],
            ["Like", "Checking a TV by pressing buttons", "Opening the TV and checking the circuit"],
          ],
        },
        {
          t: "example",
          title: "Boundary value analysis: a form accepts age 18 to 60",
          steps: ["Errors usually happen at the edges, so test values at and around the boundaries.", "Test 17 (just below, should reject), 18 (lowest valid), 19, 59, 60 (highest valid), 61 (just above, should reject)."],
          answer: "Test values: 17, 18, 19, 59, 60, 61",
        },
        {
          t: "table",
          head: ["Level of testing", "What is tested"],
          rows: [
            ["Unit testing", "One function/module alone (by the developer)"],
            ["Integration testing", "Modules joined together — do they work with each other?"],
            ["System testing", "The whole system against the requirements"],
            ["Acceptance testing", "The customer checks it meets their needs; alpha (at the developer's site) and beta (real users at their own site)"],
            ["Regression testing", "Re-testing after a change to make sure nothing old broke"],
          ],
        },
        { t: "p", text: "**Verification vs validation:** verification = “Are we building the product RIGHT?” (reviews, inspections against the design); validation = “Are we building the RIGHT product?” (testing with users against their needs)." },
        { t: "p", text: "**Cyclomatic complexity** (McCabe) measures how complicated a program's logic is = the number of independent paths through the code = the minimum number of test cases needed for full path coverage." },
        { t: "formula", items: [["V(G) — from the flow graph", "E − N + 2P   (E = edges, N = nodes, P = connected parts, usually 1)"], ["V(G) — from the code", "number of decision points (if, while, for, case) + 1"], ["V(G) — from the picture", "number of enclosed regions + 1 (outer region counted)"]] },
        {
          t: "example",
          title: "A flow graph has 9 edges and 7 nodes (one program). Find V(G).",
          steps: ["E = 9, N = 7, P = 1.", "V(G) = 9 − 7 + 2 × 1 = 4."],
          answer: "V(G) = 4 → at least 4 test cases to cover every independent path",
        },
        {
          t: "example",
          title: "Code with two if statements and one while loop",
          steps: ["Decision points = 2 (ifs) + 1 (while) = 3.", "V(G) = 3 + 1."],
          answer: "V(G) = 4",
        },
        { t: "p", text: "**Cohesion** = how closely the parts INSIDE one module belong together. **Coupling** = how much one module DEPENDS ON another. Good design = **high cohesion, low coupling**." },
        { t: "analogy", text: "A good kitchen drawer holds only cutlery (high cohesion). If changing the fridge forced you to rebuild the cupboards, they'd be tightly coupled — bad. You want each room to work on its own (low coupling)." },
        {
          t: "table",
          head: ["Cohesion: best → worst", "Coupling: best → worst"],
          rows: [["Functional (one task)", "Data (only simple data passed)"], ["Sequential", "Stamp (a whole record passed)"], ["Communicational", "Control (one module controls another's flow)"], ["Procedural", "External"], ["Temporal", "Common (shared global data)"], ["Logical", "Content (one module changes another's internals)"], ["Coincidental (random)", "—"]],
        },
        { t: "trick", text: "Worst cohesion = Coincidental; worst coupling = Content — both start with C, both are what you must avoid." },
        { t: "p", text: "**Estimating the project:** **COCOMO** estimates effort (person-months) from the size in KLOC (thousand lines of code), in three modes — organic (small, simple), semi-detached, embedded (complex, strict). **Function point analysis** measures size from inputs, outputs, enquiries, files and interfaces instead of lines of code." },
        {
          t: "recap",
          items: [
            "Black-box = inputs/outputs (BVA, equivalence); white-box = code paths",
            "Unit → integration → system → acceptance (alpha, beta); regression after changes",
            "Verification = built right; validation = right product",
            "V(G) = E − N + 2P = decisions + 1",
            "High cohesion (functional best), low coupling (data best)",
          ],
        },
      ],
      quiz: [
        { q: "Cyclomatic complexity of a graph with 10 edges, 8 nodes, 1 component:", options: ["2", "4", "18", "3"], answer: 1, explain: "10 − 8 + 2 = 4." },
        { q: "The best type of cohesion is:", options: ["Logical", "Temporal", "Functional", "Coincidental"], answer: 2, explain: "Every part contributes to one task." },
        { q: "Boundary value analysis is a ___ technique.", options: ["white-box", "black-box", "regression", "integration"], answer: 1, explain: "It uses only the specification, not the code." },
      ],
    },
  ],
};
