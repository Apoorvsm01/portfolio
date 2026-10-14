"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { site } from "../../content/site";
import { getAllStudies, studyHref } from "../lib/content";

export const OPEN_COMMAND_PALETTE_EVENT = "open-command-palette";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT));
  }
}

interface PaletteItem {
  id: string;
  category: "Pages" | "Projects" | "Sections" | "Actions";
  title: string;
  subtitle?: string;
  keywords: string;
  url?: string;
  action?: "email" | "linkedin";
}

// Static definition of all searchable items
function buildAllItems(): PaletteItem[] {
  const items: PaletteItem[] = [];

  // 1. Pages
  items.push({
    id: "page-home",
    category: "Pages",
    title: "Home",
    subtitle: "Overview & Introduction",
    keywords: "home start main overview",
    url: "/",
  });
  items.push({
    id: "page-work",
    category: "Pages",
    title: "Work",
    subtitle: "All 9 Projects & Case Studies",
    keywords: "work projects portfolio case studies index",
    url: "/work/",
  });
  items.push({
    id: "page-about",
    category: "Pages",
    title: "About",
    subtitle: "Story, Timeline & How I Work",
    keywords: "about bio story resume timeline platforms how i work",
    url: "/about/",
  });

  // 2. Case Studies (with domains)
  const studies = getAllStudies();
  studies.forEach((study) => {
    const domain =
      study.slug === site.featured.slug
        ? site.featuredDomain
        : site.work.find((w) => w.slug === study.slug)?.domain ?? "";
    items.push({
      id: `study-${study.slug}`,
      category: "Projects",
      title: study.title,
      subtitle: domain ? `${domain} · Case Study` : "Case Study",
      keywords: `${study.title} ${study.slug} ${domain} ${study.tags?.join(" ") || ""} ${study.description || ""}`,
      url: studyHref(study.slug),
    });
  });

  // 3. Labelled Case Study Sections
  studies.forEach((study) => {
    study.sections.forEach((section, sIdx) => {
      if (section.label && section.label.trim() !== "") {
        items.push({
          id: `sec-${study.slug}-${sIdx}`,
          category: "Sections",
          title: `${study.title} › ${section.label}`,
          subtitle: "Section",
          keywords: `${study.title} ${section.label} section jump`,
          url: `/work/${study.slug}/#section-${sIdx}`,
        });
      }
    });
  });

  // 4. Actions
  items.push({
    id: "action-email",
    category: "Actions",
    title: "Email",
    subtitle: site.email,
    keywords: "email contact message mail mailto",
    action: "email",
  });

  items.push({
    id: "action-linkedin",
    category: "Actions",
    title: "LinkedIn",
    subtitle: "View Profile ↗",
    keywords: "linkedin social profile connect",
    action: "linkedin",
  });

  return items;
}

const STATIC_ITEMS = buildAllItems();

export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATIC_ITEMS;
    return STATIC_ITEMS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.keywords.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const safeIndex =
    filteredItems.length > 0
      ? Math.min(selectedIndex, filteredItems.length - 1)
      : 0;

  // Open modal
  const openModal = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      setIsOpen(true);
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    setIsOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }, []);

  // Handle item selection
  const handleSelectItem = useCallback(
    async (item: PaletteItem) => {
      if (item.url) {
        router.push(item.url);
        closeModal();
      } else if (item.action === "email") {
        try {
          await navigator.clipboard.writeText(site.email);
          setCopiedEmail(true);
          if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
          copyTimeoutRef.current = setTimeout(() => {
            setCopiedEmail(false);
          }, 2000);
        } catch {
          window.location.href = `mailto:${site.email}`;
        }
      } else if (item.action === "linkedin") {
        window.open(site.linkedin, "_blank", "noopener,noreferrer");
        closeModal();
      }
    },
    [router, closeModal]
  );

  // Global keyboard shortcuts (⌘K / Ctrl+K and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal();
        }
        return;
      }

      // / key (ignored in inputs, textareas, selects, or contentEditable)
      if (e.key === "/" && !isOpen) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        openModal();
        return;
      }
    };

    const handleCustomOpen = () => openModal();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, [isOpen, openModal, closeModal]);

  // Keep selected item visible in list
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-index="${safeIndex}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [safeIndex]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0
          ? (prev - 1 + filteredItems.length) % filteredItems.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentItem = filteredItems[safeIndex];
      if (currentItem) {
        handleSelectItem(currentItem);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  };

  const activeItem = filteredItems[safeIndex];

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setIsOpen(false)}
      onCancel={(e) => {
        e.preventDefault();
        closeModal();
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) {
          closeModal();
        }
      }}
      aria-label="Command palette"
      className="m-auto fixed inset-0 z-50 w-full max-w-xl p-0 bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:flex-col shadow-2xl rounded-[20px] overflow-hidden border border-line outline-none"
    >
      <div className="bg-surface w-full flex flex-col max-h-[80svh] overflow-hidden rounded-[20px]">
        {/* Combobox Search Input */}
        <div className="relative flex items-center px-4 border-b border-line">
          <svg
            className="w-5 h-5 text-muted shrink-0 mr-3"
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
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-activedescendant={activeItem ? activeItem.id : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages, projects, sections..."
            className="w-full min-h-[56px] py-3.5 bg-transparent text-text placeholder:text-muted focus:outline-none text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              aria-label="Clear search"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-muted hover:text-text cursor-pointer"
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
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Listbox */}
        <div className="overflow-y-auto p-2 flex-1 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              No results found
            </div>
          ) : (
            <ul
              ref={listRef}
              id="command-palette-list"
              role="listbox"
              aria-label="Search suggestions"
              className="list-none p-0 space-y-1"
            >
              {filteredItems.map((item, index) => {
                const isSelected = index === safeIndex;
                const isEmailAction = item.id === "action-email";

                return (
                  <li
                    key={item.id}
                    id={item.id}
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-bg text-text border border-line"
                        : "text-text hover:bg-bg/50 border border-transparent"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface border border-line text-muted shrink-0">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <span className="text-xs text-muted truncate mt-0.5">
                          {isEmailAction && copiedEmail
                            ? "Copied email address"
                            : item.subtitle}
                        </span>
                      )}
                    </div>
                    {isEmailAction ? (
                      <span className="text-xs text-muted shrink-0">
                        {copiedEmail ? (
                          <span className="text-accent font-medium">Copied</span>
                        ) : (
                          "Copy"
                        )}
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-muted text-xs shrink-0"
                      >
                        ↵
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-3 border-t border-line/60 bg-surface text-xs text-muted flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg border border-line font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-bg border border-line font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg border border-line font-mono text-[10px]">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg border border-line font-mono text-[10px]">
              esc
            </kbd>
            <span>close</span>
          </span>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {copiedEmail ? "Copied email address to clipboard" : ""}
      </span>
    </dialog>
  );
}
