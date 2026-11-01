import { AskLanding } from "../components/ask/AskLanding";
import { HowIWork } from "../components/HowIWork";
import { AboutTeaser } from "../components/AboutTeaser";
import { HeadsetWall } from "../components/HeadsetWall";
import { getProjectCards } from "../lib/projects";
import { JsonLd, profilePageGraph } from "../lib/structured-data";

export default function Home() {
  return (
    <main id="main" className="flex-1 w-full">
      <JsonLd data={profilePageGraph()} />
      <AskLanding projects={getProjectCards()} />
      <HowIWork />
      <HeadsetWall />
      <AboutTeaser />
    </main>
  );
}
