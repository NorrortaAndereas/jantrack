/** Framstegsmätare i "streckstil" som i designen. */
export function TickProgress({
  value,
  label,
  tone = "primary",
  ticks = 48,
}: {
  value: number; // 0–1
  label: string;
  tone?: "primary" | "warning";
  ticks?: number;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  const filled = Math.round(clamped * ticks);
  const on = tone === "primary" ? "bg-primary" : "bg-warning";
  const off = tone === "primary" ? "bg-primary-track" : "bg-warning-track";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className="flex h-3.5 gap-[3px]"
    >
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} className={`flex-1 rounded-full ${i < filled ? on : off}`} />
      ))}
    </div>
  );
}
