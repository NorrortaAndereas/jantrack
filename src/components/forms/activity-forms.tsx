"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMeeting, addWorkout, type FormState } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { FELLOWSHIPS } from "@/lib/constants";

function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function AddMeetingForm({ date }: { date: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addMeeting, null);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <input type="hidden" name="date" value={date} />
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
        <div className="space-y-1.5">
          <label htmlFor="fellowship" className="text-sm font-medium">
            Gemenskap
          </label>
          <select id="fellowship" name="fellowship" required defaultValue="AA" className="field">
            {FELLOWSHIPS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="meeting-name" className="text-sm font-medium">
            Möte <span className="font-normal text-muted">(valfritt)</span>
          </label>
          <input id="meeting-name" name="name" maxLength={200} className="field" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          Lägg till möte
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function AddWorkoutForm({ date }: { date: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addWorkout, null);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <input type="hidden" name="date" value={date} />
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <div className="space-y-1.5">
          <label htmlFor="activity" className="text-sm font-medium">
            Aktivitet
          </label>
          <input
            id="activity"
            name="activity"
            required
            maxLength={100}
            list="activity-suggestions"
            className="field"
          />
          <datalist id="activity-suggestions">
            {["Promenad", "Löpning", "Gym", "Cykling", "Simning", "Yoga"].map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="durationMin" className="text-sm font-medium">
            Minuter
          </label>
          <input id="durationMin" name="durationMin" inputMode="numeric" pattern="\d{1,4}" className="field" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          Lägg till träning
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
