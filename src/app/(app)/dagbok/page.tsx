import type { Metadata } from "next";
import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOOD_LABELS } from "@/lib/constants";
import { formatLong } from "@/lib/dates";
import { getJournal } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dagbok" };

export default async function JournalPage() {
  const user = await requireUser();
  const entries = await getJournal(user.id, 60);

  return (
    <>
      <Topbar title="Dagbok" description="Dina incheckningar och anteckningar, dag för dag." />
      {entries.length === 0 ? (
        <Card>
          <p className="font-medium">Dagboken är tom</p>
          <p className="mt-1 text-ink-2">Varje incheckning blir en sida här.</p>
          <ButtonLink href="/incheckning" className="mt-5">
            Checka in
          </ButtonLink>
        </Card>
      ) : (
        <ol className="space-y-4">
          {entries.map((e) => (
            <li key={e.id}>
              <Card className="!p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold capitalize">{formatLong(e.date)}</h2>
                  <Link
                    href={`/incheckning?datum=${e.date}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Redigera
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.sober != null && (
                    <Badge tone={e.sober ? "positive" : "neutral"}>{e.sober ? "Nykter" : "Inte nykter"}</Badge>
                  )}
                  {e.mood != null && <Badge tone="primary">Mående: {MOOD_LABELS[e.mood]}</Badge>}
                  {e.craving != null && <Badge>Sug {e.craving}/10</Badge>}
                  {e.sleepHours != null && <Badge>Sömn {e.sleepHours} h</Badge>}
                  {e.weightKg != null && <Badge>{e.weightKg} kg</Badge>}
                </div>
                {e.note && <p className="mt-4 whitespace-pre-line text-ink-2">{e.note}</p>}
              </Card>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
