/**
 * Computer Science practice for the subject guide: per module, the concepts
 * that BPSC TRE / STET / DSSSB-style papers ask again and again, and original
 * exam-style MCQs with a one-line explanation. Order matches the modules of
 * the Computer Science guide (see subject-guides.ts).
 */

export type GuideMcq = { id: string; q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; explain: string };

type Practice = { hot: string[]; mcqs: Omit<GuideMcq, "id">[] };

const m = (q: string, options: GuideMcq["options"], answer: GuideMcq["answer"], explain: string) => ({ q, options, answer, explain });

/** Index = module number − 1. */
export const CS_PRACTICE: Practice[] = [
  // 1 Computer fundamentals & digital logic
  {
    hot: ["Base conversions & 2's complement", "De Morgan's theorem", "NAND/NOR as universal gates", "JK flip-flop (J = K = 1 toggles)", "Counters (mod-n) & multiplexer select lines"],
    mcqs: [
      m("(11010)₂ in decimal is:", ["24", "26", "28", "22"], 1, "16 + 8 + 2 = 26."),
      m("Which pair are universal gates?", ["AND & OR", "NAND & NOR", "XOR & XNOR", "NOT & AND"], 1, "Any Boolean function can be built using only NAND gates or only NOR gates."),
      m("By De Morgan's theorem, (A·B)′ equals:", ["A′·B′", "A′ + B′", "A + B", "(A + B)′"], 1, "The complement of a product is the sum of the complements."),
      m("A JK flip-flop with J = 1 and K = 1 at the clock edge will:", ["Reset to 0", "Set to 1", "Toggle its output", "Hold its state"], 2, "J = K = 1 is the toggle condition (it removes the SR flip-flop's invalid state)."),
      m("How many select lines does an 8 : 1 multiplexer need?", ["2", "3", "4", "8"], 1, "2ⁿ inputs need n select lines: 2³ = 8."),
      m("The 4-bit 2's complement of 0101 is:", ["1010", "1011", "0110", "1101"], 1, "Invert (1010) and add 1 → 1011."),
      m("A 3-bit binary counter has how many distinct states?", ["3", "6", "8", "16"], 2, "n flip-flops give 2ⁿ states: 2³ = 8 (mod-8)."),
    ],
  },
  // 2 Programming & data structures
  {
    hot: ["Python output questions (//, %, slicing, len)", "Stack/queue applications", "Infix → postfix", "BST worst case O(n)", "Arrays vs linked lists"],
    mcqs: [
      m("Worst-case search time in a binary search tree with n nodes is:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 2, "A skewed BST degenerates into a linked list, so search becomes linear."),
      m("The postfix form of A + B * C is:", ["AB+C*", "ABC*+", "A+BC*", "ABC+*"], 1, "* has higher precedence: B C * first, then add A → A B C * +."),
      m("In Python, print(7 // 2) outputs:", ["3.5", "3", "4", "1"], 1, "// is floor division."),
      m("In Python, len([1, [2, 3], 4]) is:", ["4", "3", "2", "Error"], 1, "The inner list counts as one element."),
      m("Which data structure follows FIFO?", ["Stack", "Queue", "Tree", "Graph"], 1, "First In, First Out — queues; stacks are LIFO."),
      m("Accessing the i-th element in O(1) time is possible in:", ["Singly linked list", "Array", "Binary search tree", "Queue built on a linked list"], 1, "Arrays support direct indexing by address calculation."),
    ],
  },
  // 3 Operating systems
  {
    hot: ["Four deadlock conditions & Banker's algorithm", "FIFO vs Optimal vs LRU (Belady's anomaly)", "SJF / Round Robin waiting time", "Thrashing", "Internal vs external fragmentation"],
    mcqs: [
      m("Which is NOT one of the necessary conditions for deadlock?", ["Mutual exclusion", "Hold and wait", "Circular wait", "Preemption"], 3, "The condition is NO preemption; allowing preemption breaks deadlock."),
      m("Banker's algorithm is used for deadlock:", ["Prevention", "Avoidance", "Detection", "Recovery"], 1, "It grants a request only if the system stays in a safe state."),
      m("Belady's anomaly can occur with which page-replacement algorithm?", ["FIFO", "LRU", "Optimal", "None of these"], 0, "With FIFO, more frames can cause more page faults; LRU and Optimal are stack algorithms."),
      m("Thrashing happens when:", ["The CPU is idle waiting for I/O", "The system spends more time paging than executing", "Two processes deadlock", "The cache is full"], 1, "Too few frames per process → constant page faults."),
      m("For jobs arriving together, which non-preemptive policy gives the minimum average waiting time?", ["FCFS", "SJF", "Round Robin", "Priority"], 1, "Shortest Job First is provably optimal for average waiting time."),
      m("External fragmentation can be removed by:", ["Compaction", "Thrashing", "Increasing time quantum", "Swapping the CPU"], 0, "Compaction moves allocated blocks together to create one large free block (paging avoids it altogether)."),
      m("Round Robin with a very large time quantum behaves like:", ["SJF", "FCFS", "Priority", "Multilevel queue"], 1, "If the quantum exceeds every burst, each job runs to completion in arrival order."),
    ],
  },
  // 4 DBMS & SQL
  {
    hot: ["Functional dependencies & Armstrong's axioms", "3NF vs BCNF", "Outer joins (LEFT/RIGHT/FULL)", "Isolation levels & anomalies", "ACID", "Indexing, B+ trees"],
    mcqs: [
      m("Which statement is true?", ["Every 3NF relation is in BCNF", "Every BCNF relation is in 3NF", "BCNF and 3NF are identical", "BCNF allows partial dependencies"], 1, "BCNF is stricter: for every X → Y, X must be a super key."),
      m("A LEFT OUTER JOIN returns:", ["Only matching rows", "All rows of the left table, with NULLs where the right has no match", "All rows of the right table only", "The Cartesian product"], 1, "Unmatched left rows are kept with NULLs for right-side columns."),
      m("The lowest isolation level that prevents dirty reads is:", ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], 1, "Read Committed allows only committed data to be read."),
      m("Which ACID property guarantees that committed data survives a crash?", ["Atomicity", "Consistency", "Isolation", "Durability"], 3, "Durability — committed changes are permanent."),
      m("Which clause filters groups after GROUP BY?", ["WHERE", "HAVING", "ORDER BY", "DISTINCT"], 1, "WHERE filters rows before grouping; HAVING filters groups."),
      m("If A → B and B → C, then A → C. This Armstrong axiom is:", ["Reflexivity", "Augmentation", "Transitivity", "Union"], 2, "Transitivity."),
      m("Most DBMS indexes for range queries are built as:", ["Hash tables", "B+ trees", "Linked lists", "Stacks"], 1, "B+ trees keep keys sorted with linked leaves, ideal for ranges."),
    ],
  },
  // 5 Networks & security
  {
    hot: ["OSI layer ↔ protocol ↔ device", "ARP / RARP", "IPv4 subnetting (hosts per subnet)", "Sliding window flow control", "CSMA/CD (Ethernet) vs CSMA/CA (Wi-Fi)", "Port numbers"],
    mcqs: [
      m("ARP is used to find:", ["The IP address from a MAC address", "The MAC address from an IP address", "The domain name from an IP address", "The port from a service name"], 1, "Address Resolution Protocol maps IP → MAC within a LAN."),
      m("How many usable host addresses does a /26 IPv4 subnet have?", ["64", "62", "30", "126"], 1, "32 − 26 = 6 host bits → 2⁶ − 2 = 62."),
      m("The sliding-window protocol is mainly used for:", ["Routing", "Flow control", "Encryption", "Name resolution"], 1, "It lets the sender transmit several frames before acknowledgement, within the window size."),
      m("CSMA/CD is the access method of:", ["Wi-Fi (802.11)", "Classic Ethernet (802.3)", "Bluetooth", "Token Ring"], 1, "Wireless LANs use CSMA/CA because collisions cannot be detected while transmitting."),
      m("Routing is a function of which OSI layer?", ["Data link", "Network", "Transport", "Session"], 1, "Routers work at layer 3 using IP addresses."),
      m("The default port of HTTPS is:", ["80", "21", "443", "25"], 2, "HTTP 80, FTP 21, SMTP 25, HTTPS 443."),
      m("Which device forwards frames using MAC addresses?", ["Hub", "Switch", "Router", "Repeater"], 1, "Switches are layer-2 devices."),
    ],
  },
  // 6 Computer organisation & architecture
  {
    hot: ["Addressing modes", "Pipeline hazards", "Memory hierarchy & cache", "DMA & interrupts", "Registers (PC, IR, MAR, MDR)"],
    mcqs: [
      m("In which addressing mode is the operand itself part of the instruction?", ["Immediate", "Direct", "Indirect", "Register"], 0, "Immediate addressing — e.g. MOV A, #5."),
      m("A hazard caused by a branch instruction in a pipeline is a:", ["Structural hazard", "Data hazard", "Control hazard", "Memory hazard"], 2, "The next instruction to fetch is unknown until the branch resolves."),
      m("The Program Counter holds:", ["The current instruction", "The address of the next instruction", "The result of the ALU", "The stack top"], 1, "PC points to the next instruction to fetch."),
      m("DMA allows:", ["The CPU to run faster", "I/O devices to transfer data to memory without the CPU moving each word", "Direct access to registers", "Faster cache hits"], 1, "The DMA controller takes the bus and moves blocks of data."),
      m("The fastest storage in a computer is:", ["Cache", "Registers", "Main memory", "SSD"], 1, "Registers sit inside the CPU, above cache in the hierarchy."),
    ],
  },
  // 7 Theory of computation & compiler design
  {
    hot: ["Phases of a compiler", "DFA vs NFA (equal power)", "Regular → finite automata, CFL → PDA", "Lexical vs syntax analysis"],
    mcqs: [
      m("Which compiler phase produces tokens?", ["Syntax analysis", "Lexical analysis", "Code optimisation", "Code generation"], 1, "The lexical analyser (scanner) groups characters into tokens."),
      m("Finite automata accept exactly the:", ["Regular languages", "Context-free languages", "Context-sensitive languages", "Recursively enumerable languages"], 0, "FA ↔ regular, PDA ↔ context-free, TM ↔ recursively enumerable."),
      m("Compared with DFAs, NFAs are:", ["More powerful", "Less powerful", "Equally powerful", "Unable to accept regular languages"], 2, "Every NFA can be converted to an equivalent DFA (subset construction)."),
      m("A parse tree is built during:", ["Lexical analysis", "Syntax analysis", "Linking", "Loading"], 1, "The parser checks the grammar and builds the tree."),
      m("A pushdown automaton recognises:", ["Regular languages only", "Context-free languages", "All languages", "Only finite languages"], 1, "The stack lets it match nested structures like balanced brackets."),
    ],
  },
  // 8 Algorithms
  {
    hot: ["Quick sort vs merge sort complexity", "Dijkstra vs Bellman-Ford", "BFS vs DFS", "Binary search (sorted, O(log n))", "Greedy (Kruskal, Prim) vs DP"],
    mcqs: [
      m("Dijkstra's algorithm can give wrong results when the graph has:", ["Cycles", "Negative edge weights", "More than 100 vertices", "Undirected edges"], 1, "Use Bellman-Ford for negative weights; it also detects negative cycles."),
      m("Worst-case time complexity of quick sort is:", ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], 1, "Bad pivots (e.g. sorted input with first-element pivot) give n² comparisons."),
      m("Merge sort runs in:", ["O(n²) in the worst case", "O(n log n) in all cases", "O(n) on sorted input", "O(log n)"], 1, "It always splits in half and merges in linear time."),
      m("Binary search requires the data to be:", ["Stored in a linked list", "Sorted", "Unique", "Of size a power of two"], 1, "It halves a sorted range each step: O(log n)."),
      m("Kruskal's minimum spanning tree algorithm is a:", ["Dynamic-programming algorithm", "Greedy algorithm", "Backtracking algorithm", "Divide-and-conquer algorithm"], 1, "It repeatedly picks the cheapest edge that does not form a cycle."),
      m("Shortest paths (fewest edges) in an unweighted graph are found with:", ["DFS", "BFS", "Heap sort", "Binary search"], 1, "BFS explores level by level."),
    ],
  },
  // 9 Software engineering & OOP (C++)
  {
    hot: ["Cyclomatic complexity (E − N + 2P)", "High cohesion, low coupling", "Spiral model = risk analysis", "Overloading vs overriding", "Virtual functions, abstract classes, virtual destructors"],
    mcqs: [
      m("Cyclomatic complexity of a control-flow graph with E edges, N nodes and P components is:", ["E − N + P", "E − N + 2P", "N − E + 2P", "E + N − 2P"], 1, "McCabe's formula V(G) = E − N + 2P."),
      m("A good software design has:", ["High coupling, low cohesion", "Low coupling, high cohesion", "High coupling, high cohesion", "Low coupling, low cohesion"], 1, "Modules should be focused (cohesive) and independent (loosely coupled)."),
      m("The distinguishing feature of the spiral model is:", ["No testing phase", "Explicit risk analysis in every cycle", "Single pass through phases", "No customer feedback"], 1, "Boehm's spiral model is risk-driven."),
      m("In C++, runtime polymorphism is achieved using:", ["Function overloading", "Templates", "Virtual functions", "Macros"], 2, "A virtual call is resolved through the object's vtable at runtime."),
      m("A C++ class with at least one pure virtual function is:", ["A friend class", "An abstract class", "A final class", "A template class"], 1, "It cannot be instantiated; derived classes must override the pure virtual function."),
      m("A base class destructor should be virtual so that:", ["Objects are created faster", "Deleting a derived object through a base pointer also runs the derived destructor", "Constructors become virtual", "Memory is never freed"], 1, "Without it, delete basePtr runs only the base destructor (undefined behaviour / leaks)."),
      m("Function overriding means:", ["Same name, different parameters in one class", "A derived class redefines a base-class function with the same signature", "Two classes with the same name", "Calling a function recursively"], 1, "Overloading is same name with different parameters in the same scope."),
    ],
  },
  // 10 Web technology
  {
    hot: ["HTTP status codes", "HTML tags & attributes", "CSS selectors & properties", "DOM, client vs server side"],
    mcqs: [
      m("HTTP status code 404 means:", ["OK", "Moved permanently", "Not found", "Internal server error"], 2, "200 OK, 301 moved, 404 not found, 500 server error."),
      m("DOM stands for:", ["Data Object Model", "Document Object Model", "Digital Ordinance Model", "Document Oriented Markup"], 1, "The browser's tree representation of a page."),
      m("Which HTML tag creates a hyperlink?", ["<link>", "<a>", "<href>", "<nav>"], 1, "<a href=\"…\">; <link> attaches resources such as stylesheets."),
      m("The CSS property that sets text colour is:", ["font-color", "text-color", "color", "foreground"], 2, "color: red;"),
    ],
  },
  // 11 Discrete mathematics & statistics
  {
    hot: ["Permutations with repetition", "Probability with dice/cards", "Trees have n − 1 edges", "Truth tables of implication"],
    mcqs: [
      m("Number of distinct arrangements of the letters of BOOK is:", ["24", "12", "6", "8"], 1, "4! / 2! = 12 (O repeats twice)."),
      m("Probability of a sum of 7 when two dice are thrown is:", ["1/6", "1/12", "7/36", "1/9"], 0, "6 favourable outcomes out of 36."),
      m("A tree with n vertices has how many edges?", ["n", "n − 1", "n + 1", "2n"], 1, "Connected and acyclic ⇒ exactly n − 1 edges."),
      m("The implication p → q is false only when:", ["p true, q true", "p true, q false", "p false, q true", "p false, q false"], 1, "A true premise cannot imply a false conclusion."),
    ],
  },
  // 12 Teaching & general sections — practised in the full mocks
  { hot: ["Language section is qualifying — secure the cut-off", "General Studies counts for merit"], mcqs: [] },
];
