import { CalendarCheck, LayoutGrid, NotebookPen, Pill, Sparkles, Sprout } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Översikt", icon: LayoutGrid },
  { href: "/incheckning", label: "Incheckning", icon: CalendarCheck },
  { href: "/dagbok", label: "Dagbok", icon: NotebookPen },
  { href: "/nykterhet", label: "Nykterhet", icon: Sprout },
  { href: "/medicin", label: "Medicin", icon: Pill },
  { href: "/ai", label: "AI-coach", icon: Sparkles },
] as const;
