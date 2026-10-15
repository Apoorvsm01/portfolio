"use client";

import { useState } from "react";
import type { BentoTile } from "../../../content/types";
import { site } from "../../../content/site";

export interface BentoProps {
  items: BentoTile[];
  flag?: string;
}

export function Bento({ items, flag = "amber" }: BentoProps) {
  // Only one tile open at a time when opened by click
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  // Hover opens independently
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const flagConfig =
    flag && site.flags[flag as keyof typeof site.flags]
      ? site.flags[flag as keyof typeof site.flags]
      : site.flags.amber;

  const rotations = [-1.3, 1.5, -1.2, 1.4, -1.5];

  const handleToggle = (index: number) => {
    if (clickedIndex === index) {
      // Toggle off and also clear hovered so it closes immediately on click
      setClickedIndex(null);
      setHoveredIndex(null);
    } else {
      setClickedIndex(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(index);
    }
  };

  return (
    <div
      className="my-10 sm:my-14"
      style={
        {
          "--bento-flag-bg": flagConfig.bg,
          "--bento-flag-ink": flagConfig.ink,
        } as React.CSSProperties
      }
    >
      {/* Bento Grid: 5 sticky note tiles */}
      <ol
        className="bento-grid list-none p-0 m-0"
        aria-label="Process and approach notes"
      >
        {items.map((item, index) => {
          const isOpen = clickedIndex === index || hoveredIndex === index;
          const rot = rotations[index % rotations.length];
          const isLead = index === 0;

          // Responsive grid layout per SPEC v5 B:
          // Tile 1 (lead): spans 3 cols x 2 rows on lg, 2 cols on md, 1 col on mobile
          // Tiles 2-5: spans 3 cols x 1 row on lg, 1 col on md, 1 col on mobile
          const gridClasses = isLead
            ? "lg:col-span-3 lg:row-span-2 md:col-span-2 col-span-1 min-h-[260px] sm:min-h-[300px] lg:min-h-[372px]"
            : "lg:col-span-3 lg:row-span-1 md:col-span-1 col-span-1 min-h-[180px]";

          const contentId = `bento-content-${index}`;

          return (
            <li
              key={item.title}
              data-open={isOpen ? "true" : "false"}
              style={
                {
                  "--i": index,
                  "--rot": `${rot}deg`,
                } as React.CSSProperties
              }
              className={`bento-tile ${gridClasses} grid-item-enter relative flex flex-col`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => {
                if (hoveredIndex === index) {
                  setHoveredIndex(null);
                }
              }}
              onClick={() => {
                if (isOpen) {
                  handleToggle(index);
                }
              }}
            >
              {/* Underneath: Paper-coloured base card */}
              <div
                id={contentId}
                className="bento-base absolute inset-0 w-full h-full rounded-[6px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xs select-text cursor-default"
              >
                <div className="bento-base-content flex flex-col justify-between h-full w-full">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-paper-muted font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="font-serif text-sm sm:text-base leading-relaxed text-paper-ink my-auto">
                    {item.condensed}
                  </p>

                  <div className="text-right">
                    <span className="font-mono text-[11px] text-paper-muted opacity-80">
                      Tap to flip
                    </span>
                  </div>

                  {/* Visually hidden full source text for assistive tech */}
                  <div className="sr-only">
                    <h4>Full notes for {item.title}:</h4>
                    {item.source.map((block, bIdx) => {
                      if (block.type === "paragraph") {
                        return <p key={bIdx}>{block.text}</p>;
                      }
                      if (block.type === "list") {
                        return (
                          <ul key={bIdx}>
                            {block.items.map((li, lIdx) => (
                              <li key={lIdx}>{li}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === "heading") {
                        return <p key={bIdx}>{block.text}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              {/* Cover: Sticky note button that flips up on peel */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(index);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => {
                  if (hoveredIndex === index) {
                    setHoveredIndex(null);
                  }
                }}
                className="bento-cover text-left p-0 border-0 focus-visible:outline-none"
              >
                {/* Front face */}
                <div className="bento-cover-front p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold opacity-75">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <span className="font-display font-black text-lg sm:text-xl md:text-2xl leading-tight text-balance my-auto block">
                    {item.title}
                  </span>

                  <span className="self-end font-sans text-xs font-semibold opacity-75 flex items-center gap-1 mt-auto">
                    <span>Peek</span>
                    <span aria-hidden="true" className="text-sm">
                      ↻
                    </span>
                  </span>
                </div>

                {/* Back face (darker tint visible mid-flip) */}
                <div
                  className="bento-cover-back p-5 sm:p-6"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ol>

      {/* Show full notes disclosure below the grid */}
      <details className="mt-8 border border-rule rounded-[6px] bg-surface p-4 sm:p-6 group">
        <summary className="cursor-pointer font-sans text-sm font-semibold text-fg hover:text-accent transition-colors flex items-center justify-between list-none focus-visible:outline-none">
          <span>Show full notes</span>
          <span
            aria-hidden="true"
            className="text-muted font-mono text-xs transition-transform duration-200 group-open:rotate-180"
          >
            ↓
          </span>
        </summary>
        <div className="mt-6 divide-y divide-rule/60 border-t border-rule/60 pt-4 space-y-6">
          {items.map((tile, i) => (
            <div key={i} className="pt-4 first:pt-0">
              <h4 className="font-display font-black text-base sm:text-lg text-fg mb-3">
                <span className="font-mono text-xs text-muted mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {tile.title}
              </h4>
              <div className="space-y-3 font-serif text-sm sm:text-base text-fg-2 leading-relaxed">
                {tile.source.map((block, bIdx) => {
                  if (block.type === "paragraph") {
                    return <p key={bIdx}>{block.text}</p>;
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={bIdx} className="list-disc pl-5 space-y-1.5">
                        {block.items.map((li, lIdx) => (
                          <li key={lIdx}>{li}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "heading") {
                    return (
                      <h5
                        key={bIdx}
                        className="font-sans font-bold text-fg text-sm mt-3"
                      >
                        {block.text}
                      </h5>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
