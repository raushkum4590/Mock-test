import type { Block, CodeLang } from "../types";

/**
 * Tagged template for source code: keeps backslashes as written (\n stays \n),
 * and trims the first newline and trailing whitespace. Code must not contain
 * backticks or "${", so JavaScript examples use + instead of template strings.
 */
export const src = (s: TemplateStringsArray) => String.raw(s).replace(/^\r?\n/, "").replace(/\s+$/, "");

/** A program written in all five course languages, with the output every version prints. */
export const multi = (title: string, code: Record<CodeLang, string>, output: string, note?: string): Block => ({
  t: "multicode",
  title,
  code,
  output,
  ...(note ? { note } : {}),
});
