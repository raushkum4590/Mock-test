import Papa from "papaparse";

export type CsvRow = Record<string, string>;

/** Parse CSV text with a header row. Header names are normalised to snake_case lower. */
export function parseCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const result = Papa.parse<CsvRow>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s-]+/g, "_"),
    transform: (v) => v.trim(),
  });
  return {
    rows: result.data,
    errors: result.errors.map((e) => `Row ${(e.row ?? 0) + 2}: ${e.message}`),
  };
}

const NUMERIC = /^-?\d+(\.\d+)?$/;

/**
 * Neutralise spreadsheet formula injection: a cell beginning with = + - @
 * (other than a plain number) is prefixed with an apostrophe.
 */
function safeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s) && !NUMERIC.test(s)) return `'${s}`;
  return s;
}

export function toCsv(columns: string[], rows: Record<string, unknown>[]): string {
  const data = rows.map((r) => columns.map((c) => safeCell(r[c])));
  // BOM so Excel opens UTF-8 (Devanagari) correctly.
  return "﻿" + Papa.unparse({ fields: columns, data }, { newline: "\r\n" });
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^A-Za-z0-9_.-]/g, "_")}"`,
      "Cache-Control": "no-store",
    },
  });
}
