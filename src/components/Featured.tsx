/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { site } from "../../content/site";
import { coverFor, getStudy, studyHref } from "../lib/content";
import { Reveal } from "./Reveal";

export function Featured() {
  const featuredStudy = getStudy(site.featured.slug);
  const largeImage = featuredStudy?.heroImages?.[0];

  return (
    <Reveal as="section" aria-label="Featured work" className="py-24 md:py-32 border-b border-line">
      {/* Label and Logo */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
          {site.featured.org}
        </span>
        <img
          src="/me/woven-logo.png"
          alt=""
          width={120}
          height={24}
          loading="lazy"
          className="woven-logo h-5 w-auto object-contain"
        />
      </div>

      {/* Headline & Summary */}
      <div className="mt-4 max-w-[48rem]">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-text leading-[1.15]">
          {site.featured.headline}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-[40rem]">
          {site.featured.summary}
        </p>
      </div>

      {/* Large Featured Image */}
      {largeImage && (
        <div className="mt-8 overflow-hidden rounded-[16px] border border-line/60 bg-surface">
          <Link
            href={studyHref(site.featured.slug)}
            className="block group overflow-hidden"
          >
            <img
              src={largeImage.src}
              alt={largeImage.alt || featuredStudy?.title || site.featured.headline}
              width={1200}
              height={750}
              loading="lazy"
              className="w-full aspect-[16/10] object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
          </Link>
        </div>
      )}

      {/* Read Case Study Link */}
      <div className="mt-6">
        <Link
          href={studyHref(site.featured.slug)}
          aria-label={`Read the case study: ${featuredStudy?.title ?? site.featured.headline}`}
          className="inline-flex items-center gap-2 font-medium text-text hover:text-accent transition-colors group"
        >
          <span>Read the case study</span>
          <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>

      {/* Row of 3 mini cards for related slugs */}
      {site.featured.related && site.featured.related.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {site.featured.related.map((slug) => {
              const study = getStudy(slug);
              const workItem = site.work.find((w) => w.slug === slug);
              const coverInfo = coverFor(slug);
              const image = coverInfo?.img;
              const title = study?.title ?? slug;
              const blurb = workItem?.blurb;

              return (
                <Link
                  key={slug}
                  href={studyHref(slug)}
                  className="group flex flex-col rounded-[20px] bg-surface border border-line p-5 hover:border-muted/60 transition-colors"
                >
                  {image && (
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-bg/50 border border-line/40 mb-4">
                      <img
                        src={image.src}
                        alt=""
                        width={600}
                        height={375}
                        loading="lazy"
                        className={`w-full h-full ${coverInfo?.fit === "contain" ? "object-contain" : "object-cover"} group-hover:scale-[1.02] transition-transform duration-500`}
                      />
                    </div>
                  )}
                  <h3 className="font-display font-semibold text-base sm:text-lg text-text group-hover:text-accent transition-colors">
                    {title}
                  </h3>
                  {blurb && (
                    <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed flex-1">
                      {blurb}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-line/40 flex items-center text-xs text-muted group-hover:text-accent transition-colors">
                    <span>View study</span>
                    <span aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Reveal>
  );
}
