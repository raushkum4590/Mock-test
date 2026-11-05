/**
 * Guest HTML live-coding mock test. Each question is graded in the browser by
 * parsing the candidate's code with DOMParser (scripts never run) and running
 * the checks against the resulting document. Marks per question are split
 * evenly across its checks.
 */

export type CodingCheck = { label: string; test: (doc: Document, src: string) => boolean };

export type CodingQuestion = {
  id: string;
  title: string;
  marks: number;
  /** Task description, one requirement per line. */
  task: string[];
  starter: string;
  checks: CodingCheck[];
};

export const HTML_MOCK_TITLE = "HTML Live Coding — Mock Test 1";
export const HTML_MOCK_MINUTES = 30;

const text = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const all = (doc: Document, sel: string) => Array.from(doc.querySelectorAll(sel));

export const HTML_MOCK_QUESTIONS: CodingQuestion[] = [
  {
    id: "q1",
    title: "Basic page structure",
    marks: 20,
    task: [
      "Start the document with the HTML5 doctype.",
      'Set the language of the <html> element to English ("en").',
      'Give the page the title "My First Page".',
      'Inside the body, add a main heading (h1) that says "Hello World".',
      "Below the heading, add one paragraph introducing yourself.",
    ],
    starter: "<!-- Write a complete HTML5 page here -->\n",
    checks: [
      { label: "Starts with <!DOCTYPE html>", test: (_d, src) => /^\s*(<!--[\s\S]*?-->\s*)*<!doctype\s+html\s*>/i.test(src) },
      { label: '<html lang="en">', test: (d) => d.documentElement.getAttribute("lang")?.toLowerCase().startsWith("en") ?? false },
      { label: 'Title is "My First Page"', test: (d) => text(d.querySelector("head > title")) === "My First Page" },
      { label: 'Exactly one h1 reading "Hello World"', test: (d) => all(d, "h1").length === 1 && text(d.querySelector("h1")) === "Hello World" },
      { label: "A non-empty paragraph after the h1", test: (d) => !!d.querySelector("h1 ~ p") && text(d.querySelector("h1 ~ p")).length > 0 },
    ],
  },
  {
    id: "q2",
    title: "Lists",
    marks: 20,
    task: [
      'Add an h2 heading "Fruits" followed by an unordered list of at least 3 fruits.',
      'Add an h2 heading "Steps" followed by an ordered list with exactly 3 steps.',
      "Make the second fruit contain a nested unordered list with 2 varieties of it.",
    ],
    starter: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>Lists</title>\n</head>\n<body>\n\n</body>\n</html>\n",
    checks: [
      { label: 'h2 "Fruits" followed by a <ul>', test: (d) => all(d, "h2").some((h) => text(h) === "Fruits" && h.nextElementSibling?.tagName === "UL") },
      {
        label: "Fruits list has at least 3 items",
        test: (d) => {
          const h = all(d, "h2").find((x) => text(x) === "Fruits");
          const ul = h?.nextElementSibling;
          return ul?.tagName === "UL" && ul.querySelectorAll(":scope > li").length >= 3;
        },
      },
      { label: 'h2 "Steps" followed by an <ol>', test: (d) => all(d, "h2").some((h) => text(h) === "Steps" && h.nextElementSibling?.tagName === "OL") },
      { label: "Steps list has exactly 3 items", test: (d) => all(d, "ol").some((ol) => ol.querySelectorAll(":scope > li").length === 3) },
      {
        label: "Second fruit has a nested <ul> with 2 items",
        test: (d) => {
          const h = all(d, "h2").find((x) => text(x) === "Fruits");
          const li = h?.nextElementSibling?.querySelectorAll(":scope > li")[1];
          return li?.querySelectorAll(":scope > ul > li").length === 2;
        },
      },
    ],
  },
  {
    id: "q3",
    title: "Links and images",
    marks: 20,
    task: [
      'Add a link with the text "Visit Example" that points to https://example.com.',
      "The link must open in a new tab and use rel=\"noopener\" for safety.",
      "Add an image with src \"logo.png\", a meaningful alt text, and a width of 200.",
      'Add a link with the text "Email us" that opens a mail to info@edqity.com.',
    ],
    starter: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>Links</title>\n</head>\n<body>\n\n</body>\n</html>\n",
    checks: [
      { label: 'Link "Visit Example" → https://example.com', test: (d) => all(d, "a").some((a) => text(a) === "Visit Example" && /^https:\/\/example\.com\/?$/.test(a.getAttribute("href") ?? "")) },
      { label: 'Opens in new tab (target="_blank")', test: (d) => all(d, 'a[href*="example.com"]').some((a) => a.getAttribute("target") === "_blank") },
      { label: 'Has rel="noopener"', test: (d) => all(d, 'a[href*="example.com"]').some((a) => (a.getAttribute("rel") ?? "").split(/\s+/).includes("noopener")) },
      { label: 'Image logo.png with alt text and width="200"', test: (d) => all(d, 'img[src="logo.png"]').some((i) => (i.getAttribute("alt") ?? "").trim().length > 0 && i.getAttribute("width") === "200") },
      { label: 'Link "Email us" → mailto:info@edqity.com', test: (d) => all(d, "a").some((a) => text(a) === "Email us" && (a.getAttribute("href") ?? "").toLowerCase() === "mailto:info@edqity.com") },
    ],
  },
  {
    id: "q4",
    title: "Tables",
    marks: 20,
    task: [
      'Create a table with the caption "Student Marks".',
      "Put a header row inside <thead> with three th cells: Name, Subject, Marks.",
      "Put at least 3 data rows inside <tbody>, each with 3 td cells.",
      'Add a <tfoot> row whose first cell says "Total" and spans 2 columns.',
    ],
    starter: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>Table</title>\n</head>\n<body>\n\n</body>\n</html>\n",
    checks: [
      { label: 'Caption "Student Marks"', test: (d) => text(d.querySelector("table > caption")) === "Student Marks" },
      { label: "thead with th: Name, Subject, Marks", test: (d) => all(d, "table thead th").map((th) => text(th)).join("|") === "Name|Subject|Marks" },
      { label: "tbody has at least 3 rows", test: (d) => all(d, "table tbody > tr").length >= 3 },
      { label: "Every tbody row has 3 td cells", test: (d) => { const rows = all(d, "table tbody > tr"); return rows.length > 0 && rows.every((r) => r.querySelectorAll(":scope > td").length === 3); } },
      { label: 'tfoot "Total" cell with colspan="2"', test: (d) => all(d, "table tfoot td, table tfoot th").some((c) => text(c) === "Total" && c.getAttribute("colspan") === "2") },
    ],
  },
  {
    id: "q5",
    title: "Registration form",
    marks: 20,
    task: [
      'Build a form that submits to "/register" using the POST method.',
      'Add a required email field with id "email" and a <label> linked to it.',
      'Add a password field with id "password" that needs at least 8 characters.',
      'Add a <select> named "course" with at least 3 options.',
      'Add a submit button that says "Register".',
    ],
    starter: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>Form</title>\n</head>\n<body>\n\n</body>\n</html>\n",
    checks: [
      { label: 'form action="/register" method="post"', test: (d) => all(d, "form").some((f) => f.getAttribute("action") === "/register" && (f.getAttribute("method") ?? "").toLowerCase() === "post") },
      {
        label: 'Required email input #email with a linked label',
        test: (d) => {
          const i = d.querySelector('form input#email[type="email"]');
          return !!i && i.hasAttribute("required") && (!!d.querySelector('label[for="email"]') || i.closest("label") !== null);
        },
      },
      { label: 'Password input #password with minlength ≥ 8', test: (d) => { const i = d.querySelector('form input#password[type="password"]'); return !!i && Number(i.getAttribute("minlength")) >= 8; } },
      { label: 'select name="course" with ≥ 3 options', test: (d) => (d.querySelector('form select[name="course"]')?.querySelectorAll("option").length ?? 0) >= 3 },
      {
        label: 'Submit button "Register"',
        test: (d) =>
          all(d, "form button").some((b) => text(b) === "Register" && (b.getAttribute("type") ?? "submit") === "submit") ||
          all(d, 'form input[type="submit"]').some((i) => i.getAttribute("value") === "Register"),
      },
    ],
  },
];

export type CheckResult = { label: string; passed: boolean };
export type QuestionResult = { id: string; score: number; marks: number; checks: CheckResult[] };

/** Grades one answer. Needs a browser (DOMParser). */
export function gradeHtml(q: CodingQuestion, src: string): QuestionResult {
  const doc = new DOMParser().parseFromString(src, "text/html");
  const checks = q.checks.map((c) => {
    let passed = false;
    try {
      passed = src.trim().length > 0 && c.test(doc, src);
    } catch {
      passed = false;
    }
    return { label: c.label, passed };
  });
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * q.marks * 10) / 10;
  return { id: q.id, score, marks: q.marks, checks };
}
