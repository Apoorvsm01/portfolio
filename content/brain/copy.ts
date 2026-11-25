// All visible copy for the home page (the second brain and the Ask box). Components read from here; none of it is hard-coded in them.

import type { Strength } from "../../src/lib/ask/types";

export const brainCopy = {
  navLabel: "Second brain",
  // Link from an Ask answer to the matching evidence on the home page.
  fromAnswer: "See every matching point",
  palette: {
    subtitle: "Ask a question, paste a job description, or filter everything",
    keywords: "second brain filter evidence skills roles hiring job description search ask match",
  },
  llms:
    "The home page is a second brain: ask a question, paste a job description or a job link, or filter everything I’ve worked on by role, skill, domain, platform and method. Every point links to its source.",

  // The one input on the home page.
  input: {
    label: "Ask a question, paste a job description, or paste a job link",
    placeholder: "Ask anything, paste a job description, or a job link",
  },

  moved: {
    title: "Moved to the home page",
    body: "The second brain now lives on the home page. Taking you there.",
    link: "Go to the home page",
  },

  graph: {
    loading: "Loading the knowledge graph",
    legend: { domains: "Domains", sources: "Projects & employers", skills: "Skills" },
  },

  // Job description mode (pasted text or a fetched link).
  jd: {
    fetching: "Fetching the job description…",
    needsPaste:
      "I couldn’t read that link. Paste the job description text into the box instead and I’ll match it the same way.",
    noRequirements:
      "I didn’t recognise any skills, roles or domains in that text. Try pasting more of the description, or ask a question instead.",
    heading: (title?: string, company?: string) =>
      title && company
        ? `Matched against: ${title} at ${company}`
        : title
          ? `Matched against: ${title}`
          : company
            ? `Matched against: a role at ${company}`
            : "Matched against the job description you gave",
    lede: (matched: number, total: number) =>
      `${matched} of ${total} ${total === 1 ? "requirement has" : "requirements have"} any evidence; the score weighs how strong it is. Each requirement links to its best two sources.`,
    close: "Close match view",
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

  glance: {
    title: "At a glance",
    caption: "How strong the evidence is, which skills it backs, and when it happened. Updates with your filters.",
    radar: "Skills the evidence backs most",
    bars: "Evidence by strength. Select a bar to filter.",
    timeline: "Evidence per year, stacked by strength",
    loading: "Loading the charts",
  },

  topics: {
    summary: "Browse all topics",
    dialogLabel: "Browse all topics",
    close: "Close",
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
    showAllSources: (total: number) => `Show all ${total} sources`,
    caption: (points: number, sources: number) =>
      `${points} ${points === 1 ? "point" : "points"} from ${sources} ${sources === 1 ? "source" : "sources"}, strongest first.`,
    loading: "Loading the evidence",
    resumeLabel: "More from my resume",
    points: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
    moreClaims: (n: number) => `+${n} more`,
    fewerClaims: "Show fewer",
    caseStudy: "Case study",
    empty: "Nothing matches all of these filters.",
    emptyHint: (label: string) => `Try removing “${label}”, the most recent one.`,
    emptyRemove: (label: string) => `Remove ${label}`,
    matchAnyInstead: "Match any instead",
    sourceToken: (label: string) => `Source: ${label}`,
    emptyNoFilters: "There is nothing to show yet.",
    emptyClear: "Clear all filters",
  },
};
