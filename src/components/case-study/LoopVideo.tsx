"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "../../lib/asset";

// Muted looping local video. Under prefers-reduced-motion it never autoplays: the poster is
// shown with a play button instead.
export function LoopVideo({
  src,
  poster,
  label,
  width,
  height,
  className = "w-full h-auto",
  eager = false,
}: {
  src: string;
  poster: string;
  label: string;
  width?: number;
  height?: number;
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        ref.current?.pause();
        setPlaying(false);
      } else {
        void ref.current?.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative">
      <video
        ref={ref}
        src={asset(src)}
        poster={asset(poster)}
        width={width}
        height={height}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-label={label}
        className={className}
      />
      {reduced && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause video: ${label}` : `Play video: ${label}`}
          className="absolute bottom-3 left-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full bg-bg/80 text-fg border border-rule focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            {playing ? (
              <path d="M4 3h3v10H4zM9 3h3v10H9z" />
            ) : (
              <path d="M4 2.5v11l9-5.5z" />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
