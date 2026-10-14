import { site } from "../../content/site";
import { CopyEmail } from "./CopyEmail";

export function ContactCTA({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-display text-h2 font-bold tracking-tight text-text leading-[1.15]">
        {site.cta.headline}
      </h2>
      <p className="mt-3 text-base text-muted leading-relaxed max-w-[38rem]">
        {site.cta.body}
      </p>
      <address className="not-italic mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted">
        <CopyEmail />
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group min-h-[44px] inline-flex items-center gap-1 hover:text-text transition-colors link-underline"
        >
          <span>LinkedIn</span>
          <span aria-hidden="true" className="arrow-nudge-diag">
            ↗
          </span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group min-h-[44px] inline-flex items-center gap-1 hover:text-text transition-colors link-underline"
        >
          <span>GitHub</span>
          <span aria-hidden="true" className="arrow-nudge-diag">
            ↗
          </span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </address>
    </div>
  );
}
