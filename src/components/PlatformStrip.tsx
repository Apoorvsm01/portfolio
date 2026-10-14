import { site } from "../../content/site";
import { Reveal } from "./Reveal";

export function PlatformStrip() {
  return (
    <Reveal as="section" aria-labelledby="platforms-heading" className="py-24 md:py-32">
      <div className="mb-8">
        <h2 id="platforms-heading" className="text-xs uppercase tracking-[0.14em] text-muted font-medium">
          Platforms
        </h2>
      </div>

      <div className="marquee-wrapper">
        <ul className="marquee-content flex gap-3 list-none p-0 shrink-0" aria-label="Platforms list">
          {site.platforms.map((platform) => (
            <li
              key={platform}
              className="px-4 py-2 rounded-full border border-line text-sm sm:text-base text-text bg-surface/40 min-h-[44px] inline-flex items-center shrink-0"
            >
              {platform}
            </li>
          ))}
        </ul>
        <ul className="marquee-content flex gap-3 list-none p-0 shrink-0" aria-hidden="true">
          {site.platforms.map((platform, i) => (
            <li
              key={`${platform}-${i}`}
              className="px-4 py-2 rounded-full border border-line text-sm sm:text-base text-text bg-surface/40 min-h-[44px] inline-flex items-center shrink-0"
            >
              {platform}
            </li>
          ))}
        </ul>
      </div>

      {site.platformsNote && (
        <p className="mt-8 font-serif italic text-base sm:text-lg text-muted max-w-[42rem] leading-relaxed">
          {site.platformsNote}
        </p>
      )}
    </Reveal>
  );
}
