import type { Metadata } from "next";
import { site } from "../../../content/site";
import { Timeline } from "../../components/Timeline";
import { HowIWork } from "../../components/HowIWork";
import { PlatformStrip } from "../../components/PlatformStrip";
import { HeroPortrait } from "../../components/HeroPortrait";

export const metadata: Metadata = {
  title: "About",
  description: site.hero.intro,
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: `About — ${site.name}`,
    description: site.hero.intro,
    url: `${site.url}/about/`,
  },
};

export default function AboutPage() {
  return (
    <main id="main" className="flex-1 w-full bg-ground">
      {/* Ink hero with h1 'About' and the hero intro in serif */}
      <header className="w-full bg-ground border-b border-rule py-16 md:py-24">
        <div className="container-page grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <h1 className="font-display font-black text-h1 text-fg leading-[1.08] mb-6">
              About
            </h1>
            <p className="font-serif text-fg-2 text-base sm:text-lg lg:text-xl leading-[1.6] max-w-[46rem] text-pretty">
              {site.hero.intro}
            </p>
            {/* At a glance: what role he is after */}
            <dl className="mt-8 max-w-[46rem] rounded-[6px] border border-rule bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 m-0">
              <dt className="w-full sm:w-28 shrink-0 font-sans text-xs sm:text-sm text-muted font-medium">
                {site.lookingFor.label}
              </dt>
              <dd className="font-serif text-fg text-sm sm:text-base leading-snug flex-1 m-0">{site.lookingFor.text}</dd>
            </dl>
          </div>
          <div className="md:col-span-4">
            <HeroPortrait
              src={site.hero.image.src}
              alt={site.hero.image.alt}
              width={site.hero.image.width}
              height={site.hero.image.height}
            />
          </div>
        </div>
      </header>

      {/* Timeline (v4 timeline style, all rows, timelineIntro) */}
      <Timeline />

      {/* How I work on a paper band (same component as home) */}
      <HowIWork />

      {/* Platforms as a static wrapped list of hairline pills with platformsNote */}
      <PlatformStrip />
    </main>
  );
}
