import Image from "next/image";
import { AuthStage } from "@/components/auth/auth-stage";
import logo from "../../../public/media/jantrack-logo.webp";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh justify-items-center p-4 lg:place-items-center">
      <AuthStage
        logo={
          // Logotypen är vit – i ljust läge inverteras den till mörk.
          <Image
            src={logo}
            alt="Jantrack"
            priority
            sizes="(min-width: 64rem) 240px, 180px"
            className="h-auto w-44 invert lg:w-60 dark:invert-0"
          />
        }
      >
        {children}
      </AuthStage>
    </main>
  );
}
