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

  return (
    <figure
      className={`my-8 first:mt-0 last:mb-0 ${
        wide ? "w-full" : "w-full max-w-[46rem]"
      }`}
    >
      <div className="rounded-[6px] overflow-hidden border border-rule bg-surface">
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
        <figcaption className="mt-3 font-sans text-xs sm:text-sm text-muted leading-relaxed max-w-[46rem]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
