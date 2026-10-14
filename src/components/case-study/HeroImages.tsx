/* eslint-disable @next/next/no-img-element */
import type { Img } from "../../../content/types";
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
    return (
      <Reveal
        as="section"
        aria-label="Hero image"
        className="py-12 sm:py-16 border-b border-line"
      >
        <div className="w-full rounded-[16px] overflow-hidden border border-line bg-surface">
          <img
            src={img.src}
            alt={img.alt || title}
            className="w-full h-auto max-h-[75vh] object-cover rounded-[16px]"
          />
        </div>
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
        {images.map((img, index) => (
          <div
            key={index}
            className="snap-start shrink-0 h-[min(60vh,560px)] max-w-[85vw] rounded-[16px] overflow-hidden border border-line bg-surface"
          >
            <img
              src={img.src}
              alt={img.alt || `${title} hero image ${index + 1}`}
              className="h-full w-auto max-w-full object-cover rounded-[16px]"
              loading={index < 2 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
