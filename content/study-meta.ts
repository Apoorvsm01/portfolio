// Per-study summary in the v4 voice: a one-line claim, plain-label facts, outcomes, and the study's band
// colour. DRAFTS from the resume + Framer facts — review before publishing. Facts and outcomes only use
// numbers the resume or the Framer page states; studies without stated numbers have no outcomes row.

export type Outcome = {
  // Shown big. Use "from → to" for a change (`from` set), or a single value.
  from?: string;
  value: string;
  label: string;
};

export type StudyMeta = {
  claim: string; // headline-style one-liner, shown under the title and on cards
  band: string; // deep background colour for the study's band (warm-ink family, readable with --fg)
  flag: "amber" | "blue" | "lime" | "pink" | "teal" | "violet" | "yellow"; // accent for rules/underlines
  facts: { label: string; value: string }[]; // plain labels: My part / When / Built on / For
  outcomes?: { title: string; items: Outcome[]; note?: string };
};

export const studyMeta: Record<string, StudyMeta> = {
  woven: {
    claim: "A driving coach that talks, so new drivers don’t have to look.",
    band: "#0c1a22",
    flag: "amber",
    facts: [
      { label: "My part", value: "UX engineer. I owned the experience end to end: research, voice and screen design, the simulator rig, and the studies." },
      { label: "When", value: "2025 to now, at Woven by Toyota" },
      { label: "With", value: "AI/ML engineers, systems integration engineers and data analysts, across Woven, TRI, TMNA and TCNA" },
      { label: "Built on", value: "CARLA simulator, a Python bridge, React and TypeScript on an iPad HMI, CAN-bus signals" },
    ],
    outcomes: {
      title: "What the studies showed",
      items: [
        { from: "100+", value: "22", label: "drivers’ research, sorted into driving scenarios" },
        { value: "70%", label: "of drivers understood the re-timed voice instructions, a 50% improvement" },
        { value: "40%", label: "faster to act on the AI’s guidance, in a 25-person simulator study" },
        { value: "80%", label: "of 35 participants preferred a quieter, less talkative AI" },
      ],
      note: "Real-car retest, a CARLA simulator study, and A/B tests with contextual interviews at Woven by Toyota. Every alert was designed to meet the industry’s 2-second glance-to-comprehension standard.",
    },
  },
  "fleet-console": {
    claim: "Oversight of an AV test fleet, made visible before it fails.",
    band: "#101a20",
    flag: "amber",
    facts: [
      { label: "My part", value: "Proposed the concept and did its UX research, design and prototyping" },
      { label: "When", value: "At Woven by Toyota; this page is an NDA-safe re-creation" },
      { label: "Status", value: "A concept. Nothing shipped, and no outcome metrics exist" },
      { label: "Built on", value: "Plumb, an original design system, and a three-surface prototype: desktop, iPhone and in-vehicle" },
    ],
  },
  "design-crew": {
    claim: "An agent pipeline where I make every call at the human gates.",
    band: "#14181f",
    flag: "teal",
    facts: [
      { label: "My part", value: "Designed the pipeline and made every call at the human gates" },
      { label: "When", value: "Built afterward, for the Fleet Console re-creation. Not used at Woven" },
      { label: "Built on", value: "Claude agents (Opus, Sonnet, Haiku) that read and write small files" },
    ],
    outcomes: {
      title: "What the logs show",
      items: [
        { value: "34", label: "logged agent runs, on one day" },
        { value: "2.43M", label: "tokens across those runs" },
        { value: "532", label: "tool calls" },
        { value: "77%", label: "of tokens on Sonnet, 23% on Haiku, about" },
      ],
      note: "From the pipeline's metrics log. Totals cover logged runs only, and Opus tokens aren't logged. They measure effort, not quality.",
    },
  },
  how2to: {
    claim: "Step-by-step tutorials that sit in the room with you.",
    band: "#181428",
    flag: "violet",
    facts: [
      { label: "My part", value: "UI design and UX research, and leading the sprints that turned Figma into Unity assets" },
      { label: "When", value: "4 months, at Omnia" },
      { label: "Built on", value: "visionOS, Meta Quest and iOS" },
    ],
  },
  omniabrowser: {
    claim: "The web, laid out in the room around you.",
    band: "#15142a",
    flag: "violet",
    facts: [
      { label: "My part", value: "UI design and UX research" },
      { label: "When", value: "7 months, at Omnia" },
      { label: "Built on", value: "visionOS, Meta Quest and iOS" },
    ],
  },
  spatialshowroom: {
    claim: "A Vision Pro showroom, live on the App Store.",
    band: "#1c1421",
    flag: "violet",
    facts: [
      { label: "My part", value: "UI design and UX research" },
      { label: "When", value: "4 months" },
      { label: "Built on", value: "visionOS, Meta Quest and iOS" },
    ],
  },
  "syncare-ai-health": {
    claim: "Health records that don’t make you work to read them.",
    band: "#101c16",
    flag: "teal",
    facts: [
      { label: "My part", value: "UX design and research collaborator" },
      { label: "When", value: "10 weeks, at Patched Reality" },
      { label: "Built on", value: "iOS and Android" },
    ],
    // No outcomes row: Patched Reality work carries no metric numbers (personalization.md).
  },
  sitelens: {
    claim: "Inspection checklists that float where the work is.",
    band: "#1b170f",
    flag: "yellow",
    facts: [
      { label: "My part", value: "UX design and research" },
      { label: "When", value: "5 weeks" },
      { label: "Built on", value: "iOS, Android and MentraOS AR glasses" },
    ],
  },
  "just-fill-it": {
    claim: "From a job page to a tailored resume, without leaving the page.",
    band: "#14181f",
    flag: "teal",
    facts: [
      { label: "My part", value: "Designed and built it, for my own job search" },
      { label: "When", value: "October 2026, on my own time" },
      { label: "Built on", value: "Chrome and Safari extensions, a local helper, Claude" },
    ],
    outcomes: {
      title: "What changed",
      items: [
        { from: "~15", value: "1", label: "steps to get a tailored document into an application" },
        { value: "~15 s", label: "and about 13k tokens per resume" },
      ],
      note: "From the project README: the manual loop was roughly 15 steps, four app switches and two file pickers per document.",
    },
  },
};
