/**
 * Turns a month of official headlines into exam-style tables (who / what /
 * where), using title patterns only. Precision over recall: a headline that
 * does not clearly fit a pattern is skipped rather than guessed.
 */
import { classifyHeadline, type ExamTopic } from "@/lib/study-material/exam-view";
import { countriesIn } from "./countries";
import { fixedDayDate } from "./days";

export type Source = "PIB" | "RBI" | "AIR";
export type RawItem = { source: Source; title: string; url: string; date: string; group?: string };
export type Ref = { url: string; date: string; source: Source };

export type Appointment = Ref & { who: string; post: string; verb: "charge" | "sworn" | "appointed" | "elected" };
export type Exercise = Ref & { name: string; partners: string[]; venue?: string };
export type Award = Ref & { award: string; winner: string };
/** `observed` is the fixed calendar date ("16 October") when known; `date` is when it was reported. */
export type ImportantDay = Ref & { day: string; theme?: string; observed?: string };
export type Summit = Ref & { event: string; venue: string };
export type Agreement = Ref & { country: string; area: string };
export type SportsWin = Ref & { who: string; feat: string; event?: string };
export type Launch = Ref & { what: string; by: string };
export type Line = Ref & { text: string };
export type TopicLine = Line & { topic: ExamTopic };

export type MonthFacts = {
  appointments: Appointment[];
  exercises: Exercise[];
  awards: Award[];
  days: ImportantDay[];
  summits: Summit[];
  agreements: Agreement[];
  sports: SportsWin[];
  launches: Launch[];
  cabinet: Line[];
  rankings: Line[];
  rbiPenalties: Line[];
  rbiLicences: Line[];
  oneLiners: TopicLine[];
};

// --- text helpers -------------------------------------------------------------------------

const SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "off", "on", "or", "the", "to", "with", "via", "under"]);
const ACRONYMS = new Set([
  "AI", "AIIMS", "BSF", "CDS", "CISF", "CRPF", "DRDO", "EU", "G20", "G7", "IAF", "ICG", "IIT", "IITS", "IIM", "ISRO", "ITBP", "MOU", "NCC", "NDRF", "NITI", "PM", "RBI",
  "SCO", "SSB", "UK", "UN", "UNGA", "US", "USA", "UAE", "WHO", "BRICS", "ASEAN", "QUAD", "SEBI", "NABARD", "GST", "UPI", "CEO", "CMD", "DG", "IPS", "IAS", "IFS", "ISS",
]);

/** PIB often shouts in ALL CAPS; convert those titles to Title Case, keeping acronyms. */
export function normaliseTitle(title: string): string {
  const letters = title.replace(/[^A-Za-z]/g, "");
  const upper = letters.replace(/[^A-Z]/g, "").length;
  if (letters.length < 12 || upper / letters.length < 0.7) return title;
  let first = true;
  return title.replace(/[A-Za-z][A-Za-z'’]*/g, (w: string, at: number) => {
    const bare = w.replace(/['’]S$/, "");
    const before = title[at - 1] ?? "";
    let out: string;
    if (/\d/.test(before)) out = w.toLowerCase(); // 68TH -> 68th
    else if (before === "(" && title[at + w.length] === ")") out = w; // (JAIMEX)
    else if (ACRONYMS.has(bare)) out = bare === "MOU" ? "MoU" : bare + w.slice(bare.length).toLowerCase();
    else if (!first && SMALL.has(w.toLowerCase())) out = w.toLowerCase();
    else out = w[0] + w.slice(1).toLowerCase();
    first = false;
    return out;
  });
}

const clean = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;–—-]+|[\s,:;–—-]+$/g, "")
    .trim();
const NAME_PARTICLES = new Set(["de", "da", "van", "von", "bin", "al", "el", "di", "du", "la", "le", "der"]);

/**
 * A person's name from a headline subject, or "" when it is not clearly a name:
 * drops "Country: " prefixes, honorifics, party/role labels ("BJP MLA-", "Olympian")
 * and trailing honours (", AVSM, NM"); rejects phrases with ordinary lowercase words
 * ("Chief coach X", "Tackling of Proxy Representation of").
 */
export function personName(raw: string): string {
  const s = clean(
    raw
      .trim()
      .replace(/^.*:\s*/, "")
      .replace(HONORIFIC, "")
      .replace(/^(?:[A-Z]{2,5}(?:\([A-Z]\))?\s+)?(?:MLA|MP|MLC)\s*[-–]?\s+/, "")
      .replace(/^(?:Olympian|Veteran|Former|Senior|Young|Star|Ace)\s+/, "")
      .replace(/(?:,\s*[A-Za-z]{2,5}\b\.?)+,?$/, ""),
  );
  if (!/^[A-Z]/.test(s)) return "";
  const lower = s.split(/\s+/).filter((w) => /^[a-z]/.test(w) && !NAME_PARTICLES.has(w));
  return lower.length ? "" : s;
}

/** "Visakhapatnam Today" -> "Visakhapatnam"; "Governance" is not a place. */
function cleanVenue(v: string): string {
  if (/^Dar\b/.test(v)) return "Dar es Salaam";
  v = v.replace(/,?\s+(?:Unveils|Launches|Says|Calls|Urges|Inaugurates|Reviews|Holds|Showcases|Highlights|Signs|Meets|Visits)$/, "");
  const out = clean(v.replace(/\s+(?:Today|Tomorrow|Highlights|World|Trade|Centre|Center|International|Convention|Mobile|Next|This|Under|From|During|On|To|As)$/i, ""));
  if (/\b(?:Bhavan|Bhawan|Era|Ecosystem|Citizen|Driving|Institute|Science|Sector|Region|Areas?|Field|Domain|Age)\b/i.test(out)) return "";
  return /^(?:Governance|Highlights|Today|Session|Summit|Conference|Meeting|Presence|Support|Partnership|Collaboration|Cooperation|Line|Light|View|AI|NER)$/i.test(out) ? "" : out;
}

const HONORIFIC =/^(?:Shri|Smt\.?|Sushri|Kumari|Mr\.?|Mrs\.?|Ms\.?)\s+/i;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const ref = (i: RawItem): Ref => ({ url: i.url, date: i.date, source: i.source });

// --- extractors (exported for tests) --------------------------------------------------------

const APPOINT_RE =
  /^(?:.*?\bcongratulates\s+)?(.+?)\s+(?:on being\s+)?(assumes charge|assumed charge|takes charge|took charge|takes over|took over|sworn in|appointed|elected|re-elected)\s+(?:as\s+)?(?:the\s+)?(?:new\s+)?(?:full-time\s+)?(.+)$/i;
/** A rank or office with no name ("Army Colonel", "New Chief"). */
const GENERIC_RANK = /^(?:(?:Army|Navy|Air|Military|Senior|New|Former|Chief|General|Colonel|Officer|Admiral|Marshal|President|Minister|Judge|Justice|Leader|Official)\s*)+$/i;
const NOT_A_PERSON =/\b(ministry|government|observers?|cabinet|newly|department|officials|board|committee|ECI|candidates|members|MPs|MLAs|team|holds|meeting|panel|appointed)\b/i;

export function extractAppointment(title: string): Omit<Appointment, keyof Ref> | null {
  for (const clause of title.split(/;\s*/)) {
    const m = APPOINT_RE.exec(clause.trim());
    if (!m) continue;
    // "Madagascar: Army Colonel …" -> after the colon; "Vice Admiral X, AVSM, NM" -> drop honours.
    const who = personName(m[1]!);
    let post = clean(m[3]!.split(/\s*(?:,\s*(?:says|said|calls|urges)|:|\s+-\s+|\s+–\s+)/)[0]!);
    post = post
      .replace(/\s+(?:today|on \d.*|in a ceremony.*|at a ceremony.*)$/i, "")
      .replace(/^unopposed\s+(?:to|as)\s+/i, "")
      .replace(/^(?:additional\s+)?charge\s+(?:of|as)\s+(?:the\s+)?/i, "");
    if (!who || words(who) > 7 || NOT_A_PERSON.test(who) || GENERIC_RANK.test(who)) continue;
    if (!post || post.length > 110 || words(post) < 1 || /^(?:by|to|in|on)\b/i.test(post)) continue;
    const v = m[2]!.toLowerCase();
    const verb = v.includes("sworn") ? "sworn" : v.includes("elected") ? "elected" : v.includes("appointed") ? "appointed" : "charge";
    return { who, post, verb };
  }
  return null;
}

const EXERCISE_STOP = new Set(["Commences", "Underway", "Begins", "Concludes", "Culminates", "Held", "Conducted", "To", "With", "In", "At", "Off", "Gets", "Kicks", "Starts", "Ends", "Opens", "Closes", "Edition", "Between", "Concluded", "Commenced", "Successfully"]);
const NOT_MILITARY = /revision exercise|exercise of|exercise (?:its|their|powers?)|mock|drill|pollution|evacuation|disaster|fire|census|mapping|consultation|survey|planning exercise/i;

export function extractExercise(title: string): Omit<Exercise, keyof Ref> | null {
  if (!/\bexercise\b/i.test(title) || NOT_MILITARY.test(title)) return null;
  let name: string | null = null;
  const quoted = /[‘'"“]([A-Z][A-Za-z0-9 -]{2,40}?)[’'"”]/.exec(title);
  // Only "Exercise (JAIMEX)" or "(JAIMEX) – 2025": other bracketed acronyms are units/agencies (RTAF, ICG…).
  const paren = /Exercise\s*\(([A-Z][A-Za-z]{3,})\)|\(([A-Z]{4,})\)\s*[-–]\s*20\d\d/.exec(title);
  const named = /\bExercise\s+([A-Z][A-Za-z]+)(?:\s+([A-Z][A-Za-z]+))?/.exec(title);
  if (quoted) name = quoted[1]!;
  else if (named && !EXERCISE_STOP.has(named[1]!)) name = named[2] && !EXERCISE_STOP.has(named[2]) && !/^\d/.test(named[2]) ? `${named[1]} ${named[2]}` : named[1]!;
  else if (paren) name = paren[1] ?? paren[2]!;
  if (!name) return null;
  name = clean(name.replace(/[-–\s]*(?:20\d\d|\d\d)$/, ""));
  if (name.length < 3 || /^(?:Joint|Military|Bilateral|Naval|Maritime|Air|Army|Navy|The)$/i.test(name)) return null;
  // "border with Pakistan" is a location, not a partner.
  const partners = countriesIn(title.replace(/\bborder with \w+/gi, ""));
  const venueMatch = [...title.matchAll(/\b(?:at|in|off)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g)]
    .map((m) => cleanVenue(m[1]!.replace(/\s+(?:Coast|From|On|To|With)$/, "")))
    .filter((v) => v && !/Exercise/i.test(v) && !countriesIn(v).length && !/^(?:India|October|November|December|January|February|March|April|May|June|July|August|September|The)/.test(v));
  return { name, partners, ...(venueMatch.length ? { venue: venueMatch.at(-1)! } : {}) };
}

const AWARD_WORD = /\b(?:Awards?|Prize|Puraskar|Ratna|Vibhushan|Bhushan|Samman|Fellowship)\b/;
const NOT_A_WIN = /prize pool|invites?|applications?|nominations?|felicitat|ceremony to|to be (?:held|presented|given)|to present|launch(?:es|ed)? (?:web|portal)|portal for|confer(?:s)? on|will receive/i;

export function extractAward(title: string): Omit<Award, keyof Ref> | null {
  if (!AWARD_WORD.test(title) || NOT_A_WIN.test(title)) return null;
  const a = /^(.+?)\s+(?:wins?|bags?|receives?|received|conferred with|honou?red with|awarded(?: the)?|clinch(?:es)?|selected for)\s+(?:the\s+)?(?:prestigious\s+|coveted\s+)?(.+?\b(?:Awards?|Prize|Puraskar|Ratna|Vibhushan|Bhushan|Samman|Fellowship)\b(?:\s+20\d\d)?(?:\s+(?:in|for)\s+(?:Physics|Chemistry|Medicine|Physiology or Medicine|Literature|Peace|Economics|Economic Sciences))?)/i.exec(title);
  if (a) {
    const winner = clean(a[1]!.replace(HONORIFIC, ""));
    const award = clean(a[2]!);
    // "First Prize", "Best Award" say nothing on their own.
    if (/^(?:the\s+)?(?:first|second|third|special|best|top|excellence)\s+(?:prize|award)s?$/i.test(award)) return null;
    if (words(winner) <= 9 && award.length <= 90 && !/^(?:Union|Minister|Ministry of)/.test(winner)) return { award, winner };
  }
  const b = /^(.+?\b(?:Award|Prize|Puraskar)\b.*?)\s+(?:conferred|presented|given)\s+(?:on|upon|to)\s+(.+)$/i.exec(title);
  if (b) {
    const winner = clean(b[2]!.replace(HONORIFIC, "").split(/[;,]/)[0]!);
    if (words(winner) <= 8) return { award: clean(b[1]!), winner };
  }
  return null;
}

export function extractDay(title: string): Omit<ImportantDay, keyof Ref> | null {
  // "International Day of Older Persons" / "World Day against …"
  const of = /\b((?:World|International|National|Global)\s+Day\s+(?:of|for|against|on)\s+(?:the\s+)?[A-Z][\w'’-]*(?:\s+(?:and|of|for|the|in|[A-Z][\w'’-]*)){0,5})/.exec(title);
  // "World Food Day" — at least one word between the prefix and "Day".
  const named = /\b((?:World|International|National|Global)\s+(?:[A-Z][\w'’-]*\s+){1,5}?Day)\b/.exec(title);
  const raw = (of ?? named)?.[1];
  if (!raw || /^(?:World|International|National|Global)\s+(?:Observes|Celebrates|Marks)\b/.test(raw)) return null;
  const day = raw.replace(/\s+(?:Today|Tomorrow|Celebrations?)$/, "").replace(/\s+(?:and|of|for|the|in)$/, "");
  const theme = /\btheme\s*[:\-–]?\s*[‘'"“]([^’'"”]{4,120})[’'"”]/i.exec(title);
  return { day, ...(theme ? { theme: clean(theme[1]!) } : {}) };
}

const BIG_FORUMS = /\b(?:G20|G7|SCO|BRICS|QUAD|Quad|ASEAN|East Asia|SAARC|BIMSTEC|COP\s?\d+|UNGA|UN General Assembly|World Health Assembly|IPU|Inter-Parliamentary|Commonwealth|AI Impact|Raisina|WTO|IMF|World Bank|Interpol|ICAO|ITU|UNESCO|FAO|Codex)\b/;
const EVENT_WORD = /\b(?:Summit|Conference|Assembly|Congress|Session|Meeting|Forum|Dialogue|Conclave|Ministerial)\b/;

export function extractSummit(title: string): Omit<Summit, keyof Ref> | null {
  if (!EVENT_WORD.test(title)) return null;
  const ord = /\b\d+(?:st|nd|rd|th)\b/i.exec(title);
  const forum = BIG_FORUMS.exec(title);
  if (!ord && !forum) return null;
  const start = Math.min(ord?.index ?? Infinity, forum?.index ?? Infinity);
  const tail = title.slice(start);
  const venue = /\s(?:in|at)\s+([A-Z][a-zA-Z]+(?:[ ,]+(?!on\b|from\b|to\b)[A-Z][a-zA-Z]+)?)/.exec(tail);
  if (!venue) return null;
  const before = tail.slice(0, venue.index);
  // The event name ends at its last keyword (+ "(ABBR)" / year); the venue must follow right after it.
  const end = [...before.matchAll(/\b(?:Summit|Conference|Assembly|Congress|Session|Meeting|Forum|Dialogue|Conclave|Ministerial)\b(?:\s*\([A-Za-z]+\))?(?:\s*[-–]?\s*(?:Plus|20\d\d))?/g)].at(-1);
  if (!end) return null;
  const endAt = end.index + end[0].length;
  if (before.length - endAt > 30) return null;
  let event = clean(before.slice(0, endAt));
  event = clean(event.replace(/\s*\([^)]*$/, ""));
  // Reject fragments such as "ITU) Host 'AI for Good Summit'".
  if (/^[^A-Za-z0-9]|\)/.test(event.replace(/\([A-Za-z]+\)/g, "")) || /\b(?:Hosts?|Attends?|Address(?:es)?|Leads?|Participates?|Joins?|Call|Discusses|Showcases|Highlights)\b/.test(event)) return null;
  // "44th Meeting" alone is not a recognisable event.
  if (event.length > 110 || words(event) < 3) return null;
  const place = cleanVenue(venue[1]!.replace(/,\s*$/, ""));
  if (!place || (/^(?:New Delhi|Delhi|India)$/.test(place) && !forum)) return null;
  return { event, venue: place };
}

export function extractAgreement(title: string): Omit<Agreement, keyof Ref> | null {
  if (!/\b(?:MoU|MoUs|Memorandum|agreement|pact|treaty)\b/i.test(title) || /Paris Agreement|trade agreement talks/i.test(title)) return null;
  if (!/\bIndia\b|\bIndian\b|\bCabinet\b/.test(title)) return null;
  if (!/\b(?:sign(?:s|ed)?|ink(?:s|ed)?|exchang(?:e|es|ed)|approves|conclude[sd]?)\b/i.test(title)) return null;
  const countries = countriesIn(title);
  if (countries.length !== 1) return null;
  const area = /\b(?:MoU|MoUs|Memorandum of Understanding|agreements?|pact|treaty)\b.*?\b(?:on|in|for|in the field of|on cooperation in)\s+(?:the\s+)?(?:field of\s+|area of\s+)?(?:cooperation in\s+)?(.+?)(?:\s+between\b|\s+with\b|;|$)/i.exec(title);
  if (!area) return null;
  const text = clean(area[1]!);
  if (text.length < 4 || text.length > 100 || countriesIn(text).length || /\bIndia\b|^(?:peace|the region|several|various|multiple|key|important)\b/i.test(text)) return null;
  return { country: countries[0]!, area: text };
}

export function extractSportsWin(title: string): Omit<SportsWin, keyof Ref> | null {
  const m = /^(.+?)\s+(?:wins?|clinch(?:es)?|bags?|claims?|secures?|lifts?|grabs?|won|clinched|bagged)\s+(?:a\s+|the\s+|her\s+|his\s+|their\s+|its\s+|maiden\s+|historic\s+|first\s+|second\s+|third\s+)*((?:gold|silver|bronze)(?:\s+medals?)?|(?:[A-Z][\w'’-]*\s+){0,5}(?:title|crown|trophy|Cup|championship))\b(?:\s+(?:at|in)\s+(?:the\s+)?([^;,:]+))?/i.exec(title);
  if (!m) return null;
  const who = clean(
    clean(m[1]!.replace(HONORIFIC, "").replace(/^India[’']s\s+/, "")).replace(
      /\s+(?:Makes History|Sets (?:a )?(?:New )?(?:World |National |Asian )?Record|Creates History|Scripts History)$/i,
      "",
    ),
  );
  // "Win Big at …", match reports ("India Edge Past Argentina 10–9 to Lift …").
  if (/\s(?:at|in)\s/i.test(m[2]!) || /\d|\b(?:beat|beats|edge|edges|past|defeat|defeats|thrash|thrashes)\b/i.test(who)) return null;
  if (words(who) > 8 || /\b(?:minister|ministry|government|PM|President)\b/i.test(who) || /Nobel|Award|Prize/i.test(title)) return null;
  return { who, feat: clean(m[2]!), ...(m[3] ? { event: clean(m[3]).slice(0, 90) } : {}) };
}

const LAUNCH_OBJECT = /\b(?:Scheme|Yojana|Mission|Portal|App|Application|Campaign|Initiative|Abhiyan|Abhiyaan|Platform|University|Programme|Program|Policy|Dashboard|Index|Framework|Guidelines)\b/i;

export function extractLaunch(item: RawItem, title: string): Omit<Launch, keyof Ref> | null {
  const m = /^(.+?)\s+(?:launches|launched|unveils|unveiled|rolls out|introduces)\s+(.+)$/i.exec(title);
  if (!m || !LAUNCH_OBJECT.test(m[2]!)) return null;
  const what = clean(m[2]!.split(/;\s*|\s+[–—-]\s+|:\s+|,\s+(?=a |an |the |to |which )/)[0]!.replace(/^the\s+/i, ""));
  if (what.length > 120 || /special campaign/i.test(what)) return null;
  // Only PIB groups are ministries (AIR groups are news categories).
  const by = item.source === "PIB" && item.group && item.group !== "Prime Minister's Office" ? item.group : clean(m[1]!.replace(HONORIFIC, ""));
  return { what, by };
}

// --- month --------------------------------------------------------------------------------

/** Lower-cased, punctuation-free key for de-duplicating near-identical rows. */
const key = (...parts: string[]) => parts.join("|").toLowerCase().replace(/[^a-z0-9|]+/g, "");
/** "Older Persons Day" and "Older Person Day" are the same day. */
const dayKey = (day: string) => key(day.replace(/s\b/g, ""));

export function extractMonth(raw: RawItem[]): MonthFacts {
  const out: MonthFacts = {
    appointments: [], exercises: [], awards: [], days: [], summits: [], agreements: [], sports: [], launches: [],
    cabinet: [], rankings: [], rbiPenalties: [], rbiLicences: [], oneLiners: [],
  };
  const seen = new Set<string>();
  const once = (k: string) => (seen.has(k) ? false : (seen.add(k), true));
  const used = new Set<string>();
  const dayDates = new Map<string, string[]>();
  const summitVenues = new Map<string, string[]>();
  // Oldest first, so the first (original) report of a fact is kept.
  const items = [...raw].sort((a, b) => a.date.localeCompare(b.date));

  for (const item of items) {
    const title = normaliseTitle(item.title);
    const r = ref(item);
    const mark = () => used.add(item.url);
    const add = <T,>(list: T[], row: T) => {
      list.push(row);
      mark();
    };

    if (item.source === "RBI") {
      const pen = /^RBI imposes (?:monetary )?penalty on (.+)$/i.exec(title);
      if (pen && once(key("pen", pen[1]!))) add(out.rbiPenalties, { ...r, text: clean(pen[1]!) });
      const lic = /^RBI cancels (?:the )?(?:certificate of registration|licen[cs]e) of (.+)$/i.exec(title);
      if (lic && once(key("lic", lic[1]!))) add(out.rbiLicences, { ...r, text: clean(lic[1]!) });
    }

    const ap = extractAppointment(title);
    if (ap && once(key("ap", ap.who))) add(out.appointments, { ...r, ...ap });

    const ex = extractExercise(title);
    if (ex) {
      const prev = out.exercises.find((e) => key(e.name) === key(ex.name));
      if (prev) {
        for (const p of ex.partners) if (!prev.partners.includes(p)) prev.partners.push(p);
        prev.venue ??= ex.venue;
      } else out.exercises.push({ ...r, ...ex });
      mark();
    }

    const aw = extractAward(title);
    if (aw && once(key("aw", aw.award, aw.winner))) add(out.awards, { ...r, ...aw });

    const day = extractDay(title);
    if (day) {
      const prev = out.days.find((d) => dayKey(d.day) === dayKey(day.day));
      if (!prev) {
        out.days.push({ ...r, ...day });
        dayDates.set(dayKey(day.day), [r.date]);
      } else {
        prev.theme ??= day.theme;
        dayDates.get(dayKey(day.day))!.push(r.date);
      }
      mark();
    }

    const sm = extractSummit(title);
    if (sm) {
      // "AI Impact Summit 2026" and "AI Impact Summit" are one event; collect every reported venue.
      const k = key("sm", sm.event.replace(/\b20\d\d\b/g, ""));
      if (!summitVenues.has(k)) out.summits.push({ ...r, ...sm, venue: "" });
      summitVenues.set(k, [...(summitVenues.get(k) ?? []), sm.venue]);
      mark();
    }

    const ag = extractAgreement(title);
    if (ag && once(key("ag", ag.country, ag.area))) add(out.agreements, { ...r, ...ag });

    if (item.group === "Sports" || item.group === "Ministry of Youth Affairs and Sports" || /\b(?:medal|championship|Cup|Olympi|Games)\b/i.test(title)) {
      const sp = extractSportsWin(title);
      if (sp && once(key("sp", sp.who, sp.feat))) add(out.sports, { ...r, ...sp });
    }

    const la = extractLaunch(item, title);
    if (la && once(key("la", la.what.slice(0, 40)))) add(out.launches, { ...r, ...la });

    const cab = /^Cabinet approves\s+(.+)$/i.exec(title);
    if (cab && once(key("cab", cab[1]!))) add(out.cabinet, { ...r, text: clean(cab[1]!) });

    if (/\bIndia\b/.test(title) && /\b(?:rank(?:s|ed)?|position|place)\b/i.test(title) && /\b\d+(?:st|nd|rd|th)\b/.test(title) && once(key("rk", title))) {
      out.rankings.push({ ...r, text: title });
      mark();
    }
  }

  // A day is mostly reported on the day itself (earlier releases announce it): use the most common date.
  for (const d of out.days) {
    const counts = new Map<string, number>();
    for (const x of dayDates.get(dayKey(d.day)) ?? []) counts.set(x, (counts.get(x) ?? 0) + 1);
    d.date = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]![0];
    const observed = fixedDayDate(d.day);
    if (observed) d.observed = observed;
  }
  out.days.sort((a, b) => a.date.localeCompare(b.date));

  // Side events (roadshows, curtain-raisers) happen elsewhere: the venue most reports name wins.
  for (const s of out.summits) {
    const venues = summitVenues.get(key("sm", s.event.replace(/\b20\d\d\b/g, ""))) ?? [s.venue];
    const counts = new Map<string, number>();
    for (const v of venues) counts.set(v, (counts.get(v) ?? 0) + 1);
    s.venue = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  }

  // Remaining exam-relevant headlines become topic-wise one-liners (newest first, capped).
  const perTopic = new Map<ExamTopic, number>();
  for (const item of [...items].reverse()) {
    if (used.has(item.url) || item.source === "RBI") continue;
    const title = normaliseTitle(item.title);
    const c = classifyHeadline(title);
    if (!c || title.length > 160 || !once(key("ol", title))) continue;
    const n = perTopic.get(c.topic) ?? 0;
    if (n >= 8) continue;
    perTopic.set(c.topic, n + 1);
    out.oneLiners.push({ ...ref(item), text: title, topic: c.topic });
  }
  return out;
}
