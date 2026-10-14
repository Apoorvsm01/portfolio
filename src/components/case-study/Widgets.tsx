"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import type { Widget } from "../../../content/types";
import { imageDims } from "../../lib/content";
import { FadeImage } from "../FadeImage";

type Language = "swiftui" | "flutter" | "tailwind";

const TABS: { id: Language; label: string }[] = [
  { id: "swiftui", label: "SwiftUI" },
  { id: "flutter", label: "Flutter" },
  { id: "tailwind", label: "Tailwind" },
];

let sharedLanguage: Language = "swiftui";
const languageListeners = new Set<(lang: Language) => void>();

function subscribeLanguage(cb: () => void) {
  const listener = () => cb();
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}

function getLanguageSnapshot(): Language {
  return sharedLanguage;
}

function setSharedLanguage(next: Language) {
  sharedLanguage = next;
  languageListeners.forEach((cb) => cb(next));
}

function SingleWidget({
  widget,
  index,
}: {
  widget: Widget;
  index: number;
}) {
  const selectedLang: Language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    () => "swiftui" as Language
  );

  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const previewDims = imageDims(widget.preview.src);
  const widgetId = `widget-${index}`;
  const codeText = widget.code[selectedLang] || "";

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (tabIndex + 1) % TABS.length;
      setSharedLanguage(TABS[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (tabIndex - 1 + TABS.length) % TABS.length;
      setSharedLanguage(TABS[prevIdx].id);
      tabRefs.current[prevIdx]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setSharedLanguage(TABS[0].id);
      tabRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setSharedLanguage(TABS[TABS.length - 1].id);
      tabRefs.current[TABS.length - 1]?.focus();
    }
  };

  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 rounded-[20px] bg-surface border border-line p-5 sm:p-6 lg:p-8 my-8 first:mt-0 last:mb-0">
      {/* Left Column: Title, Subtitle, Preview Stage */}
      <div className="flex flex-col justify-between">
        <div>
          <h4 className="font-display text-lg sm:text-xl font-bold text-text">
            {widget.title}
          </h4>
          <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
            {widget.subtitle}
          </p>
        </div>
        <div className="mt-4 sm:mt-6 rounded-xl bg-black/60 border border-line/40 p-4 sm:p-6 flex items-center justify-center min-h-[160px]">
          <FadeImage
            src={widget.preview.src}
            alt={widget.preview.alt || widget.title}
            width={previewDims.width}
            height={previewDims.height}
            loading="lazy"
            className="max-h-[220px] w-auto max-w-full object-contain"
          />
        </div>
      </div>

      {/* Right Column: Tablist + Code Panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            role="tablist"
            aria-label="Code language"
            className="flex items-center gap-1 p-1 rounded-xl bg-bg/80 border border-line/60"
          >
            {TABS.map((tab, idx) => {
              const isSelected = selectedLang === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${widgetId}-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${widgetId}-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSharedLanguage(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`min-h-[44px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-surface text-text shadow-xs border border-line"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy"}
              className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-text hover:bg-surface border border-line/60 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-accent"
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
                  <span className="text-accent font-semibold">Copied</span>
                </>
              ) : (
                <>
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
                  <span>Copy</span>
                </>
              )}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Copied" : ""}
            </span>
          </div>
        </div>

        <div
          role="tabpanel"
          id={`panel-${widgetId}-${selectedLang}`}
          aria-labelledby={`tab-${widgetId}-${selectedLang}`}
          tabIndex={0}
          className="relative flex-1 rounded-xl border border-line/60 bg-bg/90 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <pre className="overflow-x-auto whitespace-pre font-mono text-xs sm:text-sm p-4 sm:p-5 text-text/90 leading-relaxed h-full">
            <code>{codeText}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}

export function Widgets({ items }: { items: Widget[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6 sm:space-y-8 my-8 first:mt-0 last:mb-0">
      {items.map((widget, index) => (
        <SingleWidget
          key={`${widget.title}-${index}`}
          widget={widget}
          index={index}
        />
      ))}
    </div>
  );
}
