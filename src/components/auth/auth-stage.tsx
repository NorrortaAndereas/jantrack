"use client";

import { useEffect, useRef, useState } from "react";
import { LoginVideo } from "./login-video";

const RATIO = 654 / 1080; // videons bredd / höjd

/**
 * Logotyp + inloggningsruta i en kolumn, med videon bredvid. På desktop följer
 * videon kolumnens höjd (logotyp och ruta tillsammans), på mobil ligger den under.
 */
export function AuthStage({ logo, children }: { logo: React.ReactNode; children: React.ReactNode }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const desktop = matchMedia("(min-width: 64rem)");
    const update = () => setWidth(desktop.matches ? column.offsetHeight * RATIO : undefined);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(column);
    desktop.addEventListener("change", update);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch lg:gap-10">
      {/* Mobil: kolumnen "löses upp" (contents) så att ordningen blir logotyp, video, ruta.
          Logotypen ligger överst och video + ruta centreras i utrymmet under. */}
      <div
        ref={columnRef}
        className="contents lg:flex lg:w-md lg:shrink-0 lg:flex-col lg:items-center lg:gap-8"
      >
        <div className="order-1 max-lg:pt-8">{logo}</div>
        <div className="order-3 w-full max-lg:mb-auto rounded-(--radius-card) border border-border bg-surface p-8 sm:p-10">
          {children}
        </div>
      </div>
      <LoginVideo
        className="order-2 max-lg:mt-auto aspect-[654/1080] w-3/5 max-w-60 lg:order-none lg:aspect-auto lg:w-[303px] lg:max-w-none"
        style={width ? { width } : undefined}
      />
    </div>
  );
}
