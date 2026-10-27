"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FadeImage } from "../FadeImage";
import { site } from "../../../content/site";
import { shelfCopy } from "../../../content/ask";
import type { ProjectCard } from "./types";

// Big tvOS-style hero shelf: scroll-snap slides, cover parallax driven by scroll position, arrows and dots.
export function FeaturedCarousel({ projects }: { projects: ProjectCard[] }) {
  const track = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      const offset = (r.left + r.width / 2 - mid) / r.width;
      (child as HTMLElement).style.setProperty("--p", offset.toFixed(3));
      if (Math.abs(offset) < best) {
        best = Math.abs(offset);
        nearest = i;
      }
    });
    setActive(nearest);
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  function go(index: number) {
    const el = track.current;
    const slide = el?.children[index] as HTMLElement | undefined;
    if (!el || !slide) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section className="feature" aria-roledescription="carousel" aria-label={shelfCopy.featuredLabel}>
      <div ref={track} className="feature-track">
        {projects.map((p, i) => {
          const flag = site.flags[p.flag];
          return (
            <Link
              key={p.slug}
              href={p.href}
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
      </div>
      <div className="feature-controls">
        <div className="feature-dots">
          {projects.map((p, i) => (
            <button key={p.slug} type="button" className="feature-dot" aria-label={`Show ${p.title}`} aria-current={i === active} onClick={() => go(i)} />
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
