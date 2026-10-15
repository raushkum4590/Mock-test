/** Arithmetical & Numerical Ability — every answer is computed. */
import { fmt, int, mcq, nearNumbers, pick, type GenQuestion, type Rng } from "./core";

const S = "Arithmetical and Numerical Ability";

function q(r: Rng, key: string, topic: string, en: string, hi: string, answer: number, unit = "", explanationEn?: string, step = 1) {
  const u = (n: number) => `${unit === "₹" ? "₹" : ""}${fmt(n)}${unit && unit !== "₹" ? ` ${unit}` : ""}`;
  const d = nearNumbers(r, answer, { spread: 5, step }).map(u);
  return mcq(r, { key: `A:${key}`, subject: S, topic, difficulty: "MEDIUM", en, hi, explanationEn }, u(answer), d);
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

function percentOf(r: Rng) {
  const p = pick(r, [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75]), n = int(r, 4, 60) * 20;
  const ans = (p * n) / 100;
  return q(r, `po:${p}:${n}`, "Percentage", `What is ${p}% of ${n}?`, `${n} का ${p}% कितना है?`, ans, "", undefined, Math.max(1, Math.round(ans / 20)));
}

function percentChange(r: Rng) {
  const a = int(r, 4, 40) * 25, up = r() < 0.5, p = pick(r, [10, 20, 25, 30, 40, 50]);
  const b = up ? a * (1 + p / 100) : a * (1 - p / 100);
  return q(r, `pc:${a}:${b}`, "Percentage", `A value changes from ${a} to ${fmt(b)}. What is the percentage ${up ? "increase" : "decrease"}?`, `एक मान ${a} से ${fmt(b)} हो जाता है। प्रतिशत ${up ? "वृद्धि" : "कमी"} कितनी है?`, p, "%", undefined, 5);
}

function profitLoss(r: Rng) {
  const cp = int(r, 4, 80) * 25, p = pick(r, [5, 8, 10, 12, 15, 20, 25]), profit = r() < 0.6;
  const sp = cp * (1 + (profit ? p : -p) / 100);
  return q(r, `pl:${cp}:${p}:${profit}`, "Profit and loss", `An article bought for ₹${cp} is sold at a ${profit ? "profit" : "loss"} of ${p}%. Find the selling price.`, `₹${cp} में खरीदी गई वस्तु ${p}% ${profit ? "लाभ" : "हानि"} पर बेची जाती है। विक्रय मूल्य ज्ञात कीजिए।`, sp, "₹", `SP = CP × (100 ${profit ? "+" : "−"} ${p})/100.`, Math.max(1, Math.round(cp / 50)));
}

function discount(r: Rng) {
  const mp = int(r, 4, 60) * 50, d1 = pick(r, [10, 20, 25]), d2 = pick(r, [5, 10, 20]);
  const sp = mp * (1 - d1 / 100) * (1 - d2 / 100);
  return q(r, `dc:${mp}:${d1}:${d2}`, "Discount", `The marked price of an article is ₹${mp}. Successive discounts of ${d1}% and ${d2}% are given. What is the selling price?`, `एक वस्तु का अंकित मूल्य ₹${mp} है। ${d1}% और ${d2}% की क्रमिक छूट दी जाती है। विक्रय मूल्य क्या है?`, sp, "₹", undefined, Math.max(1, Math.round(mp / 40)));
}

function simpleInterest(r: Rng) {
  const p = int(r, 2, 50) * 500, rate = pick(r, [4, 5, 6, 8, 10, 12]), t = int(r, 2, 6);
  const si = (p * rate * t) / 100;
  return q(r, `si:${p}:${rate}:${t}`, "Simple interest", `Find the simple interest on ₹${p} at ${rate}% per annum for ${t} years.`, `₹${p} पर ${rate}% वार्षिक दर से ${t} वर्ष का साधारण ब्याज ज्ञात कीजिए।`, si, "₹", "SI = P × R × T / 100.", Math.max(1, Math.round(si / 20)));
}

function compoundInterest(r: Rng) {
  const p = int(r, 2, 40) * 1000, rate = pick(r, [5, 10, 20]), t = pick(r, [2, 3]);
  const ci = Math.round((p * (1 + rate / 100) ** t - p) * 100) / 100;
  return q(r, `ci:${p}:${rate}:${t}`, "Compound interest", `Find the compound interest on ₹${p} at ${rate}% per annum for ${t} years, compounded annually.`, `₹${p} पर ${rate}% वार्षिक दर से ${t} वर्ष का चक्रवृद्धि ब्याज (वार्षिक संयोजन) ज्ञात कीजिए।`, ci, "₹", undefined, Math.max(1, Math.round(ci / 25)));
}

function ratioShare(r: Rng) {
  const a = int(r, 1, 9), b = int(r, 1, 9), k = int(r, 10, 200);
  if (a === b) return null;
  const total = (a + b) * k;
  return q(r, `rs:${a}:${b}:${k}`, "Ratio and proportion", `₹${total} is divided between A and B in the ratio ${a} : ${b}. What is B's share?`, `₹${total} को A और B में ${a} : ${b} के अनुपात में बाँटा जाता है। B का हिस्सा कितना है?`, b * k, "₹", undefined, k);
}

function average(r: Rng) {
  const n = int(r, 4, 7);
  const xs = Array.from({ length: n }, () => int(r, 10, 99));
  const sum = xs.reduce((a, b) => a + b, 0);
  if (sum % n) xs[0]! += n - (sum % n);
  const avg = xs.reduce((a, b) => a + b, 0) / n;
  return q(r, `av:${xs.join(",")}`, "Average", `Find the average of ${xs.join(", ")}.`, `${xs.join(", ")} का औसत ज्ञात कीजिए।`, avg);
}

function timeWork(r: Rng) {
  const pairs = [[10, 15, 6], [12, 24, 8], [20, 30, 12], [6, 12, 4], [15, 30, 10], [18, 36, 12], [12, 36, 9], [10, 40, 8], [24, 40, 15], [21, 42, 14]];
  const [a, b, t] = pick(r, pairs) as [number, number, number];
  return q(r, `tw:${a}:${b}`, "Time and work", `A can finish a work in ${a} days and B in ${b} days. In how many days can they finish it working together?`, `A किसी कार्य को ${a} दिनों में और B ${b} दिनों में पूरा कर सकता है। दोनों मिलकर उसे कितने दिनों में पूरा करेंगे?`, t, "days", `1/${a} + 1/${b} = 1/${t}.`);
}

function speedTime(r: Rng) {
  const s = pick(r, [36, 45, 54, 60, 72, 90, 108]), t = int(r, 2, 9);
  return q(r, `st:${s}:${t}`, "Speed, time and distance", `A car travels at ${s} km/h for ${t} hours. How much distance does it cover?`, `एक कार ${s} किमी/घंटा की गति से ${t} घंटे चलती है। वह कितनी दूरी तय करती है?`, s * t, "km", undefined, s);
}

function trainPole(r: Rng) {
  const kmph = pick(r, [36, 54, 72, 90, 108]), t = int(r, 5, 20);
  const len = (kmph * 5) / 18 * t;
  return q(r, `tp:${kmph}:${t}`, "Speed, time and distance", `A train running at ${kmph} km/h crosses a pole in ${t} seconds. What is the length of the train?`, `${kmph} किमी/घंटा की गति से चल रही एक ट्रेन एक खंभे को ${t} सेकंड में पार करती है। ट्रेन की लंबाई कितनी है?`, len, "m", `${kmph} km/h = ${(kmph * 5) / 18} m/s.`, 10);
}

function lcmHcf(r: Rng) {
  const g = int(r, 2, 12), a = g * int(r, 2, 9), b = g * int(r, 2, 9);
  if (a === b) return null;
  const asLcm = r() < 0.5;
  return asLcm
    ? q(r, `lcm:${a}:${b}`, "LCM and HCF", `Find the LCM of ${a} and ${b}.`, `${a} और ${b} का लघुत्तम समापवर्त्य (LCM) ज्ञात कीजिए।`, lcm(a, b), "", undefined, g)
    : q(r, `hcf:${a}:${b}`, "LCM and HCF", `Find the HCF of ${a} and ${b}.`, `${a} और ${b} का महत्तम समापवर्तक (HCF) ज्ञात कीजिए।`, gcd(a, b));
}

function simplification(r: Rng) {
  const a = int(r, 10, 99), b = int(r, 2, 15), c = int(r, 2, 12), d = int(r, 1, 50);
  const ans = a + b * c - d;
  return q(r, `sm:${a}:${b}:${c}:${d}`, "Simplification", `Simplify: ${a} + ${b} × ${c} − ${d}`, `सरल कीजिए: ${a} + ${b} × ${c} − ${d}`, ans, "", "Multiplication first (BODMAS).");
}

function squareRoot(r: Rng) {
  const n = int(r, 11, 99);
  return q(r, `sr:${n}`, "Squares and roots", `What is the square root of ${n * n}?`, `${n * n} का वर्गमूल क्या है?`, n);
}

function ages(r: Rng) {
  const son = int(r, 5, 20), k = int(r, 2, 4), years = int(r, 3, 10);
  const father = son * k;
  return q(r, `ag:${son}:${k}:${years}`, "Ages", `A father is ${k} times as old as his son. If the son is ${son} years old now, what will be the father's age after ${years} years?`, `पिता की आयु पुत्र की आयु की ${k} गुनी है। यदि पुत्र अभी ${son} वर्ष का है, तो ${years} वर्ष बाद पिता की आयु कितनी होगी?`, father + years, "years");
}

function mixture(r: Rng) {
  const total = int(r, 4, 20) * 10, a = int(r, 1, 5), b = int(r, 1, 5);
  if ((total * a) % (a + b)) return null;
  return q(r, `mx:${total}:${a}:${b}`, "Mixture", `A ${total} litre mixture contains milk and water in the ratio ${a} : ${b}. How much milk is there?`, `${total} लीटर मिश्रण में दूध और पानी का अनुपात ${a} : ${b} है। मिश्रण में कितना दूध है?`, (total * a) / (a + b), "litres", undefined, 5);
}

function areaPerimeter(r: Rng) {
  const l = int(r, 5, 40), w = int(r, 3, 30);
  return r() < 0.5
    ? q(r, `ar:${l}:${w}`, "Mensuration", `Find the area of a rectangle of length ${l} m and breadth ${w} m.`, `${l} मी लंबे और ${w} मी चौड़े आयत का क्षेत्रफल ज्ञात कीजिए।`, l * w, "m²", undefined, w)
    : q(r, `pr:${l}:${w}`, "Mensuration", `Find the perimeter of a rectangle of length ${l} m and breadth ${w} m.`, `${l} मी लंबे और ${w} मी चौड़े आयत का परिमाप ज्ञात कीजिए।`, 2 * (l + w), "m", undefined, 2);
}

function unitaryMethod(r: Rng) {
  const n = int(r, 3, 12), price = int(r, 5, 60), m = int(r, 2, 20);
  if (m === n) return null;
  return q(r, `um:${n}:${price}:${m}`, "Unitary method", `If ${n} pens cost ₹${n * price}, what is the cost of ${m} pens?`, `यदि ${n} पेन का मूल्य ₹${n * price} है, तो ${m} पेन का मूल्य कितना होगा?`, m * price, "₹", undefined, price);
}

export const ARITHMETIC_GENERATORS: ((r: Rng) => GenQuestion | null)[] = [
  percentOf, percentChange, profitLoss, discount, simpleInterest, compoundInterest, ratioShare, average,
  timeWork, speedTime, trainPole, lcmHcf, simplification, squareRoot, ages, mixture, areaPerimeter, unitaryMethod,
];
