import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "@/app/(app)/actions";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <details className="group relative">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-full border border-border bg-surface py-1.5 pr-4 pl-1.5 [&::-webkit-details-marker]:hidden">
        <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium">{name}</span>
          <span className="block max-w-40 truncate text-xs text-muted">{email}</span>
        </span>
        <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl">
        <form action={signOut}>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-2">
            <LogOut className="size-4" aria-hidden />
            Logga ut
          </button>
        </form>
      </div>
    </details>
  );
}
