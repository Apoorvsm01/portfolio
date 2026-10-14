import type { Card } from "../../../content/types";
import { Reveal } from "../Reveal";

export function Facts({ facts }: { facts: Card[] }) {
  if (!facts || facts.length === 0) return null;

  return (
    <Reveal
      as="section"
      aria-label="Key facts"
      className="py-10 sm:py-12 border-b border-line"
    >
      <dl
        className="grid gap-6 sm:gap-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))" }}
      >
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
