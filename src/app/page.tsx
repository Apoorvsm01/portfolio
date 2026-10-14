import { Hero } from "../components/Hero";
import { IntentPicker } from "../components/IntentPicker";
import { Featured } from "../components/Featured";
import { WorkSection } from "../components/WorkCard";
import { HowIWork } from "../components/HowIWork";
import { Timeline } from "../components/Timeline";
import { PlatformStrip } from "../components/PlatformStrip";

export default function Home() {
  return (
    <main id="main" className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1">
      <Hero />
      <IntentPicker />
      <Featured />
      <WorkSection />
      <HowIWork />
      <Timeline />
      <PlatformStrip />
    </main>
  );
}
