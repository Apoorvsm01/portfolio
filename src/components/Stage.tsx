"use client";

import { useEffect, useRef } from "react";
import type { StagePicture } from "../../content/home";
import { Img } from "./Img";
import { asset } from "../lib/asset";
import { useReducedMotion } from "../lib/use-reduced-motion";

function StageVideo({ picture, on, eager }: { picture: StagePicture; on: boolean; eager: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (on && !reduced) void v.play().catch(() => {});
    else v.pause();
  }, [on, reduced]);
  return (
    <video
      ref={ref}
      src={asset(picture.video!)}
      poster={asset(picture.src)}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "metadata"}
      aria-label={picture.alt}
      style={{ objectPosition: picture.position }}
    />
  );
}

// A stack of pictures. Only the active one is visible; changing `active` crossfades over 1.6 seconds
// (set in CSS), and the active one settles from a slight scale.
export function Stage({ pictures, active, className = "" }: { pictures: StagePicture[]; active: number; className?: string }) {
  return (
    <div className={`stage ${className}`}>
      {pictures.map((p, i) => (
        <div
          key={p.src}
          className="stage__item"
          data-on={i === active}
          data-fit={p.fit}
          style={p.bg ? { background: p.bg } : undefined}
          aria-hidden={i === active ? undefined : true}
        >
          {p.video ? (
            <StageVideo picture={p} on={i === active} eager={i === 0} />
          ) : (
            <Img
              src={p.src}
              alt={i === active ? p.alt : ""}
              loading={i === 0 ? "eager" : "lazy"}
              style={{ objectPosition: p.position }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
