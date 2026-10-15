// Site-wide copy. Story sections are DRAFTS written from Apoorv's resume + Framer site —
// review before publishing. Case-study content lives in content/case-studies/*.json, and
// per-study summaries (claim, facts, outcomes, band colour) in content/study-meta.ts.
//
// Voice (v4): first person, plain words, short sentences. Every claim carries a number or a named
// thing from the resume. Headlines state a point ("…, so drivers don't have to look"), not a topic.

export type WorkRef = {
  slug: string;
  org?: string; // only set where the employer is confirmed
  blurb: string;
  cover?: string; // card image override (public path)
  coverFit?: "contain"; // for tall/logo images that shouldn't be cropped
  domain: "Automotive" | "Spatial" | "Health";
};

export const site = {
  name: "Apoorv Mahajan",
  role: "UX Engineer",
  url: "https://apoorvmahajan.com", // placeholder until a domain is chosen
  email: "apoorvsm@gmail.com",
  linkedin: "https://www.linkedin.com/in/apoorvmahajan",
  github: "https://github.com/Apoorvsm01",
  location: "Ann Arbor, MI",

  hero: {
    // Display line: the giant name. `headline` is the tagline under it.
    display: "I’m Apoorv",
    headline: "I study how people drive, and then I build what they need.",
    intro:
      "For the past year I’ve been the UX engineer behind an in-car AI driving coach at Woven by Toyota. I took it from a product brief and raw research on 100+ drivers to 22 driving scenarios, a CARLA simulator rig with real steering and pedals, and studies where 70% of drivers understood its re-timed voice instructions, a 50% improvement on the version before. I’ve been designing for cars, headsets and health apps since 2019.",
    image: { src: "/me/portrait.jpeg", alt: "Apoorv Mahajan" },
  },

  // Each intent ("door") has its own flag colour (see `flags` below): the chosen door fills with it,
  // the portrait takes a duotone of it, and the panel's rule, bullets and link underlines use it.
  intents: [
    {
      id: "engineer",
      flag: "amber",
      label: "I’m hiring a UX engineer",
      headline: "I hand engineers code, not pictures.",
      answer:
        "Start with the Generative Drive Coach: a CARLA simulator bridged to an iPad HMI in React and TypeScript, and a design system shared across four Toyota companies. Then Drive Coach iOS, which I designed and built in SwiftUI.",
      bullets: [
        "I wrote the Python bridge between the CARLA driving simulator and an iPad HMI in React and TypeScript, and it read faster than the 2-second glance standard.",
        "Engineers get production-ready React, Flutter, SwiftUI or Tailwind from me, not a spec to interpret.",
        "I built the Figma design system Woven, TRI, TMNA and TCNA now share, with tokens and visual regression tests.",
      ],
      links: ["woven", "drive-coach-ios"],
    },
    {
      id: "researcher",
      flag: "blue",
      label: "I’m hiring a UX researcher",
      headline: "I let the study change the design.",
      answer:
        "Look at how the in-car coach was validated: agency research with 100+ participants distilled into 22 driving scenarios, Wizard of Oz studies, gaze detection, and real-car tests that changed how voice instructions are timed.",
      bullets: [
        "I turned raw agency research on 100+ drivers into 22 driving scenarios, the single source of truth for how the AI coach behaves.",
        "In a 25-person CARLA simulator study, drivers acted on the AI\u2019s guidance 40% faster with the HMI active, and 80% of 35 participants preferred a quieter, less talkative AI.",
        "Real-car tests showed fixed-distance voice prompts reached speeding drivers too late, so I timed them by speed instead. In the real-car retest, 70% of drivers understood them, a 50% improvement.",
      ],
      links: ["woven", "fleet-co-pilot"],
    },
    {
      id: "curious",
      flag: "lime",
      label: "I’m just curious",
      headline: "I started in headsets, then got into cars.",
      answer:
        "Spatial computing is where I started — Vision Pro tutorials, a spatial showroom, AR glasses for construction inspectors. Browse any of it below.",
      bullets: [
        "At Omnia I designed for Apple Vision Pro and Meta Quest, including How2To, step-by-step tutorials that sit in the room with you.",
        "Before that I ran my own UX consultancy, Crazy Minds, for four years and delivered 25+ projects in fintech, health and e-commerce.",
        "I’ve designed for HoloLens 2, Spectacles, Tilt Five, RealWear and Even Realities G1 too. I haven’t got tired of new hardware yet.",
      ],
      links: ["how2to", "spatialshowroom", "sitelens"],
    },
  ],

  featured: {
    slug: "woven",
    org: "Woven by Toyota",
    headline: "From a product brief to a coach in the car.",
    summary:
      "I took an in-car AI driving experience from a brief and raw research to validated prototypes on a CARLA rig with real steering, pedals, and CAN-bus signals. The same research spun off three more products.",
    // Lead paragraphs for the featured band (v4). Plain, first person.
    lede: [
      "Generative Drive Coach talks new drivers through parking, intersections and lane changes while they drive. It started as a product brief and raw agency research on more than 100 drivers.",
      "I owned the experience end to end: the research, the voice and screen design, the simulator rig, and the studies that proved it worked.",
    ],
    // Chapter rows: a short underlined term that links into the case study, and one line about it.
    chapters: [
      { term: "Research", href: "/work/woven/#section-0", line: "Research on 100+ drivers, sorted into 22 driving scenarios." },
      { term: "Voice first", href: "/work/woven/#section-1", line: "Coaching by voice, after gaze studies showed the screen pulled eyes off the road." },
      { term: "Simulator", href: "/work/woven/#section-5", line: "A Python bridge from CARLA to an iPad HMI, with real steering, pedals and CAN signals." },
      { term: "Design system", href: "/work/woven/#section-3", line: "One Figma system now shared by Woven, TRI, TMNA and TCNA." },
    ],
    related: ["fleet-co-pilot", "fleet-dashboard", "drive-coach-ios"],
  },

  // Domain of the featured study (it isn't in `work`): used by the /work/ index filter.
  featuredDomain: "Automotive" as const,

  work: [
    { slug: "fleet-co-pilot", domain: "Automotive", cover: "/work/fleet-co-pilot/03.jpg", org: "Woven by Toyota", blurb: "Cockpit HUD for safety drivers in an autonomous test fleet." },
    { slug: "fleet-dashboard", domain: "Automotive", cover: "/work/fleet-dashboard/01.jpg", org: "Woven by Toyota", blurb: "Incident, damage, and telemetry views for fleet-ops engineers." },
    { slug: "drive-coach-ios", domain: "Automotive", coverFit: "contain", org: "Woven by Toyota", blurb: "A SwiftUI confidence-building app for technicians and new drivers." },
    { slug: "how2to", domain: "Spatial", cover: "/work/how2to/03.png", org: "Omnia", blurb: "AI-powered, step-by-step spatial tutorials on visionOS." },
    { slug: "omniabrowser", domain: "Spatial", cover: "/work/omniabrowser/02.png", org: "Omnia", blurb: "A spatial browser for Apple Vision Pro." },
    { slug: "spatialshowroom", domain: "Spatial", cover: "/work/spatialshowroom/01.png", blurb: "A spatial showroom experience for Vision Pro." },
    { slug: "syncare-ai-health", domain: "Health", cover: "/work/syncare-ai-health/01.png", org: "Patched Reality", blurb: "Reducing cognitive load in AI-integrated health records." },
    { slug: "sitelens", domain: "Spatial", cover: "/work/sitelens/02.png", blurb: "AR glasses for on-site construction inspections." },
  ] satisfies WorkRef[],

  howIWorkIntro:
    "I run the study and I build the interface, so what the research finds and what ships are the same thing.",
  howIWork: [
    {
      title: "Listen first",
      body: "Research before screens. On the drive coach, 100+ drivers’ research became 22 scenarios before I drew anything.",
    },
    {
      title: "Prototype where it runs",
      body: "Voice flows in Figma, then the simulator, then the car. A prototype only counts once it behaves like the product.",
    },
    {
      title: "Let the test win",
      body: "Real-car tests showed my voice prompts reached speeding drivers too late. I re-timed them by speed, and the retest backed it.",
    },
    {
      title: "Ship code, not pictures",
      body: "Engineers get working React, Flutter, SwiftUI or Tailwind, a shared design system, and a written log of every decision.",
    },
  ],

  timelineIntro: "Researcher, designer, engineer. Newest first, back to 2019.",
  // Newest first. `flag` colours the org chip.
  timeline: [
    { years: "2025 to now", role: "UX Engineer", org: "Woven by Toyota", flag: "amber", note: "In-car AI coaching, autonomous fleet tools, and a design system four Toyota companies share." },
    { years: "2024 to 2025", role: "UI/UX Designer", org: "Omnia", flag: "violet", note: "Apple Vision Pro, Meta Quest and CarPlay." },
    { years: "2024", role: "UX Researcher and UI Designer", org: "Patched Reality", flag: "teal", note: "VR physiotherapy and AI-assisted health records." },
    { years: "2023 to 2025", role: "M.S. in Human-Computer Interaction", org: "DePaul University", flag: "blue" },
    { years: "2019 to 2023", role: "Founder and UX consultant", org: "Crazy Minds", flag: "pink", note: "25+ projects in fintech, health and e-commerce." },
    { years: "2019 to 2023", role: "B.A. in Media and Communication", org: "Symbiosis Centre for Media and Communication", flag: "yellow" },
  ],

  platforms: [
    "Apple Vision Pro",
    "Meta Quest 3",
    "Microsoft HoloLens 2",
    "Snapchat Spectacles",
    "Tilt Five AR",
    "RealWear",
    "Even Realities G1",
    "CarPlay",
  ],
  platformsNote: "Curiosity feeds adaptability. I’ve lost count of the platforms I’ve designed for, and I’m not tired of it yet.",

  cta: {
    headline: "I’m looking for my next team.",
    body: "I want to work where the person who runs the study also ships the interface. If you’re building for cars, spatial computing or AI, write to me.",
  },

  // Flag palette: one colour per intent and per organisation. Tuned for the warm ink ground and
  // the paper bands (each has a readable ink for text on top of it).
  flags: {
    amber: { bg: "#f5a524", ink: "#12110f" },
    blue: { bg: "#4aa3ff", ink: "#0b1420" },
    lime: { bg: "#b6e05a", ink: "#12110f" },
    pink: { bg: "#ee5c96", ink: "#12110f" },
    teal: { bg: "#3cc8b4", ink: "#0b1a17" },
    violet: { bg: "#a98cf5", ink: "#12110f" },
    yellow: { bg: "#f2c94c", ink: "#12110f" },
  },

  disclaimer:
    "Woven by Toyota logo is a copyright of Woven by Toyota, Inc. ©2026. I did not design or create the logo in any capacity. All Woven by Toyota projects are inspired by the work I did, not true copies.",
};
