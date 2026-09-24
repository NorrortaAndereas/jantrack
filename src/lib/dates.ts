// Datum hanteras som 'YYYY-MM-DD'-strängar i svensk tid för att undvika tidszonsfel.
export const TIME_ZONE = "Europe/Stockholm";
const DAY_MS = 86_400_000;

const isoFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });

export function today(): string {
  return isoFormatter.format(new Date());
}

function toUtc(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(day: string, amount: number): string {
  return fromUtc(toUtc(day) + amount * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

export function startOfMonth(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

export function addMonths(day: string, amount: number): string {
  const [y, m] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + amount, 1));
  return fromUtc(date.getTime());
}

export function isValidDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("sv-SE", { ...options, timeZone: "UTC" });

const shortFmt = fmt({ day: "numeric", month: "short" });
const longFmt = fmt({ weekday: "long", day: "numeric", month: "long" });
const fullFmt = fmt({ day: "numeric", month: "long", year: "numeric" });
const monthFmt = fmt({ month: "short" });

export const formatShort = (day: string) => shortFmt.format(toUtc(day));
export const formatLong = (day: string) => longFmt.format(toUtc(day));
export const formatFull = (day: string) => fullFmt.format(toUtc(day));
export const formatMonth = (day: string) => monthFmt.format(toUtc(day)).replace(".", "");

export function relativeDay(day: string, reference = today()): string {
  const diff = daysBetween(day, reference);
  if (diff === 0) return "Idag";
  if (diff === 1) return "Igår";
  return formatShort(day);
}

export function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("sv-SE", { hour: "numeric", timeZone: TIME_ZONE }).format(now),
  );
  if (hour < 5) return "God natt";
  if (hour < 10) return "God morgon";
  if (hour < 18) return "Hej";
  return "God kväll";
}
