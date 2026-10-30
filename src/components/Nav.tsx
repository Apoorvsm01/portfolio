"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../../content/site";
import { asset } from "../lib/asset";

export const RESUME_HREF = "/resume/Apoorv-Mahajan-Resume.pdf";

const links = [
  { href: "/work/", label: "Work" },
  { href: "/personal/", label: "Side projects" },
  { href: "/about/", label: "About" },
];

// A plain bar: wordmark, four links, one action. On a phone it recomposes into two rows and scrolls away.
export function Nav() {
  const pathname = usePathname();
  const current = (href: string) => (pathname.startsWith(href) ? "page" : undefined);

  return (
    <header className="nav">
      <Link href="/" className="nav__brand">
        {site.name}
      </Link>
      <nav aria-label="Main" className="nav__list">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="nav__link" aria-current={current(l.href)}>
            {l.label}
          </Link>
        ))}
        <a className="nav__link" href={asset(RESUME_HREF)} target="_blank" rel="noopener noreferrer">
          Résumé<span className="sr-only"> (PDF, opens in a new tab)</span>
        </a>
      </nav>
      <a className="btn nav__cta" href={`mailto:${site.email}`}>
        Email me
      </a>
    </header>
  );
}
