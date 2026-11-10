"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export type MascotMood = "idle" | "thinking" | "celebrate" | "presenting" | "waving";

const ALT: Record<MascotMood, string> = {
  idle: "Sawa's mascot floating and smiling",
  thinking: "Sawa's mascot thinking",
  celebrate: "Sawa's mascot celebrating with both arms up",
  presenting: "Sawa's mascot pointing to what it found",
  waving: "Sawa's mascot waving hello",
};

/**
 * The five mascot animations: transparent VP9 WebM (background keyed out, no audio),
 * with an H.264 fallback for Safari that blends its white background into light surfaces.
 * Reduced motion shows the poster frame only.
 */
export function MascotVideo({ mood = "idle", size = 160, className = "", loop = true, decorative = false }: { mood?: MascotMood; size?: number; className?: string; loop?: boolean; decorative?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const check = () => setFallback(!v.currentSrc.endsWith(".webm"));
    v.addEventListener("loadeddata", check);
    v.play().catch(() => {});
    return () => v.removeEventListener("loadeddata", check);
  }, [mood]);
  const alt = decorative ? "" : ALT[mood];
  if (reduce) {
    return <img src={`/mascot/${mood}.jpg`} alt={alt} width={size} height={size} className={`select-none mix-blend-multiply ${className}`} draggable={false} />;
  }
  return (
    <video
      key={mood}
      ref={ref}
      width={size}
      height={size}
      autoPlay
      muted
      loop={loop}
      playsInline
      preload="auto"
      poster={`/mascot/${mood}.jpg`}
      aria-label={alt || undefined}
      aria-hidden={decorative || undefined}
      role={alt ? "img" : undefined}
      className={`pointer-events-none select-none ${fallback ? "mix-blend-multiply" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <source src={`/mascot/${mood}.webm`} type='video/webm; codecs="vp9"' />
      <source src={`/mascot/${mood}.mp4`} type="video/mp4" />
    </video>
  );
}
