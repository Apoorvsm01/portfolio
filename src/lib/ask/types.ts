import type { SuggestedPrompt, Topic } from "../../../content/ask";
import type { FacetGroup, Taxonomy } from "../../../content/brain/taxonomy";

export type { FacetGroup, Taxonomy };

export type ChunkKind = "study" | "summary" | "facts" | "profile" | "intent" | "personal" | "process" | "timeline" | "evidence";

// One retrievable passage of the site's own copy.
export type Chunk = {
  id: string;
  kind: ChunkKind;
  text: string;
  title: string; // heading or study title, weighted higher in retrieval
  label: string; // shown on source chips
  href: string; // internal path, or an external/mailto link
  slug?: string;
  org?: string; // organisation behind the item; part of the per-source diversity key
  claim?: string; // on case-study summary chunks: the one-line claim, shown as the main line in the filter view
  tags: string[];
  // Set on passages that can be filtered (case-study chunks and approved evidence).
  facets?: Facets;
  strength?: Strength;
  date?: string; // "YYYY" or "YYYY-MM", used to break ties when ranking
};

export type SourceRef = { label: string; href: string; slug?: string; external: boolean };

export type AskBullet = { text: string; source: SourceRef };

export type AskAnswer = {
  status: "answer";
  query: string;
  topicId?: string;
  headline: string;
  lead: string;
  bullets: AskBullet[];
  sources: SourceRef[];
  slugs: string[]; // projects for the shelf, best first
  followUps: SuggestedPrompt[];
};

export type RefusalReason = "empty" | "personal" | "out-of-scope";

export type AskRefusal = {
  status: "refused";
  query: string;
  reason: RefusalReason;
  message: string;
  suggestions: SuggestedPrompt[];
};

export type AskResult = AskAnswer | AskRefusal;

export type ScopeCheck = "in" | "out" | "empty";

export type AskConfig = {
  copy: {
    refusals: { outOfScope: string; personal: string; empty: string };
  };
  suggestedPrompts: SuggestedPrompt[];
  topics: Topic[];
  synonymGroups: string[][];
  stopwords: string[];
  blockedWords: string[];
  blockedPhrases: string[];
  offTopicPatterns: string[];
  injectionPatterns: string[];
};

// ---------- evidence and filtering ("second brain") ----------

// How strongly an item proves its claim, strongest first. Must stay in step with `strengths` in content/brain/taxonomy.ts.
export type Strength = "shipped" | "built" | "studied" | "watched";

export type Facets = Partial<Record<FacetGroup, string[]>>;

export type Evidence = {
  id: string;
  claim: string; // one sentence, 160 characters at most
  detail?: string;
  strength: Strength;
  date: string; // "YYYY" or "YYYY-MM"
  facets: Facets;
  source: { kind: "project" | "course" | "resume" | "video" | "repo"; label: string; href?: string };
  slug?: string; // a case study this item backs up
  org?: string; // the organisation this came from (employer or school), when known
  status: "draft" | "approved";
};

export type FilterState = {
  roles: string[];
  skills: string[];
  domains: string[];
  platforms: string[];
  methods: string[];
  minStrength?: Strength;
  // "all" (default): AND across groups, OR within one. "any": an item passes if it matches at least one selected facet.
  match?: "all" | "any";
  q?: string;
};

export type FilterItem = {
  chunk: Chunk;
  score: number; // BM25 when q is set, else 0
  matched: Facets; // the selected facet ids this item carries, per group
};

export type FilterResult = {
  items: FilterItem[]; // all matches; the first 12 respect the diversity cap
  total: number;
};

// Filter results grouped by source (case study, else organisation, else label), in rank order.
export type SourceGroup = {
  key: string;
  label: string;
  org?: string;
  slug?: string;
  href?: string;
  strongest?: Strength;
  items: FilterItem[];
};

export type FacetCount = { group: FacetGroup; id: string; count: number; strongest?: Strength };
