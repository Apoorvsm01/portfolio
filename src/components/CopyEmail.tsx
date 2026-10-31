"use client";

import { useState, useRef, useEffect } from "react";
import { site } from "../../content/site";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2">
      <a
        href={`mailto:${site.email}`}
        className="link-underline min-h-[44px] inline-flex items-center hover:text-text transition-colors"
      >
        {site.email}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Email copied to clipboard" : "Copy email address to clipboard"}
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-text hover:bg-surface border border-line/60 transition-colors cursor-pointer text-xs"
      >
        {copied ? (
          <span className="inline-flex items-center gap-1.5 text-accent font-medium">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Copied</span>
          </span>
        ) : (
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
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied email address to clipboard" : ""}
      </span>
    </div>
  );
}
