/**
 * Drawn figures for lessons (Venn diagrams, seating, walks, family trees …).
 * Plain SVG/HTML so they render on the server, scale on phones and print.
 */
import type { ReactNode } from "react";
import type { Block, CompassDir } from "@/lib/learn/types";

type Of<T extends Block["t"]> = Extract<Block, { t: T }>;

function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="avoid-break">
      <div className="overflow-x-auto rounded-xl border border-border bg-white p-3">{children}</div>
      {caption && <figcaption className="mt-1 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="mx-auto block h-auto w-full" style={{ maxWidth: w * 1.6 }}>
      {children}
    </svg>
  );
}

const TONES = [
  { area: "fill-sky-400/20 stroke-sky-600", text: "fill-sky-900" },
  { area: "fill-amber-400/25 stroke-amber-600", text: "fill-amber-900" },
  { area: "fill-emerald-400/20 stroke-emerald-600", text: "fill-emerald-900" },
  { area: "fill-rose-400/20 stroke-rose-600", text: "fill-rose-900" },
];

export function VennFigure({ block }: { block: Of<"venn"> }) {
  return (
    <Figure caption={block.caption}>
      <Svg w={200} h={120} label={`Venn diagram: ${block.circles.map((c) => c.label).join(", ")}`}>
        {block.circles.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} strokeWidth={1.5} className={TONES[i % TONES.length]!.area} />
        ))}
        {block.circles.map((c, i) => (
          <text key={i} x={c.x} y={c.y - c.r + 13} textAnchor="middle" fontSize={10} fontWeight={700} className={TONES[i % TONES.length]!.text}>
            {c.label}
          </text>
        ))}
      </Svg>
    </Figure>
  );
}

function Seat({ x, y, name, marked, round }: { x: number; y: number; name: string; marked: boolean; round: boolean }) {
  const cls = marked ? "fill-primary stroke-primary" : "fill-white stroke-slate-400";
  return (
    <g>
      {round ? <circle cx={x} cy={y} r={16} strokeWidth={1.5} className={cls} /> : <rect x={x - 18} y={y - 16} width={36} height={32} rx={6} strokeWidth={1.5} className={cls} />}
      <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} className={marked ? "fill-white" : "fill-slate-900"}>
        {name}
      </text>
    </g>
  );
}

export function SeatsFigure({ block }: { block: Of<"seats"> }) {
  const marked = new Set(block.mark ?? []);
  const n = block.seats.length;
  if (block.shape === "row") {
    const w = n * 48 + 24;
    const south = block.facing === "south";
    return (
      <Figure caption={block.caption}>
        <Svg w={w} h={112} label={`Row facing ${block.facing}: ${block.seats.join(", ")}`}>
          {block.seats.map((s, i) => {
            const x = 36 + i * 48;
            return (
              <g key={i}>
                <text x={x} y={22} textAnchor="middle" fontSize={14} className="fill-slate-500">
                  {south ? "↓" : "↑"}
                </text>
                <Seat x={x} y={50} name={s} marked={marked.has(s)} round={false} />
                <text x={x} y={80} textAnchor="middle" fontSize={9} className="fill-slate-500">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <text x={18} y={100} fontSize={9} className="fill-slate-600">
            ← left end (on paper)
          </text>
          <text x={w - 18} y={100} fontSize={9} textAnchor="end" className="fill-slate-600">
            {south ? "facing south: their right = your left" : "right end →"}
          </text>
        </Svg>
      </Figure>
    );
  }
  const cx = 120;
  const cy = 110;
  const R = 78;
  const inward = block.facing !== "out";
  return (
    <Figure caption={block.caption}>
      <Svg w={240} h={220} label={`Circle facing ${inward ? "the centre" : "outside"}, clockwise from the top: ${block.seats.join(", ")}`}>
        <circle cx={cx} cy={cy} r={R - 26} className="fill-slate-50 stroke-slate-300" strokeDasharray="3 3" />
        {block.seats.map((s, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          // Short tick showing which way the person faces.
          const d = inward ? -1 : 1;
          const x1 = x + d * 17 * Math.cos(a);
          const y1 = y + d * 17 * Math.sin(a);
          const x2 = x + d * 25 * Math.cos(a);
          const y2 = y + d * 25 * Math.sin(a);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} strokeLinecap="round" className="stroke-primary" />
              <Seat x={x} y={y} name={s} marked={marked.has(s)} round />
            </g>
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-slate-700">
          {inward ? "facing centre" : "facing outside"}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={9} className="fill-slate-600">
          {inward ? "left = clockwise ↻" : "left = anticlockwise ↺"}
        </text>
      </Svg>
    </Figure>
  );
}

const VEC: Record<CompassDir, [number, number]> = {
  N: [0, 1],
  NE: [Math.SQRT1_2, Math.SQRT1_2],
  E: [1, 0],
  SE: [Math.SQRT1_2, -Math.SQRT1_2],
  S: [0, -1],
  SW: [-Math.SQRT1_2, -Math.SQRT1_2],
  W: [-1, 0],
  NW: [-Math.SQRT1_2, Math.SQRT1_2],
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Where the end point lies from the start, in exam words. */
export function directionName(dx: number, dy: number) {
  const eps = 1e-9;
  if (Math.abs(dx) < eps && Math.abs(dy) < eps) return "at the start";
  const ns = Math.abs(dy) < eps ? "" : dy > 0 ? "north" : "south";
  const ew = Math.abs(dx) < eps ? "" : dx > 0 ? "east" : "west";
  return ns && ew ? `${ns}-${ew}` : ns || ew;
}

export function PathFigure({ block }: { block: Of<"path"> }) {
  const pts: [number, number][] = [[0, 0]];
  for (const m of block.moves) {
    const [x, y] = pts[pts.length - 1]!;
    const [ux, uy] = VEC[m.dir];
    pts.push([x + ux * m.dist, y + uy * m.dist]);
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const W = 260;
  const H = 210;
  const pad = 34;
  const sx = maxX - minX;
  const sy = maxY - minY;
  let k = Math.min(sx ? (W - 2 * pad) / sx : Infinity, sy ? (H - 2 * pad) / sy : Infinity);
  if (!Number.isFinite(k)) k = 1;
  const ox = (W - 2 * pad - sx * k) / 2;
  const oy = (H - 2 * pad - sy * k) / 2;
  const P = ([x, y]: [number, number]): [number, number] => [pad + ox + (x - minX) * k, H - pad - oy - (y - minY) * k];
  const screen = pts.map(P);
  const [ex, ey] = pts[pts.length - 1]!;
  const dist = round2(Math.hypot(ex, ey));
  const [s0, s1] = [screen[0]!, screen[screen.length - 1]!];

  return (
    <Figure caption={block.caption}>
      <Svg w={W} h={H} label={`Walk: ${block.moves.map((m) => `${m.dist} ${m.dir}`).join(", ")}; ends ${dist} ${directionName(ex, ey)} of the start`}>
        {/* compass */}
        <g transform={`translate(${W - 20} 22)`}>
          <line x1={0} y1={10} x2={0} y2={-8} strokeWidth={1.5} className="stroke-slate-500" />
          <polygon points="0,-12 -4,-5 4,-5" className="fill-slate-500" />
          <text x={0} y={22} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-slate-600">
            N
          </text>
        </g>
        {/* straight-line distance */}
        {dist > 0 && (
          <>
            <line x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]} strokeWidth={1.5} strokeDasharray="5 4" className="stroke-rose-500" />
            <text x={(s0[0] + s1[0]) / 2} y={(s0[1] + s1[1]) / 2 - 5} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-rose-600">
              {dist}
            </text>
          </>
        )}
        {screen.slice(1).map((b, i) => {
          const a = screen[i]!;
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const [ux, uy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
          const head = `${b[0]},${b[1]} ${b[0] - 9 * ux + 4 * uy},${b[1] - 9 * uy - 4 * ux} ${b[0] - 9 * ux - 4 * uy},${b[1] - 9 * uy + 4 * ux}`;
          // Label on the outer side of the segment.
          const [lx, ly] = [(a[0] + b[0]) / 2 + 10 * uy, (a[1] + b[1]) / 2 - 10 * ux];
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={2.5} strokeLinecap="round" className="stroke-primary" />
              <polygon points={head} className="fill-primary" />
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-slate-800">
                {block.moves[i]!.dist}
              </text>
            </g>
          );
        })}
        <circle cx={s0[0]} cy={s0[1]} r={5} className="fill-emerald-600" />
        <text x={s0[0]} y={s0[1] + 16} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-emerald-700">
          Start
        </text>
        <circle cx={s1[0]} cy={s1[1]} r={5} className="fill-rose-600" />
        <text x={s1[0]} y={s1[1] - 9} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-rose-700">
          End
        </text>
      </Svg>
      <p className="mt-2 text-center text-sm font-semibold text-rose-700">
        Shortest distance {dist} · end is {directionName(ex, ey)} of the start
      </p>
    </Figure>
  );
}

export function TreeFigure({ block }: { block: Of<"tree"> }) {
  const gens = Math.max(...block.people.map((p) => p.gen)) + 1;
  const byGen = Array.from({ length: gens }, (_, g) => block.people.filter((p) => p.gen === g));
  const W = Math.max(240, Math.max(...byGen.map((r) => r.length)) * 96);
  const H = gens * 78 + 26;
  const pos = new Map<string, [number, number]>();
  byGen.forEach((row, g) => row.forEach((p, i) => pos.set(p.id, [((i + 0.5) * W) / row.length, 34 + g * 78])));

  return (
    <Figure caption={block.caption}>
      <Svg w={W} h={H} label={`Family tree of ${block.people.map((p) => p.id).join(", ")}`}>
        {block.links.map(([a, b, kind], i) => {
          const pa = pos.get(a);
          const pb = pos.get(b);
          if (!pa || !pb) return null;
          if (kind === "child") {
            const mid = (pa[1] + pb[1]) / 2;
            return <path key={i} d={`M${pa[0]} ${pa[1] + 18} V${mid} H${pb[0]} V${pb[1] - 18}`} fill="none" strokeWidth={1.5} className="stroke-slate-500" />;
          }
          if (kind === "spouse") {
            const [x1, x2] = pa[0] < pb[0] ? [pa[0] + 18, pb[0] - 18] : [pb[0] + 18, pa[0] - 18];
            return (
              <g key={i} className="stroke-rose-500" strokeWidth={1.5}>
                <line x1={x1} y1={pa[1] - 3} x2={x2} y2={pb[1] - 3} />
                <line x1={x1} y1={pa[1] + 3} x2={x2} y2={pb[1] + 3} />
              </g>
            );
          }
          const [x1, x2] = pa[0] < pb[0] ? [pa[0] + 18, pb[0] - 18] : [pb[0] + 18, pa[0] - 18];
          return <line key={i} x1={x1} y1={pa[1]} x2={x2} y2={pb[1]} strokeWidth={1.5} strokeDasharray="4 3" className="stroke-sky-600" />;
        })}
        {block.people.map((p) => {
          const [x, y] = pos.get(p.id)!;
          const cls = p.sex === "m" ? "fill-sky-50 stroke-sky-600" : p.sex === "f" ? "fill-rose-50 stroke-rose-500" : "fill-white stroke-slate-400";
          return (
            <g key={p.id}>
              {p.sex === "f" ? (
                <circle cx={x} cy={y} r={17} strokeWidth={2} className={cls} />
              ) : (
                <rect x={x - 17} y={y - 17} width={34} height={34} rx={p.sex === "?" ? 10 : 3} strokeWidth={2} strokeDasharray={p.sex === "?" ? "4 3" : undefined} className={cls} />
              )}
              <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-slate-900">
                {p.id}
              </text>
              {p.note && (
                // Notes go on the outer side so they never run off the right edge.
                <text x={x > W * 0.6 ? x - 22 : x + 22} y={y - 22} textAnchor={x > W * 0.6 ? "end" : "start"} fontSize={9} className="fill-slate-600">
                  {p.note}
                </text>
              )}
            </g>
          );
        })}
      </Svg>
      <p className="mt-2 text-center text-xs text-muted">□ male · ○ female · ═ married · ┈ siblings · │ next generation</p>
    </Figure>
  );
}

export function StackFigure({ block }: { block: Of<"stack"> }) {
  const marked = new Set(block.mark ?? []);
  const label = block.label ?? "Floor";
  const top = [...block.items].map((name, i) => ({ name, n: i + 1 })).reverse();
  return (
    <Figure caption={block.caption}>
      <div className="mx-auto max-w-xs">
        {top.map(({ name, n }) => (
          <div key={n} className="flex items-center gap-3 border-x-2 border-t-2 border-slate-300 last:border-b-2">
            <span className="w-20 shrink-0 border-r border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600">
              {label} {n}
            </span>
            <span className={`my-1 rounded-md px-3 py-1 text-sm font-bold ${marked.has(name) ? "bg-primary text-white" : "text-slate-900"}`}>{name}</span>
          </div>
        ))}
      </div>
    </Figure>
  );
}

export function SeriesFigure({ block }: { block: Of<"series"> }) {
  return (
    <Figure caption={block.caption}>
      <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-2 py-1">
        {block.terms.map((term, i) => (
          <div key={i} className="flex items-end gap-1">
            {i > 0 && (
              <div className="flex flex-col items-center px-0.5">
                <span className="text-xs font-bold text-primary">{block.gaps?.[i - 1] ?? ""}</span>
                <span aria-hidden className="text-slate-400">⟶</span>
              </div>
            )}
            <span
              className={`grid min-w-10 place-items-center rounded-lg px-2 py-2 font-mono text-base font-bold ${
                term === "?" ? "border-2 border-dashed border-amber-500 bg-amber-50 text-amber-700" : "border border-slate-300 bg-slate-50 text-slate-900"
              }`}
            >
              {term}
            </span>
          </div>
        ))}
      </div>
    </Figure>
  );
}

export function StepsFigure({ block }: { block: Of<"steps"> }) {
  return (
    <Figure caption={block.caption}>
      <div className="grid gap-2">
        {block.rows.map((r, i) => {
          const moved = new Set(r.moved ?? []);
          return (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500">{r.label}</span>
              {r.items.map((it, j) => (
                <span key={j} className={`rounded-md px-2 py-1 font-mono text-sm font-semibold ${moved.has(it) ? "bg-primary text-white" : "bg-slate-100 text-slate-800"}`}>
                  {it}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Figure>
  );
}
