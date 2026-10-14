import { site } from "../../content/site";
import { ContactCTA } from "./ContactCTA";
import { CopyEmail } from "./CopyEmail";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-line bg-bg text-text mt-auto">
      <div className="container-page">
        <ContactCTA />

        <div className="py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-sm text-muted">
          <address className="not-italic flex flex-wrap items-center gap-4 sm:gap-6">
            <CopyEmail />
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-h-[44px] inline-flex items-center gap-1 hover:text-text transition-colors link-underline"
            >
              <span>LinkedIn</span>
              <span aria-hidden="true" className="arrow-nudge-diag">↗</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-h-[44px] inline-flex items-center gap-1 hover:text-text transition-colors link-underline"
            >
              <span>GitHub</span>
              <span aria-hidden="true" className="arrow-nudge-diag">↗</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </address>

          <div className="text-xs text-muted">
            © {currentYear} {site.name}
          </div>
        </div>

        {site.disclaimer && (
          <div className="pb-10 pt-2 border-t border-line/40 text-xs text-muted leading-relaxed max-w-[42rem]">
            {site.disclaimer}
          </div>
        )}
      </div>
    </footer>
  );
}
