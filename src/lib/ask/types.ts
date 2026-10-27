import type { SuggestedPrompt, Topic } from "../../../content/ask";

export type ChunkKind = "study" | "summary" | "facts" | "profile" | "intent" | "personal" | "process" | "timeline";

// One retrievable passage of the site's own copy.
export type Chunk = {
  id: string;
  kind: ChunkKind;
  text: string;
  title: string; // heading or study title, weighted higher in retrieval
  label: string; // shown on source chips
  href: string; // internal path, or an external/mailto link
  slug?: string;
  tags: string[];
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
