import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Dumbbell, Pill, Sparkles, Users } from "lucide-react";
import { LineChart, type LinePoint } from "@/components/charts/line-chart";
import { MonthBars } from "@/components/charts/month-bars";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SegmentedLinks } from "@/components/ui/segmented-links";
import { TickProgress } from "@/components/ui/tick-progress";
import { METRICS, MILESTONES, RANGES, type MetricKey, type RangeKey } from "@/lib/constants";
import {
  addDays,
  eachDay,
  formatFull,
  formatShort,
  greeting,
  relativeDay,
  today,
} from "@/lib/dates";
import {
  countMeetings,
  countWorkouts,
  getActiveSobriety,
  getDailyLog,
  getDailyLogs,
  getRecentActivity,
  medicationAdherence,
  meetingsPerMonth,
  type ActivityItem,
} from "@/lib/data";
import type { DailyLog } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Översikt" };

const metricValue: Record<MetricKey, (l: DailyLog) => number | null> = {
  mood: (l) => l.mood,
  craving: (l) => l.craving,
  sleep: (l) => l.sleepHours,
  weight: (l) => l.weightKg,
};

export default async function Dashboard({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const params = await searchParams;
  const range: RangeKey = params.r && String(params.r) in RANGES ? (String(params.r) as RangeKey) : "1m";
  const metric: MetricKey =
    params.m && String(params.m) in METRICS ? (String(params.m) as MetricKey) : "mood";

  const now = today();
  const from = addDays(now, -(RANGES[range].days - 1));
  const weekAgo = addDays(now, -6);

  const [sobriety, logs, todayLog, meetingsInRange, workoutsInRange, adherence, weekMeetings, weekWorkouts, months, meetings90, activity] =
    await Promise.all([
      getActiveSobriety(user.id),
      getDailyLogs(user.id, from, now),
      getDailyLog(user.id, now),
      countMeetings(user.id, from),
      countWorkouts(user.id, from),
      medicationAdherence(user.id, from),
      countMeetings(user.id, weekAgo),
      countWorkouts(user.id, weekAgo),
      meetingsPerMonth(user.id, 6),
      countMeetings(user.id, addDays(now, -89)),
      getRecentActivity(user.id, 5),
    ]);

  const primary = sobriety.at(0);
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const points: LinePoint[] = eachDay(from, now).map((d) => {
    const log = byDate.get(d);
    return { date: d, label: formatShort(d), value: log ? metricValue[metric](log) : null };
  });
  const { domain, ticks } = scaleFor(metric, points);
  // Alla perioder är minst 30 dagar, så loggarna täcker redan senaste månaden.
  const checkIns30 = logs.filter((l) => l.date >= addDays(now, -29)).length;
  const weekLogs = logs.filter((l) => l.date >= weekAgo && l.mood != null);
  const weekMood = weekLogs.length
    ? weekLogs.reduce((s, l) => s + l.mood!, 0) / weekLogs.length
    : null;

  const href = (next: { r?: RangeKey; m?: MetricKey }) =>
    `/?r=${next.r ?? range}&m=${next.m ?? metric}`;

  return (
    <>
      <Topbar
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description="Så här har dina senaste dagar sett ut."
      />

      <div className="grid gap-6 xl:grid-cols-[1.85fr_1fr]">
        {/* Nykterhet + trend */}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {primary ? `Nykter från ${primary.substance.toLowerCase()}` : "Nykterhet"}
            </h2>
            <SegmentedLinks
              label="Tidsperiod"
              options={(Object.keys(RANGES) as RangeKey[]).map((r) => ({
                href: href({ r }),
                label: RANGES[r].label,
                active: r === range,
              }))}
            />
          </div>

          {primary ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-6xl font-semibold tracking-tight tabular-nums">
                {primary.days.toLocaleString("sv-SE")}
                <span className="ml-2 text-2xl font-medium text-ink-2">
                  {primary.days === 1 ? "dag" : "dagar"}
                </span>
              </p>
              <Badge tone="positive">sedan {formatFull(primary.startedOn)}</Badge>
              {sobriety.slice(1).map((p) => (
                <Badge key={p.id}>
                  {p.substance}: {p.days} d
                </Badge>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-ink-2">Starta en räknare för att följa dina nyktra dagar.</p>
              <ButtonLink href="/nykterhet" variant="secondary">
                Starta räknare
              </ButtonLink>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <SegmentedLinks
              label="Mått i diagrammet"
              options={(Object.keys(METRICS) as MetricKey[]).map((m) => ({
                href: href({ m }),
                label: METRICS[m].label,
                active: m === metric,
              }))}
            />
          </div>
          <div className="mt-6">
            {points.some((p) => p.value != null) ? (
              <LineChart
                points={points}
                domain={domain}
                ticks={ticks}
                unit={METRICS[metric].unit}
                title={`${METRICS[metric].label}, ${RANGES[range].label}`}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
            <Stat icon={Users} label="Möten" value={meetingsInRange} />
            <Stat
              icon={Dumbbell}
              label="Träningspass"
              value={workoutsInRange.n}
              detail={workoutsInRange.minutes ? `${workoutsInRange.minutes} min` : undefined}
            />
            <Stat
              icon={Pill}
              label="Medicin tagen"
              value={adherence == null ? "–" : `${Math.round(adherence * 100)} %`}
            />
          </dl>
        </Card>

        {/* Dagens läge */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-primary">
              <span className="size-2.5 rounded-full bg-primary" aria-hidden />
              Dagens läge
            </span>
            <span className="text-muted">{relativeDay(now)}</span>
          </div>
          <p className="mt-5 font-serif text-3xl leading-tight tracking-tight">
            {todayLog
              ? primary
                ? `Du har varit nykter i ${primary.days} ${primary.days === 1 ? "dag" : "dagar"}. Fortsätt så.`
                : "Tack för att du checkade in idag."
              : "Du har inte checkat in idag ännu."}
          </p>

          <p className="mt-6 text-sm text-muted">Senaste 7 dagarna</p>
          <ul className="mt-2 space-y-2.5">
            <WeekRow icon={Users} label="Möten" value={weekMeetings} />
            <WeekRow icon={Dumbbell} label="Träningspass" value={weekWorkouts.n} />
            <WeekRow
              icon={CalendarCheck}
              label="Snittmående"
              value={weekMood == null ? "–" : `${weekMood.toLocaleString("sv-SE", { maximumFractionDigits: 1 })} / 5`}
            />
          </ul>

          <div className="mt-6 rounded-3xl bg-primary-soft p-5">
            <p className="text-sm font-medium text-primary">Nästa steg</p>
            <NextStep checkedIn={!!todayLog} days={primary?.days} />
          </div>

          <p className="mt-auto flex items-center gap-2 pt-6 text-sm text-muted">
            <Sparkles className="size-4" aria-hidden />
            Personliga AI-reflektioner kommer här.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Möten" href="/incheckning" hrefLabel="Lägg till möte" />
          <p className="mt-5 text-4xl font-semibold tracking-tight tabular-nums">
            {months.at(-1)!.count}
            <span className="ml-2 text-base font-normal text-muted">denna månad</span>
          </p>
          <div className="mt-6">
            <MonthBars bars={months} unit="möten" />
          </div>
          <p className="mt-6 border-t border-border pt-4 text-sm text-ink-2">
            <span className="font-semibold text-ink tabular-nums">{meetings90}</span> möten de senaste
            90 dagarna.
          </p>
        </Card>

        <Card>
          <CardHeader title="Senaste aktivitet" href="/dagbok" hrefLabel="Visa dagboken" />
          <ActivityList items={activity} />
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Milstolpar" href="/nykterhet" hrefLabel="Visa nykterhet" />
          <ul className="mt-6 space-y-6">
            {sobriety.map((p) => {
              const next = MILESTONES.find((m) => m > p.days) ?? p.days + 365;
              return (
                <Goal
                  key={p.id}
                  label={`${p.substance}: ${next} dagar`}
                  value={p.days / next}
                  detail={`${p.days} av ${next} dagar · ${next - p.days} kvar`}
                />
              );
            })}
            <Goal
              label="90 möten på 90 dagar"
              value={meetings90 / 90}
              detail={`${meetings90} av 90 möten`}
            />
            <Goal
              label="Incheckningar senaste 30 dagarna"
              value={checkIns30 / 30}
              detail={`${checkIns30} av 30 dagar`}
              tone={checkIns30 < 15 ? "warning" : "primary"}
            />
          </ul>
        </Card>
      </div>
    </>
  );
}

function scaleFor(metric: MetricKey, points: LinePoint[]) {
  const config = METRICS[metric];
  if (config.domain) return { domain: [...config.domain] as [number, number], ticks: [...config.ticks] };
  const values = points.flatMap((p) => (p.value == null ? [] : [p.value]));
  const lo = Math.floor((Math.min(...values) - 1) / 2) * 2;
  const hi = Math.ceil((Math.max(...values) + 1) / 2) * 2;
  return { domain: [lo, hi] as [number, number], ticks: [lo, (lo + hi) / 2, hi] };
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
          {detail && <span className="ml-2 text-sm font-normal text-muted">· {detail}</span>}
        </dd>
      </div>
    </div>
  );
}

function WeekRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-3 text-ink-2">
        <Icon className="size-4 text-muted" />
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </li>
  );
}

function NextStep({ checkedIn, days }: { checkedIn: boolean; days?: number }) {
  if (!checkedIn) {
    return (
      <>
        <p className="mt-2 font-medium">Gör dagens incheckning</p>
        <p className="mt-1 text-sm text-ink-2">Två minuter: mående, sug, sömn och en rad om dagen.</p>
        <ButtonLink href="/incheckning" className="mt-4">
          Checka in
        </ButtonLink>
      </>
    );
  }
  const next = days != null ? MILESTONES.find((m) => m > days) : undefined;
  return (
    <>
      <p className="mt-2 font-medium">
        {next != null ? `${next - days!} dagar kvar till ${next} dagar` : "Lägg till ett möte eller träningspass"}
      </p>
      <p className="mt-1 text-sm text-ink-2">Ett möte eller ett träningspass idag gör skillnad.</p>
      <ButtonLink href="/incheckning" variant="secondary" className="mt-4">
        Lägg till aktivitet
      </ButtonLink>
    </>
  );
}

const activityIcon = { checkin: CalendarCheck, meeting: Users, workout: Dumbbell } as const;

function ActivityList({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <p className="mt-6 text-ink-2">
        Inget registrerat ännu.{" "}
        <Link href="/incheckning" className="font-medium text-primary underline-offset-4 hover:underline">
          Gör din första incheckning
        </Link>
        .
      </p>
    );
  }
  return (
    <ul className="mt-6 space-y-5">
      {items.map((item) => {
        const Icon = activityIcon[item.kind];
        return (
          <li key={item.key} className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-sm text-muted">
                {item.detail} · {relativeDay(item.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Goal({
  label,
  value,
  detail,
  tone = "primary",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "primary" | "warning";
}) {
  return (
    <li>
      <div className="mb-2 flex justify-between gap-3 font-medium">
        <span>{label}</span>
        <span className="tabular-nums">{Math.min(100, Math.round(value * 100))} %</span>
      </div>
      <TickProgress value={value} label={label} tone={tone} />
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </li>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-[220px] place-items-center rounded-3xl border border-dashed border-border text-center">
      <div>
        <p className="font-medium">Ingen data för perioden ännu</p>
        <p className="mt-1 text-sm text-muted">Dina incheckningar visas här som en kurva.</p>
      </div>
    </div>
  );
}
