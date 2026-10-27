"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "../../content/site";
import { copyText } from "../lib/copy-text";

// A mailto: link does nothing when no mail app is set up, so Contact opens a small menu that always works:
// the address on screen, a copy button, a mail-app link and LinkedIn.
export function ContactMenu({ variant, onNavigate }: { variant: "desktop" | "mobile"; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open || variant !== "desktop") return;
    const onPointer = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    if (await copyText(site.email)) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    }
  }

  const triggerClass =
    variant === "desktop"
      ? "min-h-[44px] px-3 inline-flex items-center hover:text-fg transition-colors link-underline cursor-pointer"
      : "font-display text-2xl sm:text-3xl font-black tracking-tight text-fg hover:text-accent min-h-[44px] flex items-center w-full text-left cursor-pointer";
  const panelClass =
    variant === "desktop"
      ? "absolute right-0 top-full mt-2 w-[19rem] z-50 rounded-xl border border-rule bg-surface p-4 shadow-2xl text-left"
      : "mt-3 rounded-xl border border-rule bg-surface p-4 text-left";
  const actionClass =
    "min-h-[44px] inline-flex items-center justify-center rounded-lg border border-rule px-3 text-sm font-medium text-fg hover:border-accent hover:text-accent transition-colors cursor-pointer";

  return (
    <div ref={wrap} className={variant === "desktop" ? "relative" : ""}>
      <button type="button" className={triggerClass} aria-expanded={open} aria-controls={`contact-panel-${variant}`} onClick={() => setOpen((o) => !o)}>
        Contact
      </button>
      {open && (
        <div id={`contact-panel-${variant}`} role="group" aria-label="Contact" className={panelClass}>
          <p className="text-xs uppercase tracking-wider text-muted">Email</p>
          <p className="mt-1 break-all font-sans text-base text-fg select-all">{site.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className={actionClass} onClick={copy}>
              {copied ? "Copied" : "Copy email"}
            </button>
            <a
              className={actionClass}
              href={`mailto:${site.email}`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              Open mail app
            </a>
          </div>
          <a
            className="mt-3 inline-flex min-h-[44px] items-center text-sm text-muted hover:text-fg underline underline-offset-4"
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            Or message me on LinkedIn ↗
          </a>
          <span className="sr-only" aria-live="polite">
            {copied ? "Email address copied" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
