import { Hero } from "../components/Hero";
import { IntentPicker } from "../components/IntentPicker";
import { Featured } from "../components/Featured";
import { SelectedWork } from "../components/SelectedWork";
import { AboutTeaser } from "../components/AboutTeaser";
import { getNavIndex } from "../lib/nav-index";

export default function Home() {
  const items = getNavIndex();
  const slugTitleMap = Object.fromEntries(items.map((it) => [it.slug, it.title]));

  return (
    <main id="main" className="container-page flex-1">
      <Hero />
      <IntentPicker slugTitleMap={slugTitleMap} />
      <Featured />
      <SelectedWork />
      <AboutTeaser />
    </main>
  );
}
