"use client";

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { site, type WorkRef } from "../../content/site";
import { WorkCard } from "./WorkCard";

const DOMAINS = ["All", "Automotive", "Spatial", "Health"] as const;
type DomainFilter = (typeof DOMAINS)[number];

export function WorkIndex() {
  // Construct the 9 projects with woven first using site.featuredDomain
  const allProjects: WorkRef[] = useMemo(() => {
    const featuredAsWork: WorkRef = {
      slug: site.featured.slug,
      org: site.featured.org,
      blurb: site.featured.summary,
      domain: site.featuredDomain,
    };
    return [featuredAsWork, ...site.work];
  }, []);

  const [filter, setFilter] = useState<DomainFilter>("All");
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());

  // Respect initial URL hash on mount and listen to hashchange
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (hash === "automotive") {
        setFilter("Automotive");
      } else if (hash === "spatial") {
        setFilter("Spatial");
      } else if (hash === "health") {
        setFilter("Health");
      } else {
        setFilter("All");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (filter === "All") return allProjects;
    return allProjects.filter((p) => p.domain === filter);
  }, [allProjects, filter]);

  // Handle filter selection and URL hash sync
  const handleFilterChange = (domain: DomainFilter) => {
    if (domain === filter) return;

    // Record 'First' rects for FLIP
    cardRefs.current.forEach((el, slug) => {
      if (el) {
        prevRects.current.set(slug, el.getBoundingClientRect());
      }
    });

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
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

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
            "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease";
          el.style.transform = "none";
        });
      }
    });

    // Clear saved rects
    prevRects.current.clear();
  }, [filteredProjects]);

  return (
    <main id="main" className="container-page flex-1 py-16 sm:py-24">
      {/* Header */}
      <header className="mb-10 sm:mb-12 border-b border-line pb-8 sm:pb-12">
        <h1 className="font-display text-h1 font-bold tracking-tight text-text leading-[1.08] mb-6">
          Work
        </h1>

        {/* Filter bar of domain chips */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div
            role="toolbar"
            aria-label="Filter projects by domain"
            className="flex flex-wrap gap-2.5"
          >
            {DOMAINS.map((domain) => {
              const isActive = filter === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFilterChange(domain)}
                  className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border inline-flex items-center justify-center ${
                    isActive
                      ? "bg-text text-bg border-text shadow-xs"
                      : "bg-surface text-muted border-line hover:text-text hover:border-muted/60"
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>

          {/* Showing N projects announcement */}
          <div
            aria-live="polite"
            className="text-xs sm:text-sm text-muted font-medium"
          >
            Showing {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
          </div>
        </div>
      </header>

      {/* Grid of WorkCards */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 list-none p-0">
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
      </ul>
    </main>
  );
}
