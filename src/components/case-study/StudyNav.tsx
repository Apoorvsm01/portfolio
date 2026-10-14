import Link from "next/link";
import { site } from "../../../content/site";
import {
  coverFor,
  getAllStudies,
  getStudyNeighbors,
  imageDims,
  studyHref,
} from "../../lib/content";
import { Reveal } from "../Reveal";
import { FadeImage } from "../FadeImage";

export function StudyNav({ currentSlug }: { currentSlug: string }) {
  const { prev, next } = getStudyNeighbors(currentSlug);
  const nextStudy = next ?? getAllStudies()[0];
  const coverInfo = nextStudy ? coverFor(nextStudy.slug) : undefined;
  const cover = coverInfo?.img;
  const dims = cover ? imageDims(cover.src) : undefined;
  const blurb =
    site.work.find((w) => w.slug === nextStudy.slug)?.blurb ??
    (nextStudy.slug === site.featured.slug
      ? site.featured.summary
      : nextStudy.description);

  return (
    <Reveal
      as="nav"
      aria-label="Case study navigation"
      className="py-12 sm:py-16 border-b border-line"
    >
      {/* Large Next project card */}
      {nextStudy && (
        <div className="mb-8">
          <Link
            href={studyHref(nextStudy.slug)}
            rel="next"
            className="work-card group relative block rounded-[20px] bg-surface border border-line p-6 sm:p-8 hover:border-accent/40 transition-colors"
          >
            <div className="work-card-spotlight" aria-hidden="true" />
            <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 items-center">
              {cover && dims && (
                <figure className="aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 mb-6 md:mb-0 md:col-span-6 lg:col-span-5">
                  <FadeImage
                    src={cover.src}
                    alt=""
                    width={dims.width}
                    height={dims.height}
                    loading="lazy"
                    className={`w-full h-full ${
                      coverInfo?.fit === "contain"
                        ? "object-contain"
                        : "object-cover"
                    } group-hover:scale-[1.03] transition-transform duration-500`}
                  />
                </figure>
              )}
              <div className="w-full md:col-span-6 lg:col-span-7 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3 flex items-center gap-2">
                  <span>Next project</span>
                  <span
                    aria-hidden="true"
                    className="arrow-nudge-right text-accent font-bold"
                  >
                    →
                  </span>
                </span>
                <h3 className="font-display text-h2 font-bold text-text group-hover:text-accent transition-colors leading-tight">
                  {nextStudy.title}
                </h3>
                {blurb && (
                  <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-[42rem]">
                    {blurb}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Smaller Navigation Links: Previous & All work */}
      <div className="flex items-center justify-between pt-4 border-t border-line/60">
        <div>
          {prev ? (
            <Link
              href={studyHref(prev.slug)}
              rel="prev"
              className="link-underline min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors group"
            >
              <span aria-hidden="true" className="arrow-nudge-left">
                ←
              </span>
              <span>Previous</span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div>
          <Link
            href="/work/"
            className="link-underline min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors group"
          >
            <span>All work</span>
            <span aria-hidden="true" className="arrow-nudge-right">
              →
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
