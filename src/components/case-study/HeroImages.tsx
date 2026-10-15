import type { Img } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { Reveal } from "../Reveal";
import { FadeImage } from "../FadeImage";

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
        className="py-10 sm:py-14 border-b border-rule"
      >
        <figure className="w-full rounded-[6px] overflow-hidden border border-rule bg-surface">
          <FadeImage
            src={img.src}
            alt={img.alt || title}
            width={dims.width}
            height={dims.height}
            className="w-full h-auto max-h-[75svh] object-cover rounded-[6px]"
          />
        </figure>
      </Reveal>
    );
  }

  return (
    <Reveal
      as="section"
      aria-label="Hero images"
      className="py-10 sm:py-14 border-b border-rule"
    >
      <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
        {images.map((img, index) => {
          const dims = imageDims(img.src);
          return (
            <figure
              key={index}
              className="snap-start shrink-0 h-[min(60svh,560px)] max-w-[85vw] rounded-[6px] overflow-hidden border border-rule bg-surface"
            >
              <FadeImage
                src={img.src}
                alt={img.alt || `${title} hero image ${index + 1}`}
                width={dims.width}
                height={dims.height}
                className="h-full w-auto max-w-full object-cover rounded-[6px]"
                loading={index < 2 ? "eager" : "lazy"}
              />
            </figure>
          );
        })}
      </div>
    </Reveal>
  );
}
