"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { facetGroups, facets, type FacetGroup } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import { matchFacets } from "../../lib/ask/corpus";
import { Q_MAX } from "./state";

type Props = {
  initial: string;
  selected: Record<FacetGroup, string[]>;
  onQuery: (q: string) => void;
  onAdd: (items: { group: FacetGroup; id: string }[]) => void;
  onAddAll: (items: { group: FacetGroup; id: string }[]) => void;
};

const DEBOUNCE_MS = 250;

// The text box. After a pause it sets the free-text query and suggests the topics it recognises. Suggestions
// are never applied on their own.
export function PasteBox({ initial, selected, onQuery, onAdd, onAddAll }: Props) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [settled, setSettled] = useState(initial);
  const first = useRef(true);
  const onQueryRef = useRef(onQuery);
  useEffect(() => {
    onQueryRef.current = onQuery;
  });

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      setSettled(value);
      onQueryRef.current(value.trim().slice(0, Q_MAX));
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value]);

  const found = useMemo(() => {
    if (!settled.trim()) return [];
    const hits = matchFacets(settled, facets);
    return facetGroups.flatMap((group) =>
      (hits[group] ?? [])
        .filter((fid) => !selected[group].includes(fid))
        .map((fid) => ({ group, id: fid, label: facets[group].find((e) => e.id === fid)?.label ?? fid })),
    );
  }, [settled, selected]);

  return (
    <div className="brain-paste">
      <label htmlFor={id} className="brain-paste-label">
        {brainCopy.paste.label}
      </label>
      <textarea
        id={id}
        className="brain-paste-input"
        rows={3}
        value={value}
        placeholder={brainCopy.paste.placeholder}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
      />
      {found.length > 0 && (
        <div className="brain-found">
          <p className="brain-found-label">{brainCopy.paste.found}</p>
          <ul className="brain-found-list">
            {found.map((f) => (
              <li key={`${f.group}:${f.id}`}>
                <button type="button" className="brain-chip" onClick={() => onAdd([{ group: f.group, id: f.id }])} aria-label={brainCopy.paste.addOne(f.label)}>
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="brain-link-button" onClick={() => onAddAll(found.map(({ group, id: fid }) => ({ group, id: fid })))}>
            {brainCopy.paste.addAll}
          </button>
        </div>
      )}
    </div>
  );
}
