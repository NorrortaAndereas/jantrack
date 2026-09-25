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
      <div ref={columnRef} className="flex w-full max-w-md shrink-0 flex-col items-center gap-8 lg:w-md">
        {logo}
        <div className="w-full rounded-(--radius-card) border border-border bg-surface p-8 sm:p-10">
          {children}
        </div>
      </div>
      <LoginVideo
        className="aspect-[654/1080] w-3/4 max-w-xs lg:aspect-auto lg:w-[303px] lg:max-w-none"
        style={width ? { width } : undefined}
      />
    </div>
  );
}
