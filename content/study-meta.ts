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
        { value: "+33%", label: "driving efficiency with AI coaching, in Wizard of Oz studies" },
        { value: "+20%", label: "faster skill-building in the first sessions" },
        { value: "< 2 s", label: "to read the HMI at a glance, under the automotive standard" },
      ],
      note: "Wizard of Oz and real-car studies at Woven by Toyota.",
    },
  },
  "fleet-co-pilot": {
    claim: "Every incident tagged in one tap, from the driver’s seat.",
    band: "#101a20",
    flag: "amber",
    facts: [
      { label: "My part", value: "End to end: the cockpit UI, the incident taxonomy, and the office dashboard it feeds" },
      { label: "When", value: "2025 to now, at Woven by Toyota" },
      { label: "For", value: "Safety drivers, fleet-ops engineers and compliance teams" },
      { label: "Built on", value: "A Flutter cockpit HUD for iOS and Android, and a React fleet dashboard" },
    ],
  },
  "fleet-dashboard": {
    claim: "The office end of the fleet: incidents, damage and coverage on one screen.",
    band: "#121a17",
    flag: "amber",
    facts: [
      { label: "My part", value: "End to end: data visualisation, map integration and responsive layout" },
      { label: "When", value: "2025 to now, at Woven by Toyota" },
      { label: "For", value: "Fleet-ops engineers reviewing an autonomous test fleet" },
      { label: "Built on", value: "React, TypeScript and Vite" },
    ],
  },
  "drive-coach-ios": {
    claim: "A confidence score new drivers can watch grow.",
    band: "#0f1c1a",
    flag: "amber",
    facts: [
      { label: "My part", value: "End to end: product design, the SwiftUI build, and the data model" },
      { label: "When", value: "2025 to now, at Woven by Toyota" },
      { label: "For", value: "Technicians and new drivers, as a B2B and B2C app" },
      { label: "Built on", value: "iOS 17+, SwiftUI and Swift Charts" },
    ],
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
    outcomes: {
      title: "What the studies showed",
      items: [
        { value: "−25%", label: "measured cognitive load in EHR, medical and pharmacy flows" },
        { value: "+35%", label: "healthy habits when the app sent motivational messages about diet" },
      ],
      note: "Longitudinal user studies at Patched Reality.",
    },
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
};
