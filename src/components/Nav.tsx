"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../../content/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = window.scrollY;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 8);

        if (currentY > 400 && currentY > lastY) {
          setHidden(true);
        } else if (currentY < lastY) {
          setHidden(false);
        }
        lastY = currentY <= 0 ? 0 : currentY;
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId = requestAnimationFrame(handleScroll);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isHome = pathname === "/";
  const isAbout = pathname === "/about" || pathname === "/about/";

  return (
    <header
      data-nav=""
      data-scrolled={scrolled ? "true" : "false"}
      data-hidden={hidden && !isOpen ? "true" : "false"}
      className="sticky top-0 z-50 w-full"
    >
      <div className="container-page h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className="font-display font-semibold text-base sm:text-lg text-text hover:text-accent transition-colors tracking-tight min-h-[44px] inline-flex items-center gap-2"
        >
          <span>{site.name}</span>
          {isHome && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"
              aria-hidden="true"
            />
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-2 text-sm text-muted"
        >
          <Link
            href="/#work"
            className="min-h-[44px] px-3 inline-flex items-center hover:text-text transition-colors link-underline"
          >
            Work
          </Link>
          <Link
            href="/about/"
            aria-current={isAbout ? "page" : undefined}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 hover:text-text transition-colors data-[current=true]:text-text link-underline"
            data-current={isAbout ? "true" : undefined}
          >
            <span>About</span>
            {isAbout && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"
                aria-hidden="true"
              />
            )}
          </Link>
          <a
            href={`mailto:${site.email}`}
            className="min-h-[44px] px-3 inline-flex items-center hover:text-text transition-colors link-underline"
          >
            Contact
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group min-h-[44px] px-3 inline-flex items-center gap-1 hover:text-text transition-colors link-underline"
          >
            <span>LinkedIn</span>
            <span aria-hidden="true" className="arrow-nudge-diag">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2.5 rounded-lg text-muted hover:text-text hover:bg-surface border border-line/60 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 12h16M4 6h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile disclosure menu */}
      <nav
        id="mobile-nav"
        aria-label="Mobile Navigation"
        hidden={!isOpen}
        className={`${!isOpen ? "hidden" : "flex"} md:hidden border-t border-line bg-bg/95 backdrop-blur-md px-4 py-4 flex-col gap-2 text-sm text-muted`}
      >
        <Link
          href="/#work"
          onClick={() => setIsOpen(false)}
          className="min-h-[44px] px-3 py-2 flex items-center hover:text-text transition-colors link-underline"
        >
          Work
        </Link>
        <Link
          href="/about/"
          aria-current={isAbout ? "page" : undefined}
          onClick={() => setIsOpen(false)}
          className="min-h-[44px] px-3 py-2 flex items-center justify-between hover:text-text transition-colors data-[current=true]:text-text link-underline"
          data-current={isAbout ? "true" : undefined}
        >
          <span>About</span>
          {isAbout && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"
              aria-hidden="true"
            />
          )}
        </Link>
        <a
          href={`mailto:${site.email}`}
          onClick={() => setIsOpen(false)}
          className="min-h-[44px] px-3 py-2 flex items-center hover:text-text transition-colors link-underline"
        >
          Contact
        </a>
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          className="group min-h-[44px] px-3 py-2 flex items-center gap-1 hover:text-text transition-colors link-underline"
        >
          <span>LinkedIn</span>
          <span aria-hidden="true" className="arrow-nudge-diag">↗</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </nav>
    </header>
  );
}
