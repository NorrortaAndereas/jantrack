import Link from "next/link";

/** Segmenterad kontroll som byter läge via URL:en (fungerar utan JavaScript). */
export function SegmentedLinks({
  label,
  options,
}: {
  label: string;
  options: { href: string; label: string; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className="inline-flex rounded-full bg-surface-2 p-1">
      {options.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          scroll={false}
          aria-current={o.active ? "true" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            o.active ? "bg-primary text-on-primary" : "text-ink-2 hover:text-ink"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}
