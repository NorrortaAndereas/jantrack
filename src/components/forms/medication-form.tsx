"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMedication, type FormState } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function AddMedicationForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addMedication, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="med-name" className="text-sm font-medium">
            Namn
          </label>
          <input id="med-name" name="name" required maxLength={100} className="field" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="med-dose" className="text-sm font-medium">
            Dos <span className="font-normal text-muted">(valfritt)</span>
          </label>
          <input id="med-dose" name="dose" maxLength={100} placeholder="t.ex. 50 mg morgon" className="field" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          Lägg till medicin
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
