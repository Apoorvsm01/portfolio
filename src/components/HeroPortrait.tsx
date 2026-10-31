"use client";

import { FadeImage } from "./FadeImage";

export function HeroPortrait({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <div className="w-full max-w-[22rem] md:max-w-none aspect-[4/5] rounded-[6px] overflow-hidden border border-rule">
      <FadeImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover rounded-[6px]"
      />
    </div>
  );
}
