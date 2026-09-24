// Fyller en användares historik med realistisk demodata, baserat på dagens incheckning.
//
//   npm run db:seed-demo -- namn@exempel.se [--days=90]
//
// - Rör aldrig dagar som redan har en incheckning.
// - Möten, träning och medicin utgår från det som registrerats idag.
// - En pågående nykterhetsräknare som startat efter första demodagen flyttas bakåt.
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

const email = process.argv.slice(2).find((a) => !a.startsWith("--"));
const days = Number(process.argv.find((a) => a.startsWith("--days="))?.split("=")[1] ?? 90);
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!email || !url || !(days > 0 && days <= 730)) {
  console.error("Användning: npm run db:seed-demo -- <e-post> [--days=90]  (kräver DATABASE_URL i .env.local)");
  process.exit(1);
}

const sql = neon(url);

// --- Hjälpfunktioner ---------------------------------------------------------

const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
const addDays = (d, n) => new Date(Date.parse(d) + n * 86_400_000).toISOString().slice(0, 10);
const weekday = (d) => new Date(Date.parse(d)).getUTCDay(); // 0 = söndag

// Deterministisk slump så att samma körning ger samma resultat.
let seed = [...email].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const noise = (amp) => (rand() * 2 - 1) * amp;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pick = (list) => list[Math.floor(rand() * list.length)];

const NOTES = [
  "Lugn dag. Tog en promenad efter jobbet och kände mig stabil.",
  "Jobbigt på eftermiddagen, ringde min sponsor och det hjälpte.",
  "Bra möte ikväll. Kände igen mig i det som delades.",
  "Sov dåligt, lite rastlös. Men klarade dagen.",
  "Tacksam idag. Middag med familjen utan att tänka på att dricka.",
  "Stress på jobbet. Märkte suget men gick igenom det.",
  "Tränade och kände mig stark efteråt.",
  "Läste i stegboken. Steg tre känns mer begripligt nu.",
  "Helgen var en utmaning, men jag höll mig till planen.",
  "En helt vanlig dag – och det är faktiskt det bästa.",
];

// --- Hämta användare och mall ------------------------------------------------

const [user] = await sql`select id, name from "user" where lower(email) = lower(${email})`;
if (!user) {
  console.error(`Hittade ingen användare med e-post ${email}`);
  process.exit(1);
}

const [template] = await sql`
  select * from daily_logs where user_id = ${user.id} order by date desc limit 1`;
const templateMeetings = await sql`
  select fellowship, name from meetings where user_id = ${user.id} order by date desc limit 5`;
const templateWorkouts = await sql`
  select activity, duration_min from workouts where user_id = ${user.id} order by date desc limit 5`;
const meds = await sql`select id from medications where user_id = ${user.id} and active`;
const existing = new Set(
  (await sql`select date::text as date from daily_logs where user_id = ${user.id}`).map((r) => r.date),
);

const base = {
  mood: template?.mood ?? 4,
  craving: template?.craving ?? 2,
  sleep: template?.sleep_hours != null ? Number(template.sleep_hours) : 7.5,
  weight: template?.weight_kg != null ? Number(template.weight_kg) : null,
};
const meetingKinds = templateMeetings.length ? templateMeetings : [{ fellowship: "AA", name: null }];
const workoutKinds = templateWorkouts.length
  ? templateWorkouts
  : [{ activity: "Promenad", duration_min: 40 }];

// --- Generera dagar ----------------------------------------------------------

const first = addDays(today, -days);
const logs = [];
const meetings = [];
const workouts = [];
const intakes = [];

for (let i = 0; i < days; i++) {
  const date = addDays(first, i);
  if (existing.has(date)) continue;
  if (rand() < 0.07) continue; // ibland glömmer man att checka in

  const progress = i / days; // 0 = början, 1 = idag
  const rough = weekday(date) === 5 || weekday(date) === 6 ? 0.6 : 0; // helger är tuffare
  const mood = Math.round(clamp(base.mood - 1.4 * (1 - progress) + noise(1) - rough, 1, 5));
  const craving = Math.round(clamp(base.craving + 5 * (1 - progress) + noise(1.5) + rough * 2, 0, 10));
  const sleep = Math.round(clamp(base.sleep - 1.2 * (1 - progress) + noise(0.9), 3, 11) * 10) / 10;
  const weight =
    base.weight != null ? Math.round((base.weight + 3.5 * (1 - progress) + noise(0.4)) * 10) / 10 : null;

  logs.push({
    date,
    sober: true,
    mood,
    craving,
    sleep,
    weight,
    note: rand() < 0.45 ? pick(NOTES) : null,
  });

  // Tätare möten i början (90 på 90-andan), sedan några i veckan.
  if (rand() < 0.75 - 0.35 * progress) {
    const m = pick(meetingKinds);
    meetings.push({ date, fellowship: m.fellowship, name: m.name });
  }
  if (rand() < 0.25 + 0.25 * progress) {
    const w = pick(workoutKinds);
    const minutes = w.duration_min ? Math.round(clamp(w.duration_min + noise(15), 10, 180)) : null;
    workouts.push({ date, activity: w.activity, minutes });
  }
  for (const med of meds) intakes.push({ date, medicationId: med.id, taken: rand() < 0.93 });
}

// --- Skriv ---------------------------------------------------------------------

const col = (rows, key) => rows.map((r) => r[key]);

await sql`
  insert into daily_logs (user_id, date, sober, mood, craving, sleep_hours, weight_kg, note)
  select ${user.id}, * from unnest(
    ${col(logs, "date")}::date[], ${col(logs, "sober")}::boolean[], ${col(logs, "mood")}::smallint[],
    ${col(logs, "craving")}::smallint[], ${col(logs, "sleep")}::numeric[], ${col(logs, "weight")}::numeric[],
    ${col(logs, "note")}::text[])
  on conflict (user_id, date) do nothing`;

if (meetings.length)
  await sql`
    insert into meetings (user_id, date, fellowship, name)
    select ${user.id}, * from unnest(
      ${col(meetings, "date")}::date[], ${col(meetings, "fellowship")}::text[], ${col(meetings, "name")}::text[])`;

if (workouts.length)
  await sql`
    insert into workouts (user_id, date, activity, duration_min)
    select ${user.id}, * from unnest(
      ${col(workouts, "date")}::date[], ${col(workouts, "activity")}::text[], ${col(workouts, "minutes")}::smallint[])`;

if (intakes.length)
  await sql`
    insert into medication_intakes (user_id, medication_id, date, taken)
    select ${user.id}, * from unnest(
      ${col(intakes, "medicationId")}::int[], ${col(intakes, "date")}::date[], ${col(intakes, "taken")}::boolean[])
    on conflict (medication_id, date) do nothing`;

const moved = await sql`
  update sobriety_periods set started_on = ${first}
  where user_id = ${user.id} and ended_on is null and started_on > ${first}
  returning substance`;

console.log(`Klart för ${user.name}: ${logs.length} incheckningar, ${meetings.length} möten, ${workouts.length} träningspass, ${intakes.length} medicinregistreringar (${first} – ${addDays(today, -1)}).`);
if (moved.length) console.log(`Nykterhetsräknare flyttad till ${first}: ${moved.map((m) => m.substance).join(", ")}`);
