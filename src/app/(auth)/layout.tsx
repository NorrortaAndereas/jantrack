import Image from "next/image";
import { AuthStage } from "@/components/auth/auth-stage";
import logo from "../../../public/media/jantrack-logo.webp";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="flex w-full flex-col items-center gap-8 lg:gap-10">
        {/* Logotypen är vit – i ljust läge inverteras den till mörk. */}
        <Image
          src={logo}
          alt="Jantrack"
          priority
          sizes="(min-width: 64rem) 240px, 180px"
          className="h-auto w-44 invert lg:w-60 dark:invert-0"
        />
        <AuthStage>{children}</AuthStage>
      </div>
    </main>
  );
}
