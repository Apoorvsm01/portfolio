import Link from "next/link";
import { site } from "../../content/site";
import { ContactCTA } from "./ContactCTA";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-line bg-bg text-text mt-auto py-14 md:py-16">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left column: ContactCTA headline + body + email/LinkedIn/GitHub with CopyEmail */}
          <div className="lg:col-span-8">
            <ContactCTA />
          </div>

          {/* Right column: small nav list (Work, About) and copyright */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end lg:justify-between h-full gap-4 lg:gap-0 pt-1">
            <nav aria-label="Footer navigation">
              <ul className="flex flex-row lg:flex-col items-center lg:items-end gap-6 lg:gap-2 list-none p-0 m-0">
                <li>
                  <Link
                    href="/work/"
                    className="link-underline min-h-[44px] inline-flex items-center text-sm font-medium text-muted hover:text-text transition-colors"
                  >
                    Work
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about/"
                    className="link-underline min-h-[44px] inline-flex items-center text-sm font-medium text-muted hover:text-text transition-colors"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="text-xs text-muted lg:mt-auto">
              © {currentYear} {site.name}
            </div>
          </div>
        </div>

        {/* Disclaimer as one small muted paragraph across the bottom */}
        {site.disclaimer && (
          <p className="mt-8 pt-6 border-t border-line/40 text-xs text-muted leading-relaxed max-w-full">
            {site.disclaimer}
          </p>
        )}
      </div>
    </footer>
  );
}
