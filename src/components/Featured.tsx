/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { site } from "../../content/site";
import { coverFor, getStudy, imageDims, studyHref } from "../lib/content";
import { Reveal } from "./Reveal";
import { FadeImage } from "./FadeImage";

export function Featured() {
  const featuredStudy = getStudy(site.featured.slug);
  const largeImage = featuredStudy?.heroImages?.[0];
  const logoDims = imageDims("/me/woven-logo.png");

  return (
    <Reveal as="section" aria-labelledby="featured-heading" className="py-14 md:py-16 border-b border-line">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left cols 1-6: org label + logo, h2 headline, summary, 'Read the case study' link, then the 3 related studies */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Label and Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
              {site.featured.org}
            </span>
            <img
              src="/me/woven-logo.png"
              alt=""
              width={logoDims.width}
              height={logoDims.height}
              loading="lazy"
              className="woven-logo h-5 w-auto object-contain"
            />
          </div>

          {/* Headline & Summary */}
          <h2 id="featured-heading" className="mt-3 font-display text-h2 font-bold tracking-tight text-text leading-[1.15]">
            {site.featured.headline}
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            {site.featured.summary}
          </p>

          {/* Read Case Study Link */}
          <div className="mt-4">
            <Link
              href={studyHref(site.featured.slug)}
              aria-label={`Read the case study: ${featuredStudy?.title ?? site.featured.headline}`}
              className="link-underline min-h-[44px] inline-flex items-center gap-2 font-medium text-text hover:text-accent transition-colors group"
            >
              <span>Read the case study</span>
              <span aria-hidden="true" className="arrow-nudge-right">
                →
              </span>
            </Link>
          </div>

          {/* Compact list of 3 related studies: 72x48 rounded thumbnail + title + one-line blurb (line-clamp-1), each row a single link */}
          {site.featured.related && site.featured.related.length > 0 && (
            <ul className="mt-6 space-y-2.5 list-none p-0" aria-label="Related case studies">
              {site.featured.related.map((slug) => {
                const study = getStudy(slug);
                const workItem = site.work.find((w) => w.slug === slug);
                const coverInfo = coverFor(slug);
                const image = coverInfo?.img;
                const title = study?.title ?? slug;
                const blurb = workItem?.blurb;
                const cardDims = image ? imageDims(image.src) : undefined;

                return (
                  <li key={slug}>
                    <Link
                      href={studyHref(slug)}
                      className="group flex items-center gap-3.5 p-2 rounded-xl bg-surface/50 border border-line/60 hover:border-muted/60 hover:bg-surface transition-all min-h-[44px]"
                    >
                      {image && cardDims && (
                        <figure className="w-[72px] h-[48px] shrink-0 overflow-hidden rounded-[8px] bg-bg/50 border border-line/40">
                          <FadeImage
                            src={image.src}
                            alt=""
                            width={cardDims.width}
                            height={cardDims.height}
                            loading="lazy"
                            className={`w-full h-full ${
                              coverInfo?.fit === "contain" ? "object-contain p-1" : "object-cover"
                            } group-hover:scale-[1.04] transition-transform duration-300`}
                          />
                        </figure>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display font-semibold text-sm text-text group-hover:text-accent transition-colors truncate">
                            {title}
                          </h3>
                          <span
                            aria-hidden="true"
                            className="arrow-nudge-right text-xs text-muted group-hover:text-accent transition-colors shrink-0"
                          >
                            →
                          </span>
                        </div>
                        {blurb && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-1 truncate mt-0.5">
                            {blurb}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right cols 7-12: the featured image at aspect 4/3, top-aligned, with existing parallax. Below lg: stacked, image aspect 16/9 */}
        {largeImage && (
          <figure className="lg:col-span-6 overflow-hidden rounded-[16px] border border-line/60 bg-surface self-start">
            <Link
              href={studyHref(site.featured.slug)}
              className="block group overflow-hidden"
            >
              <FadeImage
                src={largeImage.src}
                alt={largeImage.alt || featuredStudy?.title || site.featured.headline}
                width={imageDims(largeImage.src).width}
                height={imageDims(largeImage.src).height}
                loading="lazy"
                className="featured-parallax-img w-full aspect-[16/9] lg:aspect-[4/3] object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
            </Link>
          </figure>
        )}
      </div>
    </Reveal>
  );
}
