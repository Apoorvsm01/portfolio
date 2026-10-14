"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "theme" && event.newValue) {
      const nextTheme =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Ignore localStorage write failure in restricted contexts
    }
  };

  const isDark = mounted && theme === "dark";
  const ariaLabel = !mounted
    ? "Toggle theme"
    : theme === "dark"
    ? "Switch to light theme"
    : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={mounted ? isDark : false}
      aria-label={ariaLabel}
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-lg text-muted hover:text-text hover:bg-surface border border-line/60 transition-colors cursor-pointer ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        {!mounted ? (
          /* Neutral placeholder circle icon until mounted */
          <circle cx="12" cy="12" r="5" />
        ) : theme === "light" ? (
          /* Moon icon for light mode (action: switch to dark) */
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        ) : (
          /* Sun icon for dark mode (action: switch to light) */
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </>
        )}
      </svg>
    </button>
  );
}
