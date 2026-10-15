/** General Awareness — computed general-science questions (physics/chemistry basics). */
import { fmt, int, mcq, nearNumbers, pick, type GenQuestion, type Rng } from "./core";

const S = "General Awareness";

function q(r: Rng, key: string, en: string, hi: string, answer: number, unit: string, explanationEn?: string, step = 1) {
  const u = (n: number) => `${fmt(n)} ${unit}`;
  return mcq(r, { key: `GS:${key}`, subject: S, topic: "General science", difficulty: "MEDIUM", en, hi, explanationEn }, u(answer), nearNumbers(r, answer, { spread: 5, step }).map(u));
}

const ohm = (r: Rng) => {
  const i = int(r, 1, 10), res = int(r, 2, 50);
  return q(r, `ohm:${i}:${res}`, `A current of ${i} A flows through a resistor of ${res} Ω. What is the potential difference across it?`, `${res} Ω के प्रतिरोधक से ${i} A धारा प्रवाहित होती है। उसके सिरों के बीच विभवांतर कितना है?`, i * res, "V", "V = IR.", i);
};
const power = (r: Rng) => {
  const v = pick(r, [6, 12, 24, 110, 220]), i = int(r, 1, 10);
  return q(r, `pw:${v}:${i}`, `An appliance draws ${i} A from a ${v} V supply. What is its power?`, `एक उपकरण ${v} V स्रोत से ${i} A धारा लेता है। उसकी शक्ति कितनी है?`, v * i, "W", "P = VI.", v);
};
const speed = (r: Rng) => {
  const d = int(r, 2, 50) * 10, t = int(r, 2, 20);
  if (d % t) return null;
  return q(r, `sp:${d}:${t}`, `A body covers ${d} m in ${t} s at uniform speed. What is its speed?`, `एक वस्तु एकसमान चाल से ${t} s में ${d} m दूरी तय करती है। उसकी चाल कितनी है?`, d / t, "m/s");
};
const kmphToMs = (r: Rng) => {
  const k = pick(r, [18, 36, 54, 72, 90, 108, 126, 144]);
  return q(r, `kms:${k}`, `Convert ${k} km/h into m/s.`, `${k} किमी/घंटा को m/s में बदलिए।`, (k * 5) / 18, "m/s", "Multiply by 5/18.");
};
const density = (r: Rng) => {
  const v = int(r, 2, 20), d = int(r, 1, 12) * 100;
  return q(r, `dn:${v}:${d}`, `A body of volume ${v} m³ has a mass of ${v * d} kg. What is its density?`, `${v} m³ आयतन वाली वस्तु का द्रव्यमान ${v * d} kg है। उसका घनत्व कितना है?`, d, "kg/m³", undefined, 100);
};
const work = (r: Rng) => {
  const f = int(r, 2, 50), s = int(r, 2, 30);
  return q(r, `wk:${f}:${s}`, `A force of ${f} N moves a body ${s} m in the direction of the force. How much work is done?`, `${f} N का बल किसी वस्तु को बल की दिशा में ${s} m विस्थापित करता है। किया गया कार्य कितना है?`, f * s, "J", "W = F × s.", f);
};
const kinetic = (r: Rng) => {
  const m = int(r, 1, 20), v = int(r, 1, 12);
  return q(r, `ke:${m}:${v}`, `What is the kinetic energy of a ${m} kg body moving at ${v} m/s?`, `${v} m/s से गतिमान ${m} kg वस्तु की गतिज ऊर्जा कितनी है?`, (m * v * v) / 2, "J", "KE = ½mv².", Math.max(1, m));
};
const potential = (r: Rng) => {
  const m = int(r, 1, 30), h = int(r, 1, 25);
  return q(r, `pe:${m}:${h}`, `What is the potential energy of a ${m} kg body at a height of ${h} m? (g = 10 m/s²)`, `${h} m ऊँचाई पर स्थित ${m} kg वस्तु की स्थितिज ऊर्जा कितनी है? (g = 10 m/s²)`, m * 10 * h, "J", "PE = mgh.", 10 * m);
};
const pressure = (r: Rng) => {
  const a = pick(r, [2, 4, 5, 10]), p = int(r, 5, 100);
  return q(r, `pr:${a}:${p}`, `A force of ${a * p} N acts on an area of ${a} m². What is the pressure?`, `${a} m² क्षेत्रफल पर ${a * p} N बल लगता है। दाब कितना है?`, p, "Pa", "P = F/A.");
};
const celsiusToF = (r: Rng) => {
  const c = int(r, -8, 20) * 5;
  return q(r, `cf:${c}`, `Convert ${c} °C into degrees Fahrenheit.`, `${c} °C को फ़ारेनहाइट में बदलिए।`, (c * 9) / 5 + 32, "°F", "F = 9C/5 + 32.", 9);
};
const celsiusToK = (r: Rng) => {
  const c = int(r, -100, 300);
  return q(r, `ck:${c}`, `Convert ${c} °C into kelvin.`, `${c} °C को केल्विन में बदलिए।`, c + 273, "K", "K = °C + 273.");
};
const waveSpeed = (r: Rng) => {
  const f = int(r, 2, 50) * 10, l = int(r, 1, 10);
  return q(r, `wv:${f}:${l}`, `A wave of frequency ${f} Hz has a wavelength of ${l} m. What is its speed?`, `${f} Hz आवृत्ति वाली तरंग की तरंगदैर्ध्य ${l} m है। उसकी चाल कितनी है?`, f * l, "m/s", "v = fλ.", f);
};
const acceleration = (r: Rng) => {
  const u = int(r, 0, 10), a = int(r, 1, 6), t = int(r, 2, 10);
  return q(r, `ac:${u}:${a}:${t}`, `A body starts with velocity ${u} m/s and accelerates uniformly at ${a} m/s² for ${t} s. What is its final velocity?`, `एक वस्तु ${u} m/s के प्रारंभिक वेग से ${a} m/s² के एकसमान त्वरण से ${t} s चलती है। उसका अंतिम वेग कितना है?`, u + a * t, "m/s", "v = u + at.");
};
const seriesResistance = (r: Rng) => {
  const rs = [int(r, 2, 20), int(r, 2, 20), int(r, 2, 20)];
  const par = r() < 0.4 && rs[0] === rs[1];
  return par
    ? q(r, `rp:${rs[0]}`, `Two equal resistors of ${rs[0]} Ω each are connected in parallel. What is the equivalent resistance?`, `${rs[0]} Ω के दो समान प्रतिरोधक समांतर क्रम में जुड़े हैं। तुल्य प्रतिरोध कितना है?`, rs[0]! / 2, "Ω")
    : q(r, `rs:${rs.join(",")}`, `Resistors of ${rs.join(" Ω, ")} Ω are connected in series. What is the equivalent resistance?`, `${rs.join(" Ω, ")} Ω के प्रतिरोधक श्रेणीक्रम में जुड़े हैं। तुल्य प्रतिरोध कितना है?`, rs[0]! + rs[1]! + rs[2]!, "Ω");
};
const molarMass = (r: Rng) => {
  const comps: [string, number][] = [["H₂O", 18], ["CO₂", 44], ["NaCl", 58.5], ["CH₄", 16], ["NH₃", 17], ["O₂", 32], ["H₂SO₄", 98], ["CaCO₃", 100], ["HCl", 36.5], ["C₆H₁₂O₆", 180]];
  const [f, m] = pick(r, comps);
  return q(r, `mm:${f}`, `What is the molar mass of ${f}? (H = 1, C = 12, N = 14, O = 16, Na = 23, S = 32, Cl = 35.5, Ca = 40)`, `${f} का मोलर द्रव्यमान कितना है? (H = 1, C = 12, N = 14, O = 16, Na = 23, S = 32, Cl = 35.5, Ca = 40)`, m, "g/mol", undefined, 2);
};

export const SCIENCE_GENERATORS: ((r: Rng) => GenQuestion | null)[] = [
  ohm, power, speed, kmphToMs, density, work, kinetic, potential, pressure, celsiusToF, celsiusToK, waveSpeed, acceleration, seriesResistance, molarMass,
];
