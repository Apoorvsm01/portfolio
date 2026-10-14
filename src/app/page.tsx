import { Hero } from "../components/Hero";
import { IntentPicker } from "../components/IntentPicker";
import { Featured } from "../components/Featured";
import { WorkSection } from "../components/WorkCard";
import { HowIWork } from "../components/HowIWork";
import { Timeline } from "../components/Timeline";
import { PlatformStrip } from "../components/PlatformStrip";

export default function Home() {
  return (
    <main id="main" className="container-page flex-1">
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
