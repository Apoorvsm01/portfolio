"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "../../content/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg/80 border-b border-line">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-semibold text-base sm:text-lg text-text hover:text-accent transition-colors tracking-tight"
        >
          {site.name}
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm text-muted"
        >
          <Link
            href="/#work"
            className="hover:text-text transition-colors"
          >
            Work
          </Link>
          <Link
            href="/about/"
            className="hover:text-text transition-colors"
          >
            About
          </Link>
          <a
            href={`mailto:${site.email}`}
            className="hover:text-text transition-colors"
          >
            Contact
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            LinkedIn
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-text hover:bg-surface border border-line/60 transition-colors cursor-pointer"
          >
            <span className="sr-only">Toggle navigation menu</span>
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
      {isOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-line bg-bg/95 backdrop-blur-md px-4 py-4 flex flex-col gap-3 text-sm text-muted"
        >
          <Link
            href="/#work"
            onClick={() => setIsOpen(false)}
            className="py-2 hover:text-text transition-colors"
          >
            Work
          </Link>
          <Link
            href="/about/"
            onClick={() => setIsOpen(false)}
            className="py-2 hover:text-text transition-colors"
          >
            About
          </Link>
          <a
            href={`mailto:${site.email}`}
            onClick={() => setIsOpen(false)}
            className="py-2 hover:text-text transition-colors"
          >
            Contact
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="py-2 hover:text-text transition-colors"
          >
            LinkedIn
          </a>
        </nav>
      )}
    </header>
  );
}
