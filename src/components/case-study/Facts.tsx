import type { Card } from "../../../content/types";
import { Reveal } from "../Reveal";

export function Facts({ facts }: { facts: Card[] }) {
  if (!facts || facts.length === 0) return null;

  const gridColsClass =
    facts.length <= 2
      ? "sm:grid-cols-2"
      : facts.length === 3
      ? "sm:grid-cols-2 md:grid-cols-3"
      : facts.length === 4
      ? "sm:grid-cols-2 md:grid-cols-4"
      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

  return (
    <Reveal
      as="section"
      aria-label="Key facts"
      className="py-10 sm:py-12 border-b border-line"
    >
      <dl className={`grid grid-cols-1 ${gridColsClass} gap-6 sm:gap-8`}>
        {facts.map((fact, index) => {
          const lines = fact.value.split("\n");
          return (
            <div key={`${fact.label}-${index}`} className="flex flex-col">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted font-medium mb-2">
                {fact.label}
              </dt>
              <dd className="text-sm sm:text-base text-text font-medium space-y-1">
                {lines.map((line, lIdx) => (
                  <div key={lIdx}>{line}</div>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </Reveal>
  );
}
