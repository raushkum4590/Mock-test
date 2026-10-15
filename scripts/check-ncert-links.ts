/**
 * Verifies the NCERT catalogue in src/lib/study-material/ncert.ts against
 * ncert.nic.in: every chapter PDF must exist and the chapter after the last
 * must not (catches books that gained or lost chapters).
 *
 *   npx tsx scripts/check-ncert-links.ts
 *
 * Uses 8-byte range requests, so it downloads almost nothing. ncert.nic.in is
 * slow; expect a few minutes.
 */
import { chapterUrl, NCERT_BOOKS, type NcertEdition } from "../src/lib/study-material/ncert";

const UA = "Mozilla/5.0 (compatible; EdQity link checker)";

async function exists(url: string): Promise<boolean | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Range: "bytes=0-7" }, signal: AbortSignal.timeout(45_000) });
      await res.arrayBuffer().catch(() => undefined);
      if (res.status === 404) return false;
      if (res.ok) return (res.headers.get("content-type") ?? "").includes("pdf");
    } catch {
      // retry
    }
  }
  return null;
}

async function check(ed: NcertEdition): Promise<string[]> {
  const problems: string[] = [];
  for (let n = 1; n <= ed.chapters; n++) {
    const ok = await exists(chapterUrl(ed.code, n));
    if (ok === false) problems.push(`${ed.code}: chapter ${n} missing`);
    if (ok === null) problems.push(`${ed.code}: chapter ${n} unreachable (network)`);
  }
  if ((await exists(chapterUrl(ed.code, ed.chapters + 1))) === true) problems.push(`${ed.code}: has more than ${ed.chapters} chapters`);
  return problems;
}

async function main() {
  const editions = NCERT_BOOKS.flatMap((b) => [b.en, b.hi].filter((e): e is NcertEdition => !!e));
  const problems: string[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < editions.length) {
        const ed = editions[next++]!;
        const p = await check(ed);
        console.log(p.length ? `✗ ${ed.code}` : `✓ ${ed.code} (${ed.chapters})`);
        problems.push(...p);
      }
    }),
  );
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(`\nAll ${editions.length} editions OK.`);
}

void main();
