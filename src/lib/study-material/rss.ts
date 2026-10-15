/**
 * Minimal RSS 2.0 reader for the current-affairs feeds (PIB, AIR, RBI).
 * Only headline, link and date are kept — never the article body.
 */
import { zonedTimeToUtc } from "@/lib/time/zone";

export type FeedItem = { title: string; url: string; publishedAt: Date | null };

/** Indian government feeds publish wall-clock times in IST without an offset. */
const SOURCE_TZ = "Asia/Kolkata";

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n: number | string) => String(n).padStart(2, "0");

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

function decode(s: string): string {
  const text = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, " ");
  // Twice: some feeds (AIR) double-encode, e.g. "&amp;#038;" for "&".
  return decodeEntities(decodeEntities(text)).replace(/\s+/g, " ").trim();
}

const tag = (xml: string, name: string) => {
  const m = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(xml);
  return m ? m[1]! : null;
};

/**
 * Parses the date formats the feeds use:
 *  - RFC 822 with zone:    "Sat, 10 Oct 2026 01:25:00 GMT" / "+0530"
 *  - RFC 822 without zone: "Sat, 10 Oct 2026 01:25:00" (RBI, IST)
 *  - AIR:                  "10-10-2026 | 04:48 pm" (IST)
 */
export function parseFeedDate(raw: string | null): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  const air = /^(\d{1,2})-(\d{1,2})-(\d{4})\s*\|\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s);
  if (air) {
    const [, d, mo, y, h, mi, ap] = air;
    const hour = (Number(h) % 12) + (ap!.toLowerCase() === "pm" ? 12 : 0);
    return zonedTimeToUtc(`${y}-${pad(mo!)}-${pad(d!)}T${pad(hour)}:${mi}`, SOURCE_TZ);
  }
  const rfc = /^(?:[a-z]{3},\s*)?(\d{1,2})\s+([a-z]{3})[a-z]*\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)$/i.exec(s);
  if (rfc) {
    const [, d, mon, y, h, mi, sec, zone] = rfc;
    const mo = MONTHS[mon!.toLowerCase()];
    if (!mo) return null;
    if (!zone) return zonedTimeToUtc(`${y}-${pad(mo)}-${pad(d!)}T${pad(h!)}:${mi}:${sec ?? "00"}`, SOURCE_TZ);
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Only absolute http(s) links are kept (no javascript:, data:, relative links). */
function safeUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(decode(raw));
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseRss(xml: string, limit = 20): FeedItem[] {
  const items: FeedItem[] = [];
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const body = m[1]!;
    const title = decode(tag(body, "title") ?? "");
    const url = safeUrl(tag(body, "link"));
    if (!title || !url) continue;
    items.push({ title, url, publishedAt: parseFeedDate(tag(body, "pubDate")) });
    if (items.length >= limit) break;
  }
  return items;
}
