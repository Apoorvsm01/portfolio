"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { facetGroups, facets, type FacetGroup } from "../../../content/brain/taxonomy";
import { brainCopy } from "../../../content/brain/copy";
import { loadEngine } from "../../lib/ask/load";
import type { AskEngine } from "../../lib/ask/engine";
import type { FacetCount, Strength } from "../../lib/ask/types";
import { PasteBox } from "./PasteBox";
import { QueryBar } from "./QueryBar";
import { ResultList, splitClaim, yearOf } from "./ResultList";
import { StrengthControl } from "./StrengthControl";
import { TopicIndex } from "./TopicIndex";
import { emptyState, key, parseSearch, toFilterState, toSearch, type BrainState, type Token } from "./state";

const known = Object.fromEntries(facetGroups.map((g) => [g, new Set(facets[g].map((e) => e.id))])) as Record<FacetGroup, Set<string>>;
const labelOf = (group: FacetGroup, id: string) => facets[group].find((e) => e.id === id)?.label ?? id;
const minLabel = (s: Strength | undefined) => brainCopy.strength.options.find((o) => o.value === s)?.label ?? "";

const DESKTOP = "(min-width: 768px)";
function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function useDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);
}

export function BrainExplorer() {
  const [state, setState] = useState<BrainState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [engine, setEngine] = useState<AskEngine | null>(null);
  const [showAllFor, setShowAllFor] = useState<string | null>(null);
  const desktop = useDesktop();

  // Read the shared link once on load. A static export has no search params at build time, so this runs in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(parseSearch(window.location.search, known));
    setHydrated(true);
  }, []);

  useEffect(() => {
    let live = true;
    loadEngine().then((e) => {
      if (live) setEngine(e);
    });
    return () => {
      live = false;
    };
  }, []);

  const search = toSearch(state);
  useEffect(() => {
    if (!hydrated) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search}${window.location.hash}`);
  }, [search, hydrated]);

  const filterState = useMemo(() => toFilterState(state), [state]);
  const result = useMemo(() => (engine ? engine.filter(filterState) : null), [engine, filterState]);
  const counts = useMemo(() => {
    const map = new Map<string, FacetCount>();
    if (engine) for (const c of engine.facetCounts(filterState)) map.set(key(c.group, c.id), c);
    return map;
  }, [engine, filterState]);

  const toggle = useCallback((group: FacetGroup, id: string) => {
    setState((s) => {
      const has = s.selected[group].includes(id);
      return {
        ...s,
        selected: { ...s.selected, [group]: has ? s.selected[group].filter((v) => v !== id) : [...s.selected[group], id] },
        added: has ? s.added.filter((k) => k !== key(group, id)) : [...s.added, key(group, id)],
      };
    });
  }, []);

  const addMany = useCallback((items: { group: FacetGroup; id: string }[]) => {
    setState((s) => {
      const selected = { ...s.selected };
      const added = [...s.added];
      for (const { group, id } of items) {
        if (selected[group].includes(id)) continue;
        selected[group] = [...selected[group], id];
        added.push(key(group, id));
      }
      return { ...s, selected, added };
    });
  }, []);

  // "Add all" turns the pasted text into topics: any-match, and the text itself is cleared.
  const addAll = useCallback(
    (items: { group: FacetGroup; id: string }[]) => {
      addMany(items);
      setState((s) => ({ ...s, match: "any", q: "" }));
      setResetCount((n) => n + 1);
    },
    [addMany],
  );
  const setMatch = useCallback((match: "all" | "any") => setState((s) => ({ ...s, match })), []);

  const setQuery = useCallback((q: string) => setState((s) => (s.q === q ? s : { ...s, q })), []);
  const setMin = useCallback((minStrength: Strength | undefined) => setState((s) => ({ ...s, minStrength })), []);

  const tokens: Token[] = useMemo(() => {
    const out: Token[] = [];
    const order = [...state.added];
    for (const g of facetGroups) for (const id of state.selected[g]) if (!order.includes(key(g, id))) order.push(key(g, id));
    for (const k of order) {
      const cut = k.indexOf(":");
      const group = k.slice(0, cut) as FacetGroup;
      const id = k.slice(cut + 1);
      if (state.selected[group]?.includes(id)) out.push({ kind: "facet", group, id, label: labelOf(group, id) });
    }
    if (state.minStrength) out.push({ kind: "min", label: minLabel(state.minStrength) });
    if (state.q) out.push({ kind: "q", label: brainCopy.bar.textToken(state.q.length > 36 ? `${state.q.slice(0, 36).trimEnd()}…` : state.q) });
    return out;
  }, [state]);

  const removeToken = useCallback(
    (t: Token) => {
      if (t.kind === "facet") toggle(t.group, t.id);
      else if (t.kind === "min") setMin(undefined);
      else {
        setQuery("");
        setResetCount((n) => n + 1);
      }
    },
    [toggle, setMin, setQuery],
  );

  const clear = useCallback(() => {
    setState(emptyState());
    setResetCount((n) => n + 1);
  }, []);

  const showAll = showAllFor === search;
  const items = useMemo(() => result?.items ?? [], [result]);
  const visible = showAll ? items : items.slice(0, 12);
  const last = tokens[tokens.length - 1];
  const facetCount = tokens.filter((t) => t.kind === "facet").length;

  const buildSummary = useCallback(() => {
    const lines = visible.map((it) => {
      const { claim } = splitClaim(it.chunk);
      const year = yearOf(it.chunk);
      return `- ${claim} (${it.chunk.label}${year ? `, ${year}` : ""})`;
    });
    return `${lines.join("\n")}\n\n${brainCopy.bar.summaryLink} ${window.location.href}`;
  }, [visible]);

  const index = <TopicIndex counts={counts} selected={state.selected} onToggle={toggle} ready={engine !== null} />;

  return (
    <div className="brain">
      <div className="container-page brain-controls">
        <PasteBox key={`${hydrated}-${resetCount}`} initial={state.q} selected={state.selected} onQuery={setQuery} onAdd={addMany} onAddAll={addAll} />
        <StrengthControl value={state.minStrength} onChange={setMin} />
      </div>

      <QueryBar count={result ? result.total : null} tokens={tokens} onRemove={removeToken} onClear={clear} buildSummary={buildSummary} compact={!desktop} match={state.match} facetCount={facetCount} onMatch={setMatch} />

      <div className="container-page brain-body">
        <aside className="brain-aside" aria-label={brainCopy.topics.heading}>
          {desktop ? (
            index
          ) : (
            <details className="brain-details">
              <summary className="brain-summary">{brainCopy.topics.summary}</summary>
              {index}
            </details>
          )}
        </aside>
        <section className="brain-results" aria-labelledby="brain-results-heading">
          <h2 id="brain-results-heading" className="sr-only">
            {brainCopy.results.heading}
          </h2>
          {result && (
            <ResultList
              items={items}
              total={result.total}
              showAll={showAll}
              onShowAll={() => setShowAllFor(search)}
              lastLabel={last?.label}
              onRemoveLast={() => last && removeToken(last)}
              onClear={clear}
              anyFilter={tokens.length > 0}
              generation={search}
              match={state.match}
              facetCount={facetCount}
              onMatchAny={() => setMatch("any")}
            />
          )}
        </section>
      </div>
    </div>
  );
}
