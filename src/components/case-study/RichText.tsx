import Link from "next/link";
import type { ReactNode } from "react";

// Inline links in case-study copy: `[label](href)`. Internal hrefs (leading "/") go through next/link so the
// basePath is applied; everything else opens in a new tab.
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function RichText({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, href] = m;
    if (m.index > last) out.push(text.slice(last, m.index));
    if (href.startsWith("/") && !href.startsWith("//")) {
      out.push(
        <Link key={m.index} href={href} className="link-prose">
          {label}
        </Link>,
      );
    } else {
      out.push(
        <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="link-prose">
          {label}
          <span className="sr-only"> (opens in new tab)</span>
        </a>,
      );
    }
    last = m.index + whole.length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
