"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { site } from "../../content/site";
import type { NavIndexItem } from "../lib/nav-index";

export const OPEN_COMMAND_PALETTE_EVENT = "open-command-palette";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT));
  }
}

export interface PaletteItem {
  id: string;
  category: "Pages" | "Projects" | "Sections" | "Actions";
  title: string;
  subtitle?: string;
  keywords: string;
  url?: string;
  action?: "email" | "linkedin";
}

function buildItemsFromNavIndex(items: NavIndexItem[]): PaletteItem[] {
  const result: PaletteItem[] = [];

  // 1. Pages
  result.push({
    id: "page-home",
    category: "Pages",
    title: "Home",
    subtitle: "Overview & Introduction",
    keywords: "home start main overview",
    url: "/",
  });
  result.push({
    id: "page-work",
    category: "Pages",
    title: "Work",
    subtitle: `All ${items.length} Projects & Case Studies`,
    keywords: "work projects portfolio case studies index",
    url: "/work/",
  });
  result.push({
    id: "page-about",
    category: "Pages",
    title: "About",
    subtitle: "Story, Timeline & How I Work",
    keywords: "about bio story resume timeline platforms how i work",
    url: "/about/",
  });

  // 2. Case Studies (with domains)
  items.forEach((study) => {
    result.push({
      id: `study-${study.slug}`,
      category: "Projects",
      title: study.title,
      subtitle: study.domain ? `${study.domain} · Case Study` : "Case Study",
      keywords: `${study.title} ${study.slug} ${study.domain} ${study.tags.join(" ")} ${study.blurb}`,
      url: `/work/${study.slug}/`,
    });
  });

  // Sections inside a case study are not listed: search stays at the level of pages and projects
  // (a project still matches on its tags and blurb).

  // 4. Actions
  result.push({
    id: "action-email",
    category: "Actions",
    title: "Email",
    subtitle: site.email,
    keywords: "email contact message mail mailto",
    action: "email",
  });

  result.push({
    id: "action-linkedin",
    category: "Actions",
    title: "LinkedIn",
    subtitle: "View Profile ↗",
    keywords: "linkedin social profile connect",
    action: "linkedin",
  });

  return result;
}

function scorePaletteItem(item: PaletteItem, q: string): number {
  const title = item.title.toLowerCase();
  const keywords = (item.keywords + " " + (item.subtitle || "")).toLowerCase();
  const isSection = item.category === "Sections";
  const sectionPart =
    isSection && item.title.includes("›")
      ? item.title.split("›")[1].trim().toLowerCase()
      : "";

  // 1. Exact / prefix title matches (score >= 900)
  if (!isSection) {
    if (title === q) return 1000;
    if (title.startsWith(q)) return 950;
    const words = title.split(/\s+/);
    if (words.some((w) => w.startsWith(q))) return 920;
    if (title.includes(q)) return 900;
  } else {
    if (title.startsWith(q)) return 910;
  }

  // 2. Section-title matches (score 700-800)
  // e.g. 'design' matches '<Study> › Design System'
  if (isSection && sectionPart) {
    if (sectionPart === q) return 800;
    if (sectionPart.startsWith(q)) return 780;
    const secWords = sectionPart.split(/\s+/);
    if (secWords.some((w) => w.startsWith(q))) return 750;
    if (sectionPart.includes(q)) return 720;
  }

  // 3. Tag / keyword / subtitle matches (score 300-500)
  if (keywords.split(/\s+/).some((w) => w.startsWith(q))) return 500;
  if (keywords.includes(q)) return 400;

  return 0;
}

export function CommandPalette({ items = [] }: { items?: NavIndexItem[] }) {
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

  const allItems = useMemo(() => buildItemsFromNavIndex(items), [items]);

  // Filtered and ranked items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;

    return allItems
      .map((item, index) => ({ item, index, score: scorePaletteItem(item, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(({ item }) => item);
  }, [allItems, query]);

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
  }, []);

  // Native dialog onClose callback restores focus and resets state
  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    if (
      triggerRef.current &&
      typeof triggerRef.current.focus === "function" &&
      triggerRef.current.isConnected
    ) {
      triggerRef.current.focus();
    }
  }, []);

  // Handle item selection
  const handleSelectItem = useCallback(
    async (item: PaletteItem) => {
      if (item.url) {
        closeModal();
        router.push(item.url);
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
        closeModal();
        window.open(site.linkedin, "_blank", "noopener,noreferrer");
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

      // / key (ignored in inputs, textareas, selects, or contentEditable; verify no modifier keys)
      if (
        e.key === "/" &&
        !isOpen &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
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
      onClose={handleDialogClose}
      onCancel={(e) => {
        e.preventDefault();
        closeModal();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          closeModal();
        }
      }}
      aria-label="Command palette"
      className="m-auto fixed inset-0 z-50 w-full max-w-xl p-0 bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:flex-col shadow-2xl rounded-[6px] overflow-hidden border border-rule outline-none"
    >
      <div className="bg-surface w-full flex flex-col max-h-[80svh] overflow-hidden rounded-[6px]">
        {/* Combobox Search Input */}
        <div className="relative flex items-center px-4 border-b border-rule">
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
            aria-haspopup="listbox"
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
            placeholder="Search pages and projects..."
            className="w-full min-h-[56px] py-3.5 bg-transparent text-fg placeholder:text-muted focus:outline-none text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              aria-label="Clear search"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-muted hover:text-fg cursor-pointer"
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
          <ul
            ref={listRef}
            id="command-palette-list"
            role="listbox"
            aria-label="Search suggestions"
            className="list-none p-0 space-y-1"
          >
            {filteredItems.length === 0 ? (
              <li
                role="option"
                aria-selected={false}
                className="py-12 text-center text-sm text-muted cursor-default"
              >
                No results found
              </li>
            ) : (
              filteredItems.map((item, index) => {
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
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-[6px] flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-ground text-fg border border-rule"
                        : "text-fg hover:bg-ground/50 border border-transparent"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-fg truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-surface border border-rule text-muted shrink-0">
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
                    <span
                      aria-hidden="true"
                      className="text-xs text-muted font-mono shrink-0"
                    >
                      {item.category === "Actions" ? "↵" : "→"}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Footer shortcuts info */}
        <div className="p-3 border-t border-rule bg-ground/50 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface border border-rule font-mono text-[10px] text-fg">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface border border-rule font-mono text-[10px] text-fg">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface border border-rule font-mono text-[10px] text-fg">
                ↵
              </kbd>
              <span>select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-[4px] bg-surface border border-rule font-mono text-[10px] text-fg">
                esc
              </kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-[11px] font-mono">⌘K /</span>
        </div>
      </div>
    </dialog>
  );
}
