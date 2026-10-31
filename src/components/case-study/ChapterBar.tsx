"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { Section } from "../../../content/types";

export interface ChapterBarProps {
  sections: Section[];
  flagColor?: string;
}

export function ChapterBar({
  sections,
  flagColor = "#f5a524",
}: ChapterBarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const disclosureRef = useRef<HTMLDivElement | null>(null);

  const flagBg = flagColor;

  const labelledSections = useMemo(
    () =>
      sections
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => Boolean(section.label && section.label.trim() !== "")),
    [sections]
  );

  // Scrollspy: active item reflects the section whose top is nearest above 35% of the viewport;
  // when scrolled above the first labelled section, no item is active.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const updateActive = () => {
      const threshold = window.innerHeight * 0.35;
      let currentActiveId = "";
      let nearestTop = -Infinity;

      for (const { index } of labelledSections) {
        const el = document.getElementById(`section-${index}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold && top > nearestTop) {
          nearestTop = top;
          currentActiveId = `section-${index}`;
        }
      }

      setActiveId(currentActiveId);

      // Detect if user has scrolled past hero
      const heroEl = document.getElementById("case-study-hero");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setScrolledPastHero(rect.bottom <= 64);
      }

      rafId = null;
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [labelledSections]);

  // Keyboard navigation (↑/↓ arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest('[role="tablist"], [role="listbox"], [role="menu"], dialog[open], pre'))
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (e.shiftKey) return;
        const elements = labelledSections
          .map(({ index }) => document.getElementById(`section-${index}`))
          .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (e.key === "ArrowDown") {
          const next = elements.find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top > 80;
          });
          if (next) {
            e.preventDefault();
            next.scrollIntoView({
              behavior: prefersReduced ? "auto" : "smooth",
            });
            window.history.replaceState(null, "", `#${next.id}`);
          }
        } else if (e.key === "ArrowUp") {
          const prev = [...elements].reverse().find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < -80;
          });
          if (prev) {
            e.preventDefault();
            prev.scrollIntoView({
              behavior: prefersReduced ? "auto" : "smooth",
            });
            window.history.replaceState(null, "", `#${prev.id}`);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [labelledSections]);

  // Click outside and Escape listener for disclosure
  useEffect(() => {
    if (!isDisclosureOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (disclosureRef.current && !disclosureRef.current.contains(e.target as Node)) {
        setIsDisclosureOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDisclosureOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isDisclosureOpen]);

  if (labelledSections.length < 2) return null;

  const currentIdx = labelledSections.findIndex(
    (s) => `section-${s.index}` === activeId
  );
  const activeChapterIndex = currentIdx >= 0 ? currentIdx : 0;
  const currentChapter = labelledSections[activeChapterIndex];

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
      const prev = labelledSections[activeChapterIndex - 1];
      const el = document.getElementById(`section-${prev.index}`);
      if (el) {
        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
        window.history.replaceState(null, "", `#${el.id}`);
      }
    }
  };

  const handleNext = () => {
    if (activeChapterIndex < labelledSections.length - 1) {
      const next = labelledSections[activeChapterIndex + 1];
      const el = document.getElementById(`section-${next.index}`);
      if (el) {
        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
        window.history.replaceState(null, "", `#${el.id}`);
      }
    }
  };

  return (
    <div
      aria-label="Chapter bar"
      className={`sticky-chapter-bar sticky z-40 w-full bg-ground/95 backdrop-blur-md border-b border-rule transition-opacity duration-200 ${
        scrolledPastHero
          ? "opacity-100 pointer-events-auto animate-settle"
          : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div className="container-page h-14 flex items-center justify-between gap-4">
        {/* Left: Current chapter indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs text-muted shrink-0">
            {String(activeChapterIndex + 1).padStart(2, "0")}
          </span>
          <span className="font-sans font-bold text-sm sm:text-base text-fg truncate">
            {currentChapter.section.label}
          </span>
        </div>

        {/* Right: Prev/Next buttons + Chapters disclosure */}
        <div ref={disclosureRef} className="relative flex items-center gap-1.5 shrink-0">
          {/* Prev Chapter Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeChapterIndex <= 0}
            aria-label="Previous chapter"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-[6px] text-muted hover:text-fg hover:bg-surface border border-rule/60 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span aria-hidden="true" className="font-bold text-sm">←</span>
          </button>

          {/* Next Chapter Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={activeChapterIndex >= labelledSections.length - 1}
            aria-label="Next chapter"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-[6px] text-muted hover:text-fg hover:bg-surface border border-rule/60 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span aria-hidden="true" className="font-bold text-sm">→</span>
          </button>

          {/* Chapters Disclosure Toggle */}
          <button
            type="button"
            onClick={() => setIsDisclosureOpen((prev) => !prev)}
            aria-expanded={isDisclosureOpen}
            aria-controls="chapters-dropdown"
            className="min-h-[44px] px-3 py-2 rounded-[6px] border border-rule/60 bg-surface/50 text-muted hover:text-fg hover:border-rule transition-colors inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium cursor-pointer"
          >
            <span>Chapters</span>
            <span
              aria-hidden="true"
              className={`transition-transform duration-140 ${
                isDisclosureOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {/* Chapters Disclosure Dropdown */}
          {isDisclosureOpen && (
            <div
              id="chapters-dropdown"
              className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-[6px] bg-surface border border-rule shadow-xl p-2 z-50 animate-settle max-h-[60vh] overflow-y-auto"
            >
              <div className="px-3 py-2 border-b border-rule/50 flex items-center justify-between text-xs text-muted font-sans font-medium">
                <span>All Chapters ({labelledSections.length})</span>
                <span className="font-mono text-[11px]">↑/↓ jump</span>
              </div>
              <ol className="list-none p-0 m-0 pt-1 space-y-0.5">
                {labelledSections.map(({ section, index }, i) => {
                  const isActive = i === activeChapterIndex;
                  return (
                    <li key={index}>
                      <a
                        href={`#section-${index}`}
                        onClick={() => setIsDisclosureOpen(false)}
                        aria-current={isActive ? "true" : undefined}
                        className={`min-h-[44px] px-3 py-2 rounded-[4px] flex items-center gap-2.5 text-xs sm:text-sm font-sans transition-colors ${
                          isActive
                            ? "bg-ground text-fg font-bold"
                            : "text-muted hover:text-fg hover:bg-ground/60"
                        }`}
                        style={isActive ? { color: flagBg } : undefined}
                      >
                        <span className="font-mono text-xs opacity-75 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate">{section.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
