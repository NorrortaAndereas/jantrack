import { Sidebar } from "@/components/shell/sidebar";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return (
    <div className="mx-auto flex w-full max-w-[1480px] gap-6 p-4 pb-24 md:pb-4">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-6 py-2 md:py-4">{children}</main>
    </div>
  );
}
