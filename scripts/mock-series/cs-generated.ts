/**
 * Computer Science & IT — computed questions (number systems, logic, data
 * structures, algorithms, networking, OS, programming output). The answer is
 * produced by running the same logic in TypeScript.
 */
import { fmt, int, mcq, nearNumbers, pick, sample, shuffle, type GenQuestion, type Rng } from "./core";

const S = "Computer Science and IT";

function b(key: string, topic: string, en: string, difficulty: GenQuestion["difficulty"] = "MEDIUM", hi?: string) {
  return { key: `C:${key}`, subject: S, topic, difficulty, en, hi };
}
function numQ(r: Rng, key: string, topic: string, en: string, answer: number, explanationEn?: string, step = 1, hi?: string) {
  return mcq(r, { ...b(key, topic, en, "MEDIUM", hi), explanationEn }, fmt(answer), nearNumbers(r, answer, { spread: 5, step }).map(fmt));
}

const bin = (n: number, w = 0) => n.toString(2).padStart(w, "0");

// --- Number systems -------------------------------------------------------------------
function decToBin(r: Rng) {
  const n = int(r, 10, 255);
  const ans = bin(n);
  const d = [bin(n + 1), bin(n - 1), bin(n ^ 4), bin(n ^ 16), ans.split("").reverse().join("")];
  return mcq(r, b(`d2b:${n}`, "Number systems", `What is the binary equivalent of decimal ${n}?`, "EASY", `दशमलव ${n} का द्विआधारी (बाइनरी) तुल्य क्या है?`), ans, d);
}

function binToDec(r: Rng) {
  const n = int(r, 10, 255);
  return numQ(r, `b2d:${n}`, "Number systems", `What is the decimal value of the binary number ${bin(n)}?`, n, undefined, 1, `द्विआधारी संख्या ${bin(n)} का दशमलव मान क्या है?`);
}

function decToHex(r: Rng) {
  const n = int(r, 100, 4000);
  const h = (x: number) => x.toString(16).toUpperCase();
  return mcq(r, b(`d2h:${n}`, "Number systems", `What is the hexadecimal equivalent of decimal ${n}?`, "MEDIUM", `दशमलव ${n} का षोडशआधारी (हेक्साडेसिमल) तुल्य क्या है?`), h(n), [h(n + 1), h(n - 16), h(n + 256), h(n - 1), n.toString(8)]);
}

function hexToDec(r: Rng) {
  const n = int(r, 100, 4000);
  return numQ(r, `h2d:${n}`, "Number systems", `What is the decimal value of the hexadecimal number ${n.toString(16).toUpperCase()}?`, n, undefined, 1, `हेक्साडेसिमल संख्या ${n.toString(16).toUpperCase()} का दशमलव मान क्या है?`);
}

function octToBin(r: Rng) {
  const n = int(r, 8, 511);
  const ans = bin(n);
  return mcq(r, b(`o2b:${n}`, "Number systems", `What is the binary equivalent of the octal number ${n.toString(8)}?`), ans, [bin(n + 1), bin(n ^ 2), bin(n ^ 8), bin(n - 1)]);
}

function twosComplement(r: Rng) {
  const n = int(r, 1, 127);
  const ans = bin((256 - n) & 255, 8);
  const ones = bin(~n & 255, 8);
  return mcq(r, { ...b(`tc:${n}`, "Number systems", `What is the 8-bit 2's complement representation of −${n}?`, "HARD"), explanationEn: `Invert ${bin(n, 8)} → ${ones}, then add 1.` }, ans, [ones, bin(n, 8), bin(((256 - n) & 255) ^ 1, 8), bin((n | 128) & 255, 8)]);
}

function binaryAdd(r: Rng) {
  const x = int(r, 5, 120), y = int(r, 5, 120);
  return mcq(r, b(`ba:${x}:${y}`, "Number systems", `Add the binary numbers ${bin(x)} and ${bin(y)}.`, "EASY"), bin(x + y), [bin(x + y + 1), bin(x + y - 1), bin(x ^ y), bin((x + y) ^ 2)]);
}

function bitsNeeded(r: Rng) {
  const n = int(r, 5, 2000);
  const ans = Math.ceil(Math.log2(n));
  return numQ(r, `bn:${n}`, "Number systems", `What is the minimum number of bits needed to represent ${n} distinct values?`, ans);
}

function grayCode(r: Rng) {
  const n = int(r, 5, 63);
  const g = n ^ (n >> 1);
  return mcq(r, b(`gc:${n}`, "Digital electronics", `What is the Gray code of the binary number ${bin(n)}?`, "HARD"), bin(g, bin(n).length), [bin(n, bin(n).length), bin(g ^ 1, bin(n).length), bin((n << 1) & ((1 << bin(n).length) - 1), bin(n).length), bin(~g & ((1 << bin(n).length) - 1), bin(n).length)]);
}

function hammingDistance(r: Rng) {
  const len = int(r, 6, 10);
  const x = int(r, 0, 2 ** len - 1), y = int(r, 0, 2 ** len - 1);
  const ans = bin(x ^ y).split("").filter((c) => c === "1").length;
  return numQ(r, `hd:${x}:${y}:${len}`, "Computer networks", `What is the Hamming distance between ${bin(x, len)} and ${bin(y, len)}?`, ans);
}

function asciiCode(r: Rng) {
  const upper = r() < 0.5;
  const i = int(r, 0, 25);
  const ch = String.fromCharCode((upper ? 65 : 97) + i);
  return numQ(r, `asc:${ch}`, "Number systems", `What is the ASCII code (decimal) of the character '${ch}'?`, ch.charCodeAt(0));
}

// --- Logic ------------------------------------------------------------------------------
const GATES: [string, (a: number, b: number) => number][] = [
  ["AND", (a, c) => a & c],
  ["OR", (a, c) => a | c],
  ["NAND", (a, c) => 1 - (a & c)],
  ["NOR", (a, c) => 1 - (a | c)],
  ["XOR", (a, c) => a ^ c],
  ["XNOR", (a, c) => 1 - (a ^ c)],
];

/** "an AND / OR / XOR / XNOR gate" (vowel sounds), "a NAND / NOR gate". */
const art = (g: string) => (/^[AOX]/.test(g) ? "an" : "a");

function gateCombo(r: Rng) {
  const [g1, f1] = pick(r, GATES), [g2, f2] = pick(r, GATES);
  const A = int(r, 0, 1), B = int(r, 0, 1), C = int(r, 0, 1);
  const out = f2(f1(A, B), C);
  return mcq(
    r,
    b(`gate:${g1}:${g2}:${A}${B}${C}`, "Digital electronics", `Inputs A = ${A} and B = ${B} are fed to ${art(g1)} ${g1} gate. Its output and C = ${C} are fed to ${art(g2)} ${g2} gate. What is the final output?`),
    String(out),
    [String(1 - out), "Undefined", "High impedance"],
  );
}

function booleanEval(r: Rng) {
  const A = int(r, 0, 1), B = int(r, 0, 1), C = int(r, 0, 1);
  const exprs: [string, number][] = [
    ["A·B + C", (A & B) | C],
    ["A + B·C", A | (B & C)],
    ["(A + B)·C'", (A | B) & (1 - C)],
    ["A'·B + A·C", ((1 - A) & B) | (A & C)],
    ["(A ⊕ B)·C", (A ^ B) & C],
    ["(A·B)' + C", (1 - (A & B)) | C],
  ];
  const [e, v] = pick(r, exprs);
  return mcq(r, b(`bool:${e}:${A}${B}${C}`, "Digital electronics", `Evaluate the Boolean expression ${e} for A = ${A}, B = ${B}, C = ${C}. (X' denotes NOT X)`), String(v), [String(1 - v), "2", "Cannot be determined"]);
}

function truthTableRows(r: Rng) {
  const n = int(r, 2, 8);
  return numQ(r, `tt:${n}`, "Digital electronics", `How many rows does the truth table of a Boolean function of ${n} variables have?`, 2 ** n, undefined, 2);
}

// --- Data structures and algorithms -----------------------------------------------------
function stackOps(r: Rng) {
  const ops: string[] = [];
  const st: number[] = [];
  const popped: number[] = [];
  let v = int(r, 1, 9);
  for (let i = 0; i < 8; i++) {
    if (st.length && r() < 0.4) {
      ops.push("POP");
      popped.push(st.pop()!);
    } else {
      ops.push(`PUSH(${v})`);
      st.push(v);
      v += int(r, 1, 4);
    }
  }
  if (!st.length) return null;
  const ans = String(st[st.length - 1]);
  const d = [...new Set([...st, ...popped].map(String))].filter((x) => x !== ans);
  return mcq(r, b(`stk:${ops.join(",")}`, "Data structures", `On an empty stack the following operations are performed: ${ops.join(", ")}. What is the element at the top of the stack?`), ans, shuffle(r, d).concat(["Stack is empty"]));
}

function queueOps(r: Rng) {
  const ops: string[] = [];
  const qu: number[] = [];
  let v = int(r, 1, 9);
  for (let i = 0; i < 8; i++) {
    if (qu.length > 1 && r() < 0.35) {
      ops.push("DEQUEUE");
      qu.shift();
    } else {
      ops.push(`ENQUEUE(${v})`);
      qu.push(v);
      v += int(r, 1, 4);
    }
  }
  const ans = String(qu[0]);
  return mcq(r, b(`que:${ops.join(",")}`, "Data structures", `On an empty queue the following operations are performed: ${ops.join(", ")}. Which element is at the front of the queue?`), ans, shuffle(r, qu.slice(1).map(String)).concat([String(qu[qu.length - 1]! + 1), String(Number(ans) - 1), "Queue is empty"]));
}

function postfixEval(r: Rng) {
  const a = int(r, 2, 9), c = int(r, 2, 9), d = int(r, 1, 9), e = int(r, 2, 5);
  const forms: [string, number][] = [
    [`${a} ${c} + ${d} *`, (a + c) * d],
    [`${a} ${c} ${d} * +`, a + c * d],
    [`${a} ${c} * ${d} -`, a * c - d],
    [`${a} ${c} + ${d} ${e} * -`, a + c - d * e],
    [`${a} ${c} ${d} + *`, a * (c + d)],
  ];
  const [expr, v] = pick(r, forms);
  return numQ(r, `pf:${expr}`, "Data structures", `Evaluate the postfix expression: ${expr}`, v);
}

function infixToPostfix(r: Rng) {
  const forms: [string, string, string[]][] = [
    ["A + B * C", "A B C * +", ["A B + C *", "A B * C +", "+ A * B C"]],
    ["(A + B) * C", "A B + C *", ["A B C + *", "A B C * +", "* + A B C"]],
    ["A * B + C * D", "A B * C D * +", ["A B C D * + *", "A B * C + D *", "* A B * C D +"]],
    ["(A + B) * (C − D)", "A B + C D − *", ["A B C D + − *", "A B + C − D *", "* + A B − C D"]],
    ["A + B − C", "A B + C −", ["A B C − +", "A + B C −", "− + A B C"]],
    ["A * (B + C) / D", "A B C + * D /", ["A B C D + * /", "A B * C + D /", "/ * A + B C D"]],
    ["A − B / C", "A B C / −", ["A B − C /", "A B / C −", "− A / B C"]],
    ["(A − B) / (C + D)", "A B − C D + /", ["A B C D − + /", "A − B C D + /", "/ − A B + C D"]],
  ];
  const i = int(r, 0, forms.length - 1);
  const [inf, ans, wrong] = forms[i]!;
  return mcq(r, b(`i2p:${i}`, "Data structures", `What is the postfix form of the infix expression ${inf}?`), ans, wrong);
}

type Node = { v: number; l?: Node; rt?: Node };
function insert(n: Node | undefined, v: number): Node {
  if (!n) return { v };
  if (v < n.v) n.l = insert(n.l, v);
  else n.rt = insert(n.rt, v);
  return n;
}
const inorder = (n?: Node): number[] => (n ? [...inorder(n.l), n.v, ...inorder(n.rt)] : []);
const preorder = (n?: Node): number[] => (n ? [n.v, ...preorder(n.l), ...preorder(n.rt)] : []);
const postorder = (n?: Node): number[] => (n ? [...postorder(n.l), ...postorder(n.rt), n.v] : []);

function bstTraversal(r: Rng) {
  const keys = sample(r, Array.from({ length: 60 }, (_, i) => i + 5), 6);
  let root: Node | undefined;
  for (const k of keys) root = insert(root, k);
  const kind = pick(r, ["preorder", "postorder"] as const);
  const ans = (kind === "preorder" ? preorder(root) : postorder(root)).join(", ");
  const d = [inorder(root).join(", "), (kind === "preorder" ? postorder(root) : preorder(root)).join(", "), keys.join(", "), [...keys].reverse().join(", ")];
  return mcq(r, b(`bst:${keys.join(",")}:${kind}`, "Data structures", `The keys ${keys.join(", ")} are inserted in this order into an empty binary search tree. What is its ${kind} traversal?`, "HARD"), ans, d);
}

function bubblePass(r: Rng) {
  const a = sample(r, Array.from({ length: 50 }, (_, i) => i + 1), 6);
  const x = [...a];
  for (let i = 0; i < x.length - 1; i++) if (x[i]! > x[i + 1]!) [x[i], x[i + 1]] = [x[i + 1]!, x[i]!];
  const sorted = [...a].sort((p, q) => p - q);
  return mcq(r, b(`bub:${a.join(",")}`, "Algorithms", `What is the array after the first pass of bubble sort (ascending) on [${a.join(", ")}]?`, "HARD"), `[${x.join(", ")}]`, [`[${sorted.join(", ")}]`, `[${a.join(", ")}]`, `[${[...x].reverse().join(", ")}]`, `[${[a[1], a[0], ...a.slice(2)].join(", ")}]`]);
}

function binarySearchComparisons(r: Rng) {
  const n = int(r, 7, 15);
  const arr = Array.from({ length: n }, (_, i) => (i + 1) * 5);
  const target = pick(r, arr);
  let lo = 0, hi = n - 1, c = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    c++;
    if (arr[mid] === target) break;
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return numQ(r, `bs:${n}:${target}`, "Algorithms", `Binary search (mid = ⌊(low + high)/2⌋, 0-based index) is used to find ${target} in the sorted array [${arr.join(", ")}]. How many elements are compared with ${target}?`, c);
}

function linearProbing(r: Rng) {
  const m = pick(r, [7, 10, 11, 13]);
  const keys = sample(r, Array.from({ length: 90 }, (_, i) => i + 10), 5);
  const table: (number | null)[] = Array(m).fill(null);
  let lastSlot = 0;
  for (const k of keys) {
    let s = k % m;
    while (table[s] !== null) s = (s + 1) % m;
    table[s] = k;
    lastSlot = s;
  }
  const last = keys[keys.length - 1]!;
  return numQ(r, `lp:${m}:${keys.join(",")}`, "Data structures", `Keys ${keys.join(", ")} are inserted in this order into an empty hash table of size ${m} using h(k) = k mod ${m} and linear probing. At which index is ${last} stored?`, lastSlot);
}

function completeGraphEdges(r: Rng) {
  const n = int(r, 4, 30);
  return numQ(r, `kn:${n}`, "Graph theory", `How many edges does a complete undirected graph with ${n} vertices have?`, (n * (n - 1)) / 2, `n(n − 1)/2.`);
}

function treeEdges(r: Rng) {
  const n = int(r, 5, 200);
  return numQ(r, `te:${n}`, "Graph theory", `A tree has ${n} vertices. How many edges does it have?`, n - 1);
}

function binaryTreeMaxNodes(r: Rng) {
  const h = int(r, 2, 10);
  return numQ(r, `btn:${h}`, "Data structures", `What is the maximum number of nodes in a binary tree with ${h} levels (root at level 1)?`, 2 ** h - 1, `2^${h} − 1.`, 2);
}

function arrayAddress(r: Rng) {
  const base = int(r, 10, 99) * 100, w = pick(r, [2, 4, 8]), i = int(r, 3, 40);
  return numQ(r, `aa:${base}:${w}:${i}`, "Data structures", `A 1-D array A starts at address ${base} and each element takes ${w} bytes. What is the address of A[${i}] (index starts at 0)?`, base + w * i, `Base + i × w.`, w);
}

// --- Networking ---------------------------------------------------------------------------
function subnetHosts(r: Rng) {
  const p = int(r, 20, 30);
  return numQ(r, `sh:${p}`, "Computer networks", `How many usable host addresses are there in an IPv4 subnet with prefix /${p}?`, 2 ** (32 - p) - 2, `2^(32 − ${p}) − 2.`, 2);
}

function networkAddress(r: Rng) {
  const o = [int(r, 10, 223), int(r, 0, 255), int(r, 0, 255), int(r, 1, 254)];
  const p = pick(r, [24, 25, 26, 27, 28]);
  const ip = (o[0]! << 24) + (o[1]! << 16) + (o[2]! << 8) + o[3]!;
  const mask = (0xffffffff << (32 - p)) >>> 0;
  const net = (ip & mask) >>> 0;
  const s = (x: number) => [x >>> 24, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join(".");
  const bcast = (net | (~mask >>> 0)) >>> 0;
  return mcq(r, b(`na:${o.join(".")}:${p}`, "Computer networks", `What is the network address of the host ${o.join(".")}/${p}?`, "HARD"), s(net), [s(bcast), o.join("."), s(net + 1), s((net + 2 ** (32 - p)) >>> 0)]);
}

function ipClass(r: Rng) {
  const first = int(r, 1, 239);
  if (first === 127) return null;
  const cls = first < 128 ? "A" : first < 192 ? "B" : first < 224 ? "C" : "D";
  const ip = `${first}.${int(r, 0, 255)}.${int(r, 0, 255)}.${int(r, 1, 254)}`;
  return mcq(r, b(`ipc:${ip}`, "Computer networks", `In classful addressing, to which class does the IPv4 address ${ip} belong?`, "EASY"), `Class ${cls}`, ["A", "B", "C", "D", "E"].filter((x) => x !== cls).map((x) => `Class ${x}`));
}

function transmissionTime(r: Rng) {
  const kb = pick(r, [100, 200, 250, 500, 1000]), mbps = pick(r, [1, 2, 4, 5, 8, 10]);
  const ms = (kb * 1000 * 8) / (mbps * 1e6) * 1000;
  return mcq(r, b(`tx:${kb}:${mbps}`, "Computer networks", `How long does it take to transmit a ${kb} KB file (1 KB = 1000 bytes) over a ${mbps} Mbps link (ignore propagation delay)?`), `${fmt(ms)} ms`, nearNumbers(r, ms, { spread: 5, step: Math.max(1, Math.round(ms / 8)) }).map((x) => `${fmt(x)} ms`));
}

// --- OS and architecture -------------------------------------------------------------------
function fcfsWaiting(r: Rng) {
  const bursts = Array.from({ length: int(r, 3, 4) }, () => int(r, 2, 12));
  let t = 0, total = 0;
  for (const x of bursts) {
    total += t;
    t += x;
  }
  const avg = total / bursts.length;
  return mcq(r, { ...b(`fcfs:${bursts.join(",")}`, "Operating systems", `Processes P1…P${bursts.length} arrive at time 0 in that order with burst times ${bursts.join(", ")} ms. What is the average waiting time under FCFS scheduling?`, "HARD"), explanationEn: `Waiting times are the cumulative bursts before each process.` }, `${fmt(avg)} ms`, nearNumbers(r, avg, { spread: 4, step: 1 }).map((x) => `${fmt(x)} ms`));
}

function sjfWaiting(r: Rng) {
  const bursts = sample(r, Array.from({ length: 14 }, (_, i) => i + 2), int(r, 3, 4));
  const sorted = [...bursts].sort((p, q) => p - q);
  let t = 0, total = 0;
  for (const x of sorted) {
    total += t;
    t += x;
  }
  const avg = total / bursts.length;
  return mcq(r, b(`sjf:${bursts.join(",")}`, "Operating systems", `Processes with burst times ${bursts.join(", ")} ms all arrive at time 0. What is the average waiting time under non-preemptive SJF scheduling?`, "HARD"), `${fmt(avg)} ms`, nearNumbers(r, avg, { spread: 4, step: 1 }).map((x) => `${fmt(x)} ms`));
}

function addressLines(r: Rng) {
  const k = int(r, 10, 32);
  const units: [number, string][] = [[0, "bytes"], [10, "KB"], [20, "MB"], [30, "GB"]];
  const [shift, unit] = [...units].reverse().find(([s]) => k >= s)!;
  const size = 2 ** (k - shift);
  return mcq(r, b(`al:${k}`, "Computer organisation", `A byte-addressable memory has ${k} address lines. What is its maximum size?`), `${size} ${unit}`, [`${size * 2} ${unit}`, `${size / 2} ${unit}`, `${k} ${unit}`, `${size} ${unit === "bytes" ? "KB" : unit === "KB" ? "MB" : "GB"}`]);
}

function pagesCount(r: Rng) {
  const la = pick(r, [16, 20, 24, 32]), ps = pick(r, [10, 11, 12, 13]);
  return mcq(r, b(`pg:${la}:${ps}`, "Operating systems", `A system has a ${la}-bit logical address and a page size of ${2 ** ps / 1024} KB. How many pages are there in the logical address space?`, "HARD"), `2^${la - ps}`, [`2^${la}`, `2^${ps}`, `2^${la - ps + 1}`, `2^${la - ps - 1}`]);
}

function memoryUnits(r: Rng) {
  const pairs: [string, string, number][] = [
    ["KB", "bytes", 1024], ["MB", "KB", 1024], ["GB", "MB", 1024], ["TB", "GB", 1024], ["byte", "bits", 8], ["nibble", "bits", 4],
  ];
  const [a, c, v] = pick(r, pairs);
  const n = int(r, 1, 16);
  return numQ(r, `mu:${a}:${n}`, "Computer fundamentals", `How many ${c} are there in ${n} ${a}? (binary units)`, n * v, undefined, v);
}

// --- Programming output -----------------------------------------------------------------------
function cLoopSum(r: Rng) {
  const n = int(r, 4, 15), step = pick(r, [1, 2, 3]);
  let s = 0;
  for (let i = 1; i <= n; i += step) s += i;
  return numQ(r, `cls:${n}:${step}`, "Programming in C", `What is printed?\n\nint s = 0;\nfor (int i = 1; i <= ${n}; i += ${step}) s += i;\nprintf("%d", s);`, s);
}

function cIntDivMod(r: Rng) {
  const a = int(r, 10, 99), c = int(r, 2, 9);
  const ops: [string, number][] = [
    [`${a} / ${c}`, Math.trunc(a / c)],
    [`${a} % ${c}`, a % c],
    [`${a} / ${c} * ${c}`, Math.trunc(a / c) * c],
    [`${a} % ${c} + ${a} / ${c}`, (a % c) + Math.trunc(a / c)],
  ];
  const [e, v] = pick(r, ops);
  return numQ(r, `cdm:${e}`, "Programming in C", `In C, what is the value of the int expression ${e}?`, v);
}

function cBitwise(r: Rng) {
  const a = int(r, 3, 60), c = int(r, 3, 60), k = int(r, 1, 3);
  const ops: [string, number][] = [
    [`${a} & ${c}`, a & c],
    [`${a} | ${c}`, a | c],
    [`${a} ^ ${c}`, a ^ c],
    [`${a} << ${k}`, a << k],
    [`${a} >> ${k}`, a >> k],
  ];
  const [e, v] = pick(r, ops);
  return numQ(r, `cbw:${e}`, "Programming in C", `What is the value of the C expression ${e}?`, v);
}

function cWhileCount(r: Rng) {
  const n = int(r, 20, 500), d = pick(r, [2, 3, 10]);
  let x = n, c = 0;
  while (x > 0) {
    x = Math.trunc(x / d);
    c++;
  }
  return numQ(r, `cwc:${n}:${d}`, "Programming in C", `What is printed?\n\nint x = ${n}, c = 0;\nwhile (x > 0) { x = x / ${d}; c++; }\nprintf("%d", c);`, c);
}

function pySlice(r: Rng) {
  const words = ["PROGRAM", "COMPUTER", "NETWORK", "DATABASE", "KEYBOARD", "SOFTWARE", "INTERNET", "ALGORITHM"];
  const w = pick(r, words);
  const forms: [string, string][] = [
    [`s[1:4]`, w.slice(1, 4)],
    [`s[-3:]`, w.slice(-3)],
    [`s[:3]`, w.slice(0, 3)],
    [`s[::2]`, w.split("").filter((_, i) => i % 2 === 0).join("")],
    [`s[::-1][:3]`, w.split("").reverse().join("").slice(0, 3)],
    [`s[2:-2]`, w.slice(2, -2)],
  ];
  const [e, v] = pick(r, forms);
  const others = forms.map(([, x]) => x).filter((x) => x !== v);
  return mcq(r, b(`pys:${w}:${e}`, "Programming in Python", `In Python, if s = "${w}", what is ${e}?`), v, shuffle(r, others).concat([w.slice(0, 2), w.slice(-2)]));
}

function pyOps(r: Rng) {
  const a = int(r, 7, 60), c = int(r, 2, 9);
  const ops: [string, string][] = [
    [`${a} // ${c}`, String(Math.floor(a / c))],
    [`${a} % ${c}`, String(a % c)],
    [`${c} ** 3`, String(c ** 3)],
    [`len(range(0, ${a}, ${c}))`, String(Math.ceil(a / c))],
    [`sum(range(1, ${c + 1}))`, String((c * (c + 1)) / 2)],
  ];
  const [e, v] = pick(r, ops);
  return mcq(r, b(`pyo:${e}`, "Programming in Python", `What does the Python expression ${e} evaluate to?`), v, nearNumbers(r, Number(v), { spread: 4 }).map(fmt));
}

function pyList(r: Rng) {
  const xs = sample(r, Array.from({ length: 30 }, (_, i) => i + 1), 5);
  const forms: [string, string][] = [
    ["len(a)", String(xs.length)],
    ["a[2]", String(xs[2])],
    ["a[-1]", String(xs[4])],
    ["max(a) - min(a)", String(Math.max(...xs) - Math.min(...xs))],
    ["sorted(a)[1]", String([...xs].sort((p, q) => p - q)[1])],
    ["sum(a)", String(xs.reduce((p, q) => p + q, 0))],
  ];
  const [e, v] = pick(r, forms);
  return mcq(r, b(`pyl:${xs.join(",")}:${e}`, "Programming in Python", `If a = [${xs.join(", ")}], what is ${e} in Python?`), v, shuffle(r, xs.map(String)).concat(nearNumbers(r, Number(v), { spread: 3 }).map(fmt)));
}

export const CS_GENERATORS: ((r: Rng) => GenQuestion | null)[] = [
  decToBin, binToDec, decToHex, hexToDec, octToBin, twosComplement, binaryAdd, bitsNeeded, grayCode, hammingDistance, asciiCode,
  gateCombo, booleanEval, truthTableRows,
  stackOps, queueOps, postfixEval, infixToPostfix, bstTraversal, bubblePass, binarySearchComparisons, linearProbing,
  completeGraphEdges, treeEdges, binaryTreeMaxNodes, arrayAddress,
  subnetHosts, networkAddress, ipClass, transmissionTime,
  fcfsWaiting, sjfWaiting, addressLines, pagesCount, memoryUnits,
  cLoopSum, cIntDivMod, cBitwise, cWhileCount, pySlice, pyOps, pyList,
];
