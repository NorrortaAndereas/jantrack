"use client";

import { useEffect, useRef, useState } from "react";
import { LoginVideo } from "./login-video";

const RATIO = 654 / 1080; // videons bredd / höjd

/**
 * Inloggningsrutan med videon bredvid. På desktop följer videon rutans höjd
 * (som varierar mellan inloggning och registrering), på mobil ligger den under.
 */
export function AuthStage({ children }: { children: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const desktop = matchMedia("(min-width: 64rem)");
    const update = () => setWidth(desktop.matches ? box.offsetHeight * RATIO : undefined);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    desktop.addEventListener("change", update);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch lg:gap-10">
      <div
        ref={boxRef}
        className="w-full max-w-md shrink-0 rounded-(--radius-card) border border-border bg-surface p-8 sm:p-10 lg:w-md"
      >
        {children}
      </div>
      <LoginVideo
        className="aspect-[654/1080] w-3/4 max-w-xs lg:aspect-auto lg:w-[330px] lg:max-w-none"
        style={width ? { width } : undefined}
      />
    </div>
  );
}
