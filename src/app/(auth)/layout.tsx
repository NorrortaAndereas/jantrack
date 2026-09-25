import { AuthStage } from "@/components/auth/auth-stage";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <AuthStage>
        <p className="mb-8 text-lg font-bold text-primary">Jantrack</p>
        {children}
      </AuthStage>
    </main>
  );
}
