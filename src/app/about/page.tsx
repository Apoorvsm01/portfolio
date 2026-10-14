import type { Metadata } from "next";
import { site } from "../../../content/site";
import { Reveal } from "../../components/Reveal";
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
    <main id="main" className="container-page flex-1">
      <Reveal as="header" className="pt-16 sm:pt-24 pb-12 sm:pb-16 border-b border-line">
        <h1 className="font-display text-h1 font-bold tracking-tight text-text leading-[1.08] mb-6">
          About
        </h1>
        <p className="max-w-[42rem] text-lg sm:text-xl text-muted leading-relaxed">
          {site.hero.intro}
        </p>
      </Reveal>
      <Timeline />
      <HowIWork />
      <PlatformStrip />
    </main>
  );
}
