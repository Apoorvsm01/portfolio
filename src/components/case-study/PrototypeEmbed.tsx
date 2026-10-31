"use client";

import { useState } from "react";
import type { CaseStudy } from "../../../content/types";
import { site } from "../../../content/site";
import { Reveal } from "../Reveal";

export function PrototypeEmbed({
  prototype,
  title,
  flag = "amber",
}: {
  prototype: CaseStudy["prototype"];
  title: string;
  flag?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!prototype || !prototype.embed) return null;

  const targetLink = prototype.link ?? prototype.embed;
  const flagConfig =
    flag && site.flags[flag as keyof typeof site.flags]
      ? site.flags[flag as keyof typeof site.flags]
      : site.flags.amber;

  const aspect = prototype.aspect?.trim() || "16 / 10";

  return (
    <Reveal
      as="section"
      aria-label="Interactive prototype"
      className="py-10 sm:py-14 border-b border-rule"
    >
      {/* Header row above the frame per SPEC v5 P */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <span className="font-sans text-xs sm:text-sm text-muted font-medium">
          Interactive prototype
        </span>
        <a
          href={targetLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the interactive prototype for ${title}`}
          style={{
            backgroundColor: "var(--accent)",
            color: flagConfig.ink,
          }}
          className="btn-prototype inline-flex items-center justify-center gap-2 rounded-[6px] font-sans font-semibold text-base min-h-[48px] px-5 hover:brightness-105 active:translate-y-[1px] group shrink-0"
        >
          <span>Open the interactive prototype</span>
          <span aria-hidden="true" className="arrow-slide-diag inline-block">
            ↗
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {/* Frame hugging prototype.aspect with black background, no padding/bars */}
      <div
        style={{ aspectRatio: aspect }}
        className="relative w-full rounded-[6px] overflow-hidden border border-rule bg-[#000]"
      >
        {!loaded && <div className="shimmer-skeleton" aria-hidden="true" />}
        <iframe
          src={prototype.embed}
          title={`${title} interactive prototype`}
          loading="lazy"
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
          className="w-full h-full border-0 relative z-10"
        />
      </div>
    </Reveal>
  );
}
