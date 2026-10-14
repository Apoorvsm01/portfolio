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
        wide
          ? "w-full lg:-ml-[calc((100%+3rem)/3)] lg:w-[calc((400%+3rem)/3)] lg:max-w-none"
          : "w-full max-w-[42rem]"
      }`}
    >
      <div className="rounded-[16px] overflow-hidden border border-line bg-surface">
        <FadeImage
          src={image.src}
          alt={alt}
          width={dims.width}
          height={dims.height}
          loading="lazy"
          className="case-study-scroll-img w-full h-auto object-cover rounded-[16px]"
        />
      </div>
      {caption && caption.trim() !== "" && (
        <figcaption className="mt-3 text-xs sm:text-sm text-muted leading-relaxed max-w-[42rem]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
