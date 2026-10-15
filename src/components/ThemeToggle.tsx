"use client";

import { useSyncExternalStore, useRef } from "react";

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const applyThemeChange = (nextTheme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Ignore localStorage write failure in restricted contexts
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // View transition check
    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || prefersReduced) {
      applyThemeChange(nextTheme);
      return;
    }

    const btn = buttonRef.current;
    const rect = btn?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      applyThemeChange(nextTheme);
    });

    transition.ready
      ?.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 450,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {
        // Fallback gracefully if transition fails
      });
  };

  const isDark = mounted && theme === "dark";
  const ariaLabel = !mounted
    ? "Toggle theme"
    : theme === "dark"
    ? "Switch to light theme"
    : "Switch to dark theme";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-[6px] text-muted hover:text-fg hover:bg-surface border border-rule/60 transition-colors cursor-pointer ${className}`}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        {/* Placeholder circle icon until mounted */}
        {!mounted ? (
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
            <circle cx="12" cy="12" r="5" />
          </svg>
        ) : (
          <>
            {/* Sun icon: active in dark mode (click to switch to light) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`absolute inset-0 w-4 h-4 transition-all duration-[var(--dur-2)] ease-[var(--ease-out)] ${
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0 pointer-events-none"
              }`}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>

            {/* Moon icon: active in light mode (click to switch to dark) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`absolute inset-0 w-4 h-4 transition-all duration-[var(--dur-2)] ease-[var(--ease-out)] ${
                !isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0 pointer-events-none"
              }`}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </>
        )}
      </span>
    </button>
  );
}
