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
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-muted list-none p-0">
          <li>
            <Link
              href="/work/"
              className="link-underline min-h-[44px] inline-flex items-center hover:text-text transition-colors"
            >
              Work
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted/60">
            ›
          </li>
          <li
            aria-current="page"
            className="text-text font-medium truncate"
          >
            {study.title}
          </li>
        </ol>
      </nav>

      {/* Tags as small pills */}
      {study.tags && study.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-6 list-none p-0" aria-label="Study tags">
          {study.tags.map((tag) => (
            <li
              key={tag}
              className="text-xs px-2.5 py-1 rounded-md bg-surface text-muted border border-line"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {/* h1 Title */}
      <h1 className="font-display text-h1 font-bold tracking-tight text-text leading-[1.08] mb-6">
        {study.title}
      </h1>

      {/* Description as lede */}
      {hasDescription && (
        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-[42rem] mb-8">
          {study.description}
        </p>
      )}

      {/* "How might we" line */}
      {hasHmw && (
        <div className="max-w-[42rem] pl-4 border-l-2 border-accent">
          <p className="font-serif italic text-base sm:text-lg text-text leading-relaxed">
            <span className="text-accent">How might we</span> {study.hmw}
          </p>
        </div>
      )}
    </Reveal>
  );
}
