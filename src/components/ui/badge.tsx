const tones = {
  positive: "bg-positive-soft text-positive-ink",
  primary: "bg-primary-soft text-primary",
  neutral: "bg-surface-2 text-ink-2",
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
