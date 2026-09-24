"use client";

import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "./password-field";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const { error } = signUp
      ? await authClient.signUp.email({ name: String(data.get("name")).trim(), email, password })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (error) {
      setError(
        error.status === 429
          ? "För många försök. Vänta en stund och försök igen."
          : signUp
            ? "Kunde inte skapa kontot. Kanske finns e-postadressen redan?"
            : "Fel e-post eller lösenord.",
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-5">
      {signUp && (
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Förnamn
          </label>
          <input id="name" name="name" autoComplete="given-name" required maxLength={60} className="field" />
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-post
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Lösenord
        </label>
        <PasswordField
          autoComplete={signUp ? "new-password" : "current-password"}
          describedBy={signUp ? "password-help" : undefined}
        />
        {signUp && (
          <p id="password-help" className="text-sm text-muted">
            Minst 10 tecken.
          </p>
        )}
      </div>
      <p role="alert" aria-live="assertive" className="min-h-5 text-sm text-negative">
        {error && (
          <span className="inline-flex items-center gap-1.5">
            <CircleAlert className="size-4" aria-hidden />
            {error}
          </span>
        )}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-primary text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Vänta…" : signUp ? "Skapa konto" : "Logga in"}
      </button>
    </form>
  );
}
