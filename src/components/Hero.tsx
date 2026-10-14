/* eslint-disable @next/next/no-img-element */
import { site } from "../../content/site";
import { imageDims } from "../lib/content";
import { Reveal } from "./Reveal";

export function Hero() {
  const dims = imageDims(site.hero.image.src);

  return (
    <Reveal
      as="section"
      aria-labelledby="hero-headline"
      className="border-b border-line min-h-[calc(100svh-var(--nav-h))] py-12 md:py-16 lg:py-0 flex flex-col justify-center"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-8 md:gap-y-10 lg:gap-x-12 items-center">
        {/* Full-width headline across all 12 columns */}
        <div className="md:col-span-12">
          <h1
            id="hero-headline"
            className="font-display text-hero font-bold tracking-tight text-text leading-[1.08] text-balance max-w-[70rem]"
          >
            {site.hero.headline}
          </h1>
        </div>

        {/* Intro paragraph: columns 1–7 at md, columns 1–6 at lg */}
        <div className="md:col-span-7 lg:col-span-6">
          <p className="max-w-[42rem] text-base sm:text-lg md:text-xl text-muted leading-relaxed">
            {site.hero.intro}
          </p>
        </div>

        {/* Portrait: below md left-aligned (max-w 22rem), 5-col on md, columns 8–12 on lg (max-height 70svh) */}
        <div className="md:col-span-5 lg:col-span-5 lg:col-start-8 flex justify-start md:justify-end">
          <img
            src={site.hero.image.src}
            alt={site.hero.image.alt}
            width={dims.width}
            height={dims.height}
            className="w-full max-w-[22rem] md:max-w-none aspect-[4/5] max-h-[70svh] object-cover rounded-[16px] border border-line/60 grayscale-[15%] hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>
    </Reveal>
  );
}
