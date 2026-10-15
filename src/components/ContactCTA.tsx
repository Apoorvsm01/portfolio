import { site } from "../../content/site";

export function ContactCTA({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-display font-black text-h2 text-fg leading-tight mb-4">
        {site.cta.headline}
      </h2>
      <p className="font-serif text-fg-2 text-base sm:text-lg leading-[1.6] max-w-[38rem] mb-8">
        {site.cta.body}
      </p>

      {/* Buttons: solid amber "Email me" and ghost "LinkedIn" (pill) */}
      <div className="flex flex-wrap items-center gap-4">
        <a
          href={`mailto:${site.email}`}
          className="btn-primary min-h-[44px] px-6 py-2.5 rounded-[6px] bg-accent text-ground font-sans font-bold text-sm sm:text-base hover:brightness-105 active:translate-y-[1px] inline-flex items-center justify-center"
        >
          Email me
        </a>
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group min-h-[44px] px-6 py-2.5 rounded-full border border-rule text-fg hover:border-fg active:translate-y-[1px] font-sans font-medium text-sm sm:text-base transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span>LinkedIn</span>
          <span aria-hidden="true" className="arrow-slide-diag">
            ↗
          </span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </div>
  );
}
