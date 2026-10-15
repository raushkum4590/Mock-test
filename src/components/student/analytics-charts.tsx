"use client";

/**
 * Student performance charts (Recharts).
 * Colour follows the dataviz method: categorical slots 1 (blue) and 2
 * (orange) from the validated reference palette (validator: all checks pass
 * on the light surface). One y-axis per chart; both trend series are
 * percentages on the same 0–100 scale. Single-series bar charts use slot 1
 * and no legend. Every chart has a table view.
 */
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SERIES_1 = "#2a78d6";
const SERIES_2 = "#eb6834";
const GRID = "#e6e9ee";
const AXIS = "#5b6675";

export type TrendPoint = { label: string; title: string; date: string; scorePct: number; accuracyPct: number };
export type BarPoint = { name: string; value: number; detail: string };

export function TrendChart({ data, labels }: { data: TrendPoint[]; labels: { score: string; accuracy: string; table: string } }) {
  const min = Math.min(0, ...data.map((d) => d.scorePct));
  return (
    <figure>
      <div className="h-64 w-full" role="img" aria-label={`${labels.score} / ${labels.accuracy}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis domain={[Math.floor(min / 10) * 10, 100]} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              formatter={(v, name) => [`${v ?? ""}%`, String(name ?? "")]}
              labelFormatter={(_l, payload) => {
                const p = payload?.[0]?.payload as TrendPoint | undefined;
                return p ? `${p.title} · ${p.date}` : "";
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="scorePct" name={labels.score} stroke={SERIES_1} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="accuracyPct" name={labels.accuracy} stroke={SERIES_2} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted">{labels.table}</summary>
        <table className="mt-2 w-full [&_td]:border-b [&_td]:border-border [&_td]:py-1 [&_th]:text-left">
          <thead>
            <tr>
              <th>#</th>
              <th />
              <th>{labels.score}</th>
              <th>{labels.accuracy}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>
                  {d.title} · {d.date}
                </td>
                <td>{d.scorePct}%</td>
                <td>{d.accuracyPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Horizontal single-series bar chart of percentages (0–100). */
export function PercentBars({ data, label, table }: { data: BarPoint[]; label: string; table: string }) {
  const height = Math.max(120, data.length * 36 + 30);
  return (
    <figure>
      <div style={{ height }} className="w-full" role="img" aria-label={label}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={8}>
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v, _n, item) => [`${v ?? ""}% (${(item?.payload as BarPoint | undefined)?.detail ?? ""})`, label]}
              cursor={{ fill: "#f1f4f8" }}
            />
            <Bar
              dataKey="value"
              name={label}
              fill={SERIES_1}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              isAnimationActive={false}
              label={{ position: "right", fill: AXIS, fontSize: 12, formatter: (v: unknown) => `${v}%` }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted">{table}</summary>
        <table className="mt-2 w-full [&_td]:border-b [&_td]:border-border [&_td]:py-1">
          <tbody>
            {data.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>{d.value}%</td>
                <td className="text-muted">{d.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
