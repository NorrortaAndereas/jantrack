"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Huvudmeny"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:sticky md:top-4 md:h-[calc(100dvh-2rem)] md:w-20 md:shrink-0 md:rounded-(--radius-card) md:border"
    >
      <div className="flex h-full items-center justify-around px-2 py-2 md:flex-col md:justify-start md:gap-3 md:py-6">
        <Link
          href="/"
          className="mb-4 hidden size-11 place-items-center rounded-2xl text-lg font-bold text-primary md:grid"
          aria-label="Jantrack – till översikten"
        >
          J
        </Link>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`group relative grid size-12 place-items-center rounded-2xl transition-colors ${
                active ? "bg-primary text-on-primary" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon className="size-5" aria-hidden />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
