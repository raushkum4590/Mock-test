/**
 * Downloads one month of official headlines (title, link, date, ministry /
 * category — never article text) into data/current-affairs/raw/YYYY-MM.json.
 *
 *   npx tsx scripts/current-affairs/backfill.ts 2025-10 2026-10
 *
 * Sources: PIB "All releases" (English, PIB Delhi, one request per day),
 * RBI press-release archive (one request per month) and All India Radio's
 * WordPress API (National, International, Sports, Business; English only).
 * Finished months are skipped, so the script can be stopped and re-run.
 * Requests are sequential with a pause, to stay polite to government servers.
 */
import fs from "node:fs";
import path from "node:path";
import { decodeHtml } from "../../src/lib/current-affairs/text";

export type RawItem = { source: "PIB" | "RBI" | "AIR"; title: string; url: string; date: string; group?: string };

const UA = "Mozilla/5.0 (compatible; EdQity current-affairs archiver)";
const OUT = path.join(process.cwd(), "data", "current-affairs", "raw");
const PAUSE_MS = 700;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");

async function fetchText(url: string, init: RequestInit = {}): Promise<{ text: string; res: Response }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(90_000) });
      if (res.ok) return { text: await res.text(), res };
      if (attempt >= 4) throw new Error(`${res.status} ${url}`);
    } catch (e) {
      if (attempt >= 4) throw e;
    }
    await sleep(3000 * attempt);
  }
}

const formField = (html: string, name: string) => (new RegExp(`id="${name}" value="([^"]*)"`).exec(html) ?? [, ""])[1]!;
const cookies = (res: Response) => (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");

// --- PIB --------------------------------------------------------------------------------
const PIB_URL = "https://www.pib.gov.in/allRel.aspx?reg=3&lang=1";

async function pibDay(y: number, m: number, d: number): Promise<RawItem[]> {
  const first = await fetchText(PIB_URL);
  const body = new URLSearchParams({
    __VIEWSTATE: formField(first.text, "__VIEWSTATE"),
    __VIEWSTATEGENERATOR: formField(first.text, "__VIEWSTATEGENERATOR"),
    __EVENTVALIDATION: formField(first.text, "__EVENTVALIDATION"),
    __EVENTTARGET: "ctl00$ContentPlaceHolder1$ddlday",
    __EVENTARGUMENT: "",
    ctl00$Bar1$ddlregion: "3",
    ctl00$Bar1$ddlLang: "1",
    ctl00$ContentPlaceHolder1$ddlMinistry: "0",
    ctl00$ContentPlaceHolder1$ddlday: String(d),
    ctl00$ContentPlaceHolder1$ddlMonth: String(m),
    ctl00$ContentPlaceHolder1$ddlYear: String(y),
  });
  const { text } = await fetchText(PIB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies(first.res), Referer: PIB_URL },
    body,
  });
  const selected = [...text.matchAll(/<option selected="selected" value="(\d+)">/g)].map((x) => x[1]);
  if (selected[3] !== String(d) || selected[4] !== String(m) || selected[5] !== String(y)) throw new Error(`PIB did not switch to ${y}-${m}-${d}`);
  const items: RawItem[] = [];
  let ministry = "";
  for (const t of text.matchAll(/<h3 class='font104'>([^<]+)|PRID=(\d+)'[^>]*>([^<]+)</g)) {
    if (t[1]) ministry = decodeHtml(t[1]);
    else items.push({ source: "PIB", title: decodeHtml(t[3]!), url: `https://pib.gov.in/PressReleasePage.aspx?PRID=${t[2]}`, date: `${y}-${pad(m)}-${pad(d)}`, group: ministry });
  }
  return items;
}

// --- RBI --------------------------------------------------------------------------------
const RBI_URL = "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function rbiMonth(y: number, m: number): Promise<RawItem[]> {
  const first = await fetchText(RBI_URL);
  const body = new URLSearchParams({
    __VIEWSTATE: formField(first.text, "__VIEWSTATE"),
    __VIEWSTATEGENERATOR: formField(first.text, "__VIEWSTATEGENERATOR"),
    __EVENTVALIDATION: formField(first.text, "__EVENTVALIDATION"),
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    hdnYear: String(y),
    hdnMonth: String(m),
  });
  const { text } = await fetchText(RBI_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies(first.res), Referer: RBI_URL }, body });
  const items: RawItem[] = [];
  let date = "";
  for (const t of text.matchAll(/tableheader"[^>]*><b>([A-Z][a-z]{2}) (\d{2}), (\d{4})|prid=(\d+)>([^<]+)</g)) {
    if (t[1]) date = `${t[3]}-${pad(MONTHS.indexOf(t[1]) + 1)}-${t[2]}`;
    else if (date.startsWith(`${y}-${pad(m)}`) && /[a-z]/i.test(t[5]!)) {
      items.push({ source: "RBI", title: decodeHtml(t[5]!), url: `https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=${t[4]}`, date });
    }
  }
  if (items.length === 0) throw new Error(`RBI returned no releases for ${y}-${m}`);
  return items;
}

// --- All India Radio ----------------------------------------------------------------------
const AIR_CATEGORIES: Record<number, string> = { 41706: "National", 33: "International", 11: "Sports", 39: "Business" };

async function airMonth(y: number, m: number): Promise<RawItem[]> {
  const after = `${y}-${pad(m)}-01T00:00:00`;
  const next = m === 12 ? `${y + 1}-01-01T00:00:00` : `${y}-${pad(m + 1)}-01T00:00:00`;
  const items: RawItem[] = [];
  for (let page = 1; ; page++) {
    const url =
      `https://newsonair.gov.in/wp-json/wp/v2/posts?after=${after}&before=${next}&per_page=100&page=${page}` +
      `&categories=${Object.keys(AIR_CATEGORIES).join(",")}&_fields=date,link,title,categories&orderby=date&order=asc`;
    const { text, res } = await fetchText(url);
    const posts = JSON.parse(text) as { date: string; link: string; title: { rendered: string }; categories: number[] }[];
    for (const p of posts) {
      const title = decodeHtml(p.title.rendered);
      // English posts only (other languages live under /hi/, /ur/, … and use other scripts).
      if (!/^https:\/\/newsonair\.gov\.in\/[a-z0-9-]+\/?$/.test(p.link) || !/^[\x20-\x7E‘’“”–—…₹]+$/.test(title)) continue;
      const cat = p.categories.map((c) => AIR_CATEGORIES[c]).find(Boolean);
      items.push({ source: "AIR", title, url: p.link, date: p.date.slice(0, 10), group: cat });
    }
    if (page >= Number(res.headers.get("x-wp-totalpages") ?? 1)) break;
    await sleep(PAUSE_MS);
  }
  return items;
}

// --- main -------------------------------------------------------------------------------
function months(from: string, to: string): [number, number][] {
  const out: [number, number][] = [];
  let [y, m] = from.split("-").map(Number) as [number, number];
  const [ty, tm] = to.split("-").map(Number) as [number, number];
  while (y < ty || (y === ty && m <= tm)) {
    out.push([y, m]);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

async function backfillMonth(y: number, m: number) {
  const file = path.join(OUT, `${y}-${pad(m)}.json`);
  const today = new Date();
  const isCurrent = y === today.getFullYear() && m === today.getMonth() + 1;
  if (fs.existsSync(file) && !isCurrent) return console.log(`${y}-${pad(m)} already done`);

  const partial = path.join(OUT, `${y}-${pad(m)}.partial.json`);
  const state: { pibDays: Record<string, RawItem[]>; rbi?: RawItem[]; air?: RawItem[] } = fs.existsSync(partial)
    ? JSON.parse(fs.readFileSync(partial, "utf8"))
    : { pibDays: {} };
  const save = () => fs.writeFileSync(partial, JSON.stringify(state));

  const lastDay = isCurrent ? today.getDate() : new Date(y, m, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    if (state.pibDays[d] && !(isCurrent && d === lastDay)) continue;
    state.pibDays[d] = await pibDay(y, m, d);
    save();
    process.stdout.write(`PIB ${y}-${pad(m)}-${pad(d)}: ${state.pibDays[d]!.length}\n`);
    await sleep(PAUSE_MS);
  }
  if (!state.rbi || isCurrent) state.rbi = await rbiMonth(y, m);
  save();
  if (!state.air || isCurrent) state.air = await airMonth(y, m);
  save();

  const items = [...Object.values(state.pibDays).flat(), ...state.rbi, ...state.air];
  fs.writeFileSync(file, JSON.stringify(items, null, 0));
  fs.rmSync(partial);
  console.log(`${y}-${pad(m)}: PIB ${Object.values(state.pibDays).flat().length}, RBI ${state.rbi.length}, AIR ${state.air.length}`);
}

async function main() {
  const from = process.argv[2] ?? "";
  const to = process.argv[3] ?? from;
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) {
    console.error("Usage: npx tsx scripts/current-affairs/backfill.ts YYYY-MM [YYYY-MM]");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const [y, m] of months(from, to)) await backfillMonth(y, m);
}

void main();
