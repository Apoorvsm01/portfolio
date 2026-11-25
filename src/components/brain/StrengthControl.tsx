"use client";

import { useId } from "react";
import { brainCopy } from "../../../content/brain/copy";
import type { Strength } from "../../lib/ask/types";

type Props = { value: Strength | undefined; onChange: (value: Strength | undefined) => void };

// Segmented control with radio-group semantics: native radios, visually restyled as one joined track.
export function StrengthControl({ value, onChange }: Props) {
  const name = useId();
  return (
    <fieldset className="brain-strength">
      <legend className="label-subhead brain-strength-legend">{brainCopy.strength.legend}</legend>
      <div className="brain-segments">
        {brainCopy.strength.options.map((opt) => {
          const id = `${name}-${opt.value ?? "any"}`;
          return (
            <span key={opt.label} className="brain-segment">
              <input
                id={id}
                type="radio"
                name={name}
                className="brain-segment-input"
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <label htmlFor={id} className="brain-segment-label">
                {opt.short}
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}
