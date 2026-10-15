"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { headsetWall, STAGE } from "../../content/headsets";
import { asset } from "@/lib/asset";

// Stage px → container-query width units, so the wall keeps Framer's proportions at any width.
const cq = (px: number) => `${((px / STAGE.width) * 100).toFixed(3)}cqw`;
const MAX_TILT = 10; // degrees at the stage edge

export function HeadsetWall() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    // A damped spring toward the pointer target, snapping back to rest when the pointer leaves.
    const cur = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      for (const axis of ["x", "y"] as const) {
        const v = axis === "x" ? "vx" : "vy";
        cur[v] = cur[v] * 0.78 + (target[axis] - cur[axis]) * 0.06;
        cur[axis] += cur[v];
      }
      scene.style.setProperty("--tilt-x", `${cur.x.toFixed(3)}deg`);
      scene.style.setProperty("--tilt-y", `${cur.y.toFixed(3)}deg`);
      const settled =
        Math.abs(target.x - cur.x) < 0.01 && Math.abs(target.y - cur.y) < 0.01 && Math.abs(cur.vx) + Math.abs(cur.vy) < 0.01;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      target.y = nx * MAX_TILT; // pointer right → wall turns right
      target.x = -ny * MAX_TILT * 0.75;
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section aria-labelledby="headsets-heading" className="w-full bg-ground border-b border-rule py-16 md:py-24 overflow-hidden">
      <div className="container-page">
        <div ref={wrapRef} className="headset-wrap">
          <div className="headset-stage" style={{ "--persp": cq(STAGE.perspective) } as CSSProperties}>
            <div className="headset-copy">
              <h2 id="headsets-heading" className="font-display font-black text-h2 text-fg leading-[1.08] text-balance">
                {headsetWall.heading}
              </h2>
              <p className="mt-4 text-fg-2 text-base sm:text-lg leading-relaxed text-balance">{headsetWall.body}</p>
            </div>

            <ul ref={sceneRef} className="headset-scene" aria-label="Headsets I’ve designed for">
              {headsetWall.cards.map((card) => (
                <li
                  key={card.src}
                  className="headset-card"
                  style={
                    {
                      "--x": `${card.x}%`,
                      "--y": `${card.y}%`,
                      "--w": cq(card.w),
                      "--h": cq(card.h),
                      "--rx": `${card.rx ?? 0}deg`,
                      "--ry": `${card.ry ?? 0}deg`,
                      "--rz": `${card.rz ?? 0}deg`,
                      "--tz": cq(card.tz ?? 0),
                      "--radius": `${card.radius ?? 10}px`,
                    } as CSSProperties
                  }
                >
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(card.src)} alt={card.alt} loading="lazy" decoding="async" />
                    <figcaption>{card.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
