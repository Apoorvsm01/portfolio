"use client";

import { useState, useRef, useEffect } from "react";
import { site } from "../../content/site";
import { copyText } from "../lib/copy-text";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return (
    <span>
      <a href={`mailto:${site.email}`} className="link">
        {site.email}
      </a>
      <button
        type="button"
        className="copy"
        onClick={async () => {
          if (await copyText(site.email)) {
            setCopied(true);
            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setCopied(false), 2000);
          }
        }}
        aria-label={copied ? "Email copied to clipboard" : "Copy email address to clipboard"}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied email address to clipboard" : ""}
      </span>
    </span>
  );
}
