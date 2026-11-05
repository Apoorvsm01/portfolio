import { statusFor, type WorkStatus } from "../../content/site";

// Small pill saying how far a project got (Shipped, Built, Prototype, Study, Concept, In progress).
// Solid surface with body-ink text, so it reads on any card or band: 4.5:1 or better in both themes.
export function StatusPill({ slug, className = "" }: { slug: string; className?: string }) {
  const status: WorkStatus | undefined = statusFor(slug);
  if (!status) return null;
  return (
    <span className={`status-pill ${className}`.trim()} data-status={status.toLowerCase().replace(/\s+/g, "-")}>
      <span className="sr-only">Status: </span>
      {status}
    </span>
  );
}
