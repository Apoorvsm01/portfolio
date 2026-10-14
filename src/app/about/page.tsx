import type { Metadata } from "next";
import { site } from "../../../content/site";
import { Reveal } from "../../components/Reveal";
import { Timeline } from "../../components/Timeline";
import { HowIWork } from "../../components/HowIWork";
import { PlatformStrip } from "../../components/PlatformStrip";

export const metadata: Metadata = {
  title: "About",
  description: site.hero.intro,
  openGraph: {
    title: `About — ${site.name}`,
    description: site.hero.intro,
  },
};

export default function AboutPage() {
  return (
    <main id="main" className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1">
      <Reveal as="header" className="pt-16 sm:pt-24 pb-12 sm:pb-16 border-b border-line">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold tracking-tight text-text leading-[1.08] mb-6">
          About
        </h1>
        <p className="max-w-[40rem] text-lg sm:text-xl text-muted leading-relaxed">
          {site.hero.intro}
        </p>
      </Reveal>
      <Timeline />
      <HowIWork />
      <PlatformStrip />
    </main>
  );
}
