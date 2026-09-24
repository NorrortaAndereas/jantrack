import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Card({
  className = "",
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={`rounded-(--radius-card) border border-border bg-surface p-6 sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  meta,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {meta && <span className="text-sm text-muted">{meta}</span>}
      </div>
      {children}
      {href && (
        <Link
          href={href}
          aria-label={hrefLabel ?? `Visa ${title.toLowerCase()}`}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-ink-2 transition-colors hover:bg-surface-2"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      )}
    </header>
  );
}
