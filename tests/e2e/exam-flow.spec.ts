import { expect, test, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";
import { CREDS_FILE } from "./global-setup";
import { utcToZonedInput } from "../../src/lib/time/zone";

/**
 * The mandatory first-milestone demonstration, in real browsers against the
 * production server and a real PostgreSQL database:
 *
 * Admin creates exam → publishes schedule → candidate logs in → waits →
 * server starts the exam automatically → candidate answers (EN + HI) →
 * answers are saved → official timer expires → server auto-submits →
 * result appears in the admin dashboard.
 */
const TZ = "Asia/Kolkata";

async function ok<T>(res: Awaited<ReturnType<APIRequestContext["post"]>>): Promise<T> {
  if (!res.ok()) throw new Error(`${res.status()} ${await res.text()}`);
  return (await res.json()) as T;
}

test("scheduled exam: automatic start, answering, automatic submission, result", async ({ browser }) => {
  const admin = JSON.parse(readFileSync(CREDS_FILE, "utf8")) as { username: string; password: string };
  const run = Date.now().toString(36).toUpperCase();

  // ---- Admin: log in through the UI --------------------------------------------
  const adminCtx = await browser.newContext();
  const ap = await adminCtx.newPage();
  ap.on("dialog", (d) => void d.accept());
  await ap.goto("/admin/login");
  await ap.getByLabel("Username").fill(admin.username);
  await ap.getByLabel("Password").fill(admin.password);
  await ap.getByRole("button", { name: "Sign in" }).click();
  await expect(ap.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // ---- Admin: create the exam through the UI form ---------------------------------
  await ap.goto("/admin/exams");
  await ap.getByLabel("Exam code").fill(`E2E-${run}`);
  await ap.getByLabel("Title (English)").fill(`E2E Mock ${run}`);
  await ap.getByLabel("Title (Hindi)").fill(`ई2ई मॉक ${run}`);
  await ap.getByRole("button", { name: "Create exam" }).click();
  await ap.waitForURL(/\/admin\/exams\/[0-9a-f-]{36}$/);
  const examId = ap.url().split("/").pop()!;

  // Section + two bilingual questions through the API (same session cookie).
  const api = ap.request;
  const { id: sectionId } = await ok<{ id: string }>(
    await api.post(`/api/exams/${examId}/sections`, {
      data: { code: "GA", titleEn: "General Awareness", titleHi: "सामान्य जागरूकता", subject: "General Awareness", marksCorrect: 2, marksWrong: 0.5 },
    }),
  );
  const qIds: string[] = [];
  for (const [i, q] of [
    { en: "Which planet is known as the Red Planet?", hi: "किस ग्रह को लाल ग्रह कहा जाता है?", opts: [["Venus", "शुक्र"], ["Mars", "मंगल"], ["Jupiter", "बृहस्पति"], ["Mercury", "बुध"]], correct: 1 },
    { en: "The chemical symbol of sodium is:", hi: "सोडियम का रासायनिक प्रतीक है:", opts: [["So", "So"], ["Sd", "Sd"], ["Na", "Na"], ["S", "S"]], correct: 2 },
  ].entries()) {
    const { id } = await ok<{ id: string }>(
      await api.post("/api/questions", {
        data: {
          code: `E2E-${run}-${i + 1}`,
          subject: "General Awareness",
          textEn: q.en,
          textHi: q.hi,
          options: q.opts.map(([en, hi], j) => ({ textEn: en, textHi: hi, isCorrect: j === q.correct })),
        },
      }),
    );
    qIds.push(id);
  }
  await ok(await api.post(`/api/sections/${sectionId}/questions`, { data: { questionIds: qIds } }));
  await ap.reload();
  await ap.getByRole("button", { name: "Mark READY" }).click();
  await expect(ap.getByText("READY").first()).toBeVisible();

  // Candidate.
  const roll = `R${run}`;
  const candPassword = "Cand@1234";
  await ok(await api.post("/api/candidates", { data: { rollNumber: roll, fullName: "E2E Candidate", password: candPassword } }));

  // ---- Admin: schedule through the UI (start ≥ 40 s ahead, 1-minute exam) ---------------
  const now = Date.now();
  const loginOpens = new Date(Math.floor(now / 60_000) * 60_000);
  const start = new Date(Math.ceil((now + 40_000) / 60_000) * 60_000);
  await ap.goto("/admin/schedules");
  await ap.getByRole("combobox", { name: "Exam", exact: true }).selectOption(examId);
  await ap.getByRole("textbox", { name: "Title", exact: true }).fill(`E2E sitting ${run}`);
  await ap.getByLabel(/Login opens/).fill(utcToZonedInput(loginOpens, TZ));
  await ap.getByLabel(/Scheduled start/).fill(utcToZonedInput(start, TZ));
  await ap.getByLabel("Duration (minutes)").fill("1");
  await ap.getByLabel(/Late entry window/).fill("1");
  await ap.getByRole("button", { name: "Create schedule" }).click();
  await ap.waitForURL(/\/admin\/schedules\/[0-9a-f-]{36}$/);
  const scheduleId = ap.url().split("/").pop()!;
  const candidates = await ok<{ candidates: { id: string; rollNumber: string }[] }>(await api.get(`/api/candidates?q=${roll}`));
  await ok(await api.post(`/api/schedules/${scheduleId}/assignments`, { data: { candidateIds: [candidates.candidates[0]!.id] } }));
  await ap.reload();
  await ap.getByRole("button", { name: "Lock schedule" }).click();
  await expect(ap.getByRole("button", { name: "Publish" })).toBeVisible();
  await ap.getByRole("button", { name: "Publish" }).click();
  // Login is already open, so the scheduler moves it to WAITING on its own.
  await expect(ap.getByRole("heading", { name: /E2E sitting/ }).getByText(/PUBLISHED|WAITING/)).toBeVisible();

  // ---- Candidate: log in, read instructions, wait ---------------------------------
  const candCtx = await browser.newContext();
  const cp = await candCtx.newPage();
  await cp.goto("/login");
  await cp.getByTestId("mode-centre").click(); // practice is the default tab
  await cp.getByLabel("Roll Number").fill(roll);
  await cp.getByLabel("Password").fill(candPassword);
  await cp.getByRole("button", { name: "Sign In" }).click();
  await expect(cp.getByText(`E2E Mock ${run}`)).toBeVisible();
  await cp.getByRole("link", { name: "Proceed" }).click();
  await cp.getByRole("checkbox").check();
  await cp.getByRole("button", { name: "I am ready to begin" }).click();
  await expect(cp.getByText("Please wait. The examination will begin automatically.")).toBeVisible();
  await expect(cp.getByTestId("start-countdown")).toBeVisible();
  // No questions are reachable before the start.
  const early = await cp.request.post("/api/attempts/start", { data: { scheduleId, language: "en" } });
  expect(early.status()).toBe(409);

  // ---- Server starts the exam at the scheduled time; the screen opens by itself -------
  await cp.waitForURL(/\/candidate\/exam\//, { timeout: 150_000 });
  await expect(cp.getByTestId("question-text")).toHaveText("Which planet is known as the Red Planet?");
  await cp.getByTestId("option-B").click();
  await expect(cp.getByTestId("save-status")).toContainText("Saved");
  await expect(cp.getByTestId("palette-1")).toHaveAttribute("data-state", "ANSWERED");
  await cp.getByTestId("save-next").click();

  // Switch to Hindi: same question identity, answers untouched.
  await cp.getByRole("button", { name: "हिन्दी" }).click();
  await expect(cp.getByTestId("question-text")).toHaveText("सोडियम का रासायनिक प्रतीक है:");
  await cp.getByTestId("option-A").click(); // wrong on purpose (−0.5)
  await expect(cp.getByTestId("save-status")).toContainText("सहेजा गया");
  await expect(cp.getByTestId("palette-1")).toHaveAttribute("data-state", "ANSWERED");

  // ---- Official time expires; server auto-submits; confirmation shown ---------------
  await cp.waitForURL(/\/candidate\/submission\//, { timeout: 150_000 });
  await expect(cp.getByTestId("submission-confirmed")).toBeVisible({ timeout: 30_000 });
  await expect(cp.getByText(/आधिकारिक समय समाप्त होने पर स्वतः|automatically at the end of the official time/)).toBeVisible();

  // ---- Result appears in the admin dashboard ------------------------------------------
  await ap.goto(`/admin/results/${scheduleId}`);
  const row = ap.getByRole("row", { name: new RegExp(roll) });
  await expect(row).toContainText("AUTO_SUBMITTED");
  await expect(row).toContainText("1.5 / 4"); // +2 correct, −0.5 wrong
  await expect(ap.getByText("Mock examination results — not official SSC results.")).toBeVisible();

  await candCtx.close();
  await adminCtx.close();
});
