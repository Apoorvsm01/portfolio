import { site } from "../../content/site";

export function ContactCTA({ className = "" }: { className?: string }) {
  return (
    <div className={`py-24 md:py-32 border-b border-line ${className}`}>
      <div className="max-w-[42rem]">
        <h2 className="font-display text-[var(--step-h2)] font-bold tracking-tight text-text">
          {site.cta.headline}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
          {site.cta.body}
        </p>
        <div className="mt-8">
          <a
            href={`mailto:${site.email}`}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-text text-bg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <span>{site.email}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
