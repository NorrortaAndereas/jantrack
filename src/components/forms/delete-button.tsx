import { Trash2 } from "lucide-react";

/** Liten raderaknapp som postar till en server action. */
export function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        aria-label={label}
        className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-negative"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </form>
  );
}
