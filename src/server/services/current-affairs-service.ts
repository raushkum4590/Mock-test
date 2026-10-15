/**
 * Live current-affairs headlines for the Study Material section, read from
 * official government RSS feeds (see NEWS_SOURCES). Each feed is cached for
 * 30 minutes; a feed that is down or slow is skipped, never breaking the page.
 */
import "server-only";
import { NEWS_SOURCES, type NewsSource } from "@/lib/study-material/resources";
import { parseRss, type FeedItem } from "@/lib/study-material/rss";
import { classifyHeadline, type ExamFact } from "@/lib/study-material/exam-view";

const REVALIDATE_SECONDS = 30 * 60;
const TIMEOUT_MS = 10_000;
// Some government sites reject requests without a browser-like user agent.
const USER_AGENT = "Mozilla/5.0 (compatible; EdQity study-material reader)";

export type SourceFeed = { source: NewsSource; items: FeedItem[]; ok: boolean };

async function readFeed(source: NewsSource, limit: number): Promise<SourceFeed> {
  if (!source.feed) return { source, items: [], ok: true };
  try {
    const res = await fetch(source.feed, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { source, items: [], ok: false };
    return { source, items: parseRss(await res.text(), limit), ok: true };
  } catch {
    return { source, items: [], ok: false };
  }
}

export async function getCurrentAffairs(limit = 15): Promise<SourceFeed[]> {
  return Promise.all(NEWS_SOURCES.filter((s) => s.feed).map((s) => readFeed(s, limit)));
}

export type ExamFactItem = FeedItem & ExamFact & { source: NewsSource };

/**
 * Exam-relevant headlines across the feeds, newest first. PIB's feed has no
 * dates; its items are newest-first, so they keep feed order at the top.
 */
export async function getExamFacts(feeds?: SourceFeed[]): Promise<ExamFactItem[]> {
  const all = feeds ?? (await getCurrentAffairs(30));
  const seen = new Set<string>();
  const facts: ExamFactItem[] = [];
  for (const { source, items } of all) {
    if (source.examView === false) continue;
    for (const item of items) {
      const key = item.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const fact = classifyHeadline(item.title);
      if (fact) facts.push({ ...item, ...fact, source });
    }
  }
  // Stable sort: undated (PIB) items stay first in feed order, then newest first.
  const time = (f: ExamFactItem) => f.publishedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return facts.sort((a, b) => time(b) - time(a));
}
