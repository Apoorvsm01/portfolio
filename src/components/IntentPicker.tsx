"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { site } from "../../content/site";
import { getStudy, studyHref } from "../lib/content";
import { Reveal } from "./Reveal";

export function IntentPicker() {
  const [selectedId, setSelectedId] = useState(site.intents[0]?.id ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = site.intents.findIndex((intent) => intent.id === selectedId);
  const activeIntent = site.intents[activeIndex >= 0 ? activeIndex : 0];

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
    <Reveal as="section" aria-label="What brings you here" className="py-24 md:py-32 border-b border-line">
      <h2 className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-5">
        What brings you here?
      </h2>

      <div
        role="tablist"
        aria-label="What brings you here"
        className="flex flex-wrap gap-2.5 sm:gap-3"
      >
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
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-text text-bg border-text shadow-sm"
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
        return (
          <div
            key={intent.id}
            role="tabpanel"
            id={`panel-${intent.id}`}
            aria-labelledby={`tab-${intent.id}`}
            hidden={!isSelected}
            tabIndex={0}
            className="mt-8 max-w-[40rem]"
          >
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              {intent.answer}
            </p>

            {intent.links && intent.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {intent.links.map((slug) => {
                  const study = getStudy(slug);
                  const title = study?.title ?? slug;
                  return (
                    <Link
                      key={slug}
                      href={studyHref(slug)}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-surface border border-line text-text hover:border-accent hover:text-accent transition-colors"
                    >
                      <span>{title}</span>
                      <span
                        aria-hidden="true"
                        className="text-muted group-hover:text-accent transition-colors"
                      >
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </Reveal>
  );
}
