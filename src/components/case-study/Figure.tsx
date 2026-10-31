import type { Img } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { FadeImage } from "../FadeImage";

export function Figure({
  image,
  caption,
  wide = false,
  studyTitle = "",
}: {
  image: Img;
  caption?: string;
  wide?: boolean;
  studyTitle?: string;
}) {
  const dims = imageDims(image.src);
  const alt = image.alt?.trim()
    ? image.alt
    : caption?.trim() || (studyTitle ? `${studyTitle} specification` : "Specification");

  const isPortrait = dims.height > dims.width;
  // The IA diagram gets the signature top-row-then-bottom-row reveal instead of the generic media open.
  const storyAttr = /\/ia\.svg$/.test(image.src) ? { "data-story-ia": "" } : { "data-story-media": "" };

  return (
    <figure
      className={`my-8 first:mt-0 last:mb-0 ${
        isPortrait
          ? "w-full max-w-[22rem] mx-auto"
          : wide
          ? "w-full"
          : "w-full max-w-[46rem]"
      }`}
    >
      <div {...storyAttr} className="rounded-[6px] overflow-hidden border border-rule bg-surface">
        <FadeImage
          src={image.src}
          alt={alt}
          width={dims.width}
          height={dims.height}
          loading="lazy"
          className="w-full h-auto object-cover rounded-[6px]"
        />
      </div>
      {caption && caption.trim() !== "" && (
        <figcaption
          className={`mt-3 font-sans text-xs sm:text-sm text-muted leading-relaxed ${
            isPortrait ? "text-center" : "max-w-[46rem]"
          }`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
