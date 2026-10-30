// Copy and vocabulary for the "Ask" landing (AI Mode style). Everything the visitor reads from the
// assistant comes from here or from the rest of content/. Nothing is generated, and nothing here states a
// fact the site does not already state elsewhere.
//
// DRAFTS to review: the role-to-project mapping (`topics` with kind "role"), the blocklist and the refusal
// wording. Topics marked `fromIntent` reuse the authored answer in site.intents.

export type FlagName = "amber" | "blue" | "lime" | "pink" | "teal" | "violet" | "yellow";

export type PromptKind = "role" | "industry" | "topic";

export type SuggestedPrompt = {
  id: string; // matches a Topic id
  label: string; // chip text
  query: string; // what lands in the prompt box when the chip is chosen
  kind: PromptKind;
  flag: FlagName;
};

export type Topic = {
  id: string;
  kind: PromptKind;
  label: string;
  // Phrases (already lowercase) that route a question straight to this topic's authored answer.
  aliases: string[];
  headline: string;
  // Authored answer. `fromIntent` pulls answer + bullets from site.intents instead.
  fromIntent?: "engineer" | "researcher" | "curious";
  lead?: string;
  // Verbatim evidence. "{email}"-style tokens are filled from site.ts.
  bullets?: string[];
  // Or build the evidence from existing copy instead of retrieving it.
  bulletsFrom?: "claims" | "howIWork" | "timeline";
  // Project slugs in the order they should appear in the answer's shelf.
  slugs: string[];
  followUps: string[]; // topic ids
};

export const askCopy = {
  greeting: "What would you like to know about my work?",
  greetingAccent: "my work",
  helper: "Ask about my projects, process or background. I answer only from what’s on this site.",
  placeholders: [
    "I’m searching for a UX engineer…",
    "Show me your healthcare work",
    "How did you test the voice coach?",
    "What have you built for Vision Pro?",
    "How do you work with engineers?",
  ],
  submit: "Ask",
  thinking: "Looking through the portfolio…",
  sourcesLabel: "From the portfolio",
  followUpsLabel: "Keep exploring",
  scopeHint: "I can only answer questions about this portfolio.",
  refusals: {
    // Off-topic: nothing on the site covers it.
    outOfScope:
      "That’s outside what I can help with. I can only answer questions about Apoorv’s work, process and background that appear on this site.",
    // Personal or sensitive topics: never answered, even if a word happens to match.
    personal:
      "That’s personal, and not something I can speak to. I can only answer questions about Apoorv’s work, process and background on this site.",
    empty: "Type a question, or pick one of the prompts below.",
    tryInstead: "Try one of these instead",
  },
  noMatchHint: "Nothing on the site covers that closely, so I won’t guess.",
} as const;

export const suggestedPrompts: SuggestedPrompt[] = [
  { id: "ux-engineer", label: "Searching for a UX Engineer", query: "I’m searching for a UX engineer", kind: "role", flag: "amber" },
  { id: "ux-designer", label: "Searching for a UX Designer", query: "I’m searching for a UX designer", kind: "role", flag: "pink" },
  { id: "ux-researcher", label: "Searching for a UX Researcher", query: "I’m searching for a UX researcher", kind: "role", flag: "blue" },
  { id: "healthcare", label: "Healthcare", query: "Show me your healthcare work", kind: "industry", flag: "teal" },
  { id: "automotive", label: "Automotive", query: "Show me your automotive work", kind: "industry", flag: "amber" },
  { id: "spatial", label: "Spatial computing & XR", query: "What have you built for spatial computing?", kind: "industry", flag: "violet" },
  { id: "voice-ai", label: "Voice & AI", query: "Tell me about your voice and AI work", kind: "topic", flag: "lime" },
  { id: "process", label: "How do you work?", query: "How do you work?", kind: "topic", flag: "yellow" },
  { id: "values", label: "Work ethic & values", query: "Tell me about Apoorv’s work ethic", kind: "topic", flag: "lime" },
  { id: "best-work", label: "Show me your best work", query: "Show me your best work", kind: "topic", flag: "pink" },
  { id: "contact", label: "Get in touch", query: "How do I get in touch?", kind: "topic", flag: "blue" },
];

export const topics: Topic[] = [
  {
    id: "ux-engineer",
    kind: "role",
    label: "UX Engineer",
    aliases: ["ux engineer", "ux engineers", "design engineer", "design technologist", "hiring an engineer", "front end", "frontend"],
    headline: "For a UX engineering role",
    fromIntent: "engineer",
    slugs: ["woven", "fleet-console", "good-roommate", "just-fill-it"],
    followUps: ["automotive", "process", "contact"],
  },
  {
    id: "ux-designer",
    kind: "role",
    label: "UX Designer",
    aliases: ["ux designer", "ux designers", "ui designer", "product designer", "interaction designer", "visual designer", "ui ux"],
    headline: "For a UX or UI design role",
    lead:
      "I’ve been designing for cars, headsets and health apps since 2019. At Woven by Toyota I designed the voice and screen experience of an in-car AI coach and built the Figma design system that four Toyota companies now share. Before that I was a UI/UX designer at Omnia, designing for Apple Vision Pro, Meta Quest and CarPlay.",
    bullets: [
      "I built the Figma design system Woven, TRI, TMNA and TCNA now share, with tokens and visual regression tests.",
      "At Omnia I designed for Apple Vision Pro and Meta Quest, including How2To, step-by-step tutorials that sit in the room with you.",
      "I ran my own UX consultancy, Crazy Minds, for four years and delivered 25+ projects in fintech, health and e-commerce.",
    ],
    slugs: ["woven", "how2to", "omniabrowser", "fleet-console", "syncare-ai-health", "spatialshowroom"],
    followUps: ["spatial", "healthcare", "process"],
  },
  {
    id: "ux-researcher",
    kind: "role",
    label: "UX Researcher",
    aliases: ["ux researcher", "ux researchers", "user researcher", "design researcher", "research role"],
    headline: "For a UX research role",
    fromIntent: "researcher",
    slugs: ["woven", "fleet-console", "syncare-ai-health", "how2to"],
    followUps: ["voice-ai", "process", "contact"],
  },
  {
    id: "healthcare",
    kind: "industry",
    label: "Healthcare",
    aliases: ["healthcare", "health care", "health tech", "medical", "patient", "patients", "clinical", "wellness"],
    headline: "Healthcare work",
    lead:
      "My health work is SynCare, which makes AI-integrated health records easier to read. I did it as a UX researcher and UI designer at Patched Reality in 2024, alongside VR physiotherapy. With Crazy Minds I also delivered projects in health, fintech and e-commerce.",
    bulletsFrom: "claims",
    slugs: ["syncare-ai-health"],
    followUps: ["voice-ai", "ux-designer", "ux-researcher"],
  },
  {
    id: "automotive",
    kind: "industry",
    label: "Automotive",
    aliases: ["automotive", "car", "cars", "in car", "in vehicle", "vehicle", "driving", "driver", "drivers", "hmi", "cockpit", "toyota", "woven"],
    headline: "Automotive work",
    lead:
      "Most of my recent work is in the car. At Woven by Toyota I’m the UX engineer behind an in-car AI driving coach, and Fleet Console, a self-initiated concept for overseeing an autonomous test fleet.",
    bulletsFrom: "claims",
    slugs: ["woven", "fleet-console"],
    followUps: ["voice-ai", "ux-engineer", "ux-researcher"],
  },
  {
    id: "spatial",
    kind: "industry",
    label: "Spatial computing & XR",
    aliases: ["spatial", "spatial computing", "xr", "ar", "vr", "mr", "vision pro", "visionos", "headset", "headsets", "augmented reality", "virtual reality", "quest", "hololens"],
    headline: "Spatial computing and XR",
    fromIntent: "curious",
    slugs: ["how2to", "omniabrowser", "spatialshowroom", "sitelens"],
    followUps: ["ux-designer", "voice-ai", "about"],
  },
  {
    id: "voice-ai",
    kind: "topic",
    label: "Voice & AI",
    aliases: ["voice", "voice ui", "voice first", "voice interaction", "ai", "artificial intelligence", "assistant", "conversational"],
    headline: "Voice and AI work",
    lead:
      "Voice is the main interface of the in-car coach: after gaze studies showed the screen pulled eyes off the road, I moved coaching to voice and timed prompts by speed. How2To is voice-first too, and SynCare has an AI chat for reading health records.",
    slugs: ["woven", "how2to", "syncare-ai-health", "fleet-console"],
    followUps: ["ux-researcher", "automotive", "process"],
  },
  {
    id: "process",
    kind: "topic",
    label: "How I work",
    aliases: ["how do you work", "how you work", "process", "approach", "methodology", "workflow", "how do you design", "working style", "collaborate", "collaboration"],
    headline: "How I work",
    lead:
      "I run the study and I build the interface, so what the research finds and what ships are the same thing. Research comes before screens, prototypes run where the product runs, the test wins arguments, and engineers get working code instead of pictures.",
    bulletsFrom: "howIWork",
    slugs: ["woven", "fleet-console"],
    followUps: ["ux-engineer", "ux-researcher", "best-work"],
  },
  {
    id: "values",
    kind: "topic",
    label: "Values & work ethic",
    aliases: [
      "work ethic", "work ethics", "ethic", "ethics", "ethical", "professional values", "my values", "his values", "your values",
      "core values", "principles", "philosophy", "design philosophy", "what do you value", "what does he value", "what drives you",
      "what drives him", "what matters to you", "integrity", "what are your strengths", "what makes you different",
    ],
    headline: "Values and work ethic",
    lead:
      "I let the test win and I own the work end to end. I run the study and I build the interface, so what the research finds and what ships are the same thing. When real-car tests showed my voice prompts reached speeding drivers too late, I re-timed them by speed, and the retest backed it.",
    // Each line restates something the site already says. Nothing here is a new claim.
    bullets: [
      "Listen first. Research before screens. On the drive coach, 100+ drivers’ research became 22 scenarios before I drew anything.",
      "Let the test win. Real-car tests showed my voice prompts reached speeding drivers too late. I re-timed them by speed, and the retest backed it.",
      "Ship code, not pictures. Engineers get working React, Flutter, SwiftUI or Tailwind, a shared design system, and a written log of every decision.",
      "I owned the experience end to end: the research, the voice and screen design, the simulator rig, and the studies that proved it worked.",
      "Coaching by voice, after gaze studies showed the screen pulled eyes off the road.",
      "Every alert was designed to meet the industry’s 2-second glance-to-comprehension standard.",
    ],
    slugs: ["woven", "fleet-console"],
    followUps: ["process", "best-work", "contact"],
  },
  {
    id: "best-work",
    kind: "topic",
    label: "Best work",
    aliases: ["best work", "best project", "best projects", "featured", "highlights", "favorite project", "favourite project", "top projects", "portfolio", "projects", "case studies", "your work", "show me your work"],
    headline: "Where to start",
    lead:
      "Start with the Generative Drive Coach at Woven by Toyota: a brief and research on 100+ drivers became a coach that talks new drivers through parking, intersections and lane changes. Then look at Fleet Console, the Vision Pro browser and The Good Roommate.",
    bulletsFrom: "claims",
    slugs: ["woven", "fleet-console", "omniabrowser", "good-roommate"],
    followUps: ["automotive", "spatial", "process"],
  },
  {
    id: "personal",
    kind: "topic",
    label: "Personal projects",
    aliases: ["personal project", "personal projects", "side project", "side projects", "good roommate", "just fill it", "outside work"],
    headline: "Personal projects",
    lead:
      "Outside work I take a product from the first sketch to the App Store build. The Good Roommate is a camera-first chore app designed for iPhone Duo, and Just Fill It is a Chrome and Safari extension that tailors a resume to the job page you’re on.",
    bulletsFrom: "claims",
    slugs: ["good-roommate", "just-fill-it"],
    followUps: ["ux-engineer", "process", "contact"],
  },
  {
    id: "tools",
    kind: "topic",
    label: "Tools & tech",
    aliases: ["tech stack", "stack", "tools", "tooling", "technologies", "technology", "languages", "programming languages", "frameworks", "skills", "software", "what do you use", "what do you build with"],
    headline: "Tools and tech",
    lead:
      "I build in React and TypeScript, Flutter, SwiftUI and Tailwind, and I prototype in Figma. For driving studies I use the CARLA simulator with a Python bridge to an iPad HMI, and I’ve designed for Apple Vision Pro, Meta Quest, HoloLens 2, Snapchat Spectacles, Tilt Five, RealWear, Even Realities G1 and CarPlay.",
    bullets: [
      "Engineers get production-ready React, Flutter, SwiftUI or Tailwind from me, not a spec to interpret.",
      "I wrote the Python bridge between the CARLA driving simulator and an iPad HMI in React and TypeScript, and it read faster than the 2-second glance standard.",
      "I built the Figma design system Woven, TRI, TMNA and TCNA now share, with tokens and visual regression tests.",
    ],
    slugs: ["woven", "fleet-console", "just-fill-it"],
    followUps: ["ux-engineer", "best-work", "contact"],
  },
  {
    id: "contact",
    kind: "topic",
    label: "Get in touch",
    aliases: ["contact", "contact him", "get in touch", "reach you", "reach out", "reach him", "email", "hire", "hire him", "hiring", "availability", "linkedin", "github"],
    headline: "Get in touch",
    lead:
      "I’m looking for my next team, ideally one where the person who runs the study also ships the interface. If you’re building for cars, spatial computing or AI, write to me.",
    bullets: ["Email: {email}", "LinkedIn: {linkedin}", "GitHub: {github}", "Based in {location}."],
    slugs: ["woven"],
    followUps: ["best-work", "about", "ux-engineer"],
  },
  {
    id: "about",
    kind: "topic",
    label: "About Apoorv",
    aliases: ["who is apoorv", "who are you", "about apoorv", "about you", "introduce", "background", "bio", "biography", "education", "experience", "career", "timeline", "where are you based", "where is apoorv based", "where does apoorv live", "where do you live", "location", "where did you go to school", "where did you study", "school", "university", "degree", "college", "depaul", "masters"],
    bulletsFrom: "timeline",
    headline: "About Apoorv",
    lead:
      "I’m Apoorv Mahajan, a senior product designer and UX engineer based in the United States and open to relocation. Until October 2026 I was behind an in-car AI driving coach at Woven by Toyota. Before that I designed for Apple Vision Pro and Meta Quest at Omnia, studied human-computer interaction at DePaul, and ran my own UX consultancy for four years.",
    slugs: ["woven", "how2to", "syncare-ai-health"],
    followUps: ["best-work", "process", "contact"],
  },
];

// Words that mean the same thing on this site. Each group is expanded at query time, so "medical" finds
// the health work and "car" finds the in-vehicle work. Lowercase; stemmed by the engine.
export const synonymGroups: string[][] = [
  ["health", "healthcare", "medical", "patient", "clinical", "wellness", "vitals", "physiotherapy", "records"],
  ["car", "cars", "automotive", "vehicle", "driving", "driver", "in-vehicle", "cockpit", "hmi", "toyota", "woven"],
  ["spatial", "xr", "ar", "vr", "mr", "headset", "visionos", "vision", "immersive", "augmented", "virtual", "quest"],
  ["voice", "speech", "spoken", "talk", "talks", "audio", "conversational"],
  ["ai", "artificial", "intelligence", "ml", "assistant", "coach", "coaching", "generative"],
  ["research", "researcher", "study", "studies", "interview", "interviews", "participants", "usability", "testing", "test", "tests"],
  ["design", "designer", "designing", "ui", "ux", "interface", "figma", "prototype", "prototyping"],
  ["engineer", "engineering", "code", "coding", "build", "built", "swift", "swiftui", "react", "flutter", "typescript", "tailwind", "python"],
  ["system", "tokens", "components", "library"],
  ["mobile", "ios", "iphone", "app", "apps", "android"],
  ["job", "role", "hire", "hiring", "position", "team", "career"],
];

// Words that carry no topic on their own. "apoorv" is here on purpose: a question must be about
// something on the site, and the name alone doesn't count.
export const stopwords: string[] = [
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for", "from", "with", "by",
  "about", "as", "is", "are", "was", "were", "be", "been", "am", "do", "does", "did", "done", "have", "has",
  "had", "can", "could", "would", "should", "will", "shall", "may", "might", "must", "it", "its", "this",
  "that", "these", "those", "there", "here", "what", "whats", "which", "who", "whom", "whose", "when",
  "where", "why", "how", "i", "me", "my", "mine", "we", "us", "our", "you", "your", "yours", "he", "him",
  "his", "she", "her", "they", "them", "their", "tell", "show", "give", "let", "know", "want", "need",
  "looking", "search", "searching", "find", "finding", "see", "please", "some", "any", "all", "more",
  "most", "much", "many", "very", "really", "also", "just", "get", "got", "make", "made", "so", "than",
  "then", "too", "ve", "re", "ll", "s", "t", "d", "m", "im", "ive", "id", "like", "kind", "type", "thing",
  "things", "stuff", "something", "anything", "work", "worked", "working", "apoorv", "mahajan", "apoorvs",
  // Instruction verbs and time words: they ask for something but carry no topic.
  "explain", "describe", "summarize", "summarise", "list", "define", "compare", "walk", "through",
  "use", "used", "using", "help", "helped", "try", "tried", "ask", "asked", "say", "said", "think",
  "thought", "go", "went", "give", "does", "doing", "want", "wants", "wanted", "possible", "able",
  "last", "night", "today", "yesterday", "tomorrow", "tonight", "now", "week", "weekend", "ago",
];

// Personal or sensitive subjects: always refused, even when another word in the question matches the site.
// Matched as whole words (plural-insensitive) or as phrases.
export const blockedWords: string[] = [
  "girlfriend", "boyfriend", "wife", "husband", "spouse", "fiance", "fiancee", "married", "marriage",
  "dating", "relationship", "relationships", "crush", "sex", "sexual", "sexuality", "religion",
  "religious", "political", "politics", "salary", "salaries", "income", "paycheck", "wage", "birthday",
  "birthdate", "family", "parents", "mother", "father", "mom", "dad", "sister", "brother", "kids",
  "children", "pregnant", "ssn", "passport", "citizenship", "immigration", "ethnicity", "caste",
  "password", "passwords", "debt", "gossip", "rumor", "rumour", "drunk", "drugs", "alcohol", "arrested",
  "lawsuit",
];

export const blockedPhrases: string[] = [
  "how old", "home address", "phone number", "net worth", "love life", "personal life", "private life",
  "social security", "date of birth", "real name",
  "pay you", "paid you", "how much do you make", "how much does he make",
  "is he single", "are you single", "is apoorv single", "is he taken", "are you taken", "his ex", "her ex",
  "your ex", "an ex", "have a partner", "have kids", "have children",
];

// Requests the assistant doesn't do, whatever the topic. Regex source strings, tested case-insensitively.
export const offTopicPatterns: string[] = [
  "\\b(poem|poems|poetry|joke|jokes|haiku|lyrics|essay|recipe|recipes|horoscope)\\b",
  "\\b(weather|forecast|stock|stocks|crypto|bitcoin|news|sports|election)\\b",
  "\\b(translate|translation|homework|math|calculate|equation|trivia|capital of)\\b",
  "^(write|compose|generate|draft|draw|paint|sing|solve|calculate|debug)\\b",
  "\\b(write|generate|create|draft) (me )?(a|an|some|the) (email|letter|poem|story|essay|script|function|program|cover letter|logo|post|tweet)\\b",
];

// Attempts to steer the assistant itself. There is no model to inject, but these are still refused politely.
export const injectionPatterns: string[] = [
  "ignore (all |any |the )?(previous|prior|above|earlier|your)",
  "disregard (all |any |the )?(previous|prior|above|earlier|your)",
  "system prompt",
  "your (prompt|instructions|rules)",
  "jailbreak",
  "developer mode",
  "(pretend|act|behave) (to be|as|like)",
  "you are (now|no longer)",
  "reveal (your |the )?(prompt|instructions|rules)",
];

// Apple TV style shelves under the prompt. After an answer, a "Matches" shelf is placed first.
// Each project appears once across the carousel and these shelves (the page also enforces it), so the
// carousel takes one spotlight project per area and the shelves hold the rest.
export const shelves: { id: string; title: string; kicker: string; slugs: string[] }[] = [
  { id: "automotive", title: "More automotive", kicker: "In the car, at Woven by Toyota", slugs: ["fleet-console"] },
  { id: "spatial", title: "More spatial & XR", kicker: "Headsets, glasses and the room around you", slugs: ["how2to", "spatialshowroom", "sitelens"] },
  { id: "apps", title: "Apps & AI", kicker: "Health, and tools I built myself", slugs: ["syncare-ai-health", "just-fill-it", "design-crew"] },
];

// The big carousel above the shelves: one spotlight each for automotive, spatial and personal work.
export const featuredSlugs: string[] = ["woven", "omniabrowser", "good-roommate"];

export const shelfCopy = {
  featuredLabel: "Featured",
  matchesTitle: "Matches for your question",
  matchesKicker: "Pulled from the answer above",
  scrollHint: "More below",
  viewProject: "View project",
} as const;
