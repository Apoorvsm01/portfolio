import type { Section } from "../../../content/types";

export function Toc({
  sections,
  variant = "all",
  className = "",
}: {
  sections: Section[];
  variant?: "all" | "chip-row" | "rail";
  className?: string;
}) {
  const labelledSections = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.label && section.label.trim() !== ""));

  if (labelledSections.length < 3) return null;

  if (variant === "chip-row") {
    return (
      <nav aria-label="Table of contents" className={`py-6 border-b border-line ${className}`}>
        <div className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-3">
          Contents
        </div>
        <ol className="flex gap-2.5 overflow-x-auto pb-2 list-none p-0 scrollbar-none">
          {labelledSections.map(({ section, index }, i) => (
            <li key={index} className="shrink-0">
              <a
                href={`#section-${index}`}
                className="min-h-[44px] px-4 py-2 rounded-full border border-line bg-surface text-xs font-medium text-muted hover:text-text hover:border-accent transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="font-mono text-xs text-muted/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  if (variant === "rail") {
    return (
      <nav aria-label="Table of contents" className={`py-2 ${className}`}>
        <div className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-4">
          Contents
        </div>
        <ol className="flex flex-col gap-1 list-none p-0">
          {labelledSections.map(({ section, index }, i) => (
            <li key={index}>
              <a
                href={`#section-${index}`}
                className="min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface/50 transition-colors flex items-center gap-2.5"
              >
                <span className="font-mono text-xs text-muted/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <Toc sections={sections} variant="chip-row" className={className} />
      </div>
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-[calc(var(--nav-h)+2rem)]">
          <Toc sections={sections} variant="rail" className={className} />
        </div>
      </aside>
    </>
  );
}
