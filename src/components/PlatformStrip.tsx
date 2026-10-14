import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function PlatformStrip() {
  return (
    <Reveal as="section" aria-label="Platforms" className="py-24 md:py-32">
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
          Platforms
        </h2>
      </div>

      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {site.platforms.map((platform) => (
          <span
            key={platform}
            className="px-4 py-2 rounded-full border border-line text-sm sm:text-base text-text bg-surface/40"
          >
            {platform}
          </span>
        ))}
      </div>

      {site.platformsNote && (
        <p className="mt-8 font-serif italic text-base sm:text-lg text-muted max-w-[40rem] leading-relaxed">
          {site.platformsNote}
        </p>
      )}
    </Reveal>
  );
}
