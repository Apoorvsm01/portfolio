// Site-wide copy. Story sections are DRAFTS written from Apoorv's resume + Framer site —
// review before publishing. Case-study content lives in content/case-studies/*.json.

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
    headline: "I research how people drive, then I build what they need.",
    intro:
      "UX Engineer at Woven by Toyota. Six years designing human-centered interactions for automotive, spatial, and AI products — from Wizard of Oz studies in a simulator rig to production-ready React, Flutter, and SwiftUI handed straight to engineers.",
    image: { src: "/me/portrait.jpeg", alt: "Apoorv Mahajan" },
  },

  intents: [
    {
      id: "engineer",
      label: "I'm hiring a UX engineer",
      answer:
        "Start with the Generative Drive Coach: a CARLA simulator bridged to an iPad HMI in React and TypeScript, and a design system shared across four Toyota companies. Then Drive Coach iOS, which I designed and built in SwiftUI.",
      links: ["woven", "drive-coach-ios"],
    },
    {
      id: "researcher",
      label: "I'm hiring a UX researcher",
      answer:
        "Look at how the in-car coach was validated: agency research with 100+ participants distilled into 22 driving scenarios, Wizard of Oz studies, gaze detection, and real-car tests that changed how voice instructions are timed.",
      links: ["woven", "fleet-co-pilot"],
    },
    {
      id: "curious",
      label: "Just curious",
      answer:
        "Spatial computing is where I started — Vision Pro tutorials, a spatial showroom, AR glasses for construction inspectors. Browse any of it below.",
      links: ["how2to", "spatialshowroom", "sitelens"],
    },
  ],

  featured: {
    slug: "woven",
    org: "Woven by Toyota",
    headline: "An in-car AI coach, from a product brief to a simulator rig.",
    summary:
      "I took an in-car AI driving experience from a brief and raw research to validated prototypes on a CARLA rig with real steering, pedals, and CAN-bus signals. The same research spun off three more products.",
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

  howIWork: [
    {
      title: "Start from the people, not the brief",
      body: "Interviews, contextual inquiry, and behavioral data come first. On the drive coach, 100+ participants' research became 22 scenarios before a single screen existed.",
    },
    {
      title: "Prototype in the real medium",
      body: "Voice flows in Figma, then the simulator, then the car. A prototype only counts once it behaves like the product will.",
    },
    {
      title: "Test, and let the data overrule me",
      body: "Real-car testing showed fixed-distance voice prompts reached speeding drivers too late. I redesigned them around speed, and the retest proved it.",
    },
    {
      title: "Hand over code, not just pictures",
      body: "Engineers get production-ready React, Flutter, SwiftUI, or Tailwind, backed by a shared design system and written decision logs.",
    },
  ],

  timeline: [
    { years: "2019 – 2023", role: "Founder & UX Consultant", org: "Crazy Minds", note: "25+ UX/UI projects across fintech, health tech, and e-commerce." },
    { years: "2019 – 2023", role: "B.A. Media & Communication", org: "Symbiosis Center for Media and Communication" },
    { years: "2023 – 2025", role: "M.S. Human-Computer Interaction", org: "DePaul University" },
    { years: "2024", role: "UX Researcher & UI Designer", org: "Patched Reality", note: "VR physiotherapy and AI-integrated health records." },
    { years: "2024 – 2025", role: "UI/UX Designer", org: "Omnia", note: "Vision Pro, Meta Quest, and CarPlay interfaces." },
    { years: "2025 – now", role: "UX Engineer", org: "Woven by Toyota", note: "In-car AI coaching, autonomous fleet tools, and a cross-company design system." },
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
  platformsNote: "Curiosity feeds adaptability. I've lost count of the platforms I've designed for, and I'm not tired of it yet.",

  cta: {
    headline: "Looking for my next team.",
    body: "If you're building for cars, spatial computing, or AI, I'd like to hear about it.",
  },

  disclaimer:
    "Woven by Toyota logo is a copyright of Woven by Toyota, Inc. ©2026. I did not design or create the logo in any capacity. All Woven by Toyota projects are inspired by the work I did, not true copies.",
};
