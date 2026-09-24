import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

export const db = url ? drizzle(neon(url), { schema, casing: "snake_case" }) : null;
