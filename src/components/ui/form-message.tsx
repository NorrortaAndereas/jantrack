import { CircleAlert, CircleCheck } from "lucide-react";
import type { FormState } from "@/app/(app)/actions";

export function FormMessage({ state }: { state: FormState }) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 text-sm">
      {state && (
        <span
          className={`inline-flex items-center gap-1.5 ${state.ok ? "text-positive" : "text-negative"}`}
        >
          {state.ok ? (
            <CircleCheck className="size-4" aria-hidden />
          ) : (
            <CircleAlert className="size-4" aria-hidden />
          )}
          {state.message}
        </span>
      )}
    </p>
  );
}
