import { site } from "../../content/site";

export default function Home() {
  return (
    <main className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex-1">
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text">
        {site.hero.headline}
      </h1>
    </main>
  );
}
