import { Hero } from "../components/Hero";
import { IntentPicker } from "../components/IntentPicker";
import { Featured } from "../components/Featured";
import { SelectedWork } from "../components/SelectedWork";
import { AboutTeaser } from "../components/AboutTeaser";

export default function Home() {
  return (
    <main id="main" className="container-page flex-1">
      <Hero />
      <IntentPicker />
      <Featured />
      <SelectedWork />
      <AboutTeaser />
    </main>
  );
}
