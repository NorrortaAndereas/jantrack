import {
  bigint,
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ---------------------------------------------------------------------------
// Inloggning (Better Auth). Fältnamnen måste matcha Better Auths modell.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
  id: text().primaryKey(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint({ mode: "number" }).notNull(),
});

// ---------------------------------------------------------------------------
// Appens data. Allt är knutet till en användare och raderas med kontot.
// Datum lagras som 'YYYY-MM-DD' i användarens lokala tid.
// ---------------------------------------------------------------------------

const owner = () =>
  text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

/** En nykterhetsperiod per beroende. Öppen period (endedOn = null) = pågående. */
export const sobrietyPeriods = pgTable(
  "sobriety_periods",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    substance: text().notNull(),
    startedOn: date({ mode: "string" }).notNull(),
    endedOn: date({ mode: "string" }),
    ...timestamps,
  },
  (t) => [index().on(t.userId, t.substance)],
);

/** Den dagliga incheckningen – en rad per användare och dag. */
export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    date: date({ mode: "string" }).notNull(),
    sober: boolean(),
    mood: smallint(), // 1–5
    craving: smallint(), // 0–10
    sleepHours: numeric({ precision: 3, scale: 1, mode: "number" }),
    weightKg: numeric({ precision: 5, scale: 1, mode: "number" }),
    note: text(),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.userId, t.date)],
);

export const meetings = pgTable(
  "meetings",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    date: date({ mode: "string" }).notNull(),
    fellowship: text().notNull(), // AA, NA, CA …
    name: text(),
    note: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId, t.date)],
);

export const workouts = pgTable(
  "workouts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    date: date({ mode: "string" }).notNull(),
    activity: text().notNull(),
    durationMin: smallint(),
    note: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId, t.date)],
);

export const medications = pgTable(
  "medications",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    name: text().notNull(),
    dose: text(),
    active: boolean().notNull().default(true),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export const medicationIntakes = pgTable(
  "medication_intakes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: owner(),
    medicationId: integer()
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    date: date({ mode: "string" }).notNull(),
    taken: boolean().notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.medicationId, t.date), index().on(t.userId, t.date)],
);

export type DailyLog = typeof dailyLogs.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type SobrietyPeriod = typeof sobrietyPeriods.$inferSelect;
