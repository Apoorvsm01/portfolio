import type { Metadata } from "next";
import { site } from "../../../content/site";
import { Timeline } from "../../components/Timeline";
import { HowIWork } from "../../components/HowIWork";
import { PlatformStrip } from "../../components/PlatformStrip";

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
        <div className="container-page">
          <h1 className="font-display font-black text-h1 text-fg leading-[1.08] mb-6">
            About
          </h1>
          <p className="font-serif text-fg-2 text-base sm:text-lg lg:text-xl leading-[1.6] max-w-[46rem] text-pretty">
            {site.hero.intro}
          </p>
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
