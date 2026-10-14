import { site } from "../../content/site";
import { ContactCTA } from "./ContactCTA";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-line bg-bg text-text mt-auto">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8">
        <ContactCTA />

        <div className="py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${site.email}`}
              className="hover:text-text transition-colors"
            >
              {site.email}
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-muted">
            © {currentYear} {site.name}
          </div>
        </div>

        {site.disclaimer && (
          <div className="pb-10 pt-2 border-t border-line/40 text-xs text-muted leading-relaxed max-w-[40rem]">
            {site.disclaimer}
          </div>
        )}
      </div>
    </footer>
  );
}
