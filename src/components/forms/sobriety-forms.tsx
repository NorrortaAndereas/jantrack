"use client";

import { useActionState } from "react";
import { restartSobriety, startSobriety, type FormState } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { SUBSTANCES } from "@/lib/constants";

export function StartSobrietyForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startSobriety, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="substance" className="text-sm font-medium">
            Fri från
          </label>
          <input
            id="substance"
            name="substance"
            required
            maxLength={60}
            list="substances"
            className="field"
          />
          <datalist id="substances">
            {SUBSTANCES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="startedOn" className="text-sm font-medium">
            Nykter sedan
          </label>
          <input
            id="startedOn"
            name="startedOn"
            type="date"
            required
            max={today}
            defaultValue={today}
            className="field"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          Starta räknare
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function RestartSobrietyForm({ id, today }: { id: number; today: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(restartSobriety, null);
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-ink">
        Jag har haft ett återfall
      </summary>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <div className="max-w-56 space-y-1.5">
          <label htmlFor={`restart-${id}`} className="text-sm font-medium">
            Ny startdag
          </label>
          <input
            id={`restart-${id}`}
            name="startedOn"
            type="date"
            required
            max={today}
            defaultValue={today}
            className="field"
          />
        </div>
        <p className="text-sm text-muted">Din historik sparas. Varje dag du har klarat räknas fortfarande.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="secondary" disabled={pending}>
            Starta om räknaren
          </Button>
          <FormMessage state={state} />
        </div>
      </form>
    </details>
  );
}
