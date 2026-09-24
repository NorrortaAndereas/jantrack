import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  if (!db) return Response.json({ ok: false, db: "not-configured" }, { status: 503 });

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "connected" });
  } catch {
    return Response.json({ ok: false, db: "error" }, { status: 503 });
  }
}
