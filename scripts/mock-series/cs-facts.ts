/**
 * Computer Science & IT — fact tables. Each table is "prompt → answer" with a
 * question template; distractors are other answers of the same table, so a
 * table must never contain two rows whose answers are both correct for one
 * prompt (answers are unique per prompt).
 */
import { factQuestion, mcq, pick, sample, shuffle, type GenQuestion, type Rng } from "./core";

const S = "Computer Science and IT";

type Table = { topic: string; q: (p: string) => string; rows: [string, string][]; reverse?: (a: string) => string; difficulty?: GenQuestion["difficulty"] };

const T = (topic: string, q: (p: string) => string, rows: [string, string][], reverse?: (a: string) => string, difficulty?: GenQuestion["difficulty"]): Table => ({ topic, q, rows, reverse, difficulty });

export const CS_TABLES: Table[] = [
  T("Abbreviations", (p) => `What is the full form of ${p}?`, [
    ["CPU", "Central Processing Unit"], ["ALU", "Arithmetic Logic Unit"], ["RAM", "Random Access Memory"], ["ROM", "Read Only Memory"],
    ["PROM", "Programmable Read Only Memory"], ["EPROM", "Erasable Programmable Read Only Memory"], ["EEPROM", "Electrically Erasable Programmable Read Only Memory"],
    ["BIOS", "Basic Input Output System"], ["USB", "Universal Serial Bus"], ["HDD", "Hard Disk Drive"], ["SSD", "Solid State Drive"],
    ["GUI", "Graphical User Interface"], ["CLI", "Command Line Interface"], ["OS", "Operating System"], ["DBMS", "Database Management System"],
    ["RDBMS", "Relational Database Management System"], ["SQL", "Structured Query Language"], ["HTML", "HyperText Markup Language"],
    ["HTTP", "HyperText Transfer Protocol"], ["HTTPS", "HyperText Transfer Protocol Secure"], ["URL", "Uniform Resource Locator"],
    ["WWW", "World Wide Web"], ["FTP", "File Transfer Protocol"], ["SMTP", "Simple Mail Transfer Protocol"], ["POP", "Post Office Protocol"],
    ["IMAP", "Internet Message Access Protocol"], ["DNS", "Domain Name System"], ["DHCP", "Dynamic Host Configuration Protocol"],
    ["TCP", "Transmission Control Protocol"], ["UDP", "User Datagram Protocol"], ["IP", "Internet Protocol"], ["ARP", "Address Resolution Protocol"],
    ["ICMP", "Internet Control Message Protocol"], ["LAN", "Local Area Network"], ["MAN", "Metropolitan Area Network"], ["WAN", "Wide Area Network"],
    ["PAN", "Personal Area Network"], ["VPN", "Virtual Private Network"], ["NIC", "Network Interface Card"], ["MAC", "Media Access Control"],
    ["ISP", "Internet Service Provider"], ["OSI", "Open Systems Interconnection"], ["ASCII", "American Standard Code for Information Interchange"],
    ["EBCDIC", "Extended Binary Coded Decimal Interchange Code"], ["BCD", "Binary Coded Decimal"], ["CSS", "Cascading Style Sheets"],
    ["XML", "eXtensible Markup Language"], ["JSON", "JavaScript Object Notation"], ["API", "Application Programming Interface"],
    ["IDE", "Integrated Development Environment"], ["JVM", "Java Virtual Machine"], ["JDK", "Java Development Kit"], ["JRE", "Java Runtime Environment"],
    ["OOP", "Object-Oriented Programming"], ["UML", "Unified Modeling Language"], ["SDLC", "Software Development Life Cycle"],
    ["SRS", "Software Requirements Specification"], ["CASE", "Computer-Aided Software Engineering"], ["ERP", "Enterprise Resource Planning"],
    ["CRM", "Customer Relationship Management"], ["AI", "Artificial Intelligence"], ["ML", "Machine Learning"], ["IoT", "Internet of Things"],
    ["SaaS", "Software as a Service"], ["PaaS", "Platform as a Service"], ["IaaS", "Infrastructure as a Service"], ["GPU", "Graphics Processing Unit"],
    ["VGA", "Video Graphics Array"], ["LCD", "Liquid Crystal Display"], ["LED", "Light Emitting Diode"], ["OCR", "Optical Character Recognition"],
    ["OMR", "Optical Mark Recognition"], ["MICR", "Magnetic Ink Character Recognition"], ["UPS", "Uninterruptible Power Supply"],
    ["PDF", "Portable Document Format"], ["JPEG", "Joint Photographic Experts Group"], ["GIF", "Graphics Interchange Format"],
    ["PNG", "Portable Network Graphics"], ["MPEG", "Moving Picture Experts Group"], ["CMOS", "Complementary Metal-Oxide Semiconductor"],
    ["VLSI", "Very Large Scale Integration"], ["DMA", "Direct Memory Access"], ["MAR", "Memory Address Register"], ["MDR", "Memory Data Register"],
    ["PC (register)", "Program Counter"], ["IR (register)", "Instruction Register"], ["RISC", "Reduced Instruction Set Computer"],
    ["CISC", "Complex Instruction Set Computer"], ["FIFO", "First In First Out"], ["LIFO", "Last In First Out"], ["LRU", "Least Recently Used"],
    ["DFS", "Depth First Search"], ["BFS", "Breadth First Search"], ["NAT", "Network Address Translation"], ["SSL", "Secure Sockets Layer"],
    ["TLS", "Transport Layer Security"], ["SSH", "Secure Shell"], ["SNMP", "Simple Network Management Protocol"], ["NTP", "Network Time Protocol"],
    ["CSMA/CD", "Carrier Sense Multiple Access with Collision Detection"], ["CSMA/CA", "Carrier Sense Multiple Access with Collision Avoidance"],
    ["Wi-Fi", "Wireless Fidelity"], ["GPS", "Global Positioning System"], ["GSM", "Global System for Mobile Communications"],
    ["CDMA", "Code Division Multiple Access"], ["MODEM", "Modulator-Demodulator"], ["PHP", "PHP: Hypertext Preprocessor"],
    ["COBOL", "Common Business-Oriented Language"], ["FORTRAN", "Formula Translation"], ["BASIC", "Beginner's All-purpose Symbolic Instruction Code"],
    ["ACID", "Atomicity, Consistency, Isolation, Durability"], ["DDL", "Data Definition Language"], ["DML", "Data Manipulation Language"],
    ["DCL", "Data Control Language"], ["TCL", "Transaction Control Language"], ["ER (diagram)", "Entity Relationship"], ["CAD", "Computer-Aided Design"],
    ["VoIP", "Voice over Internet Protocol"], ["IPR", "Intellectual Property Rights"], ["DOS", "Disk Operating System"], ["FAT", "File Allocation Table"],
    ["NTFS", "New Technology File System"], ["KB", "Kilobyte"], ["Gbps", "Gigabits per second"], ["MIPS", "Million Instructions Per Second"],
  ], (a) => `Which abbreviation stands for "${a}"?`, "EASY"),

  T("Port numbers", (p) => `What is the default port number of ${p}?`, [
    ["HTTP", "80"], ["HTTPS", "443"], ["FTP (control)", "21"], ["FTP (data)", "20"], ["SSH", "22"], ["Telnet", "23"], ["SMTP", "25"], ["DNS", "53"],
    ["DHCP server", "67"], ["DHCP client", "68"], ["TFTP", "69"], ["POP3", "110"], ["NTP", "123"], ["IMAP", "143"], ["SNMP", "161"], ["BGP", "179"],
    ["LDAP", "389"], ["IMAPS", "993"], ["POP3S", "995"], ["MySQL", "3306"], ["RDP", "3389"], ["PostgreSQL", "5432"],
  ], (a) => `Which protocol/service uses default port ${a}?`),

  T("OSI model", (p) => `At which layer of the OSI model does ${p} work?`, [
    ["HTTP", "Application layer"], ["TCP", "Transport layer"], ["IP", "Network layer"], ["Router", "Network layer"], ["Switch (Layer-2)", "Data link layer"],
    ["Bridge", "Data link layer"], ["Hub", "Physical layer"], ["Repeater", "Physical layer"], ["UDP", "Transport layer"], ["SMTP", "Application layer"],
    ["ICMP", "Network layer"], ["Ethernet (MAC framing)", "Data link layer"], ["PPP", "Data link layer"], ["FTP", "Application layer"],
    ["Encryption / compression (classic OSI role)", "Presentation layer"], ["Dialog control and synchronisation", "Session layer"], ["DNS", "Application layer"],
  ]),

  T("OSI model", (p) => `What is the protocol data unit (PDU) at the ${p} of the OSI model?`, [
    ["Transport layer (TCP)", "Segment"], ["Network layer", "Packet"], ["Data link layer", "Frame"], ["Physical layer", "Bit"],
  ]),

  T("Algorithms", (p) => `What is the time complexity of ${p}?`, [
    ["binary search (worst case)", "O(log n)"], ["linear search (worst case)", "O(n)"], ["bubble sort (worst case)", "O(n²)"],
    ["merge sort (worst case)", "O(n log n)"], ["quick sort (worst case)", "O(n²)"], ["heap sort (worst case)", "O(n log n)"],
    ["insertion sort (best case)", "O(n)"], ["BFS on a graph using an adjacency list", "O(V + E)"], ["Floyd–Warshall algorithm", "O(V³)"],
    ["Bellman–Ford algorithm", "O(VE)"], ["accessing an array element by index", "O(1)"], ["push/pop on a stack", "O(1)"],
    ["searching an unsorted linked list", "O(n)"], ["building a heap from n elements (bottom-up)", "O(n)"], ["Tower of Hanoi (number of moves)", "O(2ⁿ)"],
    ["matrix multiplication of two n × n matrices (standard method)", "O(n³)"], ["counting sort with range k", "O(n + k)"],
  ], undefined, "MEDIUM"),

  T("Data structures", (p) => `Which data structure is most suitable for ${p}?`, [
    ["implementing function calls and recursion", "Stack"], ["breadth-first search of a graph", "Queue"], ["implementing a priority scheduler", "Heap (priority queue)"],
    ["checking balanced parentheses", "Stack"], ["printer job spooling", "Queue"], ["average O(1) key lookup", "Hash table"],
    ["representing hierarchical data such as a file system", "Tree"], ["representing a road network", "Graph"], ["undo operation in an editor", "Stack"],
    ["dictionary words with prefix search", "Trie"], ["efficient insertion/deletion at both ends", "Deque"],
  ]),

  T("Pioneers", (p) => `Who is known for ${p}?`, [
    ["being called the 'Father of the Computer' (Analytical Engine)", "Charles Babbage"], ["being regarded as the first computer programmer", "Ada Lovelace"],
    ["inventing the World Wide Web", "Tim Berners-Lee"], ["developing the C programming language", "Dennis Ritchie"], ["creating C++", "Bjarne Stroustrup"],
    ["creating Java", "James Gosling"], ["creating Python", "Guido van Rossum"], ["creating the Linux kernel", "Linus Torvalds"],
    ["the Turing machine and the Turing test", "Alan Turing"], ["the relational model of databases", "E. F. Codd"], ["the stored-program computer architecture", "John von Neumann"],
    ["coining the term 'Artificial Intelligence' and creating LISP", "John McCarthy"], ["developing the first compiler (A-0) and influencing COBOL", "Grace Hopper"],
    ["inventing the computer mouse", "Douglas Engelbart"], ["sending the first network e-mail", "Ray Tomlinson"], ["creating JavaScript", "Brendan Eich"],
    ["creating PHP", "Rasmus Lerdorf"], ["creating Perl", "Larry Wall"], ["creating Pascal", "Niklaus Wirth"], ["leading the development of FORTRAN", "John Backus"],
    ["the punched-card tabulating machine used in the 1890 US census", "Herman Hollerith"], ["co-designing TCP/IP (often called a 'Father of the Internet')", "Vint Cerf"],
    ["the mechanical calculator 'Pascaline'", "Blaise Pascal"], ["co-founding Hotmail", "Sabeer Bhatia"],
  ]),

  T("Computer fundamentals", (p) => `What type of file usually has the extension ${p}?`, [
    [".exe", "Executable program"], [".docx", "Microsoft Word document"], [".xlsx", "Microsoft Excel workbook"], [".pptx", "Microsoft PowerPoint presentation"],
    [".pdf", "Portable Document Format file"], [".mp3", "Audio file"], [".mp4", "Video file"], [".jpg", "Image file"], [".html", "Web page"],
    [".py", "Python source file"], [".java", "Java source file"], [".class", "Compiled Java bytecode"], [".c", "C source file"], [".csv", "Comma-separated values file"],
    [".zip", "Compressed archive"], [".txt", "Plain text file"], [".sql", "SQL script"], [".css", "Style sheet"],
  ], undefined, "EASY"),

  T("Computer fundamentals", (p) => `In Microsoft Word (Windows), what does the shortcut ${p} do?`, [
    ["Ctrl + C", "Copy"], ["Ctrl + V", "Paste"], ["Ctrl + X", "Cut"], ["Ctrl + Z", "Undo"], ["Ctrl + Y", "Redo"], ["Ctrl + A", "Select all"],
    ["Ctrl + S", "Save"], ["Ctrl + P", "Print"], ["Ctrl + F", "Find"], ["Ctrl + H", "Replace"], ["Ctrl + B", "Bold"], ["Ctrl + I", "Italic"],
    ["Ctrl + U", "Underline"], ["Ctrl + N", "New document"], ["Ctrl + O", "Open"], ["Ctrl + E", "Center align"], ["Ctrl + L", "Left align"],
    ["Ctrl + R", "Right align"], ["Ctrl + J", "Justify"], ["Ctrl + K", "Insert hyperlink"], ["F7", "Spelling and grammar check"],
    ["Ctrl + Home", "Go to the beginning of the document"], ["Ctrl + End", "Go to the end of the document"],
  ], (a) => `In Microsoft Word (Windows), which shortcut is used for "${a}"?`, "EASY"),

  T("Computer fundamentals", (p) => `In Windows, what does ${p} do?`, [
    ["Alt + F4", "Closes the active window"], ["Windows + D", "Shows the desktop"], ["Windows + L", "Locks the computer"], ["Windows + E", "Opens File Explorer"],
    ["Ctrl + Shift + Esc", "Opens Task Manager"], ["F2 (on a selected file)", "Renames the file"], ["Shift + Delete", "Deletes permanently without the Recycle Bin"],
    ["Alt + Tab", "Switches between open windows"],
  ], undefined, "EASY"),

  T("Database management", (p) => `The SQL command ${p} belongs to which category?`, [
    ["CREATE", "DDL"], ["ALTER", "DDL"], ["DROP", "DDL"], ["TRUNCATE", "DDL"], ["INSERT", "DML"], ["UPDATE", "DML"], ["DELETE", "DML"],
    ["GRANT", "DCL"], ["REVOKE", "DCL"], ["COMMIT", "TCL"], ["ROLLBACK", "TCL"], ["SAVEPOINT", "TCL"],
  ]),

  T("Database management", (p) => `Which term describes the following: ${p}?`, [
    ["a minimal set of attributes that uniquely identifies each tuple and is chosen by the designer", "Primary key"],
    ["an attribute in one table that refers to the primary key of another table", "Foreign key"],
    ["any set of attributes that uniquely identifies a tuple (not necessarily minimal)", "Super key"],
    ["a minimal super key; one of them becomes the primary key", "Candidate key"],
    ["a virtual table based on the result of a query", "View"],
    ["a row of a relation", "Tuple"],
    ["the number of attributes in a relation", "Degree"],
    ["the number of tuples in a relation", "Cardinality"],
    ["a stored procedure that runs automatically on INSERT/UPDATE/DELETE", "Trigger"],
    ["the overall logical design of a database", "Schema"],
    ["the data stored in the database at a particular moment", "Instance"],
    ["a structure that speeds up data retrieval on a column", "Index"],
    ["the property that a transaction is all-or-nothing", "Atomicity"],
    ["the property that committed changes survive system failure", "Durability"],
    ["the property that concurrent transactions do not interfere", "Isolation"],
  ]),

  T("Database management", (p) => `Which normal form requires ${p}?`, [
    ["every attribute value to be atomic", "1NF"], ["1NF and no partial dependency of a non-key attribute on a candidate key", "2NF"],
    ["2NF and no transitive dependency of a non-key attribute", "3NF"], ["every determinant to be a candidate key", "BCNF"],
    ["BCNF and no non-trivial multivalued dependency", "4NF"],
  ]),

  T("Operating systems", (p) => `Which operating-system term describes ${p}?`, [
    ["excessive paging that leaves the CPU mostly idle", "Thrashing"], ["a situation where processes wait for each other forever", "Deadlock"],
    ["a process never getting the resources it needs because others keep getting them", "Starvation"],
    ["gradually raising the priority of waiting processes", "Aging"], ["saving one process's state and loading another's", "Context switch"],
    ["an integer variable used for process synchronisation with wait and signal", "Semaphore"],
    ["the part of code that accesses shared resources and must not run concurrently", "Critical section"],
    ["an access to a page that is not in main memory", "Page fault"], ["more page faults with more frames under FIFO replacement", "Belady's anomaly"],
    ["a deadlock-avoidance algorithm that checks for a safe state", "Banker's algorithm"], ["the core of the operating system that stays in memory", "Kernel"],
    ["the program that interprets user commands", "Shell"], ["a cache of recent page-table entries", "Translation Lookaside Buffer (TLB)"],
    ["placing jobs in a buffer so a slow device such as a printer can process them later", "Spooling"],
    ["using disk space to give an illusion of larger main memory", "Virtual memory"],
  ]),

  T("Operating systems", (p) => `Which CPU-scheduling algorithm ${p}?`, [
    ["gives each process a fixed time quantum in turn", "Round Robin"], ["runs processes strictly in order of arrival", "First Come First Served"],
    ["always picks the process with the smallest next CPU burst", "Shortest Job First"],
    ["preempts the running process when a new process has a shorter remaining time", "Shortest Remaining Time First"],
  ]),

  // Split by kind so that no distractor can also be true for the prompt.
  T("Computer networks", (p) => `What is the main function of ${p}?`, [
    ["ARP", "Finding the MAC address for a known IP address"], ["DNS", "Translating domain names into IP addresses"],
    ["DHCP", "Assigning IP addresses to hosts automatically"], ["NAT", "Mapping private IP addresses to a public IP address"],
    ["ICMP", "Reporting errors and diagnostics such as ping"], ["SMTP", "Sending e-mail between mail servers"], ["POP3", "Downloading e-mail from a server to a client"],
  ]),
  T("Computer networks", (p) => `What is the length of ${p}?`, [
    ["an IPv4 address", "32 bits"], ["an IPv6 address", "128 bits"], ["a MAC address", "48 bits"], ["a TCP port number", "16 bits"],
  ]),
  T("Computer networks", (p) => `Which protocol is described by: ${p}?`, [
    ["connection-oriented, reliable, ordered delivery using a three-way handshake", "TCP"], ["connectionless, no delivery guarantee, low overhead", "UDP"],
    ["best-effort addressing and routing of packets between networks", "IP"], ["request–response protocol used by web browsers", "HTTP"],
    ["encrypted remote login to another computer", "SSH"],
  ]),
  T("Computer networks", (p) => `Which network topology is described by: ${p}?`, [
    ["all nodes connect to a central hub or switch", "Star"], ["every node is directly connected to every other node", "Mesh"],
    ["all nodes share a single backbone cable", "Bus"], ["each node connects to exactly two neighbours forming a loop", "Ring"],
    ["a hierarchy of star networks connected to a root", "Tree"],
  ]),
  T("Computer networks", (p) => `What is the transmission mode of ${p}?`, [
    ["a walkie-talkie", "Half-duplex"], ["a telephone call", "Full-duplex"], ["TV broadcasting", "Simplex"], ["a keyboard sending data to a computer", "Simplex"],
  ]),
  T("Computer networks", (p) => `Which medium-access method is used in ${p}?`, [
    ["classic wired Ethernet", "CSMA/CD"], ["Wi-Fi (IEEE 802.11)", "CSMA/CA"], ["Token Ring networks", "Token passing"], ["early ALOHAnet radio", "Pure ALOHA"],
  ]),

  T("Software engineering", (p) => `Which term matches: ${p}?`, [
    ["a linear sequential SDLC model where each phase completes before the next", "Waterfall model"],
    ["an SDLC model by Barry Boehm emphasising risk analysis in each loop", "Spiral model"],
    ["an SDLC model where every development phase has a matching testing phase", "V-model"],
    ["building a quick working model to clarify requirements", "Prototyping model"],
    ["iterative development in short sprints with continuous feedback", "Agile"],
    ["testing based only on inputs and outputs without seeing the code", "Black-box testing"],
    ["testing based on the internal structure of the code", "White-box testing"],
    ["testing done by users at the developer's site before release", "Alpha testing"],
    ["testing done by real users at their own site", "Beta testing"],
    ["re-testing to make sure a change did not break existing features", "Regression testing"],
    ["an empirical cost-estimation model by Barry Boehm", "COCOMO"],
    ["a metric equal to E − N + 2P for a control-flow graph", "Cyclomatic complexity"],
    ["the degree to which elements inside a module belong together (should be high)", "Cohesion"],
    ["the degree of interdependence between modules (should be low)", "Coupling"],
    ["the document that records what the software must do", "Software Requirements Specification (SRS)"],
  ]),

  T("Object-oriented programming", (p) => `Which OOP concept is described by: ${p}?`, [
    ["bundling data and methods together and hiding internal details", "Encapsulation"],
    ["a class acquiring the properties of another class", "Inheritance"], ["one interface with many forms", "Polymorphism"],
    ["showing essential features while hiding implementation", "Abstraction"], ["defining several methods with the same name but different parameters in one class", "Method overloading"],
    ["a subclass providing its own version of a parent's method", "Method overriding"], ["a special method called automatically when an object is created", "Constructor"],
    ["an instance of a class", "Object"],
  ]),

  T("Web technology", (p) => `Which HTML tag is used for ${p}?`, [
    ["creating a hyperlink", "<a>"], ["inserting an image", "<img>"], ["an ordered (numbered) list", "<ol>"], ["an unordered (bulleted) list", "<ul>"],
    ["a list item", "<li>"], ["a table row", "<tr>"], ["a table data cell", "<td>"], ["a table header cell", "<th>"], ["a line break", "<br>"],
    ["a paragraph", "<p>"], ["the largest heading", "<h1>"], ["the page title shown on the browser tab", "<title>"], ["embedding another page inside a page", "<iframe>"],
    ["a form for user input", "<form>"],
  ], undefined, "EASY"),

  T("Information security", (p) => `Which term describes ${p}?`, [
    ["malware that copies itself across a network without attaching to a file", "Worm"], ["malware disguised as useful software", "Trojan horse"],
    ["malicious code that attaches to a host file and spreads when the file runs", "Virus"], ["malware that encrypts files and demands payment", "Ransomware"],
    ["software that secretly collects information about a user", "Spyware"], ["tricking users into revealing data through fake e-mails or sites", "Phishing"],
    ["a system that filters network traffic based on rules", "Firewall"], ["flooding a service so legitimate users cannot reach it", "Denial-of-service attack"],
    ["encryption that uses the same key to encrypt and decrypt", "Symmetric encryption"], ["encryption that uses a public and a private key", "Asymmetric encryption"],
    ["a value used to verify the sender and integrity of a message", "Digital signature"],
  ]),

  T("Information security", (p) => `${p} is an example of which kind of algorithm?`, [
    ["AES", "Symmetric-key encryption"], ["DES", "Symmetric-key encryption"], ["RSA", "Public-key (asymmetric) encryption"], ["SHA-256", "Cryptographic hash function"],
    ["MD5", "Cryptographic hash function"], ["Diffie–Hellman", "Key-exchange protocol"],
  ]),

  T("Programming in C", (p) => `In C, which header file declares ${p}?`, [
    ["printf()", "stdio.h"], ["strlen()", "string.h"], ["sqrt()", "math.h"], ["malloc()", "stdlib.h"], ["toupper()", "ctype.h"], ["time()", "time.h"],
  ]),
  T("Programming in C", (p) => `In C's printf(), which format specifier is used for ${p}?`, [
    ["an int", "%d"], ["a char", "%c"], ["a string", "%s"], ["a float", "%f"], ["an unsigned int in hexadecimal", "%x"], ["a pointer address", "%p"],
  ]),
  T("Programming in C", (p) => `In C, which keyword ${p}?`, [
    ["exits a loop or switch immediately", "break"], ["skips to the next loop iteration", "continue"], ["declares a type whose members share one memory location", "union"],
    ["creates an alias name for an existing type", "typedef"], ["declares a variable defined in another file", "extern"],
    ["makes a local variable keep its value between calls", "static"],
  ]),
  T("Programming in C", (p) => `In C, ${p}?`, [
    ["which loop always executes its body at least once", "do-while"], ["which character terminates a string", "'\\0'"],
    ["which operator gives the address of a variable", "&"], ["which operator is the logical AND", "&&"],
  ]),

  T("Programming in Python", (p) => `In Python, which keyword ${p}?`, [
    ["defines a function", "def"], ["creates an anonymous function", "lambda"], ["handles exceptions together with try", "except"],
    ["imports a module", "import"], ["exits a function and gives back a value", "return"], ["defines a class", "class"],
  ]),
  T("Programming in Python", (p) => `Which built-in Python type ${p}?`, [
    ["is an immutable ordered sequence", "tuple"], ["stores key–value pairs", "dict"], ["stores unordered unique elements", "set"],
    ["is a mutable ordered sequence", "list"], ["stores text", "str"],
  ]),
  T("Programming in Python", (p) => `In Python, which operator ${p}?`, [
    ["performs floor division", "//"], ["performs exponentiation", "**"], ["gives the remainder", "%"], ["tests object identity", "is"],
  ]),

  T("Programming in Java", (p) => `In Java, which keyword ${p}?`, [
    ["prevents a class from being inherited", "final"], ["is used to inherit a class", "extends"], ["is used to implement an interface", "implements"],
    ["refers to the current object", "this"], ["refers to the parent class", "super"], ["creates a new object", "new"],
  ]),

  T("Computer organisation", (p) => `Which component/register ${p}?`, [
    ["holds the address of the next instruction to be executed", "Program Counter (PC)"], ["holds the instruction currently being executed", "Instruction Register (IR)"],
    ["holds the address of the memory location to be accessed", "Memory Address Register (MAR)"], ["holds data being transferred to or from memory", "Memory Data Register (MDR)"],
    ["performs arithmetic and logical operations", "ALU"], ["directs the operation of the processor", "Control Unit"],
    ["is the fastest memory, inside the CPU", "Registers"], ["is the small fast memory between CPU and main memory", "Cache memory"],
    ["transfers data between I/O and memory without the CPU", "DMA controller"],
  ]),

  T("Computer fundamentals", (p) => `Which technology was used in ${p}?`, [
    ["first-generation computers", "Vacuum tubes"], ["second-generation computers", "Transistors"], ["third-generation computers", "Integrated circuits"],
    ["fourth-generation computers", "Microprocessors (VLSI)"],
  ], undefined, "EASY"),

  T("Computer fundamentals", (p) => `Which program ${p}?`, [
    ["translates the whole high-level program into machine code before execution", "Compiler"],
    ["translates and executes a high-level program one statement at a time", "Interpreter"],
    ["converts assembly language into machine code", "Assembler"], ["combines object files and libraries into one executable", "Linker"],
    ["places an executable program into main memory for execution", "Loader"],
  ]),
  T("Computer fundamentals", (p) => `Which term matches: ${p}?`, [
    ["software stored permanently in a device's ROM or flash memory", "Firmware"], ["the process of starting a computer and loading the operating system", "Booting"],
    ["software that lets the operating system control a hardware device", "Device driver"],
    ["software for maintenance tasks such as disk clean-up or backup", "Utility software"],
  ]),
  T("Computer fundamentals", (p) => `How many bits make ${p}?`, [
    ["a nibble", "4"], ["a byte", "8"], ["a word on a 32-bit processor", "32"], ["one octal digit", "3"], ["a word on a 64-bit processor", "64"],
  ]),

  T("Emerging technologies", (p) => `Which statement about ${p} is correct?`, [
    ["SaaS", "Users use ready software over the internet (e.g. web e-mail)"], ["IaaS", "The provider supplies virtual machines, storage and networks"],
    ["PaaS", "The provider supplies a platform to build and deploy applications"], ["the Turing test", "It checks whether a machine shows human-like intelligence"],
    ["supervised learning", "The model learns from labelled examples"], ["unsupervised learning", "The model finds patterns in unlabelled data"],
    ["blockchain", "It is a distributed, tamper-evident ledger"], ["IoT", "Everyday devices connect and exchange data over the internet"],
  ]),
];

/** All fact questions (forward, and reverse where defined) for a table. */
export function tableQuestions(r: Rng, table: Table): GenQuestion[] {
  const rows = table.rows.map(([p, a]) => ({ p, a }));
  const out: GenQuestion[] = [];
  for (const row of rows) {
    const fwd = factQuestion(r, rows, row, {
      key: (x) => `CF:${table.topic}:${table.q("").slice(0, 30)}:${x.p}`,
      subject: S,
      topic: table.topic,
      difficulty: table.difficulty,
      en: (x) => table.q(x.p),
      answer: (x) => x.a,
    });
    if (fwd) out.push(fwd);
    if (table.reverse) {
      const rev = factQuestion(
        r,
        rows.map((x) => ({ p: x.a, a: x.p })),
        { p: row.a, a: row.p },
        { key: (x) => `CR:${table.topic}:${x.p}`, subject: S, topic: table.topic, difficulty: table.difficulty, en: (x) => table.reverse!(x.p), answer: (x) => x.a },
      );
      // Reverse only when the answer is unique (e.g. two protocols can share nothing here).
      if (rev && rows.filter((x) => x.a === row.a).length === 1) out.push(rev);
    }
  }
  return out;
}

/** "Which of these is a stable sorting algorithm?" style set questions. */
function oneOfSet(r: Rng, key: string, topic: string, en: string, yes: string[], no: string[]): GenQuestion | null {
  return mcq(r, { key: `CS:${key}`, subject: S, topic, difficulty: "MEDIUM", en }, pick(r, yes), sample(r, no, 3));
}

export function setQuestions(r: Rng): GenQuestion[] {
  const out: (GenQuestion | null)[] = [];
  const stable = ["Merge sort", "Insertion sort", "Bubble sort", "Counting sort"];
  const unstable = ["Quick sort", "Heap sort", "Selection sort", "Shell sort"];
  for (const s of stable) out.push(mcq(r, { key: `CS:stable:${s}`, subject: S, topic: "Algorithms", difficulty: "MEDIUM", en: "Which of the following sorting algorithms is stable?" }, s, shuffle(r, unstable).slice(0, 3)));
  for (const s of unstable) out.push(mcq(r, { key: `CS:unstable:${s}`, subject: S, topic: "Algorithms", difficulty: "MEDIUM", en: "Which of the following sorting algorithms is NOT stable?" }, s, shuffle(r, stable).slice(0, 3)));
  const input = ["Keyboard", "Mouse", "Scanner", "Microphone", "Joystick", "Light pen", "Barcode reader", "Webcam"];
  const output = ["Monitor", "Printer", "Speaker", "Plotter", "Projector", "Headphones"];
  for (const d of input) out.push(oneOfSet(r, `in:${d}`, "Computer fundamentals", "Which of the following is an input device?", [d], output));
  for (const d of output) out.push(oneOfSet(r, `out:${d}`, "Computer fundamentals", "Which of the following is an output device?", [d], input));
  const volatile = ["SRAM", "DRAM", "Cache memory", "CPU registers"];
  const nonVolatile = ["ROM", "Flash memory", "Hard disk", "EEPROM", "SSD"];
  for (const d of nonVolatile) out.push(oneOfSet(r, `nv:${d}`, "Computer organisation", "Which of the following is non-volatile memory?", [d], volatile));
  const sys = ["Operating system", "Device driver", "Compiler", "Assembler", "Loader"];
  const app = ["Word processor", "Web browser", "Spreadsheet program", "Media player", "Photo editor"];
  for (const d of sys) out.push(oneOfSet(r, `sys:${d}`, "Computer fundamentals", "Which of the following is system software?", [d], app));
  const oss = ["Linux", "Windows", "macOS", "Android", "Unix"];
  const notOs = ["Oracle Database", "Microsoft Excel", "Google Chrome", "Python", "Photoshop"];
  for (const d of oss) out.push(oneOfSet(r, `os:${d}`, "Operating systems", "Which of the following is an operating system?", [d], notOs));
  const nonLinear = ["Tree", "Graph"];
  const linear = ["Array", "Stack", "Queue", "Linked list"];
  for (const d of nonLinear) out.push(oneOfSet(r, `nl:${d}`, "Data structures", "Which of the following is a non-linear data structure?", [d], linear));
  for (const d of linear) out.push(oneOfSet(r, `l:${d}`, "Data structures", "Which of the following is a linear data structure?", [d], ["Tree", "Graph", "Heap", "Trie"]));
  const guided = ["Twisted-pair cable", "Coaxial cable", "Optical fibre"];
  const unguided = ["Radio waves", "Microwaves", "Infrared"];
  for (const d of unguided) out.push(oneOfSet(r, `ug:${d}`, "Computer networks", "Which of the following is an unguided (wireless) transmission medium?", [d], guided));
  const deadlock = ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"];
  out.push(mcq(r, { key: "CS:deadlock-not", subject: S, topic: "Operating systems", difficulty: "MEDIUM", en: "Which of the following is NOT one of the four necessary conditions for deadlock?" }, "Preemption of resources", deadlock));
  return out.filter((x): x is GenQuestion => !!x);
}

export function allCsFactQuestions(r: Rng): GenQuestion[] {
  return [...CS_TABLES.flatMap((t) => tableQuestions(r, t)), ...setQuestions(r)];
}
