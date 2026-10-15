"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "../../content/site";
import { FadeImage } from "./FadeImage";

export interface StudyHeroInfo {
  slug: string;
  title: string;
  claim: string;
  coverSrc: string;
  coverAlt: string;
  coverWidth: number;
  coverHeight: number;
}

export interface HeroProps {
  studyDataMap: Record<string, StudyHeroInfo>;
  portraitDims?: { width: number; height: number };
}

export function Hero({
  studyDataMap,
  portraitDims = { width: 800, height: 1000 },
}: HeroProps) {
  // Toggle selection: null when no door is selected
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  const activeIntent = site.intents.find((it) => it.id === selectedDoorId);
  const activeFlag = activeIntent
    ? site.flags[activeIntent.flag as keyof typeof site.flags]
    : null;

  const handleDoorClick = (id: string) => {
    setSelectedDoorId((current) => (current === id ? null : id));
  };

  const firstLinkedSlug = activeIntent?.links?.[0];
  const firstLinkedStudy = firstLinkedSlug
    ? studyDataMap[firstLinkedSlug]
    : null;

  return (
    <section
      aria-labelledby="hero-display-heading"
      className="w-full bg-ground border-b border-rule py-12 md:py-16 lg:py-24"
    >
      <div className="container-page">
        {/* Top 2 columns: Text left, Portrait right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Giant Display name, Tagline, Intro (max 36rem) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-start">
            <h1
              id="hero-display-heading"
              className="font-display font-black leading-[0.95] tracking-[-0.025em] text-fg select-none relative mb-4 sm:mb-6 whitespace-nowrap"
              // Sized so "I’m Apoorv" stays on one line from ~360px up (it is longer than a 4-letter name).
              style={{ fontSize: "clamp(3.25rem, 8.6vw, 9.5rem)" }}
            >
              <span
                className={`inline-block transition-colors duration-[320ms] ${
                  activeFlag ? "name-as-window" : "text-fg"
                }`}
                style={{
                  transitionTimingFunction: "var(--ease-settle)",
                  ...(activeFlag
                    ? {
                        // The portrait is dark, so on its own the letters read dark-on-dark. A flag-colour layer
                        // screen-blended over it lifts the photo into a bright tint of the door's colour.
                        backgroundImage: `linear-gradient(${activeFlag.bg}, ${activeFlag.bg}), url(${site.hero.image.src})`,
                        backgroundBlendMode: "screen",
                      }
                    : {}),
                }}
              >
                {site.hero.display}
              </span>
            </h1>

            <p
              className="font-sans font-medium text-fg leading-snug text-balance mb-4"
              style={{ fontSize: "clamp(1.375rem, 1.1rem + 1vw, 1.75rem)" }}
            >
              {site.hero.headline}
            </p>

            <p className="font-serif text-fg-2 text-base sm:text-lg leading-[1.6] max-w-[36rem] text-pretty">
              {site.hero.intro}
            </p>
          </div>

          {/* Right Column: Portrait (aspect 4:5, radius 6px) with duotone crossfade */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-start lg:justify-end">
            <div className="relative aspect-[4/5] w-full max-w-[22rem] lg:max-w-none rounded-[6px] overflow-hidden border border-rule bg-surface self-start">
              <FadeImage
                src={site.hero.image.src}
                alt={site.hero.image.alt}
                width={portraitDims.width}
                height={portraitDims.height}
                className={`w-full h-full object-cover transition-[filter] duration-[320ms] ${
                  activeFlag ? "grayscale contrast-125" : "grayscale-0"
                }`}
                style={{ transitionTimingFunction: "var(--ease-settle)" }}
              />
              {/* Decorative Duotone multiply overlay */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 pointer-events-none mix-blend-multiply transition-opacity duration-[320ms] ${
                  activeFlag ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundColor: activeFlag?.bg ?? "transparent",
                  transitionTimingFunction: "var(--ease-settle)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Below both: "What brings you here?" + Three Doors */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-rule/60">
          <h2 className="font-sans text-xs sm:text-sm text-muted font-medium mb-4">
            What brings you here?
          </h2>

          <div
            role="group"
            aria-label="What brings you here"
            className="flex flex-wrap gap-3"
          >
            {site.intents.map((intent) => {
              const isSelected = intent.id === selectedDoorId;
              const flag = site.flags[intent.flag as keyof typeof site.flags];

              return (
                <button
                  key={intent.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleDoorClick(intent.id)}
                  style={
                    isSelected && flag
                      ? {
                          backgroundColor: flag.bg,
                          color: flag.ink,
                          borderColor: flag.bg,
                        }
                      : undefined
                  }
                  className={`min-h-[44px] px-5 py-2.5 rounded-full border text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer inline-flex items-center justify-center ${
                    isSelected
                      ? "shadow-xs"
                      : "bg-transparent text-muted hover:text-fg border-rule hover:border-fg"
                  }`}
                >
                  {intent.label}
                </button>
              );
            })}
          </div>

          {/* Panel: 2 columns with 3px top rule in flag colour (only when a door is selected) */}
          {activeIntent && activeFlag && (
            <div
              className="mt-8 pt-8 border-t-[3px] animate-settle grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
              style={{ borderTopColor: activeFlag.bg }}
            >
              {/* Left Side: Headline (h3 Mona Sans 900) + Bullets (square markers) + Study Links */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-start">
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-fg leading-tight mb-6">
                  {activeIntent.headline}
                </h3>

                <ul className="space-y-4 mb-8 list-none p-0">
                  {activeIntent.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3.5 text-fg-2 font-serif text-base sm:text-lg leading-relaxed"
                    >
                      <span
                        className="w-2.5 h-2.5 mt-2 rounded-[1px] shrink-0"
                        style={{ backgroundColor: activeFlag.bg }}
                        aria-hidden="true"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {activeIntent.links && activeIntent.links.length > 0 && (
                  <ul
                    className="flex flex-wrap gap-4 list-none p-0"
                    aria-label="Recommended case studies"
                  >
                    {activeIntent.links.map((slug) => {
                      const studyInfo = studyDataMap[slug];
                      const title = studyInfo?.title ?? slug;
                      return (
                        <li key={slug}>
                          <Link
                            href={`/work/${slug}/`}
                            className="group font-sans font-semibold text-sm sm:text-base text-fg hover:text-fg min-h-[44px] inline-flex items-center gap-1.5 link-wipe"
                            style={
                              {
                                "--flag-color": activeFlag.bg,
                              } as React.CSSProperties
                            }
                          >
                            <span>{title}</span>
                            <span
                              aria-hidden="true"
                              className="arrow-slide-right font-bold"
                            >
                              →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Right Side: First linked study's cover image + claim caption */}
              {firstLinkedStudy && (
                <div className="lg:col-span-5 xl:col-span-4">
                  <figure className="w-full">
                    <Link
                      href={`/work/${firstLinkedSlug}/`}
                      className="block group"
                    >
                      <div className="rounded-[6px] overflow-hidden border border-rule bg-surface aspect-[4/3]">
                        <FadeImage
                          src={firstLinkedStudy.coverSrc}
                          alt=""
                          width={firstLinkedStudy.coverWidth}
                          height={firstLinkedStudy.coverHeight}
                          className="w-full h-full object-cover group-hover:brightness-105 transition-[filter] duration-140"
                        />
                      </div>
                    </Link>
                    <figcaption className="mt-3 font-sans text-xs sm:text-sm text-muted leading-relaxed">
                      {firstLinkedStudy.claim}
                    </figcaption>
                  </figure>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
