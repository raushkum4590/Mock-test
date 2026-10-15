/** General Intelligence & Reasoning — every answer is computed. */
import { fmt, int, mcq, nearNumbers, ordinal, pick, shuffle, type GenQuestion, type Rng } from "./core";

const S = "General Intelligence and Reasoning";
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const L = (i: number) => ALPHA[((i % 26) + 26) % 26]!;
const pos = (c: string) => ALPHA.indexOf(c) + 1;

const NAMES: [string, string][] = [
  ["Amit", "अमित"], ["Priya", "प्रिया"], ["Rahul", "राहुल"], ["Sneha", "स्नेहा"], ["Vikas", "विकास"], ["Neha", "नेहा"],
  ["Arjun", "अर्जुन"], ["Kavya", "काव्या"], ["Rohan", "रोहन"], ["Pooja", "पूजा"], ["Suresh", "सुरेश"], ["Anita", "अनीता"],
  ["Manoj", "मनोज"], ["Ritu", "रितु"], ["Deepak", "दीपक"], ["Meena", "मीना"], ["Karan", "करण"], ["Sunita", "सुनीता"],
];

const WORDS = [
  "CAT", "DOG", "SUN", "PEN", "BOOK", "TREE", "FISH", "BIRD", "LAMP", "DESK", "MILK", "RAIN", "STAR", "ROAD", "GOLD", "WIND",
  "PLANT", "HOUSE", "WATER", "LIGHT", "CHAIR", "TABLE", "RIVER", "STONE", "CLOUD", "MOUSE", "GRAPE", "BRICK", "SMART", "TRAIN",
];

function base(key: string, topic: string, en: string, hi: string, difficulty: GenQuestion["difficulty"] = "MEDIUM") {
  return { key: `R:${key}`, subject: S, topic, difficulty, en, hi };
}

function numberQ(r: Rng, key: string, topic: string, en: string, hi: string, answer: number, explanationEn?: string, step = 1) {
  const d = nearNumbers(r, answer, { spread: 6, step }).map(fmt);
  const q = mcq(r, { ...base(key, topic, en, hi), explanationEn }, fmt(answer), d);
  return q;
}

// --- Series ---------------------------------------------------------------------------
function arithmeticSeries(r: Rng) {
  const a = int(r, 2, 60), d = int(r, 3, 17), n = 5;
  const terms = Array.from({ length: n }, (_, i) => a + i * d);
  const ans = a + n * d;
  return numberQ(r, `as:${a}:${d}`, "Number series", `Find the next number in the series: ${terms.join(", ")}, ?`, `श्रृंखला में अगली संख्या ज्ञात कीजिए: ${terms.join(", ")}, ?`, ans, `Each term increases by ${d}.`);
}

function geometricSeries(r: Rng) {
  const a = int(r, 1, 9), k = int(r, 2, 4), n = 5;
  const terms = Array.from({ length: n }, (_, i) => a * k ** i);
  const ans = a * k ** n;
  return numberQ(r, `gs:${a}:${k}`, "Number series", `Find the next number in the series: ${terms.join(", ")}, ?`, `श्रृंखला में अगली संख्या ज्ञात कीजिए: ${terms.join(", ")}, ?`, ans, `Each term is multiplied by ${k}.`, a * k);
}

function squareSeries(r: Rng) {
  const s = int(r, 1, 12), c = int(r, -3, 5), cube = r() < 0.35;
  const f = (n: number) => (cube ? n ** 3 : n ** 2) + c;
  const terms = Array.from({ length: 5 }, (_, i) => f(s + i));
  const ans = f(s + 5);
  const rule = `${cube ? "n³" : "n²"}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`;
  return numberQ(r, `sq:${s}:${c}:${cube}`, "Number series", `Find the next number in the series: ${terms.join(", ")}, ?`, `श्रृंखला में अगली संख्या ज्ञात कीजिए: ${terms.join(", ")}, ?`, ans, `Pattern: ${rule} for consecutive n.`);
}

function secondOrderSeries(r: Rng) {
  const a = int(r, 2, 30), d0 = int(r, 1, 6), dd = int(r, 1, 4);
  const terms = [a];
  let d = d0;
  for (let i = 0; i < 5; i++) {
    terms.push(terms[i]! + d);
    d += dd;
  }
  const ans = terms[5]!;
  const shown = terms.slice(0, 5);
  return numberQ(r, `so:${a}:${d0}:${dd}`, "Number series", `Find the next number in the series: ${shown.join(", ")}, ?`, `श्रृंखला में अगली संख्या ज्ञात कीजिए: ${shown.join(", ")}, ?`, ans, `Differences increase by ${dd}.`);
}

function letterSeries(r: Rng) {
  const k = int(r, 2, 4), s = int(r, 0, 25 - 5 * k); // no wrap past Z
  const terms = Array.from({ length: 5 }, (_, i) => L(s + i * k));
  const ans = L(s + 5 * k);
  const others = shuffle(r, ALPHA.split("").filter((c) => c !== ans)).slice(0, 6);
  return mcq(r, base(`ls:${s}:${k}`, "Letter series", `Find the next letter: ${terms.join(", ")}, ?`, `अगला अक्षर ज्ञात कीजिए: ${terms.join(", ")}, ?`), ans, others);
}

function pairLetterSeries(r: Rng) {
  const s = int(r, 0, 12), k = int(r, 2, 3);
  const term = (i: number) => `${L(s + i * k)}${L(25 - s - i * k)}`;
  const terms = Array.from({ length: 4 }, (_, i) => term(i));
  const ans = term(4);
  const d = [`${L(s + 4 * k + 1)}${L(25 - s - 4 * k)}`, `${L(s + 4 * k)}${L(24 - s - 4 * k)}`, `${L(s + 4 * k - 1)}${L(26 - s - 4 * k)}`, `${L(25 - s - 4 * k)}${L(s + 4 * k)}`];
  return mcq(r, base(`pls:${s}:${k}`, "Letter series", `Find the next term: ${terms.join(", ")}, ?`, `अगला पद ज्ञात कीजिए: ${terms.join(", ")}, ?`, "HARD"), ans, d);
}

// --- Coding-decoding ------------------------------------------------------------------
const shift = (w: string, k: number) => w.split("").map((c) => L(pos(c) - 1 + k)).join("");

function codingShift(r: Rng) {
  const [w1, w2] = shuffle(r, WORDS).filter((x, i, a) => a.indexOf(x) === i);
  const k = pick(r, [1, 2, 3, -1, -2]);
  const ans = shift(w2!, k);
  const d = [shift(w2!, k + 1), shift(w2!, k - 1), shift(w2!, -k), w2!.split("").reverse().join("")];
  return mcq(r, base(`cs:${w1}:${w2}:${k}`, "Coding-decoding", `If ${w1} is coded as ${shift(w1!, k)}, how is ${w2} coded in that language?`, `यदि किसी कूट भाषा में ${w1} को ${shift(w1!, k)} लिखा जाता है, तो उसी भाषा में ${w2} को कैसे लिखा जाएगा?`), ans, d);
}

function codingReverse(r: Rng) {
  const [w1, w2] = shuffle(r, WORDS);
  const k = pick(r, [0, 1, 2]);
  const enc = (w: string) => shift(w.split("").reverse().join(""), k);
  const ans = enc(w2!);
  const d = [shift(w2!, k), enc(w2!).split("").reverse().join(""), shift(w2!.split("").reverse().join(""), k + 1), shift(w2!, k + 1)];
  return mcq(r, base(`cr:${w1}:${w2}:${k}`, "Coding-decoding", `If ${w1} is written as ${enc(w1!)}, how will ${w2} be written in that code?`, `यदि किसी कूट में ${w1} को ${enc(w1!)} लिखा जाता है, तो ${w2} को कैसे लिखा जाएगा?`, "HARD"), ans, d);
}

function letterSum(r: Rng) {
  const [w1, w2] = shuffle(r, WORDS);
  const sum = (w: string) => w.split("").reduce((s, c) => s + pos(c), 0);
  return numberQ(
    r,
    `lsum:${w1}:${w2}`,
    "Coding-decoding",
    `If A = 1, B = 2, …, Z = 26 and ${w1} = ${sum(w1!)}, then ${w2} = ?`,
    `यदि A = 1, B = 2, …, Z = 26 तथा ${w1} = ${sum(w1!)} है, तो ${w2} = ?`,
    sum(w2!),
    `Add the alphabet positions of the letters of ${w2}.`,
  );
}

// --- Alphabet ---------------------------------------------------------------------------
function alphabetPosition(r: Rng) {
  const a = int(r, 3, 22), b = int(r, 2, 9), right = r() < 0.5;
  const fromLeft = right ? a + b : a - b;
  if (fromLeft < 1 || fromLeft > 26) return null;
  const ans = L(fromLeft - 1);
  const d = [L(fromLeft), L(fromLeft - 2), L(26 - fromLeft), L(right ? a - b - 1 : a + b - 1)];
  return mcq(
    r,
    base(`ap:${a}:${b}:${right}`, "Alphabet test", `In the English alphabet, which letter is ${ordinal(b)} to the ${right ? "right" : "left"} of the ${ordinal(a)} letter from the left?`, `अंग्रेज़ी वर्णमाला में बाएँ से ${a}वें अक्षर के ${right ? "दाएँ" : "बाएँ"} ${b}वाँ अक्षर कौन-सा है?`),
    ans,
    d,
  );
}

function dictionaryOrder(r: Rng) {
  const ws = shuffle(r, ["MANGO", "MARKET", "MATCH", "MASTER", "MAGIC", "MAJOR", "MAPLE", "MARBLE", "MATTER", "MALL", "MACHINE", "MARCH"]).slice(0, 4);
  const sorted = [...ws].sort();
  const k = int(r, 1, 4);
  const ans = sorted[k - 1]!;
  const ord = ["first", "second", "third", "fourth"][k - 1]!;
  const ordHi = ["पहले", "दूसरे", "तीसरे", "चौथे"][k - 1]!;
  return mcq(
    r,
    base(`do:${ws.join(",")}:${k}`, "Dictionary order", `If the words ${ws.join(", ")} are arranged in dictionary order, which word comes ${ord}?`, `यदि शब्द ${ws.join(", ")} को शब्दकोश क्रम में व्यवस्थित किया जाए, तो ${ordHi} स्थान पर कौन-सा शब्द आएगा?`),
    ans,
    ws.filter((w) => w !== ans),
  );
}

// --- Odd one out / analogy -------------------------------------------------------------
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

function oddPrime(r: Rng) {
  const primes = shuffle(r, Array.from({ length: 90 }, (_, i) => i + 11).filter(isPrime)).slice(0, 3);
  let odd = int(r, 15, 99);
  while (isPrime(odd) || odd % 2 === 0 || odd % 5 === 0) odd = int(r, 15, 99);
  return mcq(r, base(`op:${[...primes].sort().join(",")}:${odd}`, "Odd one out", `Find the odd one out: ${shuffle(r, [...primes, odd]).join(", ")}`, `विषम संख्या ज्ञात कीजिए: ${shuffle(r, [...primes, odd]).join(", ")}`), String(odd), primes.map(String));
}

function oddSquare(r: Rng) {
  const sq = shuffle(r, Array.from({ length: 25 }, (_, i) => (i + 4) ** 2)).slice(0, 3);
  let odd = int(r, 20, 700);
  while (Number.isInteger(Math.sqrt(odd))) odd++;
  const shown = shuffle(r, [...sq, odd]);
  return mcq(r, base(`osq:${[...sq].sort().join(",")}:${odd}`, "Odd one out", `Find the odd one out: ${shown.join(", ")}`, `विषम संख्या ज्ञात कीजिए: ${shown.join(", ")}`), String(odd), sq.map(String));
}

function oddMultiple(r: Rng) {
  const k = int(r, 6, 19);
  const ms = shuffle(r, Array.from({ length: 20 }, (_, i) => k * (i + 3))).slice(0, 3);
  const odd = k * int(r, 3, 22) + int(r, 1, k - 1);
  const shown = shuffle(r, [...ms, odd]);
  return mcq(r, base(`om:${k}:${[...ms].sort().join(",")}:${odd}`, "Odd one out", `Find the odd one out: ${shown.join(", ")}`, `विषम संख्या ज्ञात कीजिए: ${shown.join(", ")}`), String(odd), ms.map(String));
}

function numberAnalogy(r: Rng) {
  const rules: [string, (n: number) => number][] = [
    ["square", (n) => n * n],
    ["cube", (n) => n ** 3],
    ["square + 1", (n) => n * n + 1],
    ["square − 1", (n) => n * n - 1],
    ["n × (n + 1)", (n) => n * (n + 1)],
    ["double + 3", (n) => 2 * n + 3],
  ];
  const [name, f] = pick(r, rules);
  const a = int(r, 2, 12);
  let b = int(r, 2, 15);
  if (b === a) b++;
  return numberQ(r, `na:${name}:${a}:${b}`, "Analogy", `${a} : ${f(a)} :: ${b} : ?`, `${a} : ${f(a)} :: ${b} : ?`, f(b), `Rule: ${name}.`);
}

function letterAnalogy(r: Rng) {
  const [w1, w2] = shuffle(r, WORDS.filter((w) => w.length <= 4));
  const k = pick(r, [1, 2, 3]);
  return mcq(r, base(`la:${w1}:${w2}:${k}`, "Analogy", `${w1} : ${shift(w1!, k)} :: ${w2} : ?`, `${w1} : ${shift(w1!, k)} :: ${w2} : ?`), shift(w2!, k), [shift(w2!, k + 1), shift(w2!, k - 1), shift(w2!, -k), shift(w2!, k + 2)]);
}

// --- Direction, ranking, clock, calendar -----------------------------------------------
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [15, 20, 25]];

function directionDistance(r: Rng) {
  const [x, y, h] = pick(r, TRIPLES) as [number, number, number];
  const [n, nh] = pick(r, NAMES);
  const north = r() < 0.5;
  const east = r() < 0.5;
  const en = `${n} walks ${y} km ${north ? "north" : "south"}, then turns ${north === east ? "right" : "left"} and walks ${x} km. How far is ${n} from the starting point?`;
  const hi = `${nh} ${y} किमी ${north ? "उत्तर" : "दक्षिण"} की ओर चलता है, फिर ${north === east ? "दाएँ" : "बाएँ"} मुड़कर ${x} किमी चलता है। वह प्रारंभिक बिंदु से कितनी दूर है?`;
  return mcq(r, { ...base(`dd:${x}:${y}:${north}:${east}:${n}`, "Direction sense", en, hi), explanationEn: `√(${x}² + ${y}²) = ${h} km.` }, `${h} km`, [`${x + y} km`, `${Math.abs(y - x)} km`, `${h + 1} km`, `${h - 1} km`]);
}

function directionFacing(r: Rng) {
  const dirs = ["North", "East", "South", "West"];
  const dirsHi = ["उत्तर", "पूर्व", "दक्षिण", "पश्चिम"];
  const start = int(r, 0, 3);
  const turns = Array.from({ length: int(r, 2, 4) }, () => pick(r, [1, -1, 2]));
  const end = (((start + turns.reduce((a, b) => a + b, 0)) % 4) + 4) % 4;
  const tEn = turns.map((t) => (t === 1 ? "turns right" : t === -1 ? "turns left" : "turns back (180°)")).join(", then ");
  const tHi = turns.map((t) => (t === 1 ? "दाएँ मुड़ता है" : t === -1 ? "बाएँ मुड़ता है" : "पीछे मुड़ता है (180°)")).join(", फिर ");
  const [n, nh] = pick(r, NAMES);
  return mcq(
    r,
    base(`df:${start}:${turns.join("")}`, "Direction sense", `${n} is facing ${dirs[start]}. He ${tEn}. Which direction is he facing now?`, `${nh} ${dirsHi[start]} की ओर मुख करके खड़ा है। वह ${tHi}। अब उसका मुख किस दिशा में है?`),
    dirs[end]!,
    dirs.filter((_, i) => i !== end),
    { answer: dirsHi[end]!, distractors: dirsHi.filter((_, i) => i !== end) },
  );
}

function ranking(r: Rng) {
  const top = int(r, 5, 30), bottom = int(r, 5, 30);
  const total = top + bottom - 1;
  const [n, nh] = pick(r, NAMES);
  return numberQ(r, `rk:${top}:${bottom}`, "Ranking", `In a row of students, ${n} is ${ordinal(top)} from the front and ${ordinal(bottom)} from the back. How many students are there in the row?`, `विद्यार्थियों की एक पंक्ति में ${nh} आगे से ${top}वें तथा पीछे से ${bottom}वें स्थान पर है। पंक्ति में कुल कितने विद्यार्थी हैं?`, total, `${top} + ${bottom} − 1 = ${total}.`);
}

function clockAngle(r: Rng) {
  const h = int(r, 1, 12), m = pick(r, [0, 10, 15, 20, 30, 40, 45, 50]);
  let angle = Math.abs(30 * (h % 12) - 5.5 * m);
  if (angle > 180) angle = 360 - angle;
  const t = `${h}:${String(m).padStart(2, "0")}`;
  return mcq(
    r,
    { ...base(`ca:${h}:${m}`, "Clock", `What is the angle between the hour hand and the minute hand of a clock at ${t}?`, `${t} बजे घड़ी की घंटे और मिनट की सुइयों के बीच कितना कोण होगा?`), explanationEn: `|30H − 5.5M| = |${30 * (h % 12)} − ${5.5 * m}| → ${fmt(angle)}°.` },
    `${fmt(angle)}°`,
    nearNumbers(r, angle, { spread: 6, step: 5 }).map((x) => `${fmt(x)}°`),
  );
}

function clockMirror(r: Rng) {
  const h = int(r, 1, 11), m = int(r, 1, 59);
  const total = 12 * 60 - (h * 60 + m);
  const mh = Math.floor(total / 60) || 12, mm = total % 60;
  const f = (a: number, b: number) => `${a}:${String(b).padStart(2, "0")}`;
  return mcq(
    r,
    base(`cm:${h}:${m}`, "Clock", `A clock shows ${f(h, m)}. What time will its mirror image (mirror placed vertically) show?`, `एक घड़ी ${f(h, m)} दिखा रही है। (ऊर्ध्वाधर रखे) दर्पण में इसका प्रतिबिंब कितना समय दिखाएगा?`, "HARD"),
    f(mh, mm),
    [f(m % 12 || 12, h), f(mh, (mm + 30) % 60), f((mh % 12) + 1, mm), f(h, 60 - m)],
  );
}

function calendarDay(r: Rng) {
  const y = int(r, 1990, 2030), mo = int(r, 0, 11), d = int(r, 1, 28);
  const date = new Date(Date.UTC(y, mo, d));
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const ans = date.getUTCDay();
  const others = shuffle(r, [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== ans)).slice(0, 3);
  return mcq(
    r,
    base(`cal:${y}:${mo}:${d}`, "Calendar", `What day of the week was/is ${d} ${months[mo]} ${y}?`, `${d} ${months[mo]} ${y} को सप्ताह का कौन-सा दिन था/है?`, "HARD"),
    days[ans]!,
    others.map((i) => days[i]!),
    { answer: daysHi[ans]!, distractors: others.map((i) => daysHi[i]!) },
  );
}

// --- Blood relations -------------------------------------------------------------------
type Rel = { en: string; hi: string };
const R = (en: string, hi: string): Rel => ({ en, hi });
const BLOOD: { en: (a: string, b: string, c: string) => string; hi: (a: string, b: string, c: string) => string; ans: Rel; wrong: Rel[] }[] = [
  { en: (a, b, c) => `${a} is the father of ${b}. ${b} is the sister of ${c}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} का पिता है। ${b}, ${c} की बहन है। ${a} का ${c} से क्या संबंध है?`, ans: R("Father", "पिता"), wrong: [R("Uncle", "चाचा"), R("Brother", "भाई"), R("Grandfather", "दादा")] },
  { en: (a, b, c) => `${a} is the mother of ${b}. ${b} is the father of ${c}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} की माता है। ${b}, ${c} का पिता है। ${a} का ${c} से क्या संबंध है?`, ans: R("Grandmother", "दादी"), wrong: [R("Mother", "माता"), R("Aunt", "चाची"), R("Sister", "बहन")] },
  { en: (a, b, c) => `${a} is the brother of ${b}. ${b} is the daughter of ${c}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} का भाई है। ${b}, ${c} की पुत्री है। ${a} का ${c} से क्या संबंध है?`, ans: R("Son", "पुत्र"), wrong: [R("Brother", "भाई"), R("Nephew", "भतीजा"), R("Father", "पिता")] },
  { en: (a, b, c) => `${a} is the son of ${b}. ${c} is the brother of ${b}. How is ${c} related to ${a}?`, hi: (a, b, c) => `${a}, ${b} का पुत्र है। ${c}, ${b} का भाई है। ${c} का ${a} से क्या संबंध है?`, ans: R("Uncle", "चाचा/मामा"), wrong: [R("Father", "पिता"), R("Brother", "भाई"), R("Grandfather", "दादा")] },
  { en: (a, b, c) => `${a} is the wife of ${b}. ${b} is the only son of ${c}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} की पत्नी है। ${b}, ${c} का इकलौता पुत्र है। ${a} का ${c} से क्या संबंध है?`, ans: R("Daughter-in-law", "पुत्रवधू"), wrong: [R("Daughter", "पुत्री"), R("Sister", "बहन"), R("Niece", "भतीजी")] },
  { en: (a, b, c) => `${a} is the daughter of ${b}. ${b} is the only son of ${c}. How is ${c} related to ${a}?`, hi: (a, b, c) => `${a}, ${b} की पुत्री है। ${b}, ${c} का इकलौता पुत्र है। ${c} का ${a} से क्या संबंध है?`, ans: R("Grandparent", "दादा/दादी"), wrong: [R("Parent", "माता/पिता"), R("Uncle", "चाचा"), R("Sibling", "भाई/बहन")] },
  { en: (a, b, c) => `${a} and ${b} are brothers. ${c} is the son of ${b}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a} और ${b} भाई हैं। ${c}, ${b} का पुत्र है। ${a} का ${c} से क्या संबंध है?`, ans: R("Uncle", "चाचा"), wrong: [R("Father", "पिता"), R("Cousin", "चचेरा भाई"), R("Grandfather", "दादा")] },
  { en: (a, b, c) => `${a} is the sister of ${b}. ${b} is the son of ${c}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} की बहन है। ${b}, ${c} का पुत्र है। ${a} का ${c} से क्या संबंध है?`, ans: R("Daughter", "पुत्री"), wrong: [R("Sister", "बहन"), R("Niece", "भतीजी"), R("Mother", "माता")] },
  { en: (a, b, c) => `${a} is the husband of ${b}. ${c} is the mother of ${b}. How is ${a} related to ${c}?`, hi: (a, b, c) => `${a}, ${b} का पति है। ${c}, ${b} की माता है। ${a} का ${c} से क्या संबंध है?`, ans: R("Son-in-law", "दामाद"), wrong: [R("Son", "पुत्र"), R("Brother", "भाई"), R("Nephew", "भतीजा")] },
  { en: (a, b, c) => `${a} is the father of ${b}. ${c} is the daughter of ${b}. How is ${c} related to ${a}?`, hi: (a, b, c) => `${a}, ${b} का पिता है। ${c}, ${b} की पुत्री है। ${c} का ${a} से क्या संबंध है?`, ans: R("Granddaughter", "पोती"), wrong: [R("Daughter", "पुत्री"), R("Niece", "भतीजी"), R("Sister", "बहन")] },
];

function bloodRelation(r: Rng) {
  const t = int(r, 0, BLOOD.length - 1);
  const tpl = BLOOD[t]!;
  const [a, b, c] = shuffle(r, NAMES);
  return mcq(r, base(`br:${t}:${a![0]}:${b![0]}:${c![0]}`, "Blood relations", tpl.en(a![0], b![0], c![0]), tpl.hi(a![1], b![1], c![1])), tpl.ans.en, tpl.wrong.map((w) => w.en), {
    answer: tpl.ans.hi,
    distractors: tpl.wrong.map((w) => w.hi),
  });
}

// --- Mathematical operations ------------------------------------------------------------
function symbolSwap(r: Rng) {
  const a = int(r, 6, 40), b = int(r, 2, 9), c = int(r, 2, 9), d = int(r, 1, 20);
  // '+' means '×', '×' means '−', '−' means '+'. Expression: a − d + b × c  →  a + d × b − c
  const ans = a + d * b - c;
  return numberQ(
    r,
    `ms:${a}:${b}:${c}:${d}`,
    "Mathematical operations",
    `If '+' means '×', '×' means '−' and '−' means '+', then ${a} − ${d} + ${b} × ${c} = ?`,
    `यदि '+' का अर्थ '×', '×' का अर्थ '−' तथा '−' का अर्थ '+' हो, तो ${a} − ${d} + ${b} × ${c} = ?`,
    ans,
    `${a} + ${d} × ${b} − ${c} = ${ans}.`,
  );
}

function countDivisible(r: Rng) {
  const k = int(r, 3, 13), lo = int(r, 1, 50), hi = lo + int(r, 60, 400);
  const ans = Math.floor(hi / k) - Math.floor((lo - 1) / k);
  return numberQ(r, `cd:${k}:${lo}:${hi}`, "Number counting", `How many numbers from ${lo} to ${hi} (both inclusive) are divisible by ${k}?`, `${lo} से ${hi} तक (दोनों सम्मिलित) कितनी संख्याएँ ${k} से विभाज्य हैं?`, ans);
}

function missingInPairs(r: Rng) {
  const k = int(r, 2, 6), add = int(r, 1, 9);
  const xs = shuffle(r, Array.from({ length: 12 }, (_, i) => i + 2)).slice(0, 3);
  const f = (x: number) => x * k + add;
  return numberQ(r, `mp:${k}:${add}:${xs.join(",")}`, "Missing number", `Find the missing number: ${xs[0]} → ${f(xs[0]!)}, ${xs[1]} → ${f(xs[1]!)}, ${xs[2]} → ?`, `लुप्त संख्या ज्ञात कीजिए: ${xs[0]} → ${f(xs[0]!)}, ${xs[1]} → ${f(xs[1]!)}, ${xs[2]} → ?`, f(xs[2]!), `x × ${k} + ${add}.`);
}

export const REASONING_GENERATORS: ((r: Rng) => GenQuestion | null)[] = [
  arithmeticSeries, geometricSeries, squareSeries, secondOrderSeries, letterSeries, pairLetterSeries,
  codingShift, codingReverse, letterSum, alphabetPosition, dictionaryOrder,
  oddPrime, oddSquare, oddMultiple, numberAnalogy, letterAnalogy,
  directionDistance, directionFacing, ranking, clockAngle, clockMirror, calendarDay,
  bloodRelation, symbolSwap, countDivisible, missingInPairs,
];
