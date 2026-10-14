import Link from "next/link";
import type { CaseStudy } from "../../../content/types";
import { Reveal } from "../Reveal";

export function Hero({ study }: { study: CaseStudy }) {
  const hasDescription = Boolean(
    study.description && study.description.trim() !== ""
  );
  const hasHmw = Boolean(study.hmw && study.hmw.trim() !== "");

  return (
    <Reveal as="header" className="pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-line">
      {/* Back link */}
      <div>
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors group mb-8"
        >
          <span
            aria-hidden="true"
            className="group-hover:-translate-x-1 transition-transform"
          >
            ←
          </span>
          <span>All work</span>
        </Link>
      </div>

      {/* Tags as small pills */}
      {study.tags && study.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {study.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-md bg-surface text-muted border border-line"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* h1 Title */}
      <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold tracking-tight text-text leading-[1.08] mb-6">
        {study.title}
      </h1>

      {/* Description as lede */}
      {hasDescription && (
        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-[40rem] mb-8">
          {study.description}
        </p>
      )}

      {/* "How might we" line */}
      {hasHmw && (
        <div className="max-w-[40rem] pl-4 border-l-2 border-accent">
          <p className="font-serif italic text-base sm:text-lg text-text leading-relaxed">
            <span className="text-accent">How might we</span> {study.hmw}
          </p>
        </div>
      )}
    </Reveal>
  );
}
