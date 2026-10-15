import { site } from "../../content/site";

export function PlatformStrip() {
  return (
    <section
      aria-labelledby="platforms-heading"
      className="w-full bg-ground border-b border-rule py-16 md:py-24"
    >
      <div className="container-page">
        <div className="mb-6">
          <h2
            id="platforms-heading"
            className="font-display font-black text-h2 text-fg leading-tight"
          >
            Platforms
          </h2>
        </div>

        <ul
          className="flex flex-wrap gap-2.5 sm:gap-3 list-none p-0 m-0"
          aria-label="Platforms list"
        >
          {site.platforms.map((platform) => (
            <li
              key={platform}
              className="px-4 py-2 rounded-full border border-rule text-sm sm:text-base text-fg bg-surface min-h-[44px] inline-flex items-center"
            >
              {platform}
            </li>
          ))}
        </ul>

        {site.platformsNote && (
          <p className="mt-8 font-serif italic text-base sm:text-lg text-muted max-w-[42rem] leading-relaxed">
            {site.platformsNote}
          </p>
        )}
      </div>
    </section>
  );
}
