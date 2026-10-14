"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const checkScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const threshold = window.innerHeight * 1.5;
        setVisible(window.scrollY > threshold);
        rafId = null;
      });
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 min-h-[44px] min-w-[44px] p-3 rounded-full bg-surface border border-line text-text hover:text-accent hover:border-accent shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent"
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
        <path d="m18 15-6-6-6 6" />
      </svg>
      <span className="sr-only">Back to top</span>
    </button>
  );
}
