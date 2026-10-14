"use client";

import { useEffect, useState } from "react";
import type { Section } from "../../../content/types";

export function Toc({
  sections,
  variant = "all",
  className = "",
}: {
  sections: Section[];
  variant?: "all" | "chip-row" | "rail";
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string>("");

  const labelledSections = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.label && section.label.trim() !== ""));

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const top = intersecting.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          );
          setActiveId(top.target.id);
        }
      },
      {
        rootMargin: "-10% 0px -65% 0px",
        threshold: 0,
      }
    );

    labelledSections.forEach(({ index }) => {
      const el = document.getElementById(`section-${index}`);
      if (el) observer.observe(el);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "j" || e.key === "k") {
        const elements = labelledSections
          .map(({ index }) => document.getElementById(`section-${index}`))
          .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (e.key === "j") {
          const next = elements.find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top > 80;
          });
          if (next) {
            e.preventDefault();
            next.scrollIntoView({
              behavior: prefersReduced ? "auto" : "smooth",
            });
            window.history.pushState(null, "", `#${next.id}`);
          }
        } else if (e.key === "k") {
          const prev = [...elements].reverse().find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < -80;
          });
          if (prev) {
            e.preventDefault();
            prev.scrollIntoView({
              behavior: prefersReduced ? "auto" : "smooth",
            });
            window.history.pushState(null, "", `#${prev.id}`);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [labelledSections]);

  if (labelledSections.length < 3) return null;

  if (variant === "chip-row") {
    return (
      <nav aria-label="Table of contents" className={`py-6 border-b border-line ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
            Contents
          </div>
          <div className="text-[11px] text-muted flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono text-[10px] text-text">j</kbd>
            <span>/</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono text-[10px] text-text">k</kbd>
            <span>to jump</span>
          </div>
        </div>
        <ol className="flex gap-2.5 overflow-x-auto pb-2 list-none p-0 scrollbar-none">
          {labelledSections.map(({ section, index }, i) => {
            const isActive = activeId === `section-${index}`;
            return (
              <li key={index} className="shrink-0">
                <a
                  href={`#section-${index}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`min-h-[44px] px-4 py-2 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-accent text-accent bg-surface font-semibold shadow-xs"
                      : "border-line bg-surface text-muted hover:text-text hover:border-accent"
                  }`}
                >
                  <span className={`font-mono text-xs ${isActive ? "text-accent/80" : "text-muted/60"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{section.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  if (variant === "rail") {
    return (
      <nav aria-label="Table of contents" className={`py-2 ${className}`}>
        <div className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-4">
          Contents
        </div>
        <ol className="flex flex-col gap-1 list-none p-0">
          {labelledSections.map(({ section, index }, i) => {
            const isActive = activeId === `section-${index}`;
            return (
              <li key={index}>
                <a
                  href={`#section-${index}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                    isActive
                      ? "text-accent font-semibold bg-surface border-l-2 border-accent"
                      : "text-muted hover:text-text hover:bg-surface/50"
                  }`}
                >
                  <span className={`font-mono text-xs ${isActive ? "text-accent/80" : "text-muted/60"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{section.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono text-[11px] text-text">
            j
          </kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono text-[11px] text-text">
            k
          </kbd>
          <span>to jump between sections</span>
        </div>
      </nav>
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <Toc sections={sections} variant="chip-row" className={className} />
      </div>
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-[calc(var(--nav-h)+2rem)]">
          <Toc sections={sections} variant="rail" className={className} />
        </div>
      </aside>
    </>
  );
}
