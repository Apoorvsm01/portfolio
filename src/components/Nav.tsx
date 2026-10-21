"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../../content/site";
import { ThemeToggle } from "./ThemeToggle";
import { openCommandPalette } from "./CommandPalette";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  // Scroll detection
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
    handleScroll();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile sheet on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Focus trap and Escape listener for mobile sheet
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        const sheet = sheetRef.current;
        const toggle = toggleButtonRef.current;
        if (!sheet) return;

        const sheetFocusables = Array.from(
          sheet.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'
          )
        );
        const focusables = toggle ? [toggle, ...sheetFocusables] : sheetFocusables;
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const timer = setTimeout(() => {
      const sheet = sheetRef.current;
      if (sheet) {
        const firstFocusable = sheet.querySelector<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isHome = pathname === "/";
  const isWork = pathname === "/work" || pathname.startsWith("/work/");
  const isPersonal = pathname === "/personal" || pathname.startsWith("/personal/");
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
          className="font-display font-black text-base sm:text-lg text-fg hover:text-accent transition-colors tracking-tight min-h-[44px] inline-flex items-center gap-2"
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
          className="hidden md:flex items-center gap-1.5 font-sans text-sm text-muted"
        >
          <Link
            href="/work/"
            aria-current={isWork ? "page" : undefined}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 hover:text-fg transition-colors data-[current=true]:text-fg link-underline"
            data-current={isWork ? "true" : undefined}
          >
            <span>Work</span>
            {isWork && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"
                aria-hidden="true"
              />
            )}
          </Link>

          <Link
            href="/personal/"
            aria-current={isPersonal ? "page" : undefined}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 hover:text-fg transition-colors data-[current=true]:text-fg link-underline"
            data-current={isPersonal ? "true" : undefined}
          >
            <span>Personal</span>
            {isPersonal && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"
                aria-hidden="true"
              />
            )}
          </Link>


          <Link
            href="/about/"
            aria-current={isAbout ? "page" : undefined}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 hover:text-fg transition-colors data-[current=true]:text-fg link-underline"
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
            className="min-h-[44px] px-3 inline-flex items-center hover:text-fg transition-colors link-underline"
          >
            Contact
          </a>

          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group min-h-[44px] px-3 inline-flex items-center gap-1 hover:text-fg transition-colors link-underline"
          >
            <span>LinkedIn</span>
            <span aria-hidden="true" className="arrow-nudge-diag">
              ↗
            </span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>

          {/* ⌘K command palette trigger */}
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="min-h-[44px] px-2.5 py-1.5 rounded-[6px] border border-rule/60 bg-surface/50 text-muted hover:text-fg hover:border-rule transition-colors inline-flex items-center gap-2 text-xs ml-1 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <kbd className="font-mono text-[10px] px-1 py-0.5 rounded-[4px] bg-ground border border-rule text-muted">
              ⌘K
            </kbd>
          </button>

          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2.5 rounded-[6px] text-muted hover:text-fg hover:bg-surface border border-rule/60 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <ThemeToggle />

          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-sheet"
            aria-label="Toggle navigation menu"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2.5 rounded-[6px] text-muted hover:text-fg hover:bg-surface border border-rule/60 transition-colors cursor-pointer"
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

      {/* Mobile full-height sheet menu */}
      {isOpen && (
        <nav
          ref={sheetRef}
          id="mobile-nav-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 top-16 z-50 bg-ground/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 border-t border-rule overflow-y-auto md:hidden"
        >
          <div className="flex flex-col gap-6 pt-4">
            <Link
              href="/"
              aria-current={isHome ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent flex items-center justify-between min-h-[44px]"
            >
              <span>Home</span>
              {isHome && (
                <span
                  className="w-2 h-2 rounded-full bg-accent inline-block"
                  aria-hidden="true"
                />
              )}
            </Link>

            <Link
              href="/work/"
              aria-current={isWork ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent flex items-center justify-between min-h-[44px]"
            >
              <span>Work</span>
              {isWork && (
                <span
                  className="w-2 h-2 rounded-full bg-accent inline-block"
                  aria-hidden="true"
                />
              )}
            </Link>

            <Link
              href="/personal/"
              aria-current={isPersonal ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent flex items-center justify-between min-h-[44px]"
            >
              <span>Personal</span>
              {isPersonal && (
                <span
                  className="w-2 h-2 rounded-full bg-accent inline-block"
                  aria-hidden="true"
                />
              )}
            </Link>


            <Link
              href="/about/"
              aria-current={isAbout ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent flex items-center justify-between min-h-[44px]"
            >
              <span>About</span>
              {isAbout && (
                <span
                  className="w-2 h-2 rounded-full bg-accent inline-block"
                  aria-hidden="true"
                />
              )}
            </Link>

            <a
              href={`mailto:${site.email}`}
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent min-h-[44px] flex items-center"
            >
              Contact
            </a>

            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent flex items-center gap-2 min-h-[44px]"
            >
              <span>LinkedIn</span>
              <span aria-hidden="true" className="arrow-nudge-diag text-lg">
                ↗
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>

          <div className="pt-8 border-t border-rule flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openCommandPalette();
              }}
              className="w-full min-h-[44px] px-4 py-3 rounded-[6px] bg-surface border border-rule text-sm text-muted hover:text-fg flex items-center justify-between cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span>Search</span>
              </span>
              <kbd className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-ground border border-rule">
                ⌘K
              </kbd>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
