// Facet vocabularies for the "second brain" filter. A recruiter picks entries from these groups, and every
// piece of evidence (case studies plus hand-approved items in content/brain/evidence/) is tagged with ids
// from here. Ids that match a Topic id in content/ask.ts reuse it exactly (ux-engineer, ux-designer,
// ux-researcher, healthcare, automotive, spatial, voice-ai).
//
// `aliases` are lowercase phrases matched on word boundaries against case-study tags, titles, facts and
// claims, so keep them specific: a loose alias ("design", "app") tags everything.

export type FacetGroup = "roles" | "skills" | "domains" | "platforms" | "methods";

export type FacetEntry = { id: string; label: string; aliases: string[] };

export type Taxonomy = Record<FacetGroup, FacetEntry[]>;

export const facetGroups: FacetGroup[] = ["roles", "skills", "domains", "platforms", "methods"];

export const facetGroupLabels: Record<FacetGroup, string> = {
  roles: "Role",
  skills: "Skills",
  domains: "Domain",
  platforms: "Platform",
  methods: "Method",
};

export const facets: Taxonomy = {
  roles: [
    { id: "ux-engineer", label: "UX Engineer", aliases: ["ux engineer", "ux engineers", "design engineer", "design technologist", "design technologists"] },
    { id: "ux-designer", label: "UX Designer", aliases: ["ux designer", "ux designers", "ui designer", "ui ux designer", "product designer", "interaction designer", "visual designer"] },
    { id: "ux-researcher", label: "UX Researcher", aliases: ["ux researcher", "ux researchers", "user researcher", "design researcher", "research collaborator"] },
    { id: "hmi-designer", label: "HMI Designer", aliases: ["hmi designer", "automotive designer", "in vehicle designer"] },
    { id: "spatial-designer", label: "Spatial Designer", aliases: ["spatial designer", "xr designer", "vr designer", "ar designer", "immersive designer"] },
    { id: "front-end-engineer", label: "Front-end Engineer", aliases: ["front end engineer", "frontend engineer", "front end developer", "frontend developer", "web developer"] },
    { id: "design-systems-designer", label: "Design Systems Designer", aliases: ["design systems designer", "design system lead", "design systems engineer"] },
    { id: "ai-product-designer", label: "AI Product Designer", aliases: ["ai product designer", "ai designer", "conversational designer", "llm product designer"] },
    { id: "media-producer", label: "Media Producer", aliases: ["media producer", "film maker", "filmmaker", "video producer", "content producer"] },
  ],

  skills: [
    { id: "user-centered-design", label: "User-centered design", aliases: ["user centered design", "user centred design", "human centered design", "ucd", "hci"] },
    { id: "prototyping", label: "Prototyping", aliases: ["prototyping", "prototype", "prototypes", "rapid prototyping", "high fidelity prototype", "interactive prototype"] },
    { id: "ui-design", label: "UI design", aliases: ["ui design", "interface design", "visual design"] },
    { id: "interaction-design", label: "Interaction design", aliases: ["interaction design", "ixd", "micro interactions", "motion design"] },
    { id: "figma", label: "Figma", aliases: ["figma", "figjam"] },
    { id: "wireframing", label: "Wireframing", aliases: ["wireframe", "wireframes", "wireframing", "low-fidelity", "lo-fi"] },
    { id: "miro", label: "Miro", aliases: ["miro"] },
    { id: "axure", label: "Axure", aliases: ["axure", "axure rp"] },
    { id: "typography", label: "Typography", aliases: ["typography", "type scale", "typeface", "typefaces"] },
    { id: "data-visualization", label: "Data visualization", aliases: ["data visualization", "data visualisation", "dataviz", "charts", "dashboards"] },
    { id: "eye-tracking", label: "Eye tracking", aliases: ["eye tracking", "eye-tracking", "gaze tracking", "gaze data"] },
    { id: "design-systems", label: "Design systems", aliases: ["design system", "design systems", "design tokens", "component library", "visual regression"] },
    { id: "information-architecture", label: "Information architecture", aliases: ["information architecture", "navigation design", "sitemap", "card sorting"] },
    { id: "accessibility", label: "Accessibility", aliases: ["accessibility", "a11y", "wcag", "inclusive design"] },
    { id: "ux-research", label: "UX research", aliases: ["ux research", "user research", "design research"] },
    { id: "statistics-data-analysis", label: "Statistics and data analysis", aliases: ["statistics", "statistical analysis", "data analysis", "data analytics", "spss", "excel analysis"] },
    { id: "html-css", label: "HTML and CSS", aliases: ["html", "css", "html css", "html5", "responsive design", "tailwind"] },
    { id: "javascript", label: "JavaScript", aliases: ["javascript", "node js"] },
    { id: "typescript", label: "TypeScript", aliases: ["typescript"] },
    { id: "react", label: "React", aliases: ["react", "reactjs", "react js"] },
    { id: "nextjs", label: "Next.js", aliases: ["next js", "nextjs"] },
    { id: "swift-swiftui", label: "Swift and SwiftUI", aliases: ["swift", "swiftui", "swift 6", "xcode"] },
    { id: "python", label: "Python", aliases: ["python"] },
    { id: "unity", label: "Unity", aliases: ["unity", "unity3d", "c sharp", "realitykit", "reality composer"] },
    { id: "voice-ai", label: "Voice and AI", aliases: ["voice", "voice ui", "voice first", "voice interaction", "voice assistant", "conversational"] },
    { id: "ai-llm-design", label: "AI and LLM product design", aliases: ["ai", "artificial intelligence", "llm", "llms", "generative ai", "claude", "agent pipeline", "agents", "foundation models", "on device ai", "machine learning"] },
    { id: "storytelling", label: "Storytelling", aliases: ["storytelling", "narrative design"] },
    { id: "scriptwriting", label: "Scriptwriting", aliases: ["scriptwriting", "screenwriting", "script writing", "screenplay"] },
    { id: "direction", label: "Direction", aliases: ["direction", "film direction", "directing", "directed"] },
    { id: "production-design", label: "Production design", aliases: ["production design", "art direction", "set design"] },
    { id: "animation", label: "Animation", aliases: ["animation", "2d animation", "3d animation", "motion graphics", "after effects"] },
    { id: "radio", label: "Radio", aliases: ["radio", "radio jockey", "audio production", "podcast", "podcasting"] },
    { id: "video-editing", label: "Video editing", aliases: ["video editing", "film editing", "premiere pro", "final cut", "davinci resolve"] },
    { id: "photography", label: "Photography", aliases: ["photography", "photo editing", "lightroom"] },
    { id: "systems-thinking", label: "Systems thinking", aliases: ["systems thinking", "service design", "journey mapping", "service blueprint"] },
  ],

  domains: [
    { id: "automotive", label: "Automotive", aliases: ["automotive", "in vehicle", "in car", "vehicle", "driving", "driver", "drivers", "cockpit", "toyota", "hmi", "in vehicle hmi", "automotive hmi"] },
    { id: "spatial", label: "Spatial computing and XR", aliases: ["spatial", "spatial computing", "spatial design", "xr", "vr", "ar", "mr", "augmented reality", "virtual reality", "mixed reality", "immersive"] },
    { id: "healthcare", label: "Healthcare", aliases: ["healthcare", "health care", "health tech", "health app", "health apps", "health records", "medical", "wellness", "physiotherapy", "patient", "patients"] },
    { id: "fintech", label: "Fintech", aliases: ["fintech", "finance", "banking", "payments"] },
    { id: "e-commerce", label: "E-commerce", aliases: ["e commerce", "ecommerce", "retail", "shopping", "showroom"] },
    { id: "construction", label: "Construction", aliases: ["construction", "site inspection", "site inspections"] },
    { id: "fleet-operations", label: "Fleet operations", aliases: ["fleet", "fleet operations", "fleet console", "autonomous vehicles", "autonomous fleet", "av test fleet"] },
    { id: "productivity", label: "Productivity tools", aliases: ["productivity", "browser extension", "job search", "resume", "chrome extension"] },
    { id: "smart-home-iot", label: "Smart home & IoT", aliases: ["smart home", "iot", "internet of things", "connected devices"] },
    { id: "environmental", label: "Environment & sustainability", aliases: ["environmental", "sustainability", "air quality", "climate"] },
    { id: "future-of-work", label: "Remote & hybrid work", aliases: ["remote work", "hybrid work", "work from home", "online fatigue"] },
    { id: "film-media", label: "Film and media", aliases: ["film", "film and media", "mass communication", "broadcast", "journalism", "advertising"] },
    { id: "education", label: "Education", aliases: ["education", "tutorial", "tutorials", "learning", "coursework", "course project"] },
  ],

  platforms: [
    { id: "visionos", label: "Apple Vision Pro", aliases: ["visionos", "vision pro", "apple vision pro", "avp"] },
    { id: "meta-quest", label: "Meta Quest", aliases: ["meta quest", "quest", "quest 3", "oculus"] },
    { id: "hololens", label: "HoloLens", aliases: ["hololens", "hololens 2", "microsoft hololens"] },
    { id: "ar-glasses", label: "AR glasses", aliases: ["ar glasses", "smart glasses", "mentraos", "even realities", "spectacles", "snapchat spectacles", "tilt five", "realwear"] },
    { id: "ios", label: "iOS", aliases: ["ios", "iphone", "ipad", "ipados"] },
    { id: "watchos", label: "watchOS", aliases: ["watchos", "apple watch", "smartwatch", "wearable", "wearables"] },
    { id: "iphone-duo", label: "iPhone Duo", aliases: ["iphone duo", "foldable iphone"] },
    { id: "android", label: "Android", aliases: ["android", "material 3", "material design"] },
    { id: "carplay", label: "CarPlay", aliases: ["carplay", "car play", "android auto"] },
    { id: "in-vehicle-hud", label: "In-vehicle display and HUD", aliases: ["in vehicle hud", "hud", "heads up display", "head up display", "vehicle sdk", "instrument cluster", "infotainment"] },
    { id: "carla-simulator", label: "CARLA simulator", aliases: ["carla", "carla simulator", "driving simulator", "simulator rig"] },
    { id: "web", label: "Web", aliases: ["website", "web app", "responsive web", "web platform"] },
    { id: "browser-extension", label: "Browser extension", aliases: ["browser extension", "chrome extension", "safari extension", "chrome and safari"] },
    { id: "desktop", label: "Desktop", aliases: ["desktop", "macos", "windows app"] },
  ],

  methods: [
    { id: "usability-testing", label: "Usability testing", aliases: ["usability testing", "usability test", "usability tests", "usability study", "usability studies", "user testing"] },
    { id: "literature-review", label: "Literature review", aliases: ["literature review", "annotated bibliography", "research synthesis", "systematic review"] },
    { id: "think-aloud", label: "Think-aloud protocol", aliases: ["think aloud", "think-aloud", "think-aloud protocol"] },
    { id: "affinity-mapping", label: "Affinity mapping", aliases: ["affinity mapping", "affinity diagram", "affinity diagramming", "kj method"] },
    { id: "qualitative-coding", label: "Qualitative coding", aliases: ["qualitative coding", "thematic analysis", "codebook", "caqdas", "inductive coding"] },
    { id: "field-observation", label: "Field observation & ethnography", aliases: ["ethnography", "ethnographic", "contextual observation", "observation study", "aeiou", "field study"] },
    { id: "speculative-design", label: "Speculative design", aliases: ["speculative design", "design fiction", "futures"] },
    { id: "storyboarding", label: "Storyboarding", aliases: ["storyboard", "storyboards", "storyboarding"] },
    { id: "heuristic-evaluation", label: "Heuristic evaluation", aliases: ["heuristic evaluation", "heuristic review", "expert review", "nielsen heuristics", "cognitive walkthrough"] },
    { id: "user-interviews", label: "User interviews", aliases: ["user interviews", "user interview", "contextual interview", "contextual interviews", "contextual inquiry", "stakeholder interviews", "interviews"] },
    { id: "surveys", label: "Surveys", aliases: ["survey", "surveys", "questionnaire", "questionnaires", "sus score"] },
    { id: "ab-testing", label: "A/B testing", aliases: ["a b test", "a b testing", "a b tests", "ab testing", "split test", "split testing"] },
    { id: "simulator-studies", label: "Simulator studies", aliases: ["simulator study", "simulator studies", "driving study", "in car study", "real car retest", "gaze study", "gaze studies", "eye tracking"] },
    { id: "wizard-of-oz", label: "Wizard of Oz", aliases: ["wizard of oz", "woz"] },
    { id: "personas-journeys", label: "Personas and journey maps", aliases: ["persona", "personas", "journey map", "journey maps", "journey mapping", "empathy map", "empathy mapping"] },
    { id: "competitive-analysis", label: "Competitive analysis", aliases: ["competitive analysis", "competitor analysis", "market research", "landscape analysis"] },
    { id: "rapid-prototyping", label: "Rapid prototyping", aliases: ["rapid prototyping", "rapid prototype", "design sprint", "design sprints", "sketching"] },
    { id: "design-critique", label: "Design critique", aliases: ["design critique", "design review", "design reviews", "critique"] },
    { id: "co-design", label: "Co-design workshops", aliases: ["co design", "codesign", "participatory design", "design workshop", "workshops"] },
    { id: "accessibility-audit", label: "Accessibility audit", aliases: ["accessibility audit", "accessibility review", "wcag audit"] },
    { id: "quant-analysis", label: "Quantitative analysis", aliases: ["quantitative analysis", "quantitative research", "statistical testing", "anova", "t test"] },
  ],
};

// How strongly an item proves the claim, strongest first. Filters use this as a floor ("at least built").
export const strengths = ["shipped", "built", "studied", "watched"] as const;

export const strengthDescriptions: Record<(typeof strengths)[number], string> = {
  shipped: "Released or used in real work, with a real team or real users.",
  built: "I made it myself: a working prototype, product or piece of production.",
  studied: "Learned and practised in coursework or structured study, with graded or reviewed output.",
  watched: "Learned from talks, videos or reading; knowledge, not yet applied work.",
};
