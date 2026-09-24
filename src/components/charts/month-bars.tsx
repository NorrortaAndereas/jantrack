import { formatMonth } from "@/lib/dates";

type Bar = { month: string; count: number; current: boolean };

/** Kolumner per månad. Innevarande månad markeras, nästa månad visas skrafferad. */
export function MonthBars({ bars, unit }: { bars: Bar[]; unit: string }) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <figure>
      <ol className="flex h-36 items-end gap-2" aria-label={`${unit} per månad`}>
        {bars.map((b) => {
          const pct = Math.max(6, (b.count / max) * 82);
          return (
            <li key={b.month} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-xs font-medium text-ink-2 tabular-nums" aria-hidden>
                {b.count}
              </span>
              <span
                className={`block w-full rounded-t-2xl rounded-b-md transition-colors ${
                  b.current ? "bg-primary" : "bg-primary-soft group-hover:bg-primary-track"
                }`}
                style={{ height: `${pct}%` }}
              />
              <span className="sr-only">
                {formatMonth(b.month)}: {b.count} {unit}
              </span>
            </li>
          );
        })}
        <li className="hatch flex h-[70%] flex-1 rounded-t-2xl rounded-b-md border border-border" aria-hidden />
      </ol>
      <div className="mt-2 flex gap-2 text-center text-sm text-muted" aria-hidden>
        {bars.map((b) => (
          <span key={b.month} className={`flex-1 ${b.current ? "font-medium text-primary" : ""}`}>
            {formatMonth(b.month)}
          </span>
        ))}
        <span className="flex-1">Nästa</span>
      </div>
    </figure>
  );
}
