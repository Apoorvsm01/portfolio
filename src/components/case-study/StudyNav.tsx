import Link from "next/link";
import { site } from "../../../content/site";
import { studyMeta } from "../../../content/study-meta";
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
  const nextMeta = nextStudy ? studyMeta[nextStudy.slug] : undefined;
  const blurb =
    nextMeta?.claim ??
    site.work.find((w) => w.slug === nextStudy.slug)?.blurb ??
    (nextStudy.slug === site.featured.slug
      ? site.featured.summary
      : nextStudy.description);

  const flagName = nextMeta?.flag ?? "amber";
  const flagBg = site.flags[flagName]?.bg ?? "#f5a524";

  return (
    <Reveal
      as="nav"
      aria-label="Case study navigation"
      className="pt-16 sm:pt-20"
    >
      {/* Large Next project card in v4 card style */}
      {nextStudy && (
        <div className="mb-10 sm:mb-12">
          <Link
            href={studyHref(nextStudy.slug)}
            rel="next"
            style={{ borderTopColor: flagBg }}
            className="group relative block rounded-[6px] bg-surface border border-rule border-t-[3px] p-6 sm:p-8 card-lift"
          >
            <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 items-center">
              {cover && dims && (
                <figure className="aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-ground/50 border border-rule/40 mb-6 md:mb-0 md:col-span-6 lg:col-span-5">
                  <FadeImage
                    src={cover.src}
                    alt=""
                    width={dims.width}
                    height={dims.height}
                    loading="lazy"
                    className={`w-full h-full ${
                      coverInfo?.fit === "contain"
                        ? "object-contain p-2"
                        : "object-cover"
                    } group-hover:brightness-105 transition-[filter] duration-140`}
                  />
                </figure>
              )}
              <div className="w-full md:col-span-6 lg:col-span-7 flex flex-col justify-center">
                <span className="font-sans text-xs text-muted font-medium mb-2.5 flex items-center gap-2">
                  <span>Next project</span>
                  <span
                    aria-hidden="true"
                    className="arrow-slide-right text-accent font-bold"
                  >
                    →
                  </span>
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-fg group-hover:text-accent transition-colors leading-tight">
                  {nextStudy.title}
                </h3>
                {blurb && (
                  <p className="mt-3 font-serif text-sm sm:text-base text-muted leading-relaxed max-w-[42rem]">
                    {blurb}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Smaller Navigation Links: Previous & All work */}
      <div className="flex items-center justify-between pt-6 border-t border-rule">
        <div>
          {prev ? (
            <Link
              href={studyHref(prev.slug)}
              rel="prev"
              className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans text-sm font-medium text-muted hover:text-fg transition-colors"
            >
              <span aria-hidden="true" className="arrow-slide-left font-bold">
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
            className="group link-wipe min-h-[44px] inline-flex items-center gap-1.5 font-sans text-sm font-medium text-muted hover:text-fg transition-colors"
          >
            <span>All work</span>
            <span aria-hidden="true" className="arrow-slide-right font-bold text-accent">
              →
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
