"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 size-full object-contain"
      >
        <source src="/media/jannetrack.mov" type='video/quicktime; codecs="hvc1"' />
        <source src="/media/jannetrack.webm" type="video/webm" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausa animationen" : "Spela animationen"}
        className="absolute right-2 bottom-2 grid size-11 place-items-center rounded-full border border-border bg-surface/80 text-ink-2 backdrop-blur hover:text-ink"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
