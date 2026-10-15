import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { CREDS_FILE } from "./global-setup";

/**
 * Online mock-test milestone, in a real browser against the production
 * server and PostgreSQL:
 * Admin creates a mock test → student signs up/logs in → selects SSC CGL
 * mock → instructions → starts → questions + timer → answers save (and
 * survive a refresh) → submits (or the timer expires) → score and
 * explanations → attempt stored → test history updates.
 */
async function ok<T>(res: Awaited<ReturnType<APIRequestContext["post"]>>): Promise<T> {
  if (!res.ok()) throw new Error(`${res.status()} ${await res.text()}`);
  return (await res.json()) as T;
}

const run = Date.now().toString(36);

/** Admin creates + publishes a 2-question bilingual CGL mock through the UI and API. */
async function createPublishedTest(page: Page, opts: { slug: string; title: string; duration: number }) {
  const admin = JSON.parse(readFileSync(CREDS_FILE, "utf8")) as { username: string; password: string };
  page.on("dialog", (d) => void d.accept());
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(admin.username);
  await page.getByLabel("Password").fill(admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  const api = page.request;
  // Category (idempotent across runs).
  const cat = await api.post("/api/admin/categories", { data: { slug: "ssc-cgl", nameEn: "SSC CGL", nameHi: "एसएससी सीजीएल", position: 1 } });
  expect([201, 409]).toContain(cat.status());
  // This spec starts tests directly; start approval is covered by integration tests.
  await ok(await api.put("/api/admin/test-requests/settings", { data: { requireApproval: false } }));

  await page.goto("/admin/exams");
  await page.getByLabel("Exam code").fill(`ONL-${opts.slug}`.slice(0, 40).toUpperCase());
  await page.getByLabel("Title (English)").fill(opts.title);
  await page.getByLabel("Title (Hindi)").fill(`${opts.title} (हिंदी)`);
  await page.getByLabel("Default duration (minutes)").fill(String(opts.duration));
  await page.getByLabel(/Publish online for students/).check();
  await page.getByLabel("URL slug").fill(opts.slug);
  await page.getByRole("combobox", { name: "Exam category" }).selectOption({ label: "SSC CGL" });
  await page.getByRole("button", { name: "Create exam" }).click();
  await page.waitForURL(/\/admin\/exams\/[0-9a-f-]{36}$/);
  const examId = page.url().split("/").pop()!;

  const { id: sectionId } = await ok<{ id: string }>(
    await api.post(`/api/exams/${examId}/sections`, {
      data: { code: "QA", titleEn: "Quantitative Aptitude", titleHi: "मात्रात्मक योग्यता", subject: "Quantitative Aptitude", marksCorrect: 2, marksWrong: 0.5 },
    }),
  );
  const ids: string[] = [];
  for (const [i, q] of [
    { en: "What is 15% of 840?", hi: "840 का 15% कितना है?", opts: ["116", "126", "136", "146"], correct: 1, exEn: "840 × 15 ÷ 100 = 126.", exHi: "840 × 15 ÷ 100 = 126।" },
    { en: "If x + 1/x = 5, find x² + 1/x².", hi: "यदि x + 1/x = 5 है, तो x² + 1/x² ज्ञात कीजिए।", opts: ["21", "23", "25", "27"], correct: 1, exEn: "(x + 1/x)² − 2 = 23.", exHi: "(x + 1/x)² − 2 = 23।" },
  ].entries()) {
    const { id } = await ok<{ id: string }>(
      await api.post("/api/questions", {
        data: {
          code: `ONL-${Math.random().toString(36).slice(2, 10)}-${i}`,
          subject: "Quantitative Aptitude",
          topic: i === 0 ? "Percentage" : "Algebra",
          textEn: q.en,
          textHi: q.hi,
          explanationEn: q.exEn,
          explanationHi: q.exHi,
          options: q.opts.map((o, j) => ({ textEn: o, textHi: o, isCorrect: j === q.correct })),
        },
      }),
    );
    ids.push(id);
  }
  await ok(await api.post(`/api/sections/${sectionId}/questions`, { data: { questionIds: ids } }));
  // Paper is complete: mark READY (publishing requires it).
  await ok(await api.patch(`/api/exams/${examId}`, { data: { status: "READY" } }));
}

async function registerStudent(page: Page, email: string) {
  await page.goto("/student/register");
  await page.getByLabel("Full name").fill("Online Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Student#2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/\/student$/);
}

test("student flow: select CGL mock → instructions → answers saved across refresh → submit → score + explanations → history", async ({ browser }) => {
  const slug = `cgl-online-${run}`;
  const title = `CGL Online Mock ${run}`;
  const adminCtx = await browser.newContext();
  await createPublishedTest(await adminCtx.newPage(), { slug, title, duration: 30 });

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await registerStudent(page, `stu-${run}@example.com`);

  // Select the SSC CGL mock from the public site.
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("button", { name: "Exams" }).click();
  await nav.getByRole("link", { name: "SSC CGL", exact: true }).click();
  await page.getByRole("link", { name: new RegExp(title) }).first().click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.getByTestId("start-test").click();

  // Instructions, then the server creates the attempt.
  await expect(page.getByRole("heading", { name: "Instructions" })).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByTestId("begin-test").click();
  await page.waitForURL(/\/student\/attempts\/[0-9a-f-]{36}$/);

  // Questions and the server-derived timer appear.
  await expect(page.getByTestId("question-text")).toHaveText("What is 15% of 840?");
  await expect(page.getByTestId("timer")).toHaveText(/00:(29|30):\d\d/);
  await page.getByTestId("option-B").click();
  await expect(page.getByTestId("save-status")).toContainText("Saved");

  // Refresh: same attempt, answer restored, clock still running.
  await page.reload();
  await expect(page.getByTestId("palette-1")).toHaveAttribute("data-state", "ANSWERED");
  await page.getByTestId("save-next").click();

  // Hindi without losing answers.
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByTestId("question-text")).toHaveText("यदि x + 1/x = 5 है, तो x² + 1/x² ज्ञात कीजिए।");
  await page.getByTestId("option-A").click(); // wrong (−0.5)
  await expect(page.getByTestId("save-status")).toContainText("सहेजा गया");
  await expect(page.getByTestId("palette-1")).toHaveAttribute("data-state", "ANSWERED");

  // Manual submission with confirmation summary.
  await page.getByTestId("submit-exam").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByTestId("confirm-submit").click();
  await page.waitForURL(/\/result$/);

  // Score (+2 − 0.5 = 1.5 of 4) and explanations.
  await expect(page.getByTestId("final-score")).toHaveText("1.5 / 4");
  await expect(page.getByTestId("solution")).toHaveCount(2);
  await expect(page.getByText("(x + 1/x)² − 2 = 23")).toBeVisible();
  await expect(page.getByText(/मॉक रैंकिंग|Mock ranking only/)).toBeVisible();

  // Test history updated.
  await page.goto("/student/history");
  await expect(page.getByTestId("history-table")).toContainText(title);
  await expect(page.getByTestId("history-table")).toContainText("1.5 / 4");
  await ctx.close();
  await adminCtx.close();
});

test("timer expiry: the server auto-submits and the score appears", async ({ browser }) => {
  const slug = `cgl-timed-${run}`;
  const title = `CGL Timed Mock ${run}`;
  const adminCtx = await browser.newContext();
  await createPublishedTest(await adminCtx.newPage(), { slug, title, duration: 1 });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await registerStudent(page, `stu2-${run}@example.com`);
  await page.goto(`/student/tests/${slug}`);
  await page.getByRole("checkbox").check();
  await page.getByTestId("begin-test").click();
  await page.waitForURL(/\/student\/attempts\/[0-9a-f-]{36}$/);
  await page.getByTestId("option-B").click(); // correct (+2)
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  // No submit: wait for the official deadline.
  await page.waitForURL(/\/result$/, { timeout: 120_000 });
  await expect(page.getByTestId("final-score")).toHaveText("2 / 4", { timeout: 30_000 });
  await expect(page.getByText(/Auto-submitted/)).toBeVisible();
  await ctx.close();
  await adminCtx.close();
});
