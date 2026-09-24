import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getOptionalUser } from "@/lib/session";

export const metadata: Metadata = { title: "Skapa konto" };

export default async function SignUpPage() {
  if (await getOptionalUser()) redirect("/");
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Skapa konto</h1>
      <p className="mt-1.5 mb-8 text-ink-2">Din data är privat och syns bara för dig.</p>
      <AuthForm mode="sign-up" />
      <p className="mt-6 text-center text-sm text-ink-2">
        Har du redan ett konto?{" "}
        <Link href="/logga-in" className="font-medium text-primary underline-offset-4 hover:underline">
          Logga in
        </Link>
      </p>
    </>
  );
}
