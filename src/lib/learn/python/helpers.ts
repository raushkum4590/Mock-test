import type { Block } from "../types";
export { src } from "../dsa/helpers";

/** A Python example. `output` is exactly what the program prints (every example is run to check it). */
export const py = (title: string, code: string, output?: string, note?: string): Block => ({
  t: "code",
  lang: "python",
  title,
  code,
  ...(output !== undefined ? { output } : {}),
  ...(note ? { note } : {}),
});
