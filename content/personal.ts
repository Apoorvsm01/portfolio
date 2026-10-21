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
      src: "/work/good-roommate/process/now-cover-dishes.png",
      alt: "The shipped stopwatch cover on the folded iPhone Duo in landscape: 04:20 on the timer, Dishes, Done and Cancel buttons, and the washing-up bowl illustration, in the Duo bezel",
      caption: "The shipped cover on the Duo, in landscape.",
    } as Shot,
  },

  // Chapter 3: where the design is now (newest captures, framed in Apple's Duo bezel from the Figma file)
  now: {
    label: "03  Now",
    title: "Where the design is today.",
    body: "The app has moved a long way from the first scaffold. Up next ranks what is overdue, a running chore sits above the tab bar with its own timer, finishing one pays out a speed bonus, and three themes change the whole mood of the house.",
    lead: {
      left: {
        src: "/work/good-roommate/process/now-up-next.png",
        alt: "The Good Roommate on the folded iPhone Duo, Plum and Coral theme in light: Up next lists Dishes as overdue and aimed at by the camera, then five more chores, with the toolbar and tab bar in the side strip",
        caption: "Up next on the folded Duo, Plum · Coral, light. The camera is aimed at the most overdue chore.",
      } as Shot,
      right: {
        src: "/work/good-roommate/process/now-in-progress.png",
        alt: "The same Up next screen in the Lagoon theme in dark, with a running Dishes chore pill showing 04:20 above the bottom of the list",
        caption: "Lagoon, dark. Start a chore and its stopwatch rides along above the tab bar.",
      } as Shot,
    },
    more: [
      {
        src: "/work/good-roommate/process/now-celebration.png",
        alt: "The celebration screen on the folded Duo: +30 points, Dishes done, a 13 day streak saved for today, and a speed bonus line",
        caption: "Finish a chore: points, the streak, and a speed bonus.",
      },
      {
        src: "/work/good-roommate/process/now-theme-lagoon.png",
        alt: "Up next in the Lagoon theme, navy and azure, in dark",
        caption: "Lagoon: navy and azure.",
      },
      {
        src: "/work/good-roommate/process/now-theme-moss.png",
        alt: "Up next in the Moss theme, forest and lime, in light",
        caption: "Moss: forest and lime.",
      },
    ] as Shot[],
    cover: {
      src: "/work/good-roommate/process/now-cover-dishes.png",
      alt: "The folded iPhone Duo turned to landscape in tent mode: a stopwatch at 04:20, the chore Dishes, and the animated washing-up illustration, with the camera-hole corner kept clear",
      caption: "Tent mode on the outer screen: the stopwatch cover from the sketch, now the real thing.",
    } as Shot,
  },

  // Chapter 4: Version 1, kept as a small carousel
  v1: {
    label: "04  Version 1",
    title: "Where it started.",
    body: "Every version that changes the look gets its own folder of screenshots, a tag and a pull request, so the first scaffold still sits next to today's build.",
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
        version: "v0.1.0",
        name: "Leaderboard",
        shot: {
          src: "/work/good-roommate/process/v1-leaderboard.png",
          alt: "Version 0.1.0 leaderboard screen in system list styling",
          caption: "The leaderboard, still plain system lists.",
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
        version: "v0.2.0",
        name: "Leaderboard",
        shot: {
          src: "/work/good-roommate/process/v2-leaderboard.png",
          alt: "Version 0.2.0 leaderboard screen in the plum and coral palette",
          caption: "The leaderboard picks up the palette.",
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
    label: "05  How I work",
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
