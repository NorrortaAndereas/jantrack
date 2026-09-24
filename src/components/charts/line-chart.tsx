"use client";

import { useState } from "react";

export type LinePoint = { date: string; label: string; value: number | null };

type Props = {
  points: LinePoint[];
  domain: [number, number];
  ticks: number[];
  unit?: string;
  title: string;
  height?: number;
};

const fmt = (v: number, unit?: string) =>
  `${v.toLocaleString("sv-SE", { maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ""}`;

/**
 * Responsivt linjediagram: SVG:n skalas fritt (linjer har icke-skalande streck)
 * och all text ligger i HTML så att den aldrig förvrängs.
 */
export function LineChart({ points, domain, ticks, unit, title, height = 220 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [min, max] = domain;
  const n = points.length;
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - ((v - min) / (max - min || 1)) * 100;

  // Dela upp linjen där data saknas, så att luckor syns som luckor.
  const segments: { i: number; v: number }[][] = [];
  points.forEach((p, i) => {
    if (p.value == null) return;
    const last = segments.at(-1);
    if (last && last.at(-1)!.i === i - 1) last.push({ i, v: p.value });
    else segments.push([{ i, v: p.value }]);
  });

  const lastIndex = points.findLastIndex((p) => p.value != null);
  const xLabels = pickLabels(n, 5);
  const active = hover != null && points[hover]?.value != null ? hover : null;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const i = Math.round(Math.min(1, Math.max(0, ratio)) * (n - 1));
    // Hoppa till närmaste punkt med värde.
    let best: number | null = null;
    for (let d = 0; d < n; d++) {
      if (points[i - d]?.value != null) { best = i - d; break; }
      if (points[i + d]?.value != null) { best = i + d; break; }
    }
    setHover(best);
  }

  return (
    <figure className="w-full">
      <div className="flex gap-3">
        <div
          className="relative flex-1 touch-pan-y"
          style={{ height }}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-grid"
              style={{ top: `${y(t)}%` }}
              aria-hidden
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {segments.map((seg, k) => {
              const line = smoothPath(seg.map((p) => [x(p.i), y(p.v)]));
              const area =
                seg.length > 1
                  ? `${line} L${x(seg.at(-1)!.i)},100 L${x(seg[0].i)},100 Z`
                  : null;
              return (
                <g key={k}>
                  {area && <path d={area} fill="url(#line-fill)" />}
                  <path
                    d={line}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>

          {segments.some((s) => s.length === 1) &&
            segments
              .filter((s) => s.length === 1)
              .map((s) => <Dot key={s[0].i} left={x(s[0].i)} top={y(s[0].v)} small />)}

          {lastIndex >= 0 && active == null && (
            <Dot left={x(lastIndex)} top={y(points[lastIndex].value!)} />
          )}

          {active != null && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 border-l border-border"
                style={{ left: `${x(active)}%` }}
              />
              <Dot left={x(active)} top={y(points[active].value!)} />
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-border bg-surface px-3 py-2 text-sm whitespace-nowrap shadow-lg"
                style={{
                  left: `clamp(60px, ${x(active)}%, calc(100% - 60px))`,
                  top: `${y(points[active].value!)}%`,
                }}
              >
                <div className="text-muted">{points[active].label}</div>
                <div className="font-semibold tabular-nums">{fmt(points[active].value!, unit)}</div>
              </div>
            </>
          )}
        </div>

        <div className="relative w-10 shrink-0 text-sm text-muted tabular-nums" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(t)}%` }}>
              {fmt(t, unit)}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-3 mr-13 h-5 text-sm text-muted" aria-hidden>
        {xLabels.map((i, k) => (
          <span
            key={i}
            // På smala skärmar visas bara första, mittersta och sista datumet.
            className={`absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full ${
              k % 2 === 1 ? "max-sm:hidden" : ""
            }`}
            style={{ left: `${x(i)}%` }}
          >
            {points[i].label}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>{title}</caption>
          <tbody>
            {points
              .filter((p) => p.value != null)
              .map((p) => (
                <tr key={p.date}>
                  <th scope="row">{p.label}</th>
                  <td>{fmt(p.value!, unit)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

function Dot({ left, top, small = false }: { left: number; top: number; small?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute -translate-1/2 rounded-full bg-primary ring-2 ring-surface ${
        small ? "size-2" : "size-3"
      }`}
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  );
}

/** Monoton kubisk kurva (Fritsch–Carlson): mjuk men skjuter aldrig över datapunkterna. */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 3) return pts.map(([px, py], j) => `${j ? "L" : "M"}${px},${py}`).join(" ");
  const n = pts.length;
  const d = pts.slice(1).map(([px, py], i) => (py - pts[i][1]) / (px - pts[i][0]));
  const m = pts.map((_, i) =>
    i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2,
  );
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  let path = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = (x1 - x0) / 3;
    path += ` C${x0 + dx},${y0 + m[i] * dx} ${x1 - dx},${y1 - m[i + 1] * dx} ${x1},${y1}`;
  }
  return path;
}

function pickLabels(n: number, count: number): number[] {
  if (n === 0) return [];
  if (n <= count) return Array.from({ length: n }, (_, i) => i);
  return Array.from({ length: count }, (_, k) => Math.round((k * (n - 1)) / (count - 1)));
}
