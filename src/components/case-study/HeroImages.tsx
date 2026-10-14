/* eslint-disable @next/next/no-img-element */
import type { Img } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { Reveal } from "../Reveal";

export function HeroImages({
  images,
  title,
}: {
  images: Img[];
  title: string;
}) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    const dims = imageDims(img.src);
    return (
      <Reveal
        as="section"
        aria-label="Hero image"
        className="py-12 sm:py-16 border-b border-line"
      >
        <figure className="w-full rounded-[16px] overflow-hidden border border-line bg-surface">
          <img
            src={img.src}
            alt={img.alt || title}
            width={dims.width}
            height={dims.height}
            className="w-full h-auto max-h-[75svh] object-cover rounded-[16px]"
          />
        </figure>
      </Reveal>
    );
  }

  return (
    <Reveal
      as="section"
      aria-label="Hero images"
      className="py-12 sm:py-16 border-b border-line"
    >
      <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
        {images.map((img, index) => {
          const dims = imageDims(img.src);
          return (
            <figure
              key={index}
              className="snap-start shrink-0 h-[min(60svh,560px)] max-w-[85vw] rounded-[16px] overflow-hidden border border-line bg-surface"
            >
              <img
                src={img.src}
                alt={img.alt || `${title} hero image ${index + 1}`}
                width={dims.width}
                height={dims.height}
                className="h-full w-auto max-w-full object-cover rounded-[16px]"
                loading={index < 2 ? "eager" : "lazy"}
              />
            </figure>
          );
        })}
      </div>
    </Reveal>
  );
}
