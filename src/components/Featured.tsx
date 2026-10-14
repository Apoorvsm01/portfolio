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
    <Reveal as="section" aria-labelledby="featured-heading" className="py-24 md:py-32 border-b border-line">
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
      <div className="mt-4 max-w-[48rem]">
        <h2 id="featured-heading" className="font-display text-h2 font-bold tracking-tight text-text leading-[1.15]">
          {site.featured.headline}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-[42rem]">
          {site.featured.summary}
        </p>
      </div>

      {/* Large Featured Image with subtle scroll-driven parallax */}
      {largeImage && (
        <figure className="mt-8 overflow-hidden rounded-[16px] border border-line/60 bg-surface">
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
              className="featured-parallax-img w-full aspect-[16/10] object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
          </Link>
        </figure>
      )}

      {/* Read Case Study Link */}
      <div className="mt-6">
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

      {/* Row of 3 mini cards for related slugs */}
      {site.featured.related && site.featured.related.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0" aria-label="Related case studies">
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
                    className="group flex flex-col h-full rounded-[20px] bg-surface border border-line p-5 hover:border-muted/60 transition-colors"
                  >
                    {image && cardDims && (
                      <figure className="aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 mb-4">
                        <FadeImage
                          src={image.src}
                          alt=""
                          width={cardDims.width}
                          height={cardDims.height}
                          loading="lazy"
                          className={`w-full h-full ${coverInfo?.fit === "contain" ? "object-contain" : "object-cover"} group-hover:scale-[1.02] transition-transform duration-500`}
                        />
                      </figure>
                    )}
                    <h3 className="font-display font-semibold text-h3 text-text group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    {blurb && (
                      <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed flex-1">
                        {blurb}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-line/40 flex items-center text-xs text-muted group-hover:text-accent transition-colors">
                      <span>View study</span>
                      <span aria-hidden="true" className="arrow-nudge-right ml-1">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Reveal>
  );
}
