"use client";

import { useEffect, useRef } from "react";

/**
 * Dekorativ video med transparent bakgrund.
 * Safari får HEVC med alfakanal (.mov), övriga webbläsare VP9 med alfa (.webm).
 * Spelas bara automatiskt om användaren inte bett om reducerad rörelse.
 */
export function LoginVideo({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <div className={`relative ${className}`} style={style}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/jannetrack-poster.webp"
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-contain"
      >
        <source src="/media/jannetrack.mov" type='video/quicktime; codecs="hvc1"' />
        <source src="/media/jannetrack.webm" type="video/webm" />
      </video>
    </div>
  );
}
