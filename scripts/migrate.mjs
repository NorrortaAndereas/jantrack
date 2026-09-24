// Kör Drizzle-migreringar före bygget. Hoppar över om ingen databas är konfigurerad
// (t.ex. vid lokalt bygge utan .env.local).
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  console.log("migrate: DATABASE_URL saknas, hoppar över migreringar");
} else {
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("migrate: klart");
}
