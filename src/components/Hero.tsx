/* eslint-disable @next/next/no-img-element */
import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <Reveal as="section" aria-label="Introduction" className="py-20 md:py-28 border-b border-line">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold tracking-tight text-text leading-[1.08]">
            {site.hero.headline}
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted leading-relaxed max-w-[40rem]">
            {site.hero.intro}
          </p>
        </div>
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <img
            src={site.hero.image.src}
            alt={site.hero.image.alt}
            width={480}
            height={560}
            className="w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-full aspect-[4/5] object-cover rounded-[16px] border border-line/60 grayscale-[35%] hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>
    </Reveal>
  );
}
