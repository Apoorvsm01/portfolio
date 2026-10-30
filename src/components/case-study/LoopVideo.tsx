"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "../../lib/asset";

// A muted looping clip with a poster. Under reduced motion it stays on the poster until asked to play.
export function LoopVideo({
  src,
  poster,
  label,
  width,
  height,
  fill = false,
  eager = false,
}: {
  src: string;
  poster: string;
  label: string;
  width?: number;
  height?: number;
  fill?: boolean;
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
    <div className={`loop${fill ? " loop--fill" : ""}`}>
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
      />
      {reduced && (
        <button type="button" className="chip loop__btn" onClick={toggle} aria-label={playing ? `Pause video: ${label}` : `Play video: ${label}`}>
          {playing ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
}
