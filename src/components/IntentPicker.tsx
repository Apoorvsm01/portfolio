"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function IntentPicker({
  slugTitleMap = {},
}: {
  slugTitleMap?: Record<string, string>;
}) {
  const [selectedId, setSelectedId] = useState(site.intents[0]?.id ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [highlight, setHighlight] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const activeIndex = site.intents.findIndex((intent) => intent.id === selectedId);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeIntent = site.intents[safeIndex];

  useEffect(() => {
    const updateHighlight = () => {
      const el = tabRefs.current[safeIndex];
      if (el) {
        setHighlight({
          left: el.offsetLeft,
          top: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
          ready: true,
        });
      }
    };

    updateHighlight();
    window.addEventListener("resize", updateHighlight, { passive: true });
    return () => {
      window.removeEventListener("resize", updateHighlight);
    };
  }, [safeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % site.intents.length;
      setSelectedId(site.intents[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + site.intents.length) % site.intents.length;
      setSelectedId(site.intents[prevIndex].id);
      tabRefs.current[prevIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setSelectedId(site.intents[0].id);
      tabRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIndex = site.intents.length - 1;
      setSelectedId(site.intents[lastIndex].id);
      tabRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <Reveal as="section" aria-labelledby="intent-picker-heading" className="py-16 md:py-24 border-b border-line">
      <h2 id="intent-picker-heading" className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-5">
        What brings you here?
      </h2>

      <div
        role="tablist"
        aria-label="What brings you here"
        className="relative flex flex-wrap gap-3"
      >
        {highlight.ready && (
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 w-[100px] h-[44px] rounded-full bg-text pointer-events-none"
            style={{
              transform: `translate3d(${highlight.left}px, ${highlight.top}px, 0) scale(${highlight.width / 100}, ${highlight.height / 44})`,
              transformOrigin: "0 0",
              transitionProperty: "transform",
              transitionDuration: "var(--dur-2)",
              transitionTimingFunction: "var(--ease-out)",
            }}
          />
        )}
        {site.intents.map((intent, index) => {
          const isSelected = intent.id === activeIntent.id;
          return (
            <button
              key={intent.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${intent.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${intent.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedId(intent.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative z-10 min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border inline-flex items-center justify-center ${
                isSelected
                  ? highlight.ready
                    ? "text-bg border-transparent"
                    : "bg-text text-bg border-text shadow-sm"
                  : "bg-surface/60 text-muted border-line hover:text-text hover:border-muted/60"
              }`}
            >
              {intent.label}
            </button>
          );
        })}
      </div>

      {site.intents.map((intent) => {
        const isSelected = intent.id === activeIntent.id;
        if (!isSelected) return null;
        return (
          <div
            key={intent.id}
            role="tabpanel"
            id={`panel-${intent.id}`}
            aria-labelledby={`tab-${intent.id}`}
            tabIndex={0}
            className="intent-panel-animate mt-8 max-w-[42rem]"
          >
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              {intent.answer}
            </p>

            {intent.links && intent.links.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3 list-none p-0" aria-label="Recommended studies">
                {intent.links.map((slug) => {
                  const title = slugTitleMap[slug] ?? slug;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/work/${slug}/`}
                        className="group min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm bg-surface border border-line text-text hover:border-accent hover:text-accent transition-colors"
                      >
                        <span>{title}</span>
                        <span
                          aria-hidden="true"
                          className="arrow-nudge-right text-muted group-hover:text-accent transition-colors"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </Reveal>
  );
}
