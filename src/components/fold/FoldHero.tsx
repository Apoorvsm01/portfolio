"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * The demo video in a rounded, Duo-shaped frame. It enters blurred and slightly folded back, then
 * flattens on load. Autoplays muted and looped; a button lets people pause (and reduced motion
 * starts it paused with the poster showing).
 */
export function FoldHero({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => setOpen(true));
    if (!reduced) {
      videoRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="fold-hero" data-open={open ? "true" : undefined}>
      <div className="fold-hero-frame">
        <video
          ref={videoRef}
          className="fold-hero-video"
          src={asset(src)}
          poster={asset(poster)}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        />
        <div className="fold-hero-seam" aria-hidden="true" />
      </div>
      <button type="button" onClick={toggle} className="fold-hero-toggle" aria-pressed={playing}>
        {playing ? "Pause demo" : "Play demo"}
      </button>
    </div>
  );
}
