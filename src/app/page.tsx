import { connection } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";

async function getOverview() {
  await connection();
  if (!db) return { status: "not-configured" as const };

  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(entries);
    const latest = await db.select().from(entries).orderBy(desc(entries.recordedAt)).limit(10);
    return { status: "ok" as const, count, latest };
  } catch (error) {
    console.error("Database query failed", error);
    return { status: "error" as const };
  }
}

export default async function Home() {
  const overview = await getOverview();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Jantrack</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Spara information och visualisera den på olika sätt.
      </p>

      <section className="mt-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Databas</h2>
        {overview.status === "not-configured" && (
          <p className="mt-2 text-amber-600">DATABASE_URL saknas – koppla Neon i Vercel.</p>
        )}
        {overview.status === "error" && (
          <p className="mt-2 text-red-600">Kunde inte läsa från databasen.</p>
        )}
        {overview.status === "ok" && (
          <>
            <p className="mt-2 text-emerald-600">Ansluten · {overview.count} poster</p>
            {overview.latest.length > 0 && (
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {overview.latest.map((entry) => (
                  <li key={entry.id} className="flex justify-between py-2 text-sm">
                    <span>
                      <span className="text-zinc-500">{entry.category}</span> · {entry.label}
                    </span>
                    <span className="tabular-nums">{entry.value ?? "–"}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
