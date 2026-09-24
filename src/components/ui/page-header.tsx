export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-1.5 text-ink-2">{description}</p>}
    </div>
  );
}
