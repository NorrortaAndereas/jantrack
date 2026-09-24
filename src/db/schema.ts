import { integer, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Generisk tabell för olika typer av mätpunkter/information.
// `category` skiljer på typerna, `value` används för siffror som ska visualiseras
// och `data` rymmer övriga fält tills vi vet exakt vilka tabeller som behövs.
export const entries = pgTable("entries", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  category: text().notNull(),
  label: text().notNull(),
  value: numeric({ mode: "number" }),
  data: jsonb().$type<Record<string, unknown>>(),
  recordedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
