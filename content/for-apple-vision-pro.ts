// Copy for the private page /for/apple-vision-pro/, written for Apple's "Product Manager, Apple Vision Pro"
// role (200691783-0836). The page is noindex and left out of the sitemap and llms.txt; it is meant to be
// linked from that application only. Every claim restates something already on the site, and each row
// links to the case study that backs it. Each `need` quotes the job posting.

export const appleVisionPro = {
  role: "Product Manager, Apple Vision Pro",
  roleNumber: "200691783-0836",
  kicker: "For the Product Manager, Apple Vision Pro role",
  headline: "Spatial products, from the customer’s side.",
  intro:
    "I run the research and I build the interface, so what customers tell me and what ships stay the same thing. At Omnia I designed for Apple Vision Pro and Meta Quest: How2To, Omnia Browser, and a Vision Pro showroom that went live on the App Store. Then I took an in-car AI coach at Woven by Toyota from a product brief to validated prototypes.",
  fitTitle: "How my work maps to the role",
  fit: [
    {
      need: "Represent the customer throughout a product’s journey from concept through development to launch.",
      title: "Customer first, through to launch",
      body: "For Spatial Showroom I ran more than 25 interviews with headset owners, spatial content creators and founders, built personas, and used their constraints to prioritize features. The app went live on the visionOS App Store and was shown to buyers at a Tesla emerging-tech event.",
      href: "/work/spatialshowroom/",
      linkLabel: "Spatial Showroom",
    },
    {
      need: "Being in possession of expert knowledge of competitive products.",
      title: "Competitor audits up front",
      body: "Each spatial project started with the landscape: JigSpace and WikiHow VR for How2To, where I found gaps in interactive guidance and spatial fidelity, and web car configurators for the showroom, whose configuration mechanics I translated into a Vision Pro app.",
      href: "/work/how2to/",
      linkLabel: "How2To",
    },
    {
      need: "Partnering with engineering and design to develop the product strategy.",
      title: "Strategy built with engineering",
      body: "At Woven by Toyota I owned the in-car coach end to end: a product brief and research on 100+ drivers became 22 driving scenarios and a CARLA simulator rig, built with AI/ML engineers, systems integration engineers and data analysts.",
      href: "/work/woven/",
      linkLabel: "Generative Drive Coach",
    },
    {
      need: "Working in a global cross-functional team through the complete product development lifecycle.",
      title: "Cross-functional, across companies",
      body: "The coach was built across Woven, TRI, TMNA and TCNA, and the Figma design system I built for it is now shared by all four.",
      href: "/work/woven/#section-3",
      linkLabel: "The design system",
    },
    {
      need: "Recent experience in spatial computing/AR/VR, wearables, or emerging hardware such as self-driving cars.",
      title: "Spatial and self-driving, both recent",
      body: "Spatial work at Omnia from 2024 to 2025, then an AI driving coach at Woven by Toyota from 2025 to 2026, plus Fleet Console, a self-initiated concept for overseeing an autonomous test fleet.",
      href: "/work/fleet-console/",
      linkLabel: "Fleet Console",
    },
    {
      need: "A super user of these products, with an informed and well-developed perspective on AR/VR users.",
      title: "Hands on the hardware",
      body: "I design on the devices themselves. These are the platforms I’ve designed for:",
      href: "/about/",
      linkLabel: "About me",
      showPlatforms: true,
    },
  ],
  shelves: [
    { id: "avp-spatial", title: "Spatial computing", kicker: "Apple Vision Pro, Meta Quest and AR glasses", slugs: ["how2to", "omniabrowser", "spatialshowroom", "sitelens"] },
    { id: "avp-auto", title: "Self-driving and in-car AI", kicker: "Emerging hardware at Woven by Toyota", slugs: ["woven", "fleet-console"] },
  ],
  askTitle: "Ask my portfolio",
  askBody: "The home page answers questions from everything on this site. A few to start with:",
  askPrompts: [
    "What have you built for Apple Vision Pro?",
    "Tell me about Spatial Showroom",
    "How do you research spatial interfaces?",
    "How do you work with engineers?",
  ],
  closingTitle: "Let’s talk",
  closingBody: "I’d welcome the chance to talk about the Vision Pro customer and where spatial computing goes next.",
} as const;
