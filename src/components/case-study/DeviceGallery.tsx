import type { DeviceShot } from "../../../content/types";
import { site } from "../../../content/site";
import { imageDims } from "../../lib/content";
import { FadeImage } from "../FadeImage";

export interface DeviceGalleryProps {
  items: DeviceShot[];
  caption?: string;
  title?: string;
  studyTitle?: string;
}

/**
 * Server Component: renders a row of devices with Apple bezel composited screenshots
 * at true relative size, without drop shadows, borders, or rounded clipping.
 */
export function DeviceGallery({
  items,
  caption,
  title,
  studyTitle,
}: DeviceGalleryProps) {
  if (!items || items.length === 0) return null;

  const effectiveTitle = title || studyTitle || "";

  return (
    <figure className="device-gallery my-8 first:mt-0 last:mb-0 w-full [--mm:2.1px] md:[--mm:2.8px] lg:[--mm:3.6px]">
      {/* Devices row: horizontal scroll-snap on mobile (<640px), wrap and center on md+ */}
      <div className="flex items-end justify-start md:justify-center md:flex-wrap gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory px-4 md:px-0 py-4 max-w-full">
        {items.map((item, index) => {
          const heightMm = site.deviceHeightsMm[item.device] ?? 150;
          const dims = imageDims(item.src);
          const alt =
            item.alt?.trim() ||
            item.caption?.trim() ||
            (effectiveTitle ? `${effectiveTitle} — ${item.device}` : item.device);

          // Width auto from intrinsic aspect ratio (calc(height * width / height))
          const deviceWidthCalc = `calc(max(200px, ${heightMm} * var(--mm, 2.1px)) * ${dims.width} / ${dims.height})`;

          return (
            <div
              key={index}
              className="flex flex-col items-center shrink-0 snap-start"
              style={{ width: deviceWidthCalc }}
            >
              <FadeImage
                src={item.src}
                alt={alt}
                width={dims.width}
                height={dims.height}
                loading="lazy"
                className="object-contain block"
                style={{
                  height: `calc(max(200px, ${heightMm} * var(--mm, 2.1px)))`,
                  width: "auto",
                  minHeight: "200px",
                }}
              />
              {item.caption && item.caption.trim() !== "" && (
                <span
                  className="mt-2.5 text-xs text-muted text-center leading-relaxed block w-full"
                  style={{
                    maxWidth: deviceWidthCalc,
                  }}
                >
                  {item.caption}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Group caption below the row */}
      {caption && caption.trim() !== "" && (
        <figcaption className="mt-4 md:mt-6 font-sans text-xs sm:text-sm text-muted text-center leading-relaxed max-w-[46rem] mx-auto">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
