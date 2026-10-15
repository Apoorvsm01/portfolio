import Link from "next/link";
import { site } from "../../content/site";
import { ContactCTA } from "./ContactCTA";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-ground text-fg border-t border-rule mt-auto py-16 md:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left column: ContactCTA */}
          <div className="lg:col-span-8">
            <ContactCTA />
          </div>

          {/* Right column: small nav list (Work, About) */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-start gap-6 lg:gap-3 pt-2">
            <Link
              href="/work/"
              className="link-underline min-h-[44px] inline-flex items-center font-sans text-sm font-medium text-muted hover:text-fg transition-colors"
            >
              Work
            </Link>
            <Link
              href="/about/"
              className="link-underline min-h-[44px] inline-flex items-center font-sans text-sm font-medium text-muted hover:text-fg transition-colors"
            >
              About
            </Link>
          </div>
        </div>

        {/* Hairline + Bottom row: © year · location · GitHub · disclaimer (small) */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-rule flex flex-col gap-3 font-sans text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              © {currentYear} {site.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{site.location}</span>
            <span aria-hidden="true">·</span>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-fg transition-colors"
            >
              <span>GitHub</span>
              <span aria-hidden="true" className="arrow-nudge-diag">
                ↗
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>

          {site.disclaimer && (
            <p className="font-sans text-[11px] sm:text-xs text-muted leading-relaxed max-w-full">
              {site.disclaimer}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
