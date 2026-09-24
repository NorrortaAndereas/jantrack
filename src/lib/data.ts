import "server-only";
import { and, asc, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyLogs,
  medicationIntakes,
  medications,
  meetings,
  sobrietyPeriods,
  workouts,
} from "@/db/schema";
import { addMonths, daysBetween, startOfMonth, today } from "@/lib/dates";

// Alla frågor tar userId och filtrerar på det – ingen användare kan läsa någon annans data.

export async function getActiveSobriety(userId: string) {
  const periods = await db
    .select()
    .from(sobrietyPeriods)
    .where(and(eq(sobrietyPeriods.userId, userId), isNull(sobrietyPeriods.endedOn)))
    .orderBy(asc(sobrietyPeriods.startedOn));
  const now = today();
  return periods.map((p) => ({ ...p, days: Math.max(0, daysBetween(p.startedOn, now)) }));
}

export function getSobrietyHistory(userId: string) {
  return db
    .select()
    .from(sobrietyPeriods)
    .where(eq(sobrietyPeriods.userId, userId))
    .orderBy(desc(sobrietyPeriods.startedOn));
}

export function getDailyLogs(userId: string, from: string, to: string) {
  return db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.date, from), lte(dailyLogs.date, to)))
    .orderBy(asc(dailyLogs.date));
}

export async function getDailyLog(userId: string, date: string) {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
  return log ?? null;
}

export function getJournal(userId: string, limit = 60) {
  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.date))
    .limit(limit);
}

export async function countMeetings(userId: string, from: string) {
  const [row] = await db
    .select({ n: count() })
    .from(meetings)
    .where(and(eq(meetings.userId, userId), gte(meetings.date, from)));
  return row.n;
}

export async function countWorkouts(userId: string, from: string) {
  const [row] = await db
    .select({ n: count(), minutes: sql<number>`coalesce(sum(${workouts.durationMin}), 0)::int` })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), gte(workouts.date, from)));
  return row;
}

/** Antal möten per månad, de senaste `months` månaderna inklusive innevarande. */
export async function meetingsPerMonth(userId: string, months = 6) {
  const current = startOfMonth(today());
  const from = addMonths(current, -(months - 1));
  const month = sql<string>`to_char(${meetings.date}, 'YYYY-MM')`;
  const rows = await db
    .select({ month, n: count() })
    .from(meetings)
    .where(and(eq(meetings.userId, userId), gte(meetings.date, from)))
    .groupBy(month);
  const byMonth = new Map(rows.map((r) => [r.month, r.n]));
  return Array.from({ length: months }, (_, i) => {
    const start = addMonths(from, i);
    return { month: start, count: byMonth.get(start.slice(0, 7)) ?? 0, current: start === current };
  });
}

export function getMeetingsOn(userId: string, date: string) {
  return db
    .select()
    .from(meetings)
    .where(and(eq(meetings.userId, userId), eq(meetings.date, date)))
    .orderBy(asc(meetings.createdAt));
}

export function getWorkoutsOn(userId: string, date: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
    .orderBy(asc(workouts.createdAt));
}

export function getMedications(userId: string, { activeOnly = false } = {}) {
  return db
    .select()
    .from(medications)
    .where(
      activeOnly
        ? and(eq(medications.userId, userId), eq(medications.active, true))
        : eq(medications.userId, userId),
    )
    .orderBy(desc(medications.active), asc(medications.name));
}

export function getIntakesOn(userId: string, date: string) {
  return db
    .select()
    .from(medicationIntakes)
    .where(and(eq(medicationIntakes.userId, userId), eq(medicationIntakes.date, date)));
}

/** Andel registrerade doser som togs sedan `from` (0–1), eller null om inget registrerats. */
export async function medicationAdherence(userId: string, from: string) {
  const [row] = await db
    .select({
      total: count(),
      taken: sql<number>`count(*) filter (where ${medicationIntakes.taken})::int`,
    })
    .from(medicationIntakes)
    .where(and(eq(medicationIntakes.userId, userId), gte(medicationIntakes.date, from)));
  return row.total ? row.taken / row.total : null;
}

export type ActivityItem = {
  key: string;
  kind: "checkin" | "meeting" | "workout";
  date: string;
  at: Date;
  title: string;
  detail: string;
};

export async function getRecentActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  const [logs, meetingRows, workoutRows] = await Promise.all([
    db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.date))
      .limit(limit),
    db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, userId))
      .orderBy(desc(meetings.date), desc(meetings.createdAt))
      .limit(limit),
    db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.date), desc(workouts.createdAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...logs.map((l) => ({
      key: `c${l.id}`,
      kind: "checkin" as const,
      date: l.date,
      at: l.createdAt,
      title: "Daglig incheckning",
      detail: l.sober === false ? "Inte nykter" : l.sober ? "Nykter" : "Incheckad",
    })),
    ...meetingRows.map((m) => ({
      key: `m${m.id}`,
      kind: "meeting" as const,
      date: m.date,
      at: m.createdAt,
      title: m.name ? `${m.fellowship} · ${m.name}` : `${m.fellowship}-möte`,
      detail: "Möte",
    })),
    ...workoutRows.map((w) => ({
      key: `w${w.id}`,
      kind: "workout" as const,
      date: w.date,
      at: w.createdAt,
      title: w.activity,
      detail: w.durationMin ? `Träning · ${w.durationMin} min` : "Träning",
    })),
  ];

  return items
    .sort((a, b) => b.date.localeCompare(a.date) || b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}
