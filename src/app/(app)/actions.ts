"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  dailyLogs,
  medicationIntakes,
  medications,
  meetings,
  sobrietyPeriods,
  workouts,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { FELLOWSHIPS } from "@/lib/constants";
import { isValidDay, today } from "@/lib/dates";
import { requireUser } from "@/lib/session";

// Varje action verifierar inloggningen själv – server actions kan anropas direkt via POST.

export type FormState = { ok: boolean; message: string } | null;

const day = z
  .string()
  .refine(isValidDay, "Ogiltigt datum")
  .refine((d) => d <= today(), "Datumet kan inte ligga i framtiden");

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))),
    z.number().min(min).max(max).nullable(),
  );

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(max).nullable());

const id = z.coerce.number().int().positive();

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Något blev fel";
}

// --- Daglig incheckning -----------------------------------------------------

const checkInSchema = z.object({
  date: day,
  sober: z.enum(["yes", "no", ""]).transform((v) => (v === "" ? null : v === "yes")),
  mood: optionalNumber(1, 5),
  craving: optionalNumber(0, 10),
  sleepHours: optionalNumber(0, 24),
  weightKg: optionalNumber(20, 400),
  note: optionalText(10_000),
});

export async function saveCheckIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = checkInSchema.safeParse({
    date: formData.get("date"),
    sober: formData.get("sober") ?? "",
    mood: formData.get("mood"),
    craving: formData.get("craving"),
    sleepHours: formData.get("sleepHours"),
    weightKg: formData.get("weightKg"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const { date, ...values } = parsed.data;
  await db
    .insert(dailyLogs)
    .values({ userId: user.id, date, ...values })
    .onConflictDoUpdate({ target: [dailyLogs.userId, dailyLogs.date], set: values });

  // Medicin: en kryssruta per aktiv medicin, "med-<id>" skickas bara om den är ikryssad.
  const meds = await db
    .select({ id: medications.id })
    .from(medications)
    .where(and(eq(medications.userId, user.id), eq(medications.active, true)));
  for (const med of meds) {
    const taken = formData.get(`med-${med.id}`) === "on";
    await db
      .insert(medicationIntakes)
      .values({ userId: user.id, medicationId: med.id, date, taken })
      .onConflictDoUpdate({
        target: [medicationIntakes.medicationId, medicationIntakes.date],
        set: { taken },
      });
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Incheckningen är sparad" };
}

// --- Möten & träning --------------------------------------------------------

const meetingSchema = z.object({
  date: day,
  fellowship: z.enum(FELLOWSHIPS, "Välj gemenskap"),
  name: optionalText(200),
});

export async function addMeeting(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = meetingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  await db.insert(meetings).values({ userId: user.id, ...parsed.data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Mötet är tillagt" };
}

export async function deleteMeeting(formData: FormData) {
  const user = await requireUser();
  const meetingId = id.parse(formData.get("id"));
  await db.delete(meetings).where(and(eq(meetings.id, meetingId), eq(meetings.userId, user.id)));
  revalidatePath("/", "layout");
}

const workoutSchema = z.object({
  date: day,
  activity: z.string().trim().min(1, "Ange aktivitet").max(100),
  durationMin: optionalNumber(1, 1440),
});

export async function addWorkout(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = workoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  await db.insert(workouts).values({ userId: user.id, ...parsed.data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Träningen är tillagd" };
}

export async function deleteWorkout(formData: FormData) {
  const user = await requireUser();
  const workoutId = id.parse(formData.get("id"));
  await db.delete(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)));
  revalidatePath("/", "layout");
}

// --- Medicin ----------------------------------------------------------------

const medicationSchema = z.object({
  name: z.string().trim().min(1, "Ange namn").max(100),
  dose: optionalText(100),
});

export async function addMedication(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = medicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  await db.insert(medications).values({ userId: user.id, ...parsed.data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Medicinen är tillagd" };
}

export async function setMedicationActive(formData: FormData) {
  const user = await requireUser();
  const medId = id.parse(formData.get("id"));
  const active = formData.get("active") === "true";
  await db
    .update(medications)
    .set({ active })
    .where(and(eq(medications.id, medId), eq(medications.userId, user.id)));
  revalidatePath("/", "layout");
}

// --- Nykterhet --------------------------------------------------------------

const sobrietySchema = z.object({
  substance: z.string().trim().min(1, "Ange vad du vill vara fri från").max(60),
  startedOn: day,
});

export async function startSobriety(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = sobrietySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const [existing] = await db
    .select({ id: sobrietyPeriods.id })
    .from(sobrietyPeriods)
    .where(
      and(
        eq(sobrietyPeriods.userId, user.id),
        eq(sobrietyPeriods.substance, parsed.data.substance),
        isNull(sobrietyPeriods.endedOn),
      ),
    );
  if (existing) return { ok: false, message: "Du följer redan det här" };

  await db.insert(sobrietyPeriods).values({ userId: user.id, ...parsed.data });
  revalidatePath("/", "layout");
  return { ok: true, message: "Räknaren är startad" };
}

/** Avslutar pågående period och startar en ny från angivet datum (återfall). */
export async function restartSobriety(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.object({ id, startedOn: day }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const [period] = await db
    .update(sobrietyPeriods)
    .set({ endedOn: parsed.data.startedOn })
    .where(
      and(
        eq(sobrietyPeriods.id, parsed.data.id),
        eq(sobrietyPeriods.userId, user.id),
        isNull(sobrietyPeriods.endedOn),
      ),
    )
    .returning();
  if (!period) return { ok: false, message: "Hittade inte perioden" };

  await db.insert(sobrietyPeriods).values({
    userId: user.id,
    substance: period.substance,
    startedOn: parsed.data.startedOn,
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "En ny period har börjat. Bra att du är kvar." };
}

// --- Konto ------------------------------------------------------------------

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/logga-in");
}
