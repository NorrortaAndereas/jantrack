"use client";

import { useActionState } from "react";
import { saveCheckIn, type FormState } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { MOOD_LABELS } from "@/lib/constants";
import type { DailyLog, Medication } from "@/db/schema";

type Props = {
  date: string;
  log: DailyLog | null;
  medications: Medication[];
  takenIds: number[];
};

export function CheckInForm({ date, log, medications, takenIds }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCheckIn, null);
  const sober = log?.sober == null ? "" : log.sober ? "yes" : "no";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="date" value={date} />

      <fieldset>
        <legend className="mb-3 font-medium">Har du varit nykter idag?</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["yes", "Ja"],
            ["no", "Nej"],
          ].map(([value, label]) => (
            <Choice key={value} name="sober" value={value} label={label} defaultChecked={sober === value} />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          Ett återfall är en del av många resor. Du kan starta om räknaren under Nykterhet.
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-medium">Hur mår du?</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <Choice
              key={v}
              name="mood"
              value={String(v)}
              label={`${v} · ${MOOD_LABELS[v]}`}
              defaultChecked={log?.mood === v}
            />
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="craving" className="font-medium">
          Sug <span className="font-normal text-muted">(0 = inget, 10 = mycket starkt)</span>
        </label>
        <input
          id="craving"
          name="craving"
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={log?.craving ?? 0}
          list="craving-ticks"
          className="block w-full"
        />
        <datalist id="craving-ticks">
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i} label={i % 5 === 0 ? String(i) : undefined} />
          ))}
        </datalist>
        <div className="flex justify-between text-sm text-muted" aria-hidden>
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sleepHours" className="font-medium">
            Sömn (timmar)
          </label>
          <input
            id="sleepHours"
            name="sleepHours"
            inputMode="decimal"
            pattern="\d{1,2}([.,]\d)?"
            defaultValue={log?.sleepHours ?? ""}
            className="field"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="weightKg" className="font-medium">
            Vikt (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            inputMode="decimal"
            pattern="\d{2,3}([.,]\d)?"
            defaultValue={log?.weightKg ?? ""}
            className="field"
          />
        </div>
      </div>

      {medications.length > 0 && (
        <fieldset>
          <legend className="mb-3 font-medium">Medicin</legend>
          <div className="space-y-2">
            {medications.map((m) => (
              <label
                key={m.id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 has-checked:border-primary has-checked:bg-primary-soft"
              >
                <input
                  type="checkbox"
                  name={`med-${m.id}`}
                  defaultChecked={takenIds.includes(m.id)}
                  className="size-5"
                />
                <span className="font-medium">{m.name}</span>
                {m.dose && <span className="text-sm text-muted">{m.dose}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-1.5">
        <label htmlFor="note" className="font-medium">
          Anteckningar
        </label>
        <textarea
          id="note"
          name="note"
          maxLength={10000}
          defaultValue={log?.note ?? ""}
          aria-describedby="note-help"
          className="field"
        />
        <p id="note-help" className="text-sm text-muted">
          Vad hände idag? Vad var svårt, vad gick bra?
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : log ? "Uppdatera incheckning" : "Spara incheckning"}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

function Choice({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border px-4 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-primary">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {label}
    </label>
  );
}
