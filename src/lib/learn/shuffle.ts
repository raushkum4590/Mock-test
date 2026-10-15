/**
 * Questions are often written with the answer in the same slot; reorder the
 * options deterministically (seeded by an id) so answers spread over A–D but
 * stay identical between page loads and in PDFs.
 */
export function shuffleOptions<T extends { options: readonly string[]; answer: number }>(q: T, seed: string): T {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    const j = (h >>> 0) % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return { ...q, options: order.map((k) => q.options[k]!), answer: order.indexOf(q.answer) };
}
