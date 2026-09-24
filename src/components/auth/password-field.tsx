"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  autoComplete,
  describedBy,
}: {
  autoComplete: "current-password" | "new-password";
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={autoComplete === "new-password" ? 10 : undefined}
        aria-describedby={describedBy}
        className="field pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Dölj lösenord" : "Visa lösenord"}
        className="absolute inset-y-0 right-1 grid w-11 place-items-center text-muted hover:text-ink"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
