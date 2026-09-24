import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "AI-coach" };

export default function AiPage() {
  return (
    <>
      <Topbar title="AI-coach" description="Reflektioner och stöd baserat på din egen data." />
      <Card className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <p className="mt-5 font-serif text-3xl leading-tight">Kommer snart.</p>
        <p className="mt-3 text-ink-2">
          Här kommer du kunna få en daglig sammanfattning, se mönster i ditt mående och ställa frågor
          om din egen utveckling. AI:n ersätter inte vård, sponsor eller gemenskap – den är ett
          komplement.
        </p>
      </Card>
    </>
  );
}
