export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-(--radius-card) border border-border bg-surface p-8 sm:p-10">
        <p className="mb-8 text-lg font-bold text-primary">Jantrack</p>
        {children}
      </div>
    </main>
  );
}
