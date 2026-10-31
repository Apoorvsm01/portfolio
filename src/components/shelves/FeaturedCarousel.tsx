"use client";

import Link from "next/link";
import { animate, m, useMotionValue, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FadeImage } from "../FadeImage";
import { site } from "../../../content/site";
import { shelfCopy } from "../../../content/ask";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { SPRING_SNAP, SPRING_SOFT } from "../motion/home-motion";
import type { ProjectCard } from "./types";

const GAP = "clamp(0.9rem, 2vw, 1.4rem)";

type Stops = { min: number; targets: number[] };

// Big tvOS-style hero shelf. Before hydration it is a plain scroll-snap strip (works without JS). Once mounted
// the strip is draggable: on release it flicks with the pointer's velocity and springs to the nearest card.
// Arrows, dots and keyboard focus drive the same spring. Cover parallax still reads each slide's offset from
// the viewport centre.
export function FeaturedCarousel({ projects }: { projects: ProjectCard[] }) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const strip = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const playing = useRef<{ stop: () => void } | null>(null);
  const dragged = useRef(false);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [stops, setStops] = useState<Stops>({ min: 0, targets: [0] });

  // Where the strip rests for each card (card centred, clamped to the ends) and the drag range.
  const measure = useCallback((): Stops => {
    const vp = viewport.current;
    const st = strip.current;
    if (!vp || !st) return { min: 0, targets: [0] };
    const pad = parseFloat(getComputedStyle(vp).paddingLeft) || 0;
    const min = Math.min(0, vp.clientWidth - st.offsetWidth - pad * 2);
    const targets = Array.from(st.children).map((child) => {
      const slide = child as HTMLElement;
      const t = vp.clientWidth / 2 - pad - slide.offsetLeft - slide.offsetWidth / 2;
      return Math.max(min, Math.min(0, t));
    });
    return { min, targets };
  }, []);

  const sync = useCallback(() => {
    const vp = viewport.current;
    const st = strip.current;
    if (!vp || !st) return;
    const mid = vp.getBoundingClientRect().left + vp.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(st.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      const offset = (r.left + r.width / 2 - mid) / r.width;
      (child as HTMLElement).style.setProperty("--p", offset.toFixed(3));
      if (Math.abs(offset) < best) {
        best = Math.abs(offset);
        nearest = i;
      }
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;
    let raf = 0;
    const frame = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sync();
        if (vp.style.overflowX === "hidden") {
          setEdge({ start: x.get() >= -8, end: x.get() <= measure().min + 8 });
        } else {
          setEdge({ start: vp.scrollLeft < 8, end: vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 8 });
        }
      });
    };
    const remeasure = () => {
      setStops(measure());
      frame();
    };
    setMounted(true);
    remeasure();
    const stop = x.on("change", frame);
    vp.addEventListener("scroll", frame, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      cancelAnimationFrame(raf);
      stop();
      vp.removeEventListener("scroll", frame);
      window.removeEventListener("resize", remeasure);
    };
  }, [sync, measure, x]);

  const settle = useCallback(
    (target: number) => {
      playing.current?.stop();
      if (reduced) x.set(target);
      else playing.current = animate(x, target, SPRING_SNAP);
    },
    [reduced, x],
  );

  function go(index: number) {
    const { targets } = measure();
    const t = targets[Math.max(0, Math.min(targets.length - 1, index))];
    if (t !== undefined) settle(t);
  }

  function release(info: PanInfo) {
    const { min, targets } = measure();
    const projected = Math.max(min, Math.min(0, x.get() + info.velocity.x * 0.18));
    let best = targets[0] ?? 0;
    for (const t of targets) if (Math.abs(t - projected) < Math.abs(best - projected)) best = t;
    settle(best);
    // Swallow the click that follows a drag so releasing over a card does not open it.
    setTimeout(() => {
      dragged.current = false;
    }, 0);
  }

  return (
    <section className="feature" aria-roledescription="carousel" aria-label={shelfCopy.featuredLabel}>
      <div
        ref={viewport}
        className="feature-track"
        style={mounted ? { overflowX: "hidden", scrollSnapType: "none", touchAction: "pan-y" } : undefined}
        onScroll={(e) => {
          // Browsers scroll an overflow:hidden box to reveal focused children; the spring owns position instead.
          if (mounted && e.currentTarget.scrollLeft !== 0) e.currentTarget.scrollLeft = 0;
        }}
      >
        <m.div
          ref={strip}
          drag={mounted ? "x" : false}
          dragConstraints={{ left: stops.min, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          dragDirectionLock
          style={{ x, display: "flex", gap: GAP, width: "max-content", cursor: mounted ? "grab" : undefined }}
          onDragStart={() => {
            dragged.current = true;
            playing.current?.stop();
          }}
          onDragEnd={(_, info) => release(info)}
          onClickCapture={(e) => {
            if (dragged.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {projects.map((p, i) => {
            const flag = site.flags[p.flag];
            return (
              <Link
                key={p.slug}
                href={p.href}
                draggable={false}
                onFocus={() => {
                  if (mounted) go(i);
                }}
                className="feature-slide"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${projects.length}: ${p.title}`}
                style={{ "--flag": flag.bg, "--flag-ink": flag.ink } as React.CSSProperties}
              >
                <div className="feature-media">
                  {p.cover && (
                    <FadeImage
                      src={p.cover.src}
                      alt=""
                      width={p.cover.width}
                      height={p.cover.height}
                      loading={i === 0 ? "eager" : "lazy"}
                      draggable={false}
                      className={p.cover.fit === "contain" ? "object-contain p-10" : "object-cover"}
                    />
                  )}
                </div>
                <div className="feature-copy">
                  <span className="feature-kicker">{p.org ?? p.domain}</span>
                  <h2 className="feature-title">{p.title}</h2>
                  <p className="feature-claim">{p.claim}</p>
                </div>
              </Link>
            );
          })}
        </m.div>
      </div>
      <div className="feature-controls">
        <div className="feature-dots">
          {projects.map((p, i) => (
            <m.button
              key={p.slug}
              type="button"
              className="feature-dot"
              aria-label={`Show ${p.title}`}
              aria-current={i === active}
              onClick={() => go(i)}
              layout
              transition={reduced ? { duration: 0 } : SPRING_SOFT}
              style={{ borderRadius: 999, transition: "background-color 200ms" }}
            />
          ))}
        </div>
        <div className="feature-arrows">
          <button type="button" className="feature-arrow" aria-label="Previous project" disabled={edge.start} onClick={() => go(Math.max(0, active - 1))}>
            ←
          </button>
          <button type="button" className="feature-arrow" aria-label="Next project" disabled={edge.end} onClick={() => go(Math.min(projects.length - 1, active + 1))}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}
