# Portfolio site spec

Apoorv Mahajan's portfolio. It's a fully static Next.js 16 site (App Router, TypeScript, Tailwind CSS v4) built
with `output: "export"`. The layout is inspired by voigt.work: an editorial, narrative, single-column feel with
generous whitespace and dark mode by default. Never copy voigt.work's text, images or code.

**Read before coding:** `AGENTS.md`. This Next.js version differs from older ones, so check
`node_modules/next/dist/docs/` for any API you're unsure of. `LayoutProps<"/">` / `PageProps<"/work/[slug]">` are
global types in this version.

## Hard rules
- **All text comes from `content/site.ts` and `content/case-studies/*.json`.** Never hard-code copy in components,
  and never invent copy, metrics or links.
- Types: `content/types.ts`. Import JSON with `import data from "@/../content/case-studies/x.json"`, or build a loader in
  `src/lib/content.ts` that imports all 9 JSON files statically. Don't use `fs` at runtime.
- Static export only: no cookies, headers, route handlers, `next/image` optimization (it's set to `unoptimized`), or
  server actions. Dynamic routes need `generateStaticParams` and `export const dynamicParams = false`.
- Server Components by default. Add `"use client"` only for real interactivity (theme toggle, intent picker,
  mobile menu, scroll-reveal).
- No new npm dependencies without being asked. No animation libraries; use CSS transitions plus a small
  IntersectionObserver hook.
- Accessibility: semantic landmarks, one `h1` per page, a visible focus ring, `alt` text from the data,
  `prefers-reduced-motion` turns off all motion, color contrast of at least 4.5:1.
- Responsive: mobile-first, works at 360px wide, 16px side gutters on mobile, no horizontal page scroll.

## Design tokens (`src/app/globals.css`, Tailwind v4 `@theme`)
Fonts load with `next/font/google` in `src/app/layout.tsx`:
- `Bricolage_Grotesque` → `--font-display` (headings, weight 500–700, tight tracking `-0.02em`)
- `Mona_Sans` → `--font-sans` (body, UI)
- `Newsreader` → `--font-serif` (italic accents: the "How might we" line, pull quotes, small editorial labels)

Colors are CSS variables on `:root` (dark is the default) and on `[data-theme="light"]`:

| token | dark | light |
|---|---|---|
| `--bg` | `#0e0f0f` | `#f6f4ef` |
| `--surface` | `#17191a` | `#ffffff` |
| `--text` | `#ecebe6` | `#1a1a19` |
| `--muted` | `#9a9a94` | `#5f5e59` |
| `--line` | `#2a2c2d` | `#e2dfd7` |
| `--accent` | `#e8b86b` (warm amber) | `#9a5b00` |

Expose them to Tailwind with `@theme inline { --color-bg: var(--bg); ... }` so classes like `bg-bg`,
`text-muted` and `border-line` work.

Scale and spacing:
- Content max width 72rem; prose max width 40rem.
- Section vertical spacing `py-24 md:py-32`. Card radius 20px; image radius 16px.
- Type: h1 `clamp(2.5rem, 6vw, 4.75rem)` display font; h2 `clamp(1.75rem, 3.5vw, 2.75rem)`; body 1.0625rem/1.65.
- Small caps-style labels: `text-xs uppercase tracking-[0.14em] text-muted`.

Motion: an element with `data-reveal` fades and rises 12px when it enters the viewport (600ms, ease-out, staggered
by `--i`). Off under reduced motion.

## Routes and files
```
src/app/layout.tsx              fonts, metadata (from site.ts), <Nav/>, <Footer/>, theme bootstrap script (no flash)
src/app/page.tsx                home
src/app/work/[slug]/page.tsx    case study (generateStaticParams from all JSON; generateMetadata from title/description)
src/app/about/page.tsx          story: longer timeline + how I work + platforms
src/app/not-found.tsx
src/lib/content.ts              getAllStudies(), getStudy(slug), studyHref(slug) => `/work/${slug}/`
src/components/                 Nav, Footer, ThemeToggle, Reveal, IntentPicker, WorkCard, Timeline, HowIWork,
                                PlatformStrip, ContactCTA, case-study/{Hero, Facts, SectionBlock, ImageGrid,
                                CardGrid, VimeoEmbed, PrototypeEmbed, StudyNav}
```

## Global chrome
- **Nav** (sticky, blurred `--bg` at 80% opacity, bottom border `--line`): the name on the left links to `/`. On the right:
  Work (`/#work`), About (`/about/`), Contact (`mailto:`), LinkedIn, and the ThemeToggle. On mobile these collapse into a
  disclosure menu.
- **Footer**: ContactCTA (`site.cta`), email, LinkedIn, GitHub, `© {year} Apoorv Mahajan`, and `site.disclaimer`
  in small muted text.

## Home (`/`), in order
1. **Hero**: two columns on desktop (text left, portrait right, `site.hero.image`, rounded, slight grayscale that
   clears on hover). Shows the h1 `site.hero.headline` and `site.hero.intro`.
2. **"What brings you here?"**: `IntentPicker`, client-side. Three pill buttons from `site.intents` (an ARIA tablist).
   The selected one shows its `answer` plus link chips to each slug in `links` (chip label = study title). The first
   intent is selected by default.
3. **Featured** (`site.featured`): label "Woven by Toyota" plus the Woven logo `/me/woven-logo.png` (small, inverted
   in dark mode). Then the headline, the summary, a large image (first hero image of the featured study), a
   "Read the case study" link, and a row of 3 mini cards for `related` slugs (title + first hero image or first section
   image + blurb from `site.work`).
4. **Work** (`id="work"`): a grid of `WorkCard`s for `site.work` (2 columns desktop, 1 mobile). Each card: a 16:10 cover
   image (the study's first hero image, else its first image anywhere), the org label if set, the title, the blurb,
   and up to 3 tags. The whole card is a link.
5. **How I work**: `site.howIWork`, numbered 01–04, in a 2×2 grid.
6. **The long way here**: `site.timeline` as a vertical timeline (years in the left column, role/org/note right).
7. **Platforms**: `site.platforms` as a wrapped row of outlined pills, plus `site.platformsNote` in serif italic.
8. Footer CTA.

## Case study (`/work/[slug]/`)
1. **Hero**: a back link "← All work" (to `/#work`), tags as small pills, the h1 title, the `description` as the lede,
   then "How might we" in serif italic followed by `hmw` (skip if empty).
2. **Facts**: a definition-list row (`facts`, 3–5 columns desktop, stacked mobile). Values split on `\n` into lines.
3. **Prototype** (if `prototype`): a lazy-loaded iframe of `prototype.embed` in a 16:10 rounded frame with a border,
   plus an "Open the interactive prototype ↗" link to `prototype.link ?? prototype.embed`.
4. **Hero images**: if 1, show it full-bleed in the content width (max 75vh tall); if more than 1, use a horizontal
   scroll-snap strip of fixed height `min(60vh, 560px)`, each image at its natural aspect ratio (max 85vw wide), so
   portrait phone screenshots and landscape shots both fit the viewport.
5. **Table of contents**: links to each labelled section (`#section-<index>`). Hide it when there are fewer than 3
   labelled sections.
6. **Sections**: each one has a label (small caps-style label, `id="section-<index>"`) and renders `blocks` in order:
   - `heading` → h3 display font
   - `paragraph` → prose paragraph
   - `list` → bulleted list. If an item has the form `Term: rest`, render `Term` bold.
   - `images` → 1 image: full width; 2: 2-column grid; 3+: responsive grid. Clicking does nothing (no lightbox).
   - `cards` → a grid of small surface cards (label bold, value muted, `\n` → line breaks)
   - `video` → a Vimeo iframe `https://player.vimeo.com/video/{id}?autoplay=1&muted=1&loop=1&background=1`,
     16:9, lazy
   - `embed` → like the prototype iframe
   - An empty `label` means no label is shown.
7. **StudyNav**: previous/next study links (order = `site.work` order with `woven` first) and the ContactCTA.

## About (`/about/`)
- h1 "About". A paragraph built from `site.hero.intro`, then the full `Timeline`, `HowIWork` and `PlatformStrip`.
  No new copy.
