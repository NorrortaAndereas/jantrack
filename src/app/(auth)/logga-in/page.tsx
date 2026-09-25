import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getOptionalUser } from "@/lib/session";

export const metadata: Metadata = { title: "Logga in" };

export default async function SignInPage() {
  if (await getOptionalUser()) redirect("/");
  return (
    <>
      <h1 className="sr-only">Logga in</h1>
      <AuthForm mode="sign-in" />
      <p className="mt-6 text-center text-sm text-ink-2">
        Inget konto?{" "}
        <Link href="/registrera" className="font-medium text-primary underline-offset-4 hover:underline">
          Skapa ett
        </Link>
      </p>
    </>
  );
}
