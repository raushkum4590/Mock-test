/**
 * Prints every capsule page (each month + the yearly edition) and every subject
 * guide to an A4 PDF in
 * public/capsules/ and records them in src/data/current-affairs/pdfs.json, which
 * turns on the "Download PDF" buttons.
 *
 *   npm run dev            (in another terminal)
 *   npx tsx scripts/current-affairs/pdf.ts [baseUrl]
 *
 * Uses Playwright's Chromium (`npx playwright install chromium`), or the browser
 * at CHROMIUM_PATH, or Microsoft Edge / Chrome installed on the machine.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "playwright-core";
import { CAPSULE_MONTHS } from "../../src/data/current-affairs";
import { SUBJECT_GUIDES } from "../../src/lib/study-material/subject-guides";
import { COURSES } from "../../src/lib/learn/courses";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "public", "capsules");
const MANIFEST = path.join(process.cwd(), "src", "data", "current-affairs", "pdfs.json");

async function launch(): Promise<Browser> {
  if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  for (const channel of [undefined, "msedge", "chrome"] as const) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch {
      // try the next browser
    }
  }
  throw new Error("No Chromium found: run `npx playwright install chromium` or set CHROMIUM_PATH.");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  // [manifest key, page path, file name]
  const jobs: [string, string, string][] = [
    ...["year", ...CAPSULE_MONTHS.map((m) => m.month)].map(
      (id): [string, string, string] => [id, `/study-material/current-affairs/capsule/${id}`, `current-affairs-${id === "year" ? "yearly" : id}.pdf`],
    ),
    ...SUBJECT_GUIDES.map((g): [string, string, string] => [`guide:${g.id}`, `/study-material/subjects/${g.id}`, `guide-${g.id}.pdf`]),
    ...COURSES.map((c): [string, string, string] => [`learn:${c.id}`, `/study-material/learn/${c.id}/book`, `${c.id}-course.pdf`]),
  ];
  // ONLY=learn:computer-science (comma-separated keys) rebuilds just those PDFs.
  const only = process.env.ONLY?.split(",").map((s) => s.trim());
  const browser = await launch();
  const manifest: Record<string, string> = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  try {
    for (const [id, pagePath, file] of jobs) {
      if (only && !only.includes(id)) continue;
      const page = await browser.newPage();
      await page.goto(`${BASE}${pagePath}`, { waitUntil: "networkidle", timeout: 180_000 });
      // Collapsed practice sections must be open to appear in the PDF.
      await page.evaluate(() => document.querySelectorAll("details").forEach((d) => d.setAttribute("open", "")));
      await page.pdf({ path: path.join(OUT, file), preferCSSPageSize: true, printBackground: true });
      await page.close();
      manifest[id] = `/capsules/${file}`;
      console.log(`✓ ${file} (${Math.round(fs.statSync(path.join(OUT, file)).size / 1024)} KB)`);
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${only ? only.length : jobs.length} PDF(s); updated ${path.relative(process.cwd(), MANIFEST)}`);
}

void main();
