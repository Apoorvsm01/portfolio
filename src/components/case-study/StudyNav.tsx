import Link from "next/link";
import { getStudyNeighbors, studyHref } from "../../lib/content";
import { Reveal } from "../Reveal";

export function StudyNav({ currentSlug }: { currentSlug: string }) {
  const { prev, next } = getStudyNeighbors(currentSlug);

  if (!prev && !next) return null;

  return (
    <Reveal
      as="nav"
      aria-label="Case study navigation"
      className="py-12 sm:py-16 border-b border-line"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {prev ? (
          <Link
            href={studyHref(prev.slug)}
            className="group flex flex-col p-6 rounded-[20px] bg-surface border border-line hover:border-muted/60 transition-colors"
          >
            <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2 flex items-center gap-1.5 group-hover:text-accent transition-colors">
              <span
                aria-hidden="true"
                className="group-hover:-translate-x-1 transition-transform"
              >
                ←
              </span>
              <span>Previous</span>
            </span>
            <span className="font-display font-bold text-lg sm:text-xl text-text group-hover:text-accent transition-colors">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {next && (
          <Link
            href={studyHref(next.slug)}
            className={`group flex flex-col p-6 rounded-[20px] bg-surface border border-line hover:border-muted/60 transition-colors text-right ${
              !prev ? "sm:col-start-2" : ""
            }`}
          >
            <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2 flex items-center justify-end gap-1.5 group-hover:text-accent transition-colors">
              <span>Next</span>
              <span
                aria-hidden="true"
                className="group-hover:translate-x-1 transition-transform"
              >
                →
              </span>
            </span>
            <span className="font-display font-bold text-lg sm:text-xl text-text group-hover:text-accent transition-colors">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </Reveal>
  );
}
