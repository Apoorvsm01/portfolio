import { facetGroups, strengths, type FacetGroup, type Taxonomy } from "../../../content/brain/taxonomy";
import { matchFacets } from "../../lib/ask/corpus";
import type { FilterState, Strength } from "../../lib/ask/types";

// Everything the visitor can set. `added` remembers the order facets were picked in so the empty state can
// suggest removing the most recent one.
export type BrainState = {
  selected: Record<FacetGroup, string[]>;
  minStrength?: Strength;
  q: string;
  match: "all" | "any";
  added: string[]; // "group:id"
};

export const Q_MAX = 500;

export const GROUP_PARAM: Record<FacetGroup, string> = {
  roles: "role",
  skills: "skill",
  domains: "domain",
  platforms: "platform",
  methods: "method",
};

export const emptyState = (): BrainState => ({
  selected: { roles: [], skills: [], domains: [], platforms: [], methods: [] },
  q: "",
  match: "all",
  added: [],
});

export const key = (group: FacetGroup, id: string) => `${group}:${id}`;

export function toFilterState(s: BrainState): FilterState {
  return {
    roles: s.selected.roles,
    skills: s.selected.skills,
    domains: s.selected.domains,
    platforms: s.selected.platforms,
    methods: s.selected.methods,
    minStrength: s.minStrength,
    q: s.q || undefined,
    match: s.match,
  };
}

export function parseSearch(search: string, known: Record<FacetGroup, Set<string>>): BrainState {
  const params = new URLSearchParams(search);
  const state = emptyState();
  for (const group of facetGroups) {
    const ids = (params.get(GROUP_PARAM[group]) ?? "").split(",").map((v) => v.trim()).filter((v) => known[group].has(v));
    state.selected[group] = [...new Set(ids)];
    for (const id of state.selected[group]) state.added.push(key(group, id));
  }
  const min = params.get("min");
  if (min && (strengths as readonly string[]).includes(min)) state.minStrength = min as Strength;
  if (params.get("match") === "any") state.match = "any";
  state.q = (params.get("q") ?? "").slice(0, Q_MAX);
  return state;
}

export function toSearch(s: BrainState): string {
  const params = new URLSearchParams();
  for (const group of facetGroups) {
    if (s.selected[group].length) params.set(GROUP_PARAM[group], s.selected[group].join(","));
  }
  if (s.minStrength) params.set("min", s.minStrength);
  if (s.match === "any") params.set("match", "any");
  if (s.q) params.set("q", s.q);
  const out = params.toString();
  return out ? `?${out}` : "";
}

export type Token =
  | { kind: "facet"; group: FacetGroup; id: string; label: string }
  | { kind: "source"; key: string; label: string }
  | { kind: "min"; label: string }
  | { kind: "q"; label: string };

// Home-page filter link for a free-text question (used by the Ask answer): the question's topics as facets, plus the
// answer's own topic when it is also a taxonomy id. No topics → fall back to a text search.
export function brainSearchFor(question: string, topicId: string | undefined, taxonomy: Taxonomy): string {
  const s = emptyState();
  const found = matchFacets(question, taxonomy);
  for (const group of facetGroups) {
    const ids = new Set(found[group] ?? []);
    if (topicId && taxonomy[group].some((e) => e.id === topicId)) ids.add(topicId);
    s.selected[group] = [...ids];
  }
  const count = facetGroups.reduce((n, g) => n + s.selected[g].length, 0);
  if (count === 0) s.q = question.slice(0, Q_MAX);
  if (count > 1) s.match = "any";
  return toSearch(s);
}
