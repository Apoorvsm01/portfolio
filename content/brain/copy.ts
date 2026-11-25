// All visible copy for /brain. Components read from here; none of it is hard-coded in them.

import type { Strength } from "../../src/lib/ask/types";

export const brainCopy = {
  navLabel: "Second brain",
  // Links from the home Ask box into /brain.
  fromAnswer: "See every matching point",
  fromHome: "Or filter everything I’ve worked on",
  meta: {
    title: "Second brain",
    description:
      "Everything Apoorv Mahajan has worked on, filterable by role, skill, domain, platform and method. Every point links back to its source.",
  },
  palette: {
    subtitle: "Filter everything by role, skill or domain",
    keywords: "second brain filter evidence skills roles hiring job description search",
  },
  llms: "Filter everything I’ve worked on by role, skill, domain, platform and method; every point links to its source.",
  title: "Everything I’ve worked on, filterable",
  lede: "Pick what you’re hiring for. Every point links back to where it came from: a shipped product, a project, a course or my resume.",

  paste: {
    label: "Paste a job description or type a skill",
    placeholder: "Paste a job description, or type a skill such as “prototyping”",
    found: "Found in your text:",
    addAll: "Add all",
    addOne: (label: string) => `Add ${label}`,
  },

  bar: {
    label: "Current filters",
    showing: (n: number) => `Showing ${n} ${n === 1 ? "point" : "points"}`,
    loading: "Loading the evidence",
    clear: "Clear",
    share: "Share",
    matchLegend: "How to combine topics",
    matchAll: "Match all",
    matchAny: "Match any",
    copyLink: "Copy link",
    copySummary: "Copy summary",
    copied: "Copied",
    copyFailed: "Copy failed",
    summaryLink: "Link:",
    remove: (label: string) => `Remove filter ${label}`,
    textToken: (q: string) => `Text: “${q}”`,
  },

  strength: {
    legend: "How strong is the evidence?",
    options: [
      { value: undefined, label: "Any", short: "Any" },
      { value: "studied", label: "Studied or more", short: "Studied+" },
      { value: "built", label: "Built or more", short: "Built+" },
      { value: "shipped", label: "Shipped", short: "Shipped" },
    ] as { value: Strength | undefined; label: string; short: string }[],
    pillLabels: {
      shipped: "Shipped",
      built: "Built",
      studied: "Studied",
      watched: "Watched",
    } as Record<Strength, string>,
  },

  topics: {
    summary: "Browse all topics",
    heading: "Topics",
    groupLabels: {
      roles: "Roles",
      skills: "Skills",
      domains: "Domains",
      platforms: "Platforms",
      methods: "Methods",
    } as Record<string, string>,
    count: (label: string, n: number) => `${label}, ${n} ${n === 1 ? "point" : "points"}`,
  },

  results: {
    heading: "Evidence",
    sourceFallback: "Source",
    opensInNewTab: " (opens in new tab)",
    more: "More",
    less: "Less",
    showAll: (total: number) => `Show all ${total}`,
    empty: "Nothing matches all of these filters.",
    emptyHint: (label: string) => `Try removing “${label}”, the most recent one.`,
    emptyRemove: (label: string) => `Remove ${label}`,
    matchAnyInstead: "Match any instead",
    matches: (n: number, of: number) => `Matches ${n} of ${of}`,
    emptyNoFilters: "There is nothing to show yet.",
    emptyClear: "Clear all filters",
  },
};
