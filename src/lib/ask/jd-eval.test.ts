// Evaluation: does the second-brain filter surface the right work for a job description?
// Run: node --test src/lib/ask/jd-eval.test.ts   (Node 22.18+ strips types natively)
//
// The JD flow mirrors the recruiter UI: requirements = matchFacets(jd, facets), then the filter runs in "any" mode
// on those facets and the grouped results are read from the top. `expect` lists source keys (case-study slug, or
// org / source label for evidence); a case passes when at least one of them is in the top 6 groups.
// Cases that miss a reasonable expectation are test.todo, with their assertion still running, so a miss is visible
// in the output without failing the suite.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createAsk } from "./engine.ts";
import { matchFacets } from "./corpus.ts";
import { site } from "../../../content/site.ts";
import { studyMeta } from "../../../content/study-meta.ts";
import { personal } from "../../../content/personal.ts";
import * as askContent from "../../../content/ask.ts";
import { facets } from "../../../content/brain/taxonomy.ts";
import type { CaseStudy } from "../../../content/types.ts";
import type { Evidence, FilterState } from "./types";

const readJson = <T>(dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(new URL(f, dir), "utf8")) as T }));

const studies = readJson<CaseStudy>(new URL("../../../content/case-studies/", import.meta.url)).map((f) => f.data);
// Real approved evidence, so the expected orgs (Patched Reality, Crazy Minds, DePaul, Omnia) are present.
// Nothing here reaches the public page; the test only reads the index.
const evidence = readJson<Evidence[]>(new URL("../../../content/brain/evidence/", import.meta.url)).flatMap((f) => f.data);

const config = {
  copy: askContent.askCopy,
  suggestedPrompts: askContent.suggestedPrompts,
  topics: askContent.topics,
  synonymGroups: askContent.synonymGroups,
  stopwords: askContent.stopwords,
  blockedWords: askContent.blockedWords,
  blockedPhrases: askContent.blockedPhrases,
  offTopicPatterns: askContent.offTopicPatterns,
  injectionPatterns: askContent.injectionPatterns,
};

const engine = createAsk({ site, studies, studyMeta, personal, config, taxonomy: facets, evidence });

const TOP = 6;

function runJd(jd: string) {
  const requirements = matchFacets(jd, facets);
  const state: FilterState = {
    roles: requirements.roles ?? [],
    skills: requirements.skills ?? [],
    domains: requirements.domains ?? [],
    platforms: requirements.platforms ?? [],
    methods: requirements.methods ?? [],
    match: "any",
  };
  const detected = Object.values(requirements).reduce((n, list) => n + (list?.length ?? 0), 0);
  const groups = engine.groupBySource(engine.filter(state).items);
  return { requirements, detected, groups, topKeys: groups.slice(0, TOP).map((g) => g.key) };
}

const describeTop = (r: ReturnType<typeof runJd>) => r.topKeys.join(", ");

type Case = { role: string; jd: string; minRequirements: number; expect: string[]; todo?: boolean };

const cases: Case[] = [
  {
    role: "Automotive HMI designer",
    minRequirements: 4,
    expect: ["woven", "fleet-console"],
    jd: "We are a mobility company building the next generation of in-vehicle experiences. We need an HMI designer to shape infotainment and instrument cluster interfaces for our production vehicles. You will design interaction flows for the center display and heads-up display, define touch and steering-wheel controls, and prototype in Figma. You will run driving simulator studies and usability testing with drivers to keep eyes-on-road time low. Experience with CarPlay, Android Auto, or automotive design guidelines is a plus. Familiarity with cognitive load and driver distraction research is valued.",
  },
  {
    role: "In-car voice UX designer",
    minRequirements: 3,
    expect: ["woven"],
    jd: "Our automotive team is building a conversational assistant for drivers. As a voice UX designer, you will write dialogue flows, design wake-word and error recovery behaviour, and define how the assistant pairs voice with the in-vehicle display. You will work with speech engineers on intent design, prototype multimodal interactions, and run Wizard of Oz sessions in a driving simulator. Strong sense of voice interaction design, prompt writing, and testing with real drivers is essential. Experience with voice assistants or conversational AI products is required.",
  },
  {
    role: "Vision Pro spatial designer",
    minRequirements: 3,
    expect: ["omniabrowser", "spatialshowroom", "how2to", "Omnia"],
    jd: "A consumer software studio is looking for a spatial designer to craft apps for visionOS. You will design windows, volumes and immersive spaces for Apple Vision Pro, define gaze and pinch interactions, and set comfort guidelines for depth and motion. You will prototype in Reality Composer or Unity, and test with headset users. Strong experience with spatial computing, 3D layout, and ergonomic design is required. Familiarity with RealityKit and Swift is a plus.",
  },
  {
    role: "Meta Quest VR healthcare designer",
    minRequirements: 3,
    expect: ["Patched Reality"],
    jd: "A digital health startup is building immersive therapy experiences on Meta Quest 3 for patients in rehabilitation. We are hiring a VR product designer to design exercise scenes, onboarding for older users, and clinician dashboards. You will prototype interactions, define comfort and motion sickness safeguards, and run usability sessions with patients and therapists. Experience with Meta Quest, Unity, and healthcare product work is required. Knowledge of accessibility standards for medical devices is a plus.",
  },
  {
    role: "UX researcher (qualitative)",
    minRequirements: 4,
    expect: ["DePaul"],
    jd: "We are seeking a UX researcher to lead qualitative studies for our payments platform. You will plan interview guides, run contextual inquiry and field observations, and synthesise findings with affinity mapping and thematic analysis. You will build personas and journey maps, and present insights to product leaders. Experience with usability testing, think-aloud protocols, and research synthesis is essential. Comfort with participant recruitment and research repositories is a plus.",
  },
  {
    role: "UX researcher (quantitative, surveys, statistics)",
    minRequirements: 4,
    expect: ["DePaul"],
    jd: "Our product analytics group needs a UX researcher focused on quantitative methods. You will design large-scale surveys, run A/B testing and statistical analysis in SPSS or R, and build regression and confidence interval models to explain user behaviour. You will report SUS and task-success benchmarks, and partner with designers on experiment design. Strong background in statistics, survey methodology and quantitative analysis is required. Experience with dashboards and data visualization is a plus.",
  },
  {
    role: "Design systems designer",
    minRequirements: 3,
    expect: ["Omnia"],
    jd: "A scale-up is building a unified design system across web and iOS. We need a design systems designer to own design tokens, component libraries and documentation. You will define theming for light and dark modes, maintain Figma component libraries with variants and auto layout, and work with engineers on code parity. You will set accessibility standards, run design critique sessions, and drive adoption across product teams. Experience with design tokens and component libraries is required.",
  },
  {
    role: "UX engineer (React and TypeScript)",
    minRequirements: 4,
    expect: ["Omnia", "woven"],
    jd: "We are hiring a UX engineer to bridge design and engineering on our React and TypeScript codebase. You will prototype interactions in code, build accessible components, and translate Figma designs into production interfaces. You will improve micro-interactions and motion, write tests, and collaborate with product designers on design systems. Strong skills in React, TypeScript, CSS, and interaction design are required. Experience with Next.js and Figma is a plus.",
  },
  {
    role: "Front-end developer",
    minRequirements: 3,
    expect: ["Omnia", "Portfolio site"],
    jd: "Our growing team needs a front-end developer to build customer-facing web apps. You will implement responsive layouts in HTML, CSS and JavaScript, integrate REST APIs, and improve page performance and accessibility. You will work with designers in Figma to deliver pixel-accurate interfaces and maintain our component library. Strong experience with React or Next.js, TypeScript and modern CSS tooling is required. Familiarity with testing and web performance is a plus.",
  },
  {
    role: "Healthcare product designer",
    minRequirements: 3,
    expect: ["syncare-ai-health"],
    todo: true,
    jd: "A telehealth company is looking for a product designer to improve patient and clinician experiences. You will design scheduling, intake and medical record flows for iOS and web. You will run usability testing with patients, define accessibility standards aligned with WCAG, and prototype in Figma. You will collaborate with clinicians and engineers, and map end-to-end patient journeys. Experience designing healthcare or wellness products is required.",
  },
  {
    role: "Fintech product designer",
    minRequirements: 3,
    expect: ["Crazy Minds"],
    jd: "A banking startup is hiring a product designer to design its mobile app for payments, savings and budgeting. You will own end-to-end flows from research to high-fidelity prototypes in Figma, define interaction patterns for money movement, and collaborate with engineers on delivery. You will run A/B tests and usability studies, and shape the design system for our iOS and web products. Experience in fintech, banking, or payments products is required.",
  },
  {
    role: "AI product designer",
    minRequirements: 3,
    expect: ["woven"],
    jd: "An AI company is building LLM-powered assistants for enterprise teams. We need an AI product designer to design conversational interfaces, agent workflows and evaluation tools. You will prototype generative AI experiences, write prompt-based flows, define how the model explains its confidence, and run user testing with knowledge workers. Experience designing AI or machine learning products, and familiarity with LLMs, is required. Comfort with Figma and rapid prototyping is expected.",
  },
  {
    role: "Motion designer and video producer",
    minRequirements: 3,
    expect: ["Crazy Minds"],
    jd: "Our brand studio needs a motion designer and video producer for social campaigns and product films. You will storyboard concepts, shoot and edit short video in Premiere Pro or DaVinci Resolve, and produce 2D animation and motion graphics in After Effects. You will manage a small crew, direct talent on set, and deliver final cuts with colour grading and sound. A portfolio of short films, animation or video editing is required.",
  },
  {
    role: "Generalist product designer (seed-stage startup)",
    minRequirements: 4,
    expect: ["Omnia"],
    jd: "We are a seed-stage startup and need a generalist product designer who can do it all. You will run user interviews, map journeys, sketch wireframes, design high-fidelity UI in Figma, and ship prototypes to users within days. You will set up our first design system, write microcopy, and work directly with founders on product strategy. Experience with user research, interaction design and prototyping is required. A background in front-end development is a bonus.",
  },
];

for (const c of cases) {
  const run = c.todo ? test.todo : test;
  run(`${c.role}: at least ${c.minRequirements} requirements, and ${c.expect.join(" or ")} in the top ${TOP}`, () => {
    const r = runJd(c.jd);
    assert.ok(r.detected >= c.minRequirements, `detected ${r.detected} requirements: ${JSON.stringify(r.requirements)}`);
    assert.ok(
      c.expect.some((key) => r.topKeys.includes(key)),
      `expected one of [${c.expect.join(", ")}] in top ${TOP}; got [${describeTop(r)}]`,
    );
  });
}

test("SRE (Kubernetes): the portfolio does not pretend to match an unrelated role", () => {
  const r = runJd(
    "Our platform team is hiring a site reliability engineer to run our backend services on Kubernetes. You will manage clusters on AWS, write Go and Python services for deployment automation, build observability with Prometheus, and respond to on-call incidents. You will define SLOs, tune autoscaling, and harden CI pipelines. Strong experience with Linux, Terraform and distributed systems is required. Experience with database operations and PostgreSQL is a plus.",
  );
  const shippedInTop3 = r.groups.slice(0, 3).some((g) => g.strongest === "shipped");
  assert.ok(
    r.detected < 3 || !shippedInTop3,
    `detected ${r.detected} requirements and shipped evidence in top 3: [${r.groups.slice(0, 3).map((g) => `${g.key}[${g.strongest}]`).join(", ")}]`,
  );
});
