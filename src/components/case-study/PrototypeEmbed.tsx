"use client";

import { useState } from "react";
import type { CaseStudy } from "../../../content/types";
import { Reveal } from "../Reveal";

export function PrototypeEmbed({
  prototype,
  title,
}: {
  prototype: CaseStudy["prototype"];
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!prototype || !prototype.embed) return null;

  const targetLink = prototype.link ?? prototype.embed;

  return (
    <Reveal
      as="section"
      aria-label="Interactive prototype"
      className="py-10 sm:py-14 border-b border-rule"
    >
      <div className="relative aspect-[16/10] w-full rounded-[6px] overflow-hidden border border-rule bg-surface">
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
      <div className="mt-4">
        <a
          href={targetLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the interactive prototype for ${title}`}
          className="link-underline group min-h-[44px] inline-flex items-center gap-1.5 text-sm font-sans font-medium text-fg hover:text-accent transition-colors"
        >
          <span>Open the interactive prototype</span>
          <span aria-hidden="true" className="arrow-nudge-diag">↗</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </Reveal>
  );
}
