"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { brainCopy } from "../../../content/brain/copy";

type Props = { open: boolean; onClose: () => void; children: ReactNode };

// A modal dialog: a side drawer from 768px up, a bottom sheet below. The native <dialog> opened with
// showModal() traps focus, closes on Escape, makes the page behind inert and returns focus to the opener.
export function TopicsDialog({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="topics-dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself, not on its panel.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="topics-panel">
        <div className="topics-head">
          <h2 id={titleId} className="topics-title">
            {brainCopy.topics.heading}
          </h2>
          <button type="button" className="brain-button" onClick={onClose}>
            {brainCopy.topics.close}
          </button>
        </div>
        <div className="topics-body">{open ? children : null}</div>
      </div>
    </dialog>
  );
}
