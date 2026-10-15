import type { Metric } from "../../../content/types";

function StatTile({ item }: { item: Metric }) {
  return (
    <div className="p-5 sm:p-6 rounded-[6px] bg-surface border border-rule flex flex-col-reverse justify-start">
      <dt className="text-xs text-muted font-sans font-medium mt-2">
        {item.label}
      </dt>
      <dd className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-fg tracking-tight">
        {item.value}
      </dd>
    </div>
  );
}

export function Metrics({ items }: { items: Metric[] }) {
  if (!items || items.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-8 first:mt-0 last:mb-0">
      {items.map((item, index) => (
        <StatTile key={`${item.label}-${index}`} item={item} />
      ))}
    </dl>
  );
}
