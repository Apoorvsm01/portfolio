import Link from "next/link";
import type { CaseStudy, Img, Section } from "../../../content/types";
import type { StudyMeta } from "../../../content/study-meta";
import { site } from "../../../content/site";
import { imageDims } from "../../lib/content";
import { FadeImage } from "../FadeImage";
import { LoopVideo } from "./LoopVideo";

export interface CaseStudyHeroProps {
  study: CaseStudy;
  meta: StudyMeta;
  firstImage?: Img;
  labelledSections?: { section: Section; index: number }[];
}

export function Hero({
  study,
  meta,
  firstImage,
  labelledSections = [],
}: CaseStudyHeroProps) {
  const flagBg = site.flags[meta.flag]?.bg ?? "#f5a524";
  const heroImage = firstImage ?? study.heroImages?.[0];
  const heroDims = heroImage ? imageDims(heroImage.src) : { width: 1200, height: 800 };
  const caption = heroImage?.alt?.trim() ? heroImage.alt : meta.claim;

  return (
    <header
      id="case-study-hero"
      style={{ backgroundColor: meta.band }}
      className="band-dark w-full border-b border-rule py-12 md:py-16 lg:py-20"
    >
      <div className="container-page">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-muted list-none p-0 m-0">
            <li>
              <Link
                href="/work/"
                className="link-underline min-h-[44px] inline-flex items-center hover:text-fg transition-colors"
              >
                Work
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted/60">
              ›
            </li>
            <li aria-current="page" className="text-fg font-medium truncate">
              {study.title}
            </li>
          </ol>
        </nav>

        {/* Hero Grid: Left text & facts table, Right first hero image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Title, Claim tagline, Facts table */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-start">
            <h1 className="font-display font-black text-h1 text-fg leading-[1.05] tracking-[-0.025em] mb-4">
              {study.title}
            </h1>

            <p
              className="font-sans font-medium text-fg leading-snug text-balance mb-8"
              style={{ fontSize: "clamp(1.375rem, 1.1rem + 1vw, 1.75rem)" }}
            >
              {meta.claim}
            </p>

            {/* Facts table: dl, hairline rows, label column ~7rem muted, value serif */}
            {meta.facts && meta.facts.length > 0 && (
              <dl className="border-t border-rule/60 divide-y divide-rule/60 list-none p-0 m-0">
                {meta.facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 text-sm"
                  >
                    <dt className="w-full sm:w-28 shrink-0 font-sans text-xs sm:text-sm text-muted font-medium">
                      {fact.label}
                    </dt>
                    <dd className="font-serif text-fg-2 text-sm sm:text-base leading-relaxed flex-1 m-0">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Right Column: First hero image right with caption */}
          {heroImage && (
            <div className="lg:col-span-5 xl:col-span-5 self-start">
              <figure className="w-full">
                {heroImage.video ? (
                  study.heroFit === "contain" ? (
                    <LoopVideo
                      src={heroImage.video}
                      poster={heroImage.src}
                      label={heroImage.alt || study.title}
                      width={heroDims.width}
                      height={heroDims.height}
                      eager
                      className="w-auto h-auto max-h-[60svh] max-w-full object-contain mx-auto block"
                    />
                  ) : (
                    <div data-story-parallax className="rounded-[6px] overflow-hidden border border-rule/60 bg-surface aspect-[4/3]">
                      <LoopVideo
                        src={heroImage.video}
                        poster={heroImage.src}
                        label={heroImage.alt || study.title}
                        width={heroDims.width}
                        height={heroDims.height}
                        eager
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  )
                ) : study.heroFit === "contain" ? (
                  <FadeImage
                    src={heroImage.src}
                    alt={heroImage.alt || study.title}
                    width={heroDims.width}
                    height={heroDims.height}
                    loading="eager"
                    className="w-auto h-auto max-h-[60svh] max-w-full object-contain mx-auto block"
                  />
                ) : (
                  <div data-story-parallax className="rounded-[6px] overflow-hidden border border-rule/60 bg-surface aspect-[4/3]">
                    <FadeImage
                      src={heroImage.src}
                      alt={heroImage.alt || study.title}
                      width={heroDims.width}
                      height={heroDims.height}
                      loading="eager"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <figcaption
                  className={`mt-3 font-sans text-xs sm:text-sm text-muted leading-relaxed ${
                    study.heroFit === "contain" ? "text-center" : ""
                  }`}
                >
                  {caption}
                </figcaption>
              </figure>
            </div>
          )}
        </div>

        {/* Outcomes row when studyMeta has outcomes (static values, 'from → value') */}
        {meta.outcomes && meta.outcomes.items && meta.outcomes.items.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-rule/60">
            <h2 className="font-display font-black text-h2 text-fg leading-tight mb-8">
              {meta.outcomes.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {meta.outcomes.items.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-fg tracking-tight mb-2">
                    {item.from ? `${item.from} → ${item.value}` : item.value}
                  </div>
                  <div className="font-sans text-xs sm:text-sm text-muted leading-snug">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            {meta.outcomes.note && (
              <p className="mt-6 font-serif italic text-xs sm:text-sm text-muted leading-relaxed">
                {meta.outcomes.note}
              </p>
            )}
          </div>
        )}

        {/* Inline underlined chapter links in the study flag colour */}
        {labelledSections && labelledSections.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 border-t border-rule/60">
            <div className="font-sans text-xs text-muted font-medium mb-3">
              Chapters
            </div>
            <ol className="flex flex-wrap gap-x-6 gap-y-3 list-none p-0 m-0">
              {labelledSections.map(({ section, index }, i) => (
                <li key={index}>
                  <a
                    href={`#section-${index}`}
                    className="group link-wipe min-h-[40px] inline-flex items-center font-sans font-medium text-sm sm:text-base text-fg hover:text-accent transition-colors"
                    style={
                      {
                        "--flag-color": flagBg,
                      } as React.CSSProperties
                    }
                  >
                    <span className="font-mono text-xs text-muted mr-1.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </header>
  );
}
