"use client";

import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { m } from "motion/react";
import { WorkCard } from "./WorkCard";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { HomeMotion, SPRING_PRESS } from "./motion/home-motion";
import type { NavIndexItem } from "../lib/nav-index";

const DOMAINS = ["All", "Automotive", "Spatial", "Health", "Personal"] as const;
type DomainFilter = (typeof DOMAINS)[number];

interface ExitingCard {
  item: NavIndexItem;
  top: number;
  left: number;
  width: number;
  height: number;
}

export function WorkIndex({ items = [] }: { items?: NavIndexItem[] }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<DomainFilter>("All");
  const [exitingItems, setExitingItems] = useState<ExitingCard[]>([]);
  const containerRef = useRef<HTMLUListElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const exitingRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());

  // Initialize filter state synchronously using useLayoutEffect before paint
  useLayoutEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (hash === "automotive") {
        setFilter("Automotive");
      } else if (hash === "spatial") {
        setFilter("Spatial");
      } else if (hash === "health") {
        setFilter("Health");
      } else if (hash === "personal") {
        setFilter("Personal");
      } else {
        setFilter("All");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((p) => p.domain === filter);
  }, [items, filter]);

  // Handle filter selection and URL hash sync
  const handleFilterChange = (domain: DomainFilter) => {
    if (domain === filter) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Record 'First' rects for FLIP
    cardRefs.current.forEach((el, slug) => {
      if (el) {
        prevRects.current.set(slug, el.getBoundingClientRect());
      }
    });

    const nextProjects =
      domain === "All" ? items : items.filter((p) => p.domain === domain);

    if (!prefersReduced && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const exiting = filteredProjects.filter(
        (curr) => !nextProjects.some((next) => next.slug === curr.slug)
      );

      const exitingCards: ExitingCard[] = exiting
        .map((item) => {
          const rect = prevRects.current.get(item.slug);
          if (!rect) return null;
          return {
            item,
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
          };
        })
        .filter((c): c is ExitingCard => c !== null);

      setExitingItems(exitingCards);
    } else {
      setExitingItems([]);
    }

    setFilter(domain);

    // Update URL hash without jumping
    if (domain === "All") {
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      window.history.replaceState(null, "", `#${domain.toLowerCase()}`);
    }
  };

  // FLIP animation (First, Last, Invert, Play) on filter change
  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      return;
    }

    // 1. Animate remaining/moving cards
    filteredProjects.forEach((p) => {
      const el = cardRefs.current.get(p.slug);
      const first = prevRects.current.get(p.slug);
      if (!el || !first) return;

      const last = el.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;

      if (dx !== 0 || dy !== 0) {
        // Invert
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "none";

        // Play
        requestAnimationFrame(() => {
          el.style.transition =
            "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
          el.style.transform = "none";

          // Clean up inline styles on transitionend so hover styles and rect measurements are restored
          const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName === "transform") {
              el.style.transform = "";
              el.style.transition = "";
              el.removeEventListener("transitionend", handleTransitionEnd);
            }
          };
          el.addEventListener("transitionend", handleTransitionEnd);
        });
      }
    });

    // 2. Animate exiting cards (opacity & scale out before unmounting)
    if (exitingItems.length > 0) {
      requestAnimationFrame(() => {
        exitingRefs.current.forEach((el) => {
          el.style.transition =
            "opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
          el.style.opacity = "0";
          el.style.transform = "scale(0.95)";
        });
      });

      const timer = setTimeout(() => {
        setExitingItems([]);
      }, 300);

      return () => clearTimeout(timer);
    }

    // Clear saved rects
    prevRects.current.clear();
  }, [filteredProjects, exitingItems.length]);

  return (
    <HomeMotion>
    <main id="main" className="container-page flex-1 py-16 md:py-24">
      {/* Header */}
      <header className="mb-10 sm:mb-12 border-b border-rule pb-8 sm:pb-12">
        <h1 className="font-display font-black text-h1 text-fg leading-[1.08] mb-6">
          Work
        </h1>

        {/* Filter bar of domain chips: restyled as v4 pill doors */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div
            role="toolbar"
            aria-label="Filter projects by domain"
            className="flex flex-wrap gap-2.5"
          >
            {DOMAINS.map((domain) => {
              const isActive = filter === domain;
              return (
                <m.button
                  key={domain}
                  whileTap={reduced ? undefined : { scale: 0.97 }}
                  transition={SPRING_PRESS}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFilterChange(domain)}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--accent)",
                          color: "var(--ground)",
                          borderColor: "var(--accent)",
                        }
                      : undefined
                  }
                  className={`min-h-[44px] px-5 py-2.5 rounded-full border text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer inline-flex items-center justify-center ${
                    isActive
                      ? "shadow-xs font-bold"
                      : "bg-transparent text-muted hover:text-fg border-rule hover:border-fg"
                  }`}
                >
                  {domain}
                </m.button>
              );
            })}
          </div>

          {/* Showing N projects announcement */}
          <div
            aria-live="polite"
            className="text-xs sm:text-sm text-muted font-sans font-medium"
          >
            Showing {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
          </div>
        </div>
      </header>

      {/* Grid of WorkCards */}
      <ul
        ref={containerRef}
        className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 list-none p-0 m-0"
      >
        {filteredProjects.map((work, index) => (
          <li
            key={work.slug}
            ref={(el) => {
              if (el) {
                cardRefs.current.set(work.slug, el);
              } else {
                cardRefs.current.delete(work.slug);
              }
            }}
            className={
              index === 0 && filter === "All"
                ? "col-span-1 md:col-span-1 xl:col-span-2"
                : "col-span-1"
            }
          >
            <WorkCard work={work} isLead={index === 0 && filter === "All"} />
          </li>
        ))}

        {/* Retained exiting cards animating out before unmounting */}
        {exitingItems.map(({ item, top, left, width, height }) => (
          <li
            key={`exit-${item.slug}`}
            ref={(el) => {
              if (el) {
                exitingRefs.current.set(item.slug, el);
              } else {
                exitingRefs.current.delete(item.slug);
              }
            }}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              pointerEvents: "none",
              zIndex: 0,
              opacity: 1,
              transform: "scale(1)",
              transformOrigin: "center center",
            }}
            className="list-none"
          >
            <WorkCard work={item} isLead={false} />
          </li>
        ))}
      </ul>
    </main>
    </HomeMotion>
  );
}
