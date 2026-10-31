import type { Block, Section } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { FadeImage } from "../FadeImage";
import { Figure } from "./Figure";
import { Metrics } from "./Metrics";
import { Widgets } from "./Widgets";
import { Bento } from "./Bento";
import { DeviceGallery } from "./DeviceGallery";
import { IframeWithSkeleton } from "./IframeWithSkeleton";
import { LoopVideo } from "./LoopVideo";
import { RichText } from "./RichText";

function renderListItem(item: string) {
  const match = item.match(/^([^:\n]+):\s*(.*)$/);
  if (match) {
    const [, term, rest] = match;
    if (!/^(https?|ftp)$/i.test(term)) {
      return (
        <>
          <strong className="font-semibold text-fg">{term}</strong>:{" "}
          <span><RichText text={rest} /></span>
        </>
      );
    }
  }
  return <RichText text={item} />;
}

export function BlockRenderer({
  block,
  studyTitle = "",
  sectionLabel = "",
  flag,
}: {
  block: Block;
  studyTitle?: string;
  sectionLabel?: string;
  flag?: string;
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
        <h3 data-story-headline className="font-display text-h3 font-black tracking-tight text-fg mt-10 first:mt-0 mb-4">
          {block.text}
        </h3>
      );
    }

    case "paragraph":
      return (
        <p className="max-w-[46rem] font-serif text-base sm:text-lg leading-[1.6] text-fg-2 mb-6 last:mb-0 whitespace-pre-line text-pretty">
          <RichText text={block.text} />
        </p>
      );

    case "list":
      return (
        <ul className="max-w-[46rem] font-serif text-base sm:text-lg leading-[1.6] text-fg-2 list-disc pl-5 space-y-2.5 mb-6 last:mb-0 marker:text-muted">
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
          <figure data-story-media className="w-full rounded-[6px] overflow-hidden border border-rule bg-surface my-8 first:mt-0 last:mb-0">
            <FadeImage
              src={img.src}
              alt={alt}
              width={dims.width}
              height={dims.height}
              className="w-full h-auto object-cover rounded-[6px]"
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
                  data-story-media
                  className="rounded-[6px] overflow-hidden border border-rule bg-surface"
                >
                  <FadeImage
                    src={img.src}
                    alt={alt}
                    width={dims.width}
                    height={dims.height}
                    className="w-full h-auto object-cover rounded-[6px]"
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
                data-story-media
                className="rounded-[6px] overflow-hidden border border-rule bg-surface"
              >
                <FadeImage
                  src={img.src}
                  alt={alt}
                  width={dims.width}
                  height={dims.height}
                  className="w-full h-auto object-cover rounded-[6px]"
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
              data-story-batch
              className="p-5 sm:p-6 rounded-[6px] bg-surface border border-rule flex flex-col justify-start"
            >
              <div className="font-sans font-bold text-fg text-base mb-2">
                {card.label}
              </div>
              <div className="font-serif text-sm text-muted space-y-1">
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
        <IframeWithSkeleton
          src={`https://player.vimeo.com/video/${block.vimeoId}?autoplay=1&muted=1&loop=1&background=1`}
          title={vimeoTitle}
          aspect="aspect-[16/9]"
        />
      );
    }

    case "embed": {
      const embedTitle = hasLabel
        ? (studyTitle ? `${studyTitle} — ${cleanLabel} — interactive prototype` : `${cleanLabel} — interactive prototype`)
        : (studyTitle ? `${studyTitle} — interactive prototype` : "Interactive prototype");
      return (
        <IframeWithSkeleton
          src={block.src}
          title={embedTitle}
          aspect="aspect-[16/10]"
        />
      );
    }

    case "figure":
      return (
        <Figure
          image={block.image}
          caption={block.caption}
          wide={block.wide}
          studyTitle={studyTitle}
        />
      );

    case "loop": {
      const dims = imageDims(block.poster);
      const hasCaption = Boolean(block.caption?.trim());
      const label = hasCaption
        ? block.caption!
        : studyTitle
        ? `${studyTitle} looping demo`
        : "Looping demo";
      return (
        <figure
          className={`my-8 first:mt-0 last:mb-0 ${block.wide ? "w-full" : "w-full max-w-[46rem]"}`}
        >
          <div data-story-media className="rounded-[6px] overflow-hidden border border-rule bg-surface">
            <LoopVideo
              src={block.src}
              poster={block.poster}
              label={label}
              width={dims.width}
              height={dims.height}
              className="w-full h-auto object-cover rounded-[6px] block"
            />
          </div>
          {hasCaption && (
            <figcaption className="mt-3 max-w-[46rem] font-sans text-xs sm:text-sm text-muted leading-relaxed">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "metrics":
      return <Metrics items={block.items} />;

    case "widgets":
      return <Widgets items={block.items} />;

    case "bento":
      return <Bento items={block.items} flag={flag} />;

    case "devices":
      return (
        <DeviceGallery
          items={block.items}
          caption={block.caption}
          title={studyTitle}
        />
      );

    default:
      return null;
  }
}

export function SectionBlock({
  section,
  index = 0,
  block,
  studyTitle = "",
  flag,
}: {
  section?: Section;
  index?: number;
  block?: Block;
  studyTitle?: string;
  flag?: string;
}) {
  if (block) {
    return <BlockRenderer block={block} studyTitle={studyTitle} sectionLabel="" flag={flag} />;
  }

  if (!section) return null;

  const hasLabel = Boolean(section.label && section.label.trim() !== "");

  if (hasLabel) {
    return (
      <section
        id={`section-${index}`}
        aria-labelledby={`section-heading-${index}`}
        className="py-12 sm:py-16 md:py-20 border-b border-rule scroll-mt-24"
      >
        <h2
          id={`section-heading-${index}`}
          data-story-headline
          className="font-sans text-xs sm:text-sm text-muted font-medium mb-6"
        >
          {section.label}
        </h2>
        <div data-story-body>
          {section.blocks.map((b, bIdx) => (
            <BlockRenderer
              key={bIdx}
              block={b}
              studyTitle={studyTitle}
              sectionLabel={section.label}
              flag={flag}
            />
          ))}
        </div>
      </section>
    );
  }

  // Untitled section: MUST be a <div>, not a section (SPEC S)
  return (
    <div
      id={`section-${index}`}
      className="py-12 sm:py-16 md:py-20 border-b border-rule scroll-mt-24"
    >
      <div data-story-body>
        {section.blocks.map((b, bIdx) => (
          <BlockRenderer
            key={bIdx}
            block={b}
            studyTitle={studyTitle}
            sectionLabel={section.label}
            flag={flag}
          />
        ))}
      </div>
    </div>
  );
}
