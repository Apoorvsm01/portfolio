import type { SuggestedPrompt, Topic } from "../../../content/ask";
import { buildCorpus, type CorpusInput } from "./corpus.ts";
import type { AskAnswer, AskBullet, AskConfig, AskRefusal, AskResult, Chunk, RefusalReason, ScopeCheck, SourceRef } from "./types";

export type AskEngineInput = CorpusInput & { config: AskConfig };

// ---------- text ----------

const QUERY_MAX = 240;

export function normalize(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, QUERY_MAX);
}

function words(text: string): string[] {
  return normalize(text)
    .replace(/'s\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

// A light stemmer: enough to match plurals and -ing/-ed forms, not a linguistic one.
export function stem(word: string): string {
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) w = w.slice(0, -1);
  return w;
}

const stems = (text: string) => words(text).map(stem);

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("; "), cut.lastIndexOf(" "));
  return `${cut.slice(0, stop > max * 0.6 ? stop : max).replace(/[,;:\s]+$/, "")}…`;
}

// ---------- engine ----------

const K1 = 1.4;
const B = 0.75;
// Below this top BM25 score a question is treated as not covered by the site. Tuned against ask.test.ts.
const MIN_SCORE = 3.2;
const MIN_COVERAGE = 0.6;

type Doc = { chunk: Chunk; tf: Map<string, number>; len: number; owner: Set<string> };

// Naming a project ("SynCare onboarding") should favour that project's passages over a better word match elsewhere.
const OWNER_BOOST = 1.6;

export function createAsk(input: AskEngineInput) {
  const { config, site } = input;
  const chunks = buildCorpus(input);

  // Index. Title words count three times and tags once more, so a heading beats a passing mention.
  const docs: Doc[] = chunks.map((chunk) => {
    const owner = chunk.label.split(" · ")[0];
    const tokens = [...stems(chunk.text), ...stems(chunk.title), ...stems(chunk.title), ...stems(chunk.tags.join(" ")), ...stems(owner)];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { chunk, tf, len: tokens.length, owner: new Set(stems(owner)) };
  });
  const avgLen = docs.reduce((n, d) => n + d.len, 0) / Math.max(docs.length, 1);
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t: string) => Math.log(1 + (docs.length - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));

  const stopSet = new Set(config.stopwords.map(stem));
  stopSet.add("apoorv");
  const blockedSet = new Set(config.blockedWords);
  const synonyms = new Map<string, Set<string>>();
  for (const group of config.synonymGroups) {
    const stemmed = [...new Set(group.flatMap((g) => stems(g)))];
    for (const s of stemmed) {
      const set = synonyms.get(s) ?? new Set<string>();
      stemmed.forEach((o) => o !== s && set.add(o));
      synonyms.set(s, set);
    }
  }
  const offTopic = config.offTopicPatterns.map((p) => new RegExp(p, "i"));
  const injection = config.injectionPatterns.map((p) => new RegExp(p, "i"));
  const promptById = new Map(config.suggestedPrompts.map((p) => [p.id, p]));
  const topicById = new Map(config.topics.map((t) => [t.id, t]));

  const inVocab = (term: string) =>
    df.has(term) || [...(synonyms.get(term) ?? [])].some((s) => df.has(s));

  // Anchors: words that name something the portfolio is actually about (projects, orgs, tags, tools,
  // domains, proper nouns). Ordinary English words that happen to appear in the copy ("single", "life",
  // "game") are not anchors, so a question has to touch at least one real subject to be answered.
  const anchors = new Set<string>();
  const addAnchors = (text: string) => stems(text).forEach((t) => !stopSet.has(t) && t.length > 1 && anchors.add(t));
  for (const study of input.studies) addAnchors(`${study.title} ${study.tags.join(" ")}`);
  for (const w of site.work) addAnchors(`${(w as { org?: string }).org ?? ""} ${w.domain}`);
  for (const t of site.timeline) addAnchors(`${t.role} ${t.org}`);
  addAnchors(site.platforms.join(" "));
  for (const t of config.topics) addAnchors(`${t.label} ${t.aliases.join(" ")}`);
  for (const group of config.synonymGroups) addAnchors(group.join(" "));
  for (const c of chunks) {
    // Mid-sentence capitalised words and ALL-CAPS acronyms: CARLA, Figma, Tesla, SwiftUI, HoloLens.
    for (const m of c.text.matchAll(/(?<=[a-z,;:)] )([A-Z][A-Za-z0-9]{2,}|[A-Z]{2,})\b/g)) addAnchors(m[1]);
  }

  // term -> weight. Expanded synonyms count for less than the words the visitor typed.
  function weightedTerms(terms: string[]): Map<string, number> {
    const out = new Map<string, number>();
    for (const t of terms) out.set(t, 1);
    for (const t of terms) {
      for (const s of synonyms.get(t) ?? []) if (!out.has(s)) out.set(s, 0.45);
    }
    return out;
  }

  function search(terms: Map<string, number>, exclude?: (c: Chunk) => boolean) {
    const scored: { chunk: Chunk; score: number }[] = [];
    for (const d of docs) {
      if (exclude?.(d.chunk)) continue;
      let score = 0;
      let named = false;
      for (const [term, weight] of terms) {
        const f = d.tf.get(term);
        if (weight === 1 && d.owner.has(term) && !stopSet.has(term) && anchors.has(term) && d.owner.size > 0 && term.length > 3) named = true;
        if (!f) continue;
        score += weight * idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
      }
      if (score > 0) scored.push({ chunk: d.chunk, score: named ? score * OWNER_BOOST : score });
    }
    return scored.sort((a, b) => b.score - a.score);
  }

  // ---------- scope gate ----------

  type Gate =
    | { ok: true; query: string; topic?: Topic; terms: string[] }
    | { ok: false; query: string; reason: RefusalReason };

  const singular = (w: string) => (w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

  function gate(raw: string): Gate {
    const query = normalize(raw);
    if (!query) return { ok: false, query, reason: "empty" };

    const padded = ` ${words(query).join(" ")} `;
    const tokens = words(query);

    // 1. Personal or sensitive subjects: never answered, whatever else matches.
    if (
      tokens.some((t) => blockedSet.has(t) || blockedSet.has(singular(t))) ||
      config.blockedPhrases.some((p) => padded.includes(` ${p} `))
    ) {
      return { ok: false, query, reason: "personal" };
    }
    // 2. Attempts to steer the assistant, and requests it doesn't do.
    if (injection.some((r) => r.test(query)) || offTopic.some((r) => r.test(query))) {
      return { ok: false, query, reason: "out-of-scope" };
    }
    // 3. A topic the portfolio answers directly: longest matching phrase wins.
    const terms = tokens.map(stem).filter((t) => !stopSet.has(t));
    let topic: Topic | undefined;
    let matchedAlias = "";
    for (const t of config.topics) {
      for (const alias of t.aliases) {
        if (alias.length > matchedAlias.length && padded.includes(` ${words(alias).join(" ")} `)) {
          matchedAlias = alias;
          topic = t;
        }
      }
    }
    if (topic) {
      // A matched topic still can't carry a question about something else ("Apoorv's dog").
      const aliasStems = new Set(stems(matchedAlias));
      const covered = terms.filter((t) => aliasStems.has(t) || inVocab(t)).length;
      if (terms.length > 0 && covered / terms.length < MIN_COVERAGE) return { ok: false, query, reason: "out-of-scope" };
      return { ok: true, query, topic, terms: [] };
    }

    // 4. Free-form: the question needs substance the site actually has.
    if (terms.length === 0) return { ok: true, query, topic: topicById.get("about"), terms: [] };
    const known = terms.filter(inVocab);
    if (known.length === 0 || known.length / terms.length < MIN_COVERAGE || !known.some((t) => anchors.has(t))) {
      return { ok: false, query, reason: "out-of-scope" };
    }
    const top = search(weightedTerms(known))[0];
    if (!top || top.score < MIN_SCORE) return { ok: false, query, reason: "out-of-scope" };
    return { ok: true, query, terms: known };
  }

  const suggestionIds = ["best-work", "ux-engineer", "healthcare"];
  const suggestions = () => suggestionIds.map((id) => promptById.get(id)).filter((p): p is SuggestedPrompt => Boolean(p));

  function refuse(query: string, reason: RefusalReason): AskRefusal {
    const { refusals } = config.copy;
    const message = reason === "empty" ? refusals.empty : reason === "personal" ? refusals.personal : refusals.outOfScope;
    return { status: "refused", query, reason, message, suggestions: suggestions() };
  }

  // ---------- composing ----------

  const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);
  const toSource = (c: Chunk): SourceRef => ({ label: c.label, href: c.href, slug: c.slug, external: isExternal(c.href) });

  function bestSentence(chunk: Chunk, terms: Map<string, number>): string {
    const parts = sentences(chunk.text);
    let pick = parts[0] ?? chunk.text;
    let top = -1;
    parts.forEach((s, i) => {
      let score = 0;
      for (const t of new Set(stems(s))) score += terms.get(t) ?? 0;
      score -= i * 0.01;
      if (score > top) {
        top = score;
        pick = s;
      }
    });
    return trimTo(pick, 240);
  }

  // Diverse evidence: highest-scoring passages, at most two per project, no repeated sentence.
  function evidence(scored: { chunk: Chunk; score: number }[], terms: Map<string, number>, count: number, skip: Set<string>): AskBullet[] {
    const out: AskBullet[] = [];
    const perSlug = new Map<string, number>();
    for (const { chunk } of scored) {
      if (out.length >= count) break;
      const key = chunk.slug ?? chunk.id;
      if ((perSlug.get(key) ?? 0) >= 2) continue;
      const text = bestSentence(chunk, terms);
      const sig = text.toLowerCase();
      if (skip.has(sig) || text.length < 25) continue;
      skip.add(sig);
      perSlug.set(key, (perSlug.get(key) ?? 0) + 1);
      out.push({ text, source: toSource(chunk) });
    }
    return out;
  }

  const notIntent = (c: Chunk) => c.kind === "intent";
  const byId = new Map(chunks.map((c) => [c.id, c]));
  const fallbackSource: SourceRef = { label: "Portfolio", href: "/", external: false };

  // Evidence assembled from copy that already exists on the site, word for word.
  function fromExistingCopy(topic: Topic): AskBullet[] {
    const out: AskBullet[] = [];
    const push = (text: string, chunkId: string) => {
      const chunk = byId.get(chunkId);
      out.push({ text, source: chunk ? toSource(chunk) : fallbackSource });
    };
    if (topic.bulletsFrom === "claims") {
      for (const slug of topic.slugs.slice(0, 4)) {
        if (slug === "good-roommate") {
          push(`${site.personal.lead.title}: ${site.personal.lead.claim}`, "personal:lead");
          continue;
        }
        const study = input.studies.find((s) => s.slug === slug);
        const meta = input.studyMeta[slug];
        if (study && meta) push(`${study.title}: ${meta.claim}`, `${slug}:summary`);
      }
    } else if (topic.bulletsFrom === "howIWork") {
      site.howIWork.forEach((step, i) => push(`${step.title}. ${step.body}`, `process:${i}`));
    } else if (topic.bulletsFrom === "timeline") {
      site.timeline.slice(0, 4).forEach((t, i) => {
        const note = "note" in t && t.note ? ` ${t.note}` : "";
        push(`${t.years}: ${t.role}, ${t.org}.${note}`, `timeline:${i}`);
      });
    }
    return out;
  }

  function rankSlugs(scored: { chunk: Chunk; score: number }[], first: string[] = []): string[] {
    const totals = new Map<string, number>();
    for (const { chunk, score } of scored.slice(0, 30)) {
      if (chunk.slug) totals.set(chunk.slug, (totals.get(chunk.slug) ?? 0) + score);
    }
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => slug);
    return [...new Set([...first, ...ranked])].slice(0, 8);
  }

  function followUps(ids: string[], exclude?: string): SuggestedPrompt[] {
    return ids.filter((id) => id !== exclude).map((id) => promptById.get(id)).filter((p): p is SuggestedPrompt => Boolean(p)).slice(0, 3);
  }

  function intentFor(id: Topic["fromIntent"]) {
    return site.intents.find((i) => i.id === id);
  }

  function composeTopic(query: string, topic: Topic): AskAnswer {
    const intent = intentFor(topic.fromIntent);
    const lead = intent?.answer ?? topic.lead ?? "";
    const authored = intent?.bullets ?? topic.bullets ?? [];
    const topicTerms = weightedTerms(stems([topic.label, ...topic.aliases].join(" ")).filter((t) => !stopSet.has(t)));
    const skip = new Set<string>();

    let bullets: AskBullet[];
    if (authored.length) {
      // Authored bullets stay verbatim; each gets the passage elsewhere on the site that best backs it up.
      bullets = authored.map((raw) => {
        if (raw.includes("{")) {
          const text = raw.replace(/\{(\w+)\}/g, (_, key: string) => String((site as Record<string, unknown>)[key] ?? ""));
          const contact = byId.get("site:contact");
          return { text, source: contact ? toSource(contact) : fallbackSource };
        }
        const hit = search(weightedTerms(stems(raw).filter((t) => !stopSet.has(t))), notIntent)[0];
        skip.add(raw.toLowerCase());
        return { text: raw, source: hit ? toSource(hit.chunk) : fallbackSource };
      });
    } else if (topic.bulletsFrom) {
      bullets = fromExistingCopy(topic);
    } else {
      bullets = evidence(search(topicTerms, notIntent), topicTerms, 3, skip);
    }

    const scored = search(topicTerms, notIntent);
    const sources: SourceRef[] = [];
    for (const b of bullets) if (!sources.some((s) => s.href === b.source.href)) sources.push(b.source);

    return {
      status: "answer",
      query,
      topicId: topic.id,
      headline: topic.headline,
      lead,
      bullets,
      sources: sources.slice(0, 5),
      // An authored project list is the answer; retrieval only fills in when a topic names none.
      slugs: topic.slugs.length ? topic.slugs : rankSlugs(scored),
      followUps: followUps(topic.followUps, topic.id),
    };
  }

  function composeFreeform(query: string, terms: string[]): AskAnswer {
    const weighted = weightedTerms(terms);
    const scored = search(weighted);
    const skip = new Set<string>();
    const [leadBullet, ...rest] = evidence(scored, weighted, 4, skip);
    const bullets = rest.slice(0, 3);
    const sources: SourceRef[] = [];
    for (const b of [leadBullet, ...bullets]) {
      if (b && !sources.some((s) => s.href === b.source.href)) sources.push(b.source);
    }
    return {
      status: "answer",
      query,
      headline: "What the portfolio says",
      lead: leadBullet?.text ?? "",
      bullets,
      sources: sources.slice(0, 5),
      slugs: rankSlugs(scored),
      followUps: followUps(["best-work", "process", "contact"]),
    };
  }

  function ask(raw: string): AskResult {
    const g = gate(raw);
    if (!g.ok) return refuse(g.query, g.reason);
    return g.topic ? composeTopic(g.query, g.topic) : composeFreeform(g.query, g.terms);
  }

  function scope(raw: string): ScopeCheck {
    if (!raw.trim()) return "empty";
    return gate(raw).ok ? "in" : "out";
  }

  // Why a free-form question passes or fails the gate. For tuning and tests only.
  function explain(raw: string) {
    const terms = words(raw).map(stem).filter((t) => !stopSet.has(t));
    const known = terms.filter(inVocab);
    const top = known.length ? search(weightedTerms(known))[0] : undefined;
    return {
      terms,
      known,
      anchored: known.filter((t) => anchors.has(t)),
      topScore: top ? Number(top.score.toFixed(2)) : 0,
      topChunk: top?.chunk.id,
    };
  }

  return { ask, scope, explain, size: chunks.length, chunks };
}

export type AskEngine = ReturnType<typeof createAsk>;
