import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Hämtar inloggad användare, eller skickar till inloggningen. Anropas i varje sida och server action. */
export const requireUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/logga-in");
  return session.user;
});

export async function getOptionalUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
