/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { site } from "../../content/site";
import { studyMeta } from "../../content/study-meta";
import { getStudy, imageDims, studyHref } from "../lib/content";
import { FadeImage } from "./FadeImage";

export function Featured() {
  const featuredStudy = getStudy(site.featured.slug);
  const largeImage = featuredStudy?.heroImages?.[0];
  const logoDims = imageDims("/me/woven-logo.png");
  const bandColor = studyMeta[site.featured.slug]?.band ?? "#0c1a22";

  return (
    <section
      aria-labelledby="featured-heading"
      style={{ backgroundColor: bandColor }}
      className="w-full border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Side: Org label + logo, h2 headline, lede paragraphs (serif), chapters hairline rows, amber button + text link */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            {/* Org label + logo */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-xs text-muted font-medium">
                {site.featured.org}
              </span>
              <span className="woven-logo-plate" aria-hidden="true">
                <img
                  src="/me/woven-logo.png"
                  alt=""
                  width={logoDims.width}
                  height={logoDims.height}
                  loading="lazy"
                  className="woven-logo"
                />
              </span>
            </div>

            {/* Headline */}
            <h2
              id="featured-heading"
              className="font-display font-black text-h2 text-fg leading-[1.08] text-balance mb-6"
            >
              {site.featured.headline}
            </h2>

            {/* Lede paragraphs in Newsreader serif */}
            <div className="space-y-4 mb-8 max-w-[40rem]">
              {site.featured.lede.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="font-serif text-fg-2 text-base sm:text-lg leading-[1.6] text-pretty"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Chapters: hairline-separated rows */}
            {site.featured.chapters && site.featured.chapters.length > 0 && (
              <ul
                className="border-t border-rule/60 divide-y divide-rule/60 mb-8 list-none p-0"
                aria-label="Case study chapters"
              >
                {site.featured.chapters.map((ch, idx) => (
                  <li
                    key={idx}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6 text-sm"
                  >
                    <Link
                      href={ch.href}
                      className="group link-wipe font-sans font-bold text-fg hover:text-accent transition-colors shrink-0"
                      style={
                        {
                          "--flag-color": "var(--accent)",
                        } as React.CSSProperties
                      }
                    >
                      {ch.term}
                    </Link>
                    <span className="font-serif text-fg-2 text-sm sm:text-base leading-relaxed text-right sm:text-left">
                      {ch.line}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Buttons: solid amber button + text link "All projects" */}
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href={studyHref(site.featured.slug)}
                className="btn-primary min-h-[44px] px-6 py-3 rounded-[6px] bg-accent text-ground font-sans font-bold text-sm sm:text-base hover:brightness-105 active:translate-y-[1px] inline-flex items-center justify-center"
              >
                Open the case study
              </Link>
              <Link
                href="/work/"
                className="group link-wipe font-sans font-medium text-sm sm:text-base text-fg-2 hover:text-fg transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
              >
                <span>All projects</span>
                <span
                  aria-hidden="true"
                  className="arrow-slide-right font-bold text-accent"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side: Featured image (radius 6px) */}
          {largeImage && (
            <div className="lg:col-span-5 self-start">
              <figure className="w-full overflow-hidden rounded-[6px] border border-rule/60 bg-surface">
                <Link
                  href={studyHref(site.featured.slug)}
                  className="block group overflow-hidden"
                >
                  <FadeImage
                    src={largeImage.src}
                    alt={
                      largeImage.alt ||
                      featuredStudy?.title ||
                      site.featured.headline
                    }
                    width={imageDims(largeImage.src).width}
                    height={imageDims(largeImage.src).height}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover group-hover:brightness-105 transition-[filter] duration-140"
                  />
                </Link>
              </figure>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
