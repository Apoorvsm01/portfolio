import type { Section } from "../../../content/types";
import { Reveal } from "../Reveal";

export function Toc({ sections }: { sections: Section[] }) {
  const labelledSections = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => Boolean(section.label && section.label.trim() !== ""));

  if (labelledSections.length < 3) return null;

  return (
    <Reveal
      as="nav"
      aria-label="Table of contents"
      className="py-8 sm:py-10 border-b border-line"
    >
      <div className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-4">
        Contents
      </div>
      <ol className="flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-3">
        {labelledSections.map(({ section, index }, i) => (
          <li key={index}>
            <a
              href={`#section-${index}`}
              className="inline-flex items-center text-sm font-medium text-muted hover:text-accent transition-colors gap-2"
            >
              <span className="font-mono text-xs text-muted/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
