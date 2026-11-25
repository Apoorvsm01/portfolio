"use client";

import { m } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { askCopy, featuredSlugs, shelfCopy, shelves, suggestedPrompts, type SuggestedPrompt } from "../../../content/ask";
import { site } from "../../../content/site";
import { seo } from "../../../content/seo";
import { brainCopy } from "../../../content/brain/copy";
import { facetGroups, facets, type FacetGroup } from "../../../content/brain/taxonomy";
import { matchFacets } from "../../lib/ask/corpus";
import { loadEngine } from "../../lib/ask/load";
import type { AskEngine } from "../../lib/ask/engine";
import type { AskResult, FacetCount, ScopeCheck, Strength } from "../../lib/ask/types";
import { classifyInput, fetchJobDescription } from "../../lib/jd";
import { FeaturedCarousel } from "../shelves/FeaturedCarousel";
import { Shelf } from "../shelves/Shelf";
import type { ProjectCard } from "../shelves/types";
import { AnswerPanel, RefusalPanel, ThinkingPanel } from "./AnswerPanel";
import { HomeChips } from "../motion/home-chips";
import { HomeMotion, useEnter } from "../motion/home-motion";
import { ScrollBlur } from "./ScrollBlur";
import { PromptBox } from "./PromptBox";
import KnowledgeGraph from "../graph/KnowledgeGraph";
import { buildGraph, highlightFor, sourceKeyFor, type GraphNode } from "../graph/model";
import { QueryBar } from "../brain/QueryBar";
import { StrengthControl } from "../brain/StrengthControl";
import { TopicIndex } from "../brain/TopicIndex";
import { emptyState, key, parseSearch, toFilterState, toSearch, type BrainState, type Token } from "../brain/state";
import { AtAGlance } from "../home/AtAGlance";
import { EvidenceCards } from "../home/EvidenceCards";
import { orderGroups } from "../home/order";
import { asset } from "../../lib/asset";
import { MatchView } from "../home/MatchView";
import { TopicsDialog } from "../home/TopicsDialog";
import { useDesktop } from "../home/useDesktop";
import { withoutOwnFilter, type Requirement } from "../charts/model";
import { splitClaim, yearOf } from "../brain/claims";

type Phase = "idle" | "thinking" | "answered" | "refused";
type Jd = { title?: string; company?: string; requirements: Requirement[]; nonce: number };

const known = Object.fromEntries(facetGroups.map((g) => [g, new Set(facets[g].map((e) => e.id))])) as Record<FacetGroup, Set<string>>;
const labelOf = (group: FacetGroup, id: string) => facets[group].find((e) => e.id === id)?.label ?? id;
const minLabel = (s: Strength | undefined) => brainCopy.strength.options.find((o) => o.value === s)?.label ?? "";
const ASK_MAX = 200;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// One headline word that rises in with the staged entrance. Plain text when JS is off or motion is reduced.
function Word({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  const { opacity, y } = useEnter(delay, 18);
  return (
    <m.span className={className} style={{ display: "inline-block", opacity, y }}>
      {children}
    </m.span>
  );
}

function Headline({ lead, accent, tail }: { lead: string; accent: string; tail: string }) {
  const leadWords = lead.trim().split(/\s+/).filter(Boolean);
  const fused = /^(\S*)([\s\S]*)$/.exec(tail) ?? [];
  const tailWords = (fused[2] ?? "").trim().split(/\s+/).filter(Boolean);
  const base = 0.14;
  const step = 0.05;
  const accentAt = leadWords.length;
  return (
    <>
      {leadWords.map((w, i) => (
        <span key={`${i}-${w}`}>
          <Word delay={base + step * i}>{w}</Word>{" "}
        </span>
      ))}
      <span style={{ whiteSpace: "nowrap" }}>
        <Word delay={base + step * accentAt} className="shimmer-text">
          {accent}
        </Word>
        {fused[1] && <Word delay={base + step * accentAt}>{fused[1]}</Word>}
      </span>
      {tailWords.map((w, i) => (
        <span key={`t${i}-${w}`}>
          {" "}
          <Word delay={base + step * (accentAt + 1 + i)}>{w}</Word>
        </span>
      ))}
    </>
  );
}

export function AskLanding({ projects }: { projects: ProjectCard[] }) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AskResult | null>(null);
  const [verdict, setVerdict] = useState<{ scope: ScopeCheck }>({ scope: "in" });
  const [pulse, setPulse] = useState(0);
  const [asked, setAsked] = useState(0);
  const [question, setQuestion] = useState("");
  const [engine, setEngine] = useState<AskEngine | null>(null);
  const [state, setState] = useState<BrainState>(emptyState);
  const [sourceKeys, setSourceKeys] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [jd, setJd] = useState<Jd | null>(null);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [showAllFor, setShowAllFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const jdNonce = useRef(0);
  const matchHeading = useRef<HTMLHeadingElement>(null);
  const desktop = useDesktop();

  const bySlug = useMemo(() => new Map(projects.map((p) => [p.slug, p])), [projects]);
  const pick = (slugs: string[]) => slugs.map((s) => bySlug.get(s)).filter((p): p is ProjectCard => Boolean(p));

  const warm = useCallback(() => {
    loadEngine().then(setEngine);
  }, []);

  // Load the retrieval engine as soon as the page is idle: the graph and the first question both wait on it.
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(warm, { timeout: 800 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(warm, 300);
    return () => clearTimeout(handle);
  }, [warm]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const graph = useMemo(() => (engine ? buildGraph(engine) : null), [engine]);

  // Live "is this about the portfolio?" hint while typing a short question.
  const kind = useMemo(() => classifyInput(query), [query]);
  useEffect(() => {
    if (!engine || kind.kind !== "ask") return;
    const t = setTimeout(() => setVerdict({ scope: engine.scope(kind.text) }), 200);
    return () => clearTimeout(t);
  }, [kind, engine]);
  const scope: ScopeCheck = kind.kind === "ask" ? verdict.scope : "empty";

  // ---------- filters (shared with the URL) ----------

  const filterState = useMemo(() => toFilterState(state), [state]);
  const filtered = useMemo(() => (engine ? engine.filter(filterState) : null), [engine, filterState]);

  // The graph's org-source nodes filter by source; that choice is local to the page, not part of the link.
  const bySource = useCallback(
    <T extends { chunk: Parameters<typeof sourceKeyFor>[1] }>(list: T[]): T[] => {
      if (!sourceKeys.length || !graph) return list;
      const wanted = new Set(sourceKeys);
      return list.filter((it) => wanted.has(sourceKeyFor(graph, it.chunk) ?? ""));
    },
    [sourceKeys, graph],
  );
  const items = useMemo(() => (filtered ? bySource(filtered.items) : null), [filtered, bySource]);
  // Charts with their own control count everything except what that control sets, so selecting never empties them.
  const strengthItems = useMemo(
    () => (engine ? bySource(engine.filter(withoutOwnFilter(filterState, "strength")).items) : null),
    [engine, filterState, bySource],
  );
  const skillItems = useMemo(
    () => (engine ? bySource(engine.filter(withoutOwnFilter(filterState, "skills")).items) : null),
    [engine, filterState, bySource],
  );
  const allGroups = useMemo(() => (engine && filtered ? engine.groupBySource(filtered.items) : []), [engine, filtered]);
  const groups = useMemo(() => (engine && items ? orderGroups(engine.groupBySource(items)) : []), [engine, items]);

  const search = toSearch(state);

  const applyUrl = useCallback((queryString: string) => {
    setState(parseSearch(queryString, known));
    setSourceKeys([]);
  }, []);

  const toggle = useCallback((group: FacetGroup, id: string) => {
    setState((s) => {
      const has = s.selected[group].includes(id);
      return {
        ...s,
        selected: { ...s.selected, [group]: has ? s.selected[group].filter((v) => v !== id) : [...s.selected[group], id] },
        added: has ? s.added.filter((k) => k !== key(group, id)) : [...s.added, key(group, id)],
      };
    });
  }, []);
  const toggleSource = useCallback((k: string) => setSourceKeys((cur) => (cur.includes(k) ? cur.filter((v) => v !== k) : [...cur, k])), []);
  const setMatch = useCallback((match: "all" | "any") => setState((s) => ({ ...s, match })), []);
  const setMin = useCallback((minStrength: Strength | undefined) => setState((s) => ({ ...s, minStrength })), []);
  const pickStrength = useCallback(
    (s: Strength) => setState((cur) => ({ ...cur, minStrength: s === "watched" || cur.minStrength === s ? undefined : s })),
    [],
  );

  const sourceLabel = useCallback((k: string) => graph?.nodes.find((n) => n.kind === "source" && n.key === k)?.label ?? k, [graph]);

  const tokens: Token[] = useMemo(() => {
    const out: Token[] = [];
    const order = [...state.added];
    for (const g of facetGroups) for (const id of state.selected[g]) if (!order.includes(key(g, id))) order.push(key(g, id));
    for (const k of order) {
      const cut = k.indexOf(":");
      const group = k.slice(0, cut) as FacetGroup;
      const id = k.slice(cut + 1);
      if (state.selected[group]?.includes(id)) out.push({ kind: "facet", group, id, label: labelOf(group, id) });
    }
    for (const k of sourceKeys) out.push({ kind: "source", key: k, label: brainCopy.results.sourceToken(sourceLabel(k)) });
    if (state.minStrength) out.push({ kind: "min", label: minLabel(state.minStrength) });
    if (state.q) out.push({ kind: "q", label: brainCopy.bar.textToken(state.q.length > 36 ? `${state.q.slice(0, 36).trimEnd()}…` : state.q) });
    return out;
  }, [state, sourceKeys, sourceLabel]);

  const removeToken = useCallback(
    (t: Token) => {
      if (t.kind === "facet") toggle(t.group, t.id);
      else if (t.kind === "source") toggleSource(t.key);
      else if (t.kind === "min") setMin(undefined);
      else setState((s) => ({ ...s, q: "" }));
    },
    [toggle, toggleSource, setMin],
  );

  const clearFilters = useCallback(() => {
    setState(emptyState());
    setSourceKeys([]);
    setJd(null);
  }, []);

  const facetCount = tokens.filter((t) => t.kind === "facet").length;
  const last = tokens[tokens.length - 1];

  // Shared link: read once on load (a static export has no search params at build time). `?q=` alone is the
  // per-application deep link, which asks that question; with filters it is the text filter of a shared link.
  const submitRef = useRef<(raw: string) => void>(() => undefined);
  useEffect(() => {
    const parsed = parseSearch(window.location.search, known);
    const hasFilter = facetGroups.some((g) => parsed.selected[g].length > 0) || Boolean(parsed.minStrength);
    const ask = !hasFilter && parsed.q ? parsed.q.trim().slice(0, ASK_MAX) : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(ask ? emptyState() : parsed);
    setHydrated(true);
    if (!ask) return;
    const id = setTimeout(() => {
      setQuery(ask);
      submitRef.current(ask);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search}${window.location.hash}`);
  }, [search, hydrated]);

  // ---------- the one input ----------

  const scrollTo = useCallback((id: string, focusHeading = true) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      if (focusHeading) el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    }, 0);
  }, []);

  const runJd = useCallback(
    (text: string, meta: { title?: string; company?: string } = {}) => {
      const found = matchFacets(text, facets);
      const requirements: Requirement[] = facetGroups.flatMap((g) => (found[g] ?? []).map((id) => ({ group: g, id })));
      if (requirements.length === 0) {
        setNotice(brainCopy.jd.noRequirements);
        return;
      }
      const next = emptyState();
      for (const { group, id } of requirements) {
        next.selected[group].push(id);
        next.added.push(key(group, id));
      }
      next.match = "any";
      setState((cur) => ({ ...next, minStrength: cur.minStrength }));
      setSourceKeys([]);
      clearTimeout(timer.current);
      setPhase("idle");
      setResult(null);
      setQuery("");
      setNotice("");
      jdNonce.current += 1;
      setJd({ ...meta, requirements, nonce: jdNonce.current });
    },
    [],
  );

  // Open the match view: scroll to it and move focus to its heading.
  const openedNonce = useRef(0);
  useEffect(() => {
    if (!jd || openedNonce.current === jd.nonce || !matchHeading.current) return;
    openedNonce.current = jd.nonce;
    scrollTo("match");
  }, [jd, scrollTo]);

  const ask = useCallback(
    async (q: string) => {
      clearTimeout(timer.current);
      setPhase("thinking");
      setResult(null);
      setQuestion(q);
      setPulse((n) => n + 1);
      setAsked((n) => n + 1);
      const e = await loadEngine();
      const wait = prefersReducedMotion() ? 0 : 700 + Math.min(500, q.length * 8);
      timer.current = setTimeout(() => {
        const r = e.ask(q);
        setResult(r);
        setPhase(r.status === "answer" ? "answered" : "refused");
      }, wait);
    },
    [],
  );

  const submit = useCallback(
    async (raw: string) => {
      const input = classifyInput(raw);
      setNotice("");
      if (input.kind === "empty") return;
      if (input.kind === "ask") {
        ask(input.text.slice(0, ASK_MAX));
        return;
      }
      if (input.kind === "jd") {
        runJd(input.text);
        return;
      }
      setBusy(true);
      setNotice(brainCopy.jd.fetching);
      const fetched = await fetchJobDescription(input.url);
      if (fetched) {
        setNotice("");
        runJd(fetched.text, { title: fetched.title, company: fetched.company });
      } else {
        // No endpoint, or the page could not be read: never a dead end.
        setNotice(brainCopy.jd.needsPaste);
        document.querySelector<HTMLTextAreaElement>(".ask-input")?.focus();
      }
      setBusy(false);
    },
    [ask, runJd],
  );
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const choose = useCallback(
    (p: SuggestedPrompt) => {
      setQuery(p.query);
      ask(p.query);
    },
    [ask],
  );

  const resetAsk = useCallback(() => {
    clearTimeout(timer.current);
    setPhase("idle");
    setResult(null);
    setQuery("");
    setNotice("");
  }, []);

  // "Ask something else": back to the empty box, ready to type.
  const reset = useCallback(() => {
    resetAsk();
    requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>(".ask-input")?.focus());
  }, [resetAsk]);

  // The default home page, used by the nav name: empty box, no filters, scrolled to the top.
  const goHome = useCallback(() => {
    resetAsk();
    clearFilters();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [resetAsk, clearFilters]);
  useEffect(() => {
    window.addEventListener("ask:reset", goHome);
    return () => window.removeEventListener("ask:reset", goHome);
  }, [goHome]);

  // "See every matching point" on an answer: apply those filters here and show the evidence.
  const openEvidence = useCallback(
    (queryString: string) => {
      applyUrl(queryString);
      setJd(null);
      scrollTo("evidence");
    },
    [applyUrl, scrollTo],
  );

  // ---------- derived view ----------

  const answer = result?.status === "answer" ? result : null;
  const matches = answer ? pick(answer.slugs) : [];
  const [lead, tail] = askCopy.greeting.split(askCopy.greetingAccent);
  const selectedChip = phase === "idle" ? null : (suggestedPrompts.find((p) => p.query === query)?.id ?? null);
  const identityEnter = useEnter(0, 10);
  const helperEnter = useEnter(0.5, 10);

  // What the graph lights: an answer's own topics and projects, else the current facet filters.
  const highlight = useMemo(() => {
    if (!graph) return null;
    if (answer) return highlightFor(graph, matchFacets(question, facets), answer.slugs);
    if (facetCount === 0) return null;
    const sources = (items ?? []).map((it) => sourceKeyFor(graph, it.chunk)).filter((k): k is string => Boolean(k));
    return highlightFor(graph, state.selected, sources);
  }, [graph, answer, question, facetCount, items, state.selected]);

  const selectedNodes = useMemo(() => {
    const out = new Set<string>();
    if (!graph) return out;
    for (const n of graph.nodes) {
      if (n.facet && state.selected[n.facet.group].includes(n.facet.id)) out.add(n.id);
      else if (n.kind === "source" && n.key !== undefined && sourceKeys.includes(n.key)) out.add(n.id);
    }
    return out;
  }, [graph, state.selected, sourceKeys]);

  const onGraphToggle = useCallback(
    (node: GraphNode) => {
      if (node.facet) toggle(node.facet.group, node.facet.id);
      else if (node.kind === "source" && node.key !== undefined) toggleSource(node.key);
    },
    [toggle, toggleSource],
  );

  const counts = useMemo(() => {
    const map = new Map<string, FacetCount>();
    if (engine && topicsOpen) for (const c of engine.facetCounts(filterState)) map.set(key(c.group, c.id), c);
    return map;
  }, [engine, filterState, topicsOpen]);

  const showAll = showAllFor === search + sourceKeys.join(",");
  const points = items?.length ?? 0;

  const buildSummary = useCallback(() => {
    const lines = (items ?? []).slice(0, 12).map((it) => {
      const { claim } = splitClaim(it.chunk);
      const year = yearOf(it.chunk);
      return `- ${claim} (${it.chunk.label}${year ? `, ${year}` : ""})`;
    });
    return `${lines.join("\n")}\n\n${brainCopy.bar.summaryLink} ${window.location.href}`;
  }, [items]);

  // Each project shows once below the evidence: the carousel first, then each shelf takes what is left.
  const shown = new Set<string>(pick(featuredSlugs).map((p) => p.slug));
  const shelfRows = shelves.map((s) => {
    const rows = pick(s.slugs).filter((p) => !shown.has(p.slug));
    rows.forEach((p) => shown.add(p.slug));
    return { ...s, items: rows };
  });

  return (
    <HomeMotion>
      <section
        className="home-hero"
        aria-labelledby="home-title"
        onKeyDown={(e) => {
          if (e.key === "Escape" && phase !== "idle") reset();
        }}
      >
        <div className="home-graph">
          {graph ? (
            <KnowledgeGraph graph={graph} highlight={highlight} selected={selectedNodes} onToggle={onGraphToggle} portrait={asset(site.hero.image.src)} legend={brainCopy.graph.legend} />
          ) : (
            <div className="home-graph-placeholder" role="status">
              <span className="sr-only">{brainCopy.graph.loading}</span>
            </div>
          )}
        </div>
        <div className="home-copy container-page">
          <m.div className="home-identity" style={{ opacity: identityEnter.opacity, y: identityEnter.y }}>
            <p className="home-eyebrow">
              {site.name} <span aria-hidden="true">·</span> {seo.roleLine}
            </p>
            <p className="ask-status">
              <span className="ask-status-dot" aria-hidden="true" />
              {seo.status}
            </p>
          </m.div>
          <h1 id="home-title" className="ask-greeting">
            <Headline lead={lead} accent={askCopy.greetingAccent} tail={tail} />
          </h1>
          <PromptBox value={query} onChange={setQuery} onSubmit={() => submit(query)} onFirstTouch={warm} scope={scope} busy={phase === "thinking" || busy} notice={notice} />
          <HomeChips prompts={suggestedPrompts} onPick={choose} disabled={phase === "thinking"} selectedId={selectedChip} />
          <m.ul className="ask-proof" aria-label="At a glance" style={{ opacity: helperEnter.opacity, y: helperEnter.y }}>
            {site.hero.proof.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </m.ul>

          {phase !== "idle" && question && (
            <p className="ask-question">
              <span className="ask-question-label">{site.askEchoLabel}</span> {question}
            </p>
          )}
          {phase === "thinking" && <ThinkingPanel />}
          {phase === "answered" && answer && (
            <AnswerPanel key={asked} result={answer} matchCount={matches.length} onPick={choose} onStreaming={() => undefined} onReset={reset} onOpenEvidence={openEvidence} />
          )}
          {phase === "refused" && result?.status === "refused" && <RefusalPanel key={asked} result={result} onPick={choose} onReset={reset} />}
        </div>
      </section>

      {pulse > 0 && <div key={pulse} className="edge-glow" aria-hidden="true" />}

      <div className="home-brain">
        {jd && items && (
          <MatchView
            ref={matchHeading}
            title={jd.title}
            company={jd.company}
            requirements={jd.requirements}
            items={items}
            groups={allGroups}
            onClose={() => setJd(null)}
          />
        )}

        <AtAGlance
          items={items}
          strengthItems={strengthItems}
          skillItems={skillItems}
          minStrength={state.minStrength}
          onPickStrength={pickStrength}
          onClearStrength={() => setMin(undefined)}
          selectedSkills={state.selected.skills}
          onToggleSkill={(id) => toggle("skills", id)}
        />

        <QueryBar
          count={items ? points : null}
          tokens={tokens}
          onRemove={removeToken}
          onClear={clearFilters}
          buildSummary={buildSummary}
          compact={!desktop}
          match={state.match}
          facetCount={facetCount}
          onMatch={setMatch}
          start={
            <button type="button" className="brain-button" onClick={() => setTopicsOpen(true)} aria-haspopup="dialog">
              {brainCopy.topics.summary}
            </button>
          }
          end={<StrengthControl value={state.minStrength} onChange={setMin} />}
        />
        <section id="evidence" className="home-section container-page" aria-labelledby="evidence-title">
          <h2 id="evidence-title" tabIndex={-1} className="home-h2">
            {brainCopy.results.heading}
          </h2>
          {items ? (
            <EvidenceCards
              groups={groups}
              points={points}
              showAll={showAll}
              onShowAll={() => setShowAllFor(search + sourceKeys.join(","))}
              lastLabel={last?.label}
              onRemoveLast={() => last && removeToken(last)}
              onClear={clearFilters}
              anyFilter={tokens.length > 0}
              match={state.match}
              facetCount={facetCount}
              onMatchAny={() => setMatch("any")}
            />
          ) : (
            <div className="ev-grid ev-grid--loading" role="status">
              <span className="sr-only">{brainCopy.results.loading}</span>
            </div>
          )}
        </section>
      </div>

      <TopicsDialog open={topicsOpen} onClose={() => setTopicsOpen(false)}>
        <TopicIndex counts={counts} selected={state.selected} onToggle={toggle} ready={engine !== null} />
      </TopicsDialog>

      <div className="container-page">
        <ScrollBlur>
          <FeaturedCarousel projects={pick(featuredSlugs)} />
        </ScrollBlur>
        <div className="shelves">
          {matches.length > 0 && (
            <ScrollBlur key={`matches-${asked}`}>
              <Shelf id="ask-matches" title={shelfCopy.matchesTitle} kicker={shelfCopy.matchesKicker} projects={matches} matches enter />
            </ScrollBlur>
          )}
          {shelfRows.map((s) => (
            <ScrollBlur key={s.id}>
              <Shelf id={`shelf-${s.id}`} title={s.title} kicker={s.kicker} projects={s.items} />
            </ScrollBlur>
          ))}
        </div>
      </div>
    </HomeMotion>
  );
}
