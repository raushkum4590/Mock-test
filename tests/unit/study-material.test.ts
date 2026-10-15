import { describe, expect, it } from "vitest";
import { chapterUrl, filterNcertBooks, fullBookUrl, NCERT_BOOKS } from "@/lib/study-material/ncert";
import { findPattern } from "@/lib/exam-patterns";
import { EXAM_KITS } from "@/lib/study-material/exam-kits";
import { SUBJECT_GUIDES } from "@/lib/study-material/subject-guides";
import { classifyHeadline, splitOnKeyword } from "@/lib/study-material/exam-view";
import { chapterTitle, NCERT_CHAPTERS } from "@/lib/study-material/ncert-chapters";
import { NEWS_SOURCES } from "@/lib/study-material/resources";
import { parseFeedDate, parseRss } from "@/lib/study-material/rss";

describe("NCERT catalogue", () => {
  it("builds official chapter and full-book URLs", () => {
    expect(chapterUrl("kehs1", 1)).toBe("https://ncert.nic.in/textbook/pdf/kehs101.pdf");
    expect(chapterUrl("kegy2", 14)).toBe("https://ncert.nic.in/textbook/pdf/kegy214.pdf");
    expect(fullBookUrl("lhhs1")).toBe("https://ncert.nic.in/textbook/pdf/lhhs1dd.zip");
  });

  it("has unique ids and codes, valid code shapes and at least one medium", () => {
    const ids = new Set<string>();
    const codes = new Set<string>();
    const classLetter = { 6: "f", 7: "g", 8: "h", 9: "i", 10: "j", 11: "k", 12: "l" } as Record<number, string>;
    for (const b of NCERT_BOOKS) {
      expect(ids.has(b.id), b.id).toBe(false);
      ids.add(b.id);
      expect(b.en || b.hi, b.id).toBeTruthy();
      for (const [medium, ed] of [["e", b.en], ["h", b.hi]] as const) {
        if (!ed) continue;
        expect(codes.has(ed.code), ed.code).toBe(false);
        codes.add(ed.code);
        expect(ed.code, b.id).toMatch(new RegExp(`^${classLetter[b.cls]}${medium}[a-z]{2}\\d$`));
        expect(ed.chapters).toBeGreaterThan(0);
        expect(ed.chapters).toBeLessThan(21);
      }
    }
  });

  it("filters by class, subject and medium", () => {
    const c12History = filterNcertBooks({ cls: 12, subject: "history", medium: "en" });
    expect(c12History.map((b) => b.en!.code)).toEqual(["lehs1", "lehs2", "lehs3"]);
    expect(filterNcertBooks({ medium: "en" }).every((b) => b.en)).toBe(true);
    expect(filterNcertBooks({ cls: 8, medium: "hi" }).some((b) => b.id === "8-ss-2")).toBe(false);
  });
});

describe("NCERT chapter titles", () => {
  it("cover every book and match its chapter count", () => {
    for (const b of NCERT_BOOKS) {
      const titles = NCERT_CHAPTERS[b.id];
      expect(titles, b.id).toBeDefined();
      const counts = [b.en?.chapters, b.hi?.chapters].filter(Boolean);
      expect(counts, b.id).toContain(titles!.length);
      for (const [en, hi] of titles!) {
        expect(en.trim(), b.id).toBe(en);
        expect(hi, b.id).toMatch(/[ऀ-ॿ]/);
      }
    }
    expect(Object.keys(NCERT_CHAPTERS).every((id) => NCERT_BOOKS.some((b) => b.id === id))).toBe(true);
  });

  it("returns the title in the edition's language", () => {
    expect(chapterTitle("jess3", 1)).toBe("The Rise of Nationalism in Europe");
    expect(chapterTitle("jhss3", 1)).toBe("यूरोप में राष्ट्रवाद का उदय");
    expect(chapterTitle("hhss1", 5)).toBe("जब जनता बग़ावत करती है: 1857 और उसके बाद");
    expect(chapterTitle("leps1", 7)).toBe("Globalisation");
    // Hindi edition has a different chapter count, so no guessed titles.
    expect(chapterTitle("lhps1", 1)).toBeNull();
    expect(chapterTitle("zzzz1", 1)).toBeNull();
  });
});

describe("exam view classifier", () => {
  const topic = (t: string) => classifyHeadline(t)?.topic ?? null;

  it("sorts real headlines into exam topics (English and Hindi)", () => {
    expect(topic("RBI Announces Regulatory Measures for the Foreign Exchange Market")).toBe("banking");
    expect(topic("Defence Minister Rajnath Singh addresses Exercise Tarang Shakti 2026 in Rajasthan")).toBe("defence");
    expect(topic("भारतीय नौसेना अपने स्वदेशी पनडुब्बी रोधी युद्धपोत 'मंगरोल' को बेड़े में शामिल करेगी")).toBe("defence");
    expect(topic("भारत 6G एलायंस ने तीसरे अंतरराष्ट्रीय भारत 6G संगोष्ठी 2026 में वैश्विक साझेदारी मजबूत की")).toBe("science");
    expect(topic("Putul Sonowal assures country’s first ever medal at World Bowls Champion of Champions")).toBe("sports");
    expect(topic("India slams Pakistan at UN, reiterates J&K is an integral and inalienable part of the country")).toBe("international");
    expect(topic("Election Commission sets limits on Form-7 applications to curb bulk filing")).toBe("polity");
  });

  it("drops routine news", () => {
    expect(topic("IMD forecasts heavy rainfall over Bihar, Karnataka, Himachal Pradesh & Jammu-Kashmir")).toBeNull();
    expect(topic("Indian Railways cancels several trains arriving at New Delhi")).toBeNull();
    expect(topic("प्रधानमंत्री ने महालया के अवसर पर शुभकामनाएं दीं")).toBeNull();
    expect(topic("Auction of 91-Day, 182-Day and 364-Day Treasury Bills")).toBeNull();
    expect(topic("PM Modi to visit Chennai on October 11")).toBeNull();
  });

  it("matches acronyms case-sensitively", () => {
    expect(topic("Union minister discusses the act of kindness")).toBeNull();
    expect(topic("Parliament passes the Waqf Act amendment")).toBe("polity");
  });

  it("splits the title around the matched keyword", () => {
    expect(splitOnKeyword("Defence Minister visits", "Defence")).toEqual(["", "Defence", " Minister visits"]);
    expect(splitOnKeyword("no match", "x")).toEqual(["no match", "", ""]);
  });
});

describe("exam kits", () => {
  it("BPSC TRE CS kit points every NCERT ref at a real chapter with a title", () => {
    const kit = EXAM_KITS.find((k) => k.id === "bpsc-tre-computer-science")!;
    expect(findPattern(kit.patternId)).toBeDefined();
    const cs = kit.parts.find((p) => p.id === "cs")!;
    expect(cs.questions).toBe(80);
    const refs = kit.parts.flatMap((p) => p.topics.flatMap((t) => t.refs));
    const ncert = refs.filter((r) => r.kind === "ncert");
    expect(ncert.length).toBeGreaterThan(10);
    // Links into the CS guide point at real modules.
    const guideCs = SUBJECT_GUIDES.find((g) => g.id === "computer-science")!;
    const guideLinks = refs.filter((r) => r.url.startsWith("/study-material/subjects/computer-science#m"));
    expect(guideLinks.length).toBeGreaterThan(8);
    for (const r of guideLinks) {
      const n = Number(r.url.split("#m")[1]);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(guideCs.modules.length);
      expect(r.label).toContain(guideCs.modules[n - 1]!.title.en);
    }
    for (const r of ncert) {
      expect(r.url).toMatch(/^https:\/\/ncert\.nic\.in\/textbook\/pdf\/(kecs1|lecs1|keip1|leip1)\d\d\.pdf$/);
      expect(r.label).toMatch(/Ch \d+: \S/);
    }
    for (const r of refs.filter((x) => x.kind === "app")) expect(r.url).toMatch(/^\//);
    expect(kit.plan.map((p) => p.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("subject guides", () => {
  it("have unique ids, modules with topics/tips and valid chapter links", () => {
    expect(new Set(SUBJECT_GUIDES.map((g) => g.id)).size).toBe(SUBJECT_GUIDES.length);
    expect(SUBJECT_GUIDES.map((g) => g.id)).toEqual(expect.arrayContaining(["computer-science", "history", "geography", "polity", "economy", "science", "maths", "reasoning"]));
    for (const g of SUBJECT_GUIDES) {
      expect(g.modules.length, g.id).toBeGreaterThanOrEqual(7);
      for (const m of g.modules) {
        expect(m.topics.length, m.title.en).toBeGreaterThan(0);
        expect(m.tip.hi, m.title.en).toMatch(/[ऀ-ॿ]/);
        for (const r of m.refs) {
          if (r.kind === "ncert") {
            expect(r.url).toMatch(/^https:\/\/ncert\.nic\.in\/textbook\/pdf\/[a-l][eh][a-z]{2}\d\d\d\.pdf$/);
            expect(r.label.en, r.url).not.toMatch(/Chapter \d+$/);
            if (r.hiUrl) expect(r.hiUrl).toMatch(/^https:\/\/ncert\.nic\.in\/textbook\/pdf\/[a-l]h[a-z]{2}\d\d\d\.pdf$/);
          } else if (r.kind === "app") expect(r.url).toMatch(/^\//);
          else expect(r.url).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("Computer Science modules carry hot topics and well-formed practice MCQs", () => {
    const cs = SUBJECT_GUIDES.find((g) => g.id === "computer-science")!;
    const mcqs = cs.modules.flatMap((m) => m.mcqs ?? []);
    expect(mcqs.length).toBeGreaterThanOrEqual(60);
    expect(new Set(mcqs.map((q) => q.id)).size).toBe(mcqs.length);
    for (const q of mcqs) {
      expect(new Set(q.options).size, q.q).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.explain.length, q.q).toBeGreaterThan(5);
    }
    for (const m of cs.modules) expect(m.hot?.length, m.title.en).toBeGreaterThan(0);
    // Answers are spread over A–D (no single letter gets more than 40%).
    const byLetter = [0, 1, 2, 3].map((k) => mcqs.filter((q) => q.answer === k).length);
    for (const n of byLetter) expect(n / mcqs.length).toBeLessThan(0.4);
    // Spot-check answers.
    const find = (start: string) => mcqs.find((q) => q.q.startsWith(start))!;
    expect(find("ARP is used to find").options[find("ARP is used to find").answer]).toBe("The MAC address from an IP address");
    expect(find("How many usable host").options[find("How many usable host").answer]).toBe("62");
    expect(find("Belady").options[find("Belady").answer]).toBe("FIFO");
  });

  it("Reasoning modules carry hot topics and well-formed practice MCQs", () => {
    const rs = SUBJECT_GUIDES.find((g) => g.id === "reasoning")!;
    const mcqs = rs.modules.flatMap((m) => m.mcqs ?? []);
    expect(mcqs.length).toBeGreaterThanOrEqual(50);
    expect(new Set(mcqs.map((q) => q.id)).size).toBe(mcqs.length);
    for (const q of mcqs) {
      expect(new Set(q.options).size, q.q).toBe(4);
      expect(q.explain.length, q.q).toBeGreaterThan(5);
    }
    for (const m of rs.modules) expect(m.hot?.length, m.title.en).toBeGreaterThan(0);
    // Shuffling keeps the right answer attached.
    const find = (start: string) => mcqs.find((q) => q.q.startsWith(start))!;
    expect(find("2, 6, 12, 20").options[find("2, 6, 12, 20").answer]).toBe("42");
    expect(find("If south-east").options[find("If south-east").answer]).toBe("South-east");
    expect(find("In a row, A is 7th").options[find("In a row, A is 7th").answer]).toBe("33");
  });

  it("never links a Hindi PDF whose chapter order differs (Contemporary World Politics)", () => {
    const polity = SUBJECT_GUIDES.find((g) => g.id === "polity")!;
    const refs = polity.modules.flatMap((m) => m.refs).filter((r) => r.url.includes("leps1"));
    expect(refs.length).toBeGreaterThan(0);
    for (const r of refs) expect(r.hiUrl).toBeUndefined();
  });
});

describe("news sources", () => {
  it("are https and have an archive page", () => {
    for (const s of NEWS_SOURCES) {
      expect(s.archive).toMatch(/^https:\/\//);
      if (s.feed) expect(s.feed).toMatch(/^https:\/\//);
    }
  });
});

describe("RSS reader", () => {
  it("reads RBI-style items (CDATA, zone-less IST dates, &amp; in links)", () => {
    const xml = `<?xml version="1.0"?><rss><channel><title>RBI</title>
      <item><title><![CDATA[RBI announces special window]]></title><description><![CDATA[<p>long body</p>]]></description>
      <link>https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13738&amp;Mode=0</link><pubDate>Sat, 10 Oct 2026 01:25:00</pubDate></item>
    </channel></rss>`;
    const [item] = parseRss(xml);
    expect(item).toEqual({
      title: "RBI announces special window",
      url: "https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13738&Mode=0",
      publishedAt: new Date("2026-10-09T19:55:00.000Z"),
    });
  });

  it("reads AIR dates and items without dates (PIB)", () => {
    const xml = `<rss><channel>
      <item><title>Mahalaya Celebrated</title><link>https://newsonair.gov.in/x/</link><pubDate>10-10-2026 | 04:48 pm</pubDate></item>
      <item><title>बीकन से लैंडमार्क तक:</title><link>https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2321713</link></item>
    </channel></rss>`;
    const items = parseRss(xml);
    expect(items[0]!.publishedAt).toEqual(new Date("2026-10-10T11:18:00.000Z"));
    expect(items[1]).toMatchObject({ title: "बीकन से लैंडमार्क तक:", publishedAt: null });
  });

  it("drops items with unsafe or missing links and respects the limit", () => {
    const xml = `<rss>
      <item><title>bad</title><link>javascript:alert(1)</link></item>
      <item><title>none</title></item>
      <item><title>a &amp; b</title><link>https://a.gov.in/1</link></item>
      <item><title>c</title><link>https://a.gov.in/2</link></item>
    </rss>`;
    expect(parseRss(xml, 1)).toEqual([{ title: "a & b", url: "https://a.gov.in/1", publishedAt: null }]);
  });

  it("decodes double-encoded entities (AIR)", () => {
    const xml = `<rss><item><title>Telecom &amp;#038; ITU organise event</title><link>https://newsonair.gov.in/y/</link></item></rss>`;
    expect(parseRss(xml)[0]!.title).toBe("Telecom & ITU organise event");
  });

  it("keeps explicit time zones", () => {
    expect(parseFeedDate("Sat, 10 Oct 2026 01:25:00 GMT")).toEqual(new Date("2026-10-10T01:25:00.000Z"));
    expect(parseFeedDate("garbage")).toBeNull();
  });
});
