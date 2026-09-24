import { Sparkles } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { UserMenu } from "./user-menu";

export async function Topbar({ title, description }: { title: string; description?: string }) {
  const user = await requireUser();
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-ink-2">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/ai"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-on-primary shadow-[0_8px_24px_-8px_var(--primary)] transition-colors hover:bg-primary-hover"
        >
          <Sparkles className="size-4" aria-hidden />
          Fråga coachen
        </Link>
        <UserMenu name={user.name} email={user.email} />
      </div>
    </header>
  );
}
