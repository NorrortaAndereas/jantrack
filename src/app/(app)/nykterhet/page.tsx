import type { Metadata } from "next";
import { Topbar } from "@/components/shell/topbar";
import { RestartSobrietyForm, StartSobrietyForm } from "@/components/forms/sobriety-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { TickProgress } from "@/components/ui/tick-progress";
import { MILESTONES } from "@/lib/constants";
import { daysBetween, formatFull, today } from "@/lib/dates";
import { getActiveSobriety, getSobrietyHistory } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Nykterhet" };

export default async function SobrietyPage() {
  const user = await requireUser();
  const now = today();
  const [active, history] = await Promise.all([
    getActiveSobriety(user.id),
    getSobrietyHistory(user.id),
  ]);
  const past = history.filter((p) => p.endedOn);

  return (
    <>
      <Topbar title="Nykterhet" description="Varje dag räknas." />

      <div className="grid gap-6 lg:grid-cols-2">
        {active.map((p) => {
          const next = MILESTONES.find((m) => m > p.days) ?? p.days + 365;
          const reached = MILESTONES.filter((m) => m <= p.days);
          return (
            <Card key={p.id}>
              <CardHeader title={p.substance} meta={`sedan ${formatFull(p.startedOn)}`} />
              <p className="mt-4 text-6xl font-semibold tracking-tight tabular-nums">
                {p.days}
                <span className="ml-2 text-2xl font-medium text-ink-2">{p.days === 1 ? "dag" : "dagar"}</span>
              </p>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-medium">
                  <span>Nästa milstolpe: {next} dagar</span>
                  <span className="text-muted">{next - p.days} kvar</span>
                </div>
                <TickProgress value={p.days / next} label={`Mot ${next} dagar`} />
              </div>
              {reached.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {reached.map((m) => (
                    <Badge key={m} tone="positive">
                      {m} d
                    </Badge>
                  ))}
                </div>
              )}
              <RestartSobrietyForm id={p.id} today={now} />
            </Card>
          );
        })}

        <Card>
          <CardHeader title={active.length ? "Följ något mer" : "Starta din räknare"} />
          <p className="mt-2 mb-6 text-ink-2">
            Välj vad du vill vara fri från och från vilken dag du räknar.
          </p>
          <StartSobrietyForm today={now} />
        </Card>
      </div>

      {past.length > 0 && (
        <Card>
          <CardHeader title="Tidigare perioder" />
          <ul className="mt-4 divide-y divide-border">
            {past.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span className="font-medium">{p.substance}</span>
                <span className="text-ink-2 tabular-nums">
                  {formatFull(p.startedOn)} – {formatFull(p.endedOn!)} ·{" "}
                  {daysBetween(p.startedOn, p.endedOn!)} dagar
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
