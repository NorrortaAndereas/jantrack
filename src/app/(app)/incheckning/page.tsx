import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell, Users } from "lucide-react";
import { deleteMeeting, deleteWorkout } from "@/app/(app)/actions";
import { AddMeetingForm, AddWorkoutForm } from "@/components/forms/activity-forms";
import { CheckInForm } from "@/components/forms/check-in-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { Topbar } from "@/components/shell/topbar";
import { Card, CardHeader } from "@/components/ui/card";
import { addDays, formatLong, isValidDay, today } from "@/lib/dates";
import {
  getDailyLog,
  getIntakesOn,
  getMedications,
  getMeetingsOn,
  getWorkoutsOn,
} from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Incheckning" };

export default async function CheckInPage({ searchParams }: PageProps<"/incheckning">) {
  const user = await requireUser();
  const now = today();
  const requested = String((await searchParams).datum ?? "");
  const date = isValidDay(requested) && requested <= now ? requested : now;

  const [log, meds, intakes, dayMeetings, dayWorkouts] = await Promise.all([
    getDailyLog(user.id, date),
    getMedications(user.id, { activeOnly: true }),
    getIntakesOn(user.id, date),
    getMeetingsOn(user.id, date),
    getWorkoutsOn(user.id, date),
  ]);

  const title = date === now ? "Dagens incheckning" : "Incheckning";

  return (
    <>
      <Topbar title={title} description="Några minuter för dig själv, varje dag." />

      <nav aria-label="Välj dag" className="flex items-center gap-2">
        <Link
          href={`/incheckning?datum=${addDays(date, -1)}`}
          aria-label="Föregående dag"
          className="grid size-11 place-items-center rounded-full border border-border bg-surface hover:bg-surface-2"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <p className="min-w-48 text-center font-medium capitalize">{formatLong(date)}</p>
        {date < now ? (
          <Link
            href={`/incheckning?datum=${addDays(date, 1)}`}
            aria-label="Nästa dag"
            className="grid size-11 place-items-center rounded-full border border-border bg-surface hover:bg-surface-2"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span className="size-11" />
        )}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CheckInForm
            key={date}
            date={date}
            log={log}
            medications={meds}
            takenIds={intakes.filter((i) => i.taken).map((i) => i.medicationId)}
          />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Möten" meta={dayMeetings.length ? `${dayMeetings.length} st` : undefined} />
            <ItemList
              icon={Users}
              empty="Inga möten registrerade den här dagen."
              items={dayMeetings.map((m) => ({
                id: m.id,
                title: m.name ? `${m.fellowship} · ${m.name}` : `${m.fellowship}-möte`,
              }))}
              onDelete={deleteMeeting}
            />
            <div className="mt-6 border-t border-border pt-6">
              <AddMeetingForm key={date} date={date} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Träning" meta={dayWorkouts.length ? `${dayWorkouts.length} pass` : undefined} />
            <ItemList
              icon={Dumbbell}
              empty="Ingen träning registrerad den här dagen."
              items={dayWorkouts.map((w) => ({
                id: w.id,
                title: w.durationMin ? `${w.activity} · ${w.durationMin} min` : w.activity,
              }))}
              onDelete={deleteWorkout}
            />
            <div className="mt-6 border-t border-border pt-6">
              <AddWorkoutForm key={date} date={date} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function ItemList({
  icon: Icon,
  items,
  empty,
  onDelete,
}: {
  icon: React.ComponentType<{ className?: string }>;
  items: { id: number; title: string }[];
  empty: string;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  if (!items.length) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Icon className="size-4" />
          </span>
          <span className="flex-1 font-medium">{item.title}</span>
          <DeleteButton action={onDelete} id={item.id} label={`Ta bort ${item.title}`} />
        </li>
      ))}
    </ul>
  );
}
