import type { CaseStudy } from "../../../content/types";
import { Reveal } from "../Reveal";

export function PrototypeEmbed({
  prototype,
  title,
}: {
  prototype: CaseStudy["prototype"];
  title: string;
}) {
  if (!prototype || !prototype.embed) return null;

  const targetLink = prototype.link ?? prototype.embed;

  return (
    <Reveal
      as="section"
      aria-label="Interactive prototype"
      className="py-12 sm:py-16 border-b border-line"
    >
      <div className="aspect-[16/10] w-full rounded-[20px] overflow-hidden border border-line bg-surface">
        <iframe
          src={prototype.embed}
          title={`${title} interactive prototype`}
          loading="lazy"
          allow="autoplay; fullscreen"
          className="w-full h-full border-0"
        />
      </div>
      <div className="mt-4">
        <a
          href={targetLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the interactive prototype for ${title}`}
          className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-text hover:text-accent transition-colors"
        >
          <span>Open the interactive prototype</span>
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </Reveal>
  );
}
