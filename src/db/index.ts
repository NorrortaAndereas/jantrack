import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// neon() ansluter först vid första frågan, så bygget fungerar även utan databas.
const url = process.env.DATABASE_URL ?? "postgresql://unset:unset@localhost/unset";

export const db = drizzle(neon(url), { schema, casing: "snake_case" });
