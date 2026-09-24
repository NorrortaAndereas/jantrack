import type { Metadata } from "next";
import { setMedicationActive } from "@/app/(app)/actions";
import { AddMedicationForm } from "@/components/forms/medication-form";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { getMedications } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Medicin" };

export default async function MedicationPage() {
  const user = await requireUser();
  const meds = await getMedications(user.id);

  return (
    <>
      <Topbar title="Medicin" description="Aktiva mediciner dyker upp i din dagliga incheckning." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Dina mediciner" />
          {meds.length === 0 ? (
            <p className="mt-4 text-ink-2">Du har inte lagt till några mediciner.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {meds.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    {m.dose && <p className="text-sm text-muted">{m.dose}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {!m.active && <Badge>Pausad</Badge>}
                    <form action={setMedicationActive}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="active" value={String(!m.active)} />
                      <button className="min-h-11 rounded-full px-4 text-sm font-medium text-primary hover:bg-primary-soft">
                        {m.active ? "Pausa" : "Återaktivera"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Lägg till medicin" />
          <div className="mt-6">
            <AddMedicationForm />
          </div>
        </Card>
      </div>
    </>
  );
}
