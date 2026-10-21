// Copy and media for the /personal page ("Personal projects"). Facts come from the Good Roommate repo
// (docs/discussion-log.md, docs/screenshots/README.md, CLAUDE.md, linear/project-import.md) and the
// Linear project "The Good Roommate". Nothing here is a metric the project does not state.

export type Shot = { src: string; alt: string; caption: string };

export const personal = {
  kicker: "Personal projects",
  title: "Designing for hardware before it ships",
  intro:
    "Outside work I take a product from the first sketch to the App Store build. The Good Roommate is the one I am designing for iPhone Duo, Apple's foldable, and the page below follows how it got made.",

  hero: {
    eyebrow: "The Good Roommate",
    headline: "A camera-first chore app that folds with the phone.",
    video: "/work/good-roommate/demo-1.mp4",
    poster: "/work/good-roommate/demo-1-poster.jpg",
    videoLabel: "Demo of The Good Roommate on iPhone Duo",
    facts: [
      { label: "My part", value: "Product, UX, UI and the prompts. Claude Code wrote the Swift." },
      { label: "Platforms", value: "iPhone Duo and every iPhone, iOS 27" },
      { label: "Status", value: "In progress, started October 2026" },
    ],
  },

  // Chapter 1: the drawing, then the Figma frame it became
  sketch: {
    label: "01  Sketch",
    title: "It starts on paper.",
    body: "The Duo's outer screen is small and has a camera hole in one corner, so I drew the stopwatch cover by hand first: the timer top left, the chore drawn big on the right, and room kept clear for the lens. Washing dishes and vacuuming were the first two.",
    left: {
      src: "/work/good-roommate/process/sketch-dishes-vacuum.png",
      alt: "Hand-drawn sketch in Procreate of two folded-Duo cover screens, Washing dishes and Vacuum, each with a stopwatch box and a drawing of the chore",
      caption: "Procreate sketch: Washing dishes and Vacuum, with the stopwatch box.",
    } as Shot,
    right: {
      src: "/work/good-roommate/process/figma-cover-landscape.png",
      alt: "The Figma frame for the landscape stopwatch cover: Stopwatch 04:20, the chore Dishes, buttons Done and Cancel, a washing-up bowl and tap illustration, and the camera-hole corner marked with a dashed box",
      caption: "The same screen in Figma at 678 by 466, with the lens corner cut out.",
    } as Shot,
  },

  // Chapter 2: Figma motion graphic to shipped screen
  shipped: {
    label: "02  Design to build",
    title: "Figma first, then the app.",
    body: "Each chore illustration is drawn in Figma with editable layers and keyframes, then ported into SwiftUI. I would sooner argue with a frame in Figma than with a build.",
    left: {
      src: "/work/good-roommate/process/figma-cover-landscape.png",
      alt: "Figma frame of the landscape stopwatch cover for the Dishes chore",
      caption: "Figma: Screens v1.2, the Dishes cover.",
    } as Shot,
    right: {
      src: "/work/good-roommate/process/shipped-cover-dishes.png",
      alt: "The shipped stopwatch cover on iPhone Duo in the simulator, Lagoon theme: 04:20 on the timer, Dishes, Done and Cancel buttons, the washing-up bowl illustration, and white outlines marking the safe zone and the camera-hole corner",
      caption: "The shipped cover in the Duo simulator, Lagoon theme. The white outlines are the safe zone.",
    } as Shot,
  },

  // Chapter 3: V1, V2, V3
  evolution: {
    label: "03  Versions",
    title: "Every version stays viewable.",
    body: "Each version that changes the look gets its own folder of screenshots, a tag and a pull request, so I can put the first scaffold next to today's build and see what actually changed.",
    steps: [
      {
        version: "v0.1.0",
        name: "Scaffold",
        shot: {
          src: "/work/good-roommate/process/v1-camera.png",
          alt: "Version 0.1.0 camera screen: system lists, emoji avatars and a transparent icon tab bar",
          caption: "System lists, emoji avatars, a transparent icon tab bar.",
        } as Shot,
      },
      {
        version: "v0.2.0",
        name: "First design pass",
        shot: {
          src: "/work/good-roommate/process/v2-camera.png",
          alt: "Version 0.2.0 camera screen from the first design pass: plum and coral palette, reticle and an Aiming at pill",
          caption: "Plum and coral palette, a reticle and an Aiming at pill, from the Figma canvas.",
        } as Shot,
      },
      {
        version: "v0.3.0",
        name: "Screens v1.1",
        shot: {
          src: "/work/good-roommate/process/v3-camera.png",
          alt: "Version 0.3.0 camera screen: one column, an aim chip in the bottom stack, tinted Liquid Glass",
          caption: "Camera as one column, tinted Liquid Glass, Bricolage Grotesque and Figtree.",
        } as Shot,
      },
    ],
  },

  // Chapter 4: how it was made. Statuses are the project's own (Linear: The Good Roommate).
  workflow: {
    label: "04  How I work",
    title: "My decisions, a tight loop of tools.",
    body: "I run product, UX, UI and the build in conversation with Claude Code. The decisions and the design are mine; the tools keep each step small, written down and reversible.",
    steps: [
      {
        tool: "Linear",
        role: "Plan",
        points: [
          "The project has five planning milestones, from discovery to the build spec, then a milestone for each build, starting with v0.5.0.",
          "Every idea is logged first, then accepted or parked, and becomes an issue with a priority.",
          "I imported the plan through the Linear MCP, so the repo's plan and the board stay the same document.",
        ],
        mine: "What the product is, what is in scope, what to park.",
      },
      {
        tool: "Figma",
        role: "Design",
        points: [
          "Screens live on versioned pages: Screens, Screens v1.1 and Screens v1.2.",
          "A Foundations page holds the type and color; the code uses the same roles.",
          "Through the Figma MCP, Claude Code can read a frame and its layers instead of guessing from a screenshot.",
        ],
        mine: "Every screen, the sketches, the motion, the layout rules for Duo.",
      },
      {
        tool: "Claude Code",
        role: "Build",
        points: [
          "It writes the SwiftUI and the tests from the decisions logged in CLAUDE.md and the docs.",
          "Each version is a branch, screenshots on iPhone and Duo, a tag, and a pull request.",
          "The pull request is mine to review and merge.",
        ],
        mine: "The prompts, the review, and the call on whether it looks right.",
      },
    ],
  },

  versionsNote:
    "The ideas log, the discussion log and the plan all live in the repo, so the next session starts from what was decided rather than from memory.",

  next: {
    title: "Also built on my own time",
    slug: "just-fill-it",
  },
};
