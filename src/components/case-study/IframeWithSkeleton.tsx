"use client";

import { useState } from "react";

export function IframeWithSkeleton({
  src,
  title,
  aspect = "aspect-[16/10]",
}: {
  src: string;
  title: string;
  aspect?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative ${aspect} w-full rounded-[6px] overflow-hidden border border-rule bg-surface my-8 first:mt-0 last:mb-0`}
    >
      {!loaded && <div className="shimmer-skeleton" aria-hidden="true" />}
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; fullscreen"
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-0 relative z-10"
      />
    </div>
  );
}
