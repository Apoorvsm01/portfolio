/* eslint-disable @next/next/no-img-element */
import type { Block, Section } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { Reveal } from "../Reveal";

function renderListItem(item: string) {
  const match = item.match(/^([^:\n]+):\s*(.*)$/);
  if (match) {
    const [, term, rest] = match;
    if (!/^(https?|ftp)$/i.test(term)) {
      return (
        <>
          <strong className="font-semibold text-text">{term}</strong>:{" "}
          <span>{rest}</span>
        </>
      );
    }
  }
  return item;
}

export function BlockRenderer({
  block,
  studyTitle = "",
  sectionLabel = "",
}: {
  block: Block;
  studyTitle?: string;
  sectionLabel?: string;
}) {
  const cleanLabel = sectionLabel?.trim() || "";
  const hasLabel = Boolean(cleanLabel);
  const imageFallbackAlt = hasLabel
    ? (studyTitle ? `${studyTitle} — ${cleanLabel}` : cleanLabel)
    : (studyTitle ? `${studyTitle} screenshot` : "Screenshot");

  switch (block.type) {
    case "heading": {
      // SPEC S: skip a heading block whose text equals its section label
      if (
        cleanLabel &&
        block.text.trim().toLowerCase() === cleanLabel.toLowerCase()
      ) {
        return null;
      }
      return (
        <h3 className="font-display text-h3 font-bold tracking-tight text-text mt-8 first:mt-0 mb-4">
          {block.text}
        </h3>
      );
    }

    case "paragraph":
      return (
        <p className="max-w-[42rem] text-[1.0625rem] leading-[1.65] text-text/90 mb-6 last:mb-0 whitespace-pre-line">
          {block.text}
        </p>
      );

    case "list":
      return (
        <ul className="max-w-[42rem] list-disc pl-5 space-y-2.5 mb-6 last:mb-0 text-[1.0625rem] leading-[1.65] text-text/90 marker:text-muted">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {renderListItem(item)}
            </li>
          ))}
        </ul>
      );

    case "images": {
      const { images } = block;
      if (!images || images.length === 0) return null;

      if (images.length === 1) {
        const img = images[0];
        const alt = img.alt?.trim() ? img.alt : imageFallbackAlt;
        const dims = imageDims(img.src);
        return (
          <figure className="w-full rounded-[16px] overflow-hidden border border-line bg-surface my-8 first:mt-0 last:mb-0">
            <img
              src={img.src}
              alt={alt}
              width={dims.width}
              height={dims.height}
              className="w-full h-auto object-cover rounded-[16px]"
              loading="lazy"
            />
          </figure>
        );
      }

      if (images.length === 2) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-8 first:mt-0 last:mb-0">
            {images.map((img, i) => {
              const alt = img.alt?.trim() ? img.alt : imageFallbackAlt;
              const dims = imageDims(img.src);
              return (
                <figure
                  key={i}
                  className="rounded-[16px] overflow-hidden border border-line bg-surface"
                >
                  <img
                    src={img.src}
                    alt={alt}
                    width={dims.width}
                    height={dims.height}
                    className="w-full h-auto object-cover rounded-[16px]"
                    loading="lazy"
                  />
                </figure>
              );
            })}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-8 first:mt-0 last:mb-0">
          {images.map((img, i) => {
            const alt = img.alt?.trim() ? img.alt : imageFallbackAlt;
            const dims = imageDims(img.src);
            return (
              <figure
                key={i}
                className="rounded-[16px] overflow-hidden border border-line bg-surface"
              >
                <img
                  src={img.src}
                  alt={alt}
                  width={dims.width}
                  height={dims.height}
                  className="w-full h-auto object-cover rounded-[16px]"
                  loading="lazy"
                />
              </figure>
            );
          })}
        </div>
      );
    }

    case "cards":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-8 first:mt-0 last:mb-0">
          {block.cards.map((card, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-[20px] bg-surface border border-line flex flex-col justify-start"
            >
              <div className="font-semibold text-text text-base mb-2">
                {card.label}
              </div>
              <div className="text-sm text-muted space-y-1">
                {card.value.split("\n").map((line, lIdx) => (
                  <div key={lIdx}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "video": {
      const vimeoTitle = hasLabel
        ? (studyTitle ? `${studyTitle} — ${cleanLabel} video` : `${cleanLabel} video`)
        : (studyTitle || "Video");
      return (
        <div className="aspect-[16/9] w-full rounded-[20px] overflow-hidden border border-line bg-surface my-8 first:mt-0 last:mb-0">
          <iframe
            src={`https://player.vimeo.com/video/${block.vimeoId}?autoplay=1&muted=1&loop=1&background=1`}
            title={vimeoTitle}
            loading="lazy"
            allow="autoplay; fullscreen"
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    case "embed": {
      const embedTitle = hasLabel
        ? (studyTitle ? `${studyTitle} — ${cleanLabel} — interactive prototype` : `${cleanLabel} — interactive prototype`)
        : (studyTitle ? `${studyTitle} — interactive prototype` : "Interactive prototype");
      return (
        <div className="aspect-[16/10] w-full rounded-[20px] overflow-hidden border border-line bg-surface my-8 first:mt-0 last:mb-0">
          <iframe
            src={block.src}
            title={embedTitle}
            loading="lazy"
            allow="autoplay; fullscreen"
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    default:
      return null;
  }
}

export function SectionBlock({
  section,
  index = 0,
  block,
  studyTitle = "",
}: {
  section?: Section;
  index?: number;
  block?: Block;
  studyTitle?: string;
}) {
  if (block) {
    return <BlockRenderer block={block} studyTitle={studyTitle} sectionLabel="" />;
  }

  if (!section) return null;

  const hasLabel = Boolean(section.label && section.label.trim() !== "");

  if (hasLabel) {
    return (
      <Reveal
        as="section"
        id={`section-${index}`}
        aria-labelledby={`section-heading-${index}`}
        className="py-16 sm:py-24 border-b border-line scroll-mt-24"
      >
        <h2
          id={`section-heading-${index}`}
          className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-8 sm:mb-12"
        >
          {section.label}
        </h2>
        <div>
          {section.blocks.map((b, bIdx) => (
            <BlockRenderer
              key={bIdx}
              block={b}
              studyTitle={studyTitle}
              sectionLabel={section.label}
            />
          ))}
        </div>
      </Reveal>
    );
  }

  // Untitled section: MUST be a <div>, not a section (SPEC S)
  return (
    <Reveal
      as="div"
      id={`section-${index}`}
      className="py-16 sm:py-24 border-b border-line scroll-mt-24"
    >
      <div>
        {section.blocks.map((b, bIdx) => (
          <BlockRenderer
            key={bIdx}
            block={b}
            studyTitle={studyTitle}
            sectionLabel={section.label}
          />
        ))}
      </div>
    </Reveal>
  );
}
