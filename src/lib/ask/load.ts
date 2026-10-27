import type { AskEngine } from "./engine.ts";

let pending: Promise<AskEngine> | null = null;

// Loads the retrieval engine and the content it indexes on first use, as a separate chunk, so the landing
// page paints without it. Safe to call repeatedly.
export function loadEngine(): Promise<AskEngine> {
  pending ??= (async () => {
    const [{ createAsk }, { getAllStudies }, { site }, { studyMeta }, { personal }, ask] = await Promise.all([
      import("./engine.ts"),
      import("../content"),
      import("../../../content/site"),
      import("../../../content/study-meta"),
      import("../../../content/personal"),
      import("../../../content/ask"),
    ]);
    return createAsk({
      site,
      studies: getAllStudies(),
      studyMeta,
      personal,
      config: {
        copy: ask.askCopy,
        suggestedPrompts: ask.suggestedPrompts,
        topics: ask.topics,
        synonymGroups: ask.synonymGroups,
        stopwords: ask.stopwords,
        blockedWords: ask.blockedWords,
        blockedPhrases: ask.blockedPhrases,
        offTopicPatterns: ask.offTopicPatterns,
        injectionPatterns: ask.injectionPatterns,
      },
    });
  })();
  return pending;
}
