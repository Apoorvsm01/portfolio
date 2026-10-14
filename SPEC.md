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

---

# v2 refinements (supersedes anything above that conflicts)

## R. Responsive layout
Check every page at 360, 390, 768, 834, 1024, 1280, 1440 and 1920px wide. None of them may show awkward empty bands,
images taller than the viewport, or headlines longer than 3 lines.

- **Container**: `max-width: 80rem`, side gutters `clamp(1rem, 4vw, 3rem)`. Define it once as a `.container-page`
  utility in globals.css and use it everywhere. No per-component `max-w-*` page wrappers.
- **Prose** width `42rem`. Long paragraphs never span the full container.
- **Fluid type** (CSS custom properties in globals.css, used by every heading):
  - `--step-hero: clamp(2.125rem, 1.4rem + 3.6vw, 5rem)`
  - `--step-h1: clamp(2.25rem, 1.5rem + 3vw, 4.25rem)`
  - `--step-h2: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)`
  - `--step-h3: clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)`
  - Body is `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`.
  - Headings use `text-wrap: balance`. Paragraphs use `text-wrap: pretty`.
- **Viewport units**: use `svh`/`dvh`, never `vh`, for anything sized to the screen (mobile browser bars).
- **Home hero**:
  - Below `lg` (1024px): single column, text first, then the portrait at `max-width: 22rem` and aspect 4:5, left-aligned.
    At `md` (768–1023px) the portrait sits beside the intro paragraph in a 7/5 grid *under* the full-width headline.
  - At `lg`+: a 12-column grid with the headline spanning all 12 columns at the top (2–3 lines max), the intro in
    columns 1–6 and the portrait in columns 8–12 (aspect 4:5, max height `70svh`).
  - The hero section is `min-height: calc(100svh - var(--nav-h))`, with content vertically centered from `lg`.
- **Case study at `lg`+**: a 12-column grid. The TOC is a sticky left rail (columns 1–3, `top: calc(var(--nav-h) + 2rem)`)
  and the article content takes columns 4–12. Below `lg` the TOC is a horizontal scrollable chip row under the facts.
- **Facts** use `grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr))`.
- **Work grid**: 1 column, then 2 from 768px. The first card spans 2 columns from 1280px (the editorial lead card).
- **Tap targets**: every link and button is at least 44×44px (use padding, not just font size), with at least 8px
  between targets.
- **Images**: always pass `width`/`height` from `imageDims(src)` (src/lib/content.ts) so the browser reserves space
  before load. Use `sizes` where the width is known.

## S. Semantic HTML (required)
- Pages: `header > nav`, `main#main`, `footer`. Each case-study page's `main` contains one `<article>` with its own
  `<header>` (tags, h1, lede, how-might-we).
- Every `<section>` has `aria-labelledby` pointing to its visible heading's `id`. Use `aria-label` only when there's
  no visible heading. Untitled case-study sections should be `<div>`s, not sections.
- Lists are lists:
  - The work grid is `ul > li > article` (the card heading is an `h3`, and the whole card is one link wrapping the
    heading text, using the "stretched link" pattern so there's no nested interactive content).
  - How I work is `ol`.
  - The timeline is `ol > li` with `<time datetime="YYYY">`.
  - Platforms and tags are `ul`.
  - Intent links are `ul`.
  - The TOC is `nav > ol`.
  - Prev/next is `nav` with `rel="prev"`/`rel="next"`.
- Facts are `<dl>` with `<div><dt><dd>` groups.
- Content images are `<figure><img></figure>`. Add a `<figcaption>` only when real caption text exists.
  Decorative images get `alt=""`.
- Headings never skip a level, and a heading block whose text equals its section label isn't rendered twice.
- Navigation uses `<a>`. Actions (theme toggle, copy email, menu, tabs) use `<button type="button">`.
- External links: `target="_blank" rel="noopener noreferrer"` plus a visually hidden "(opens in new tab)".
- The footer contact block is wrapped in `<address>`.
- Metadata: per-page `title`/`description`, Open Graph title/description/url, `<link rel="canonical">`,
  `theme-color` for both color schemes, and `color-scheme` set.
- No `div` with click handlers. No `role` attributes that duplicate a native element's role.

## M. Micro-interactions and motion
Motion should feel crafted, quick and physical. It must never block reading, and every effect turns off under
`prefers-reduced-motion: reduce`, falling back to the final state.

Tokens in globals.css:
- `--ease-out: cubic-bezier(.16,1,.3,1)`
- `--ease-in-out: cubic-bezier(.65,0,.35,1)`
- `--dur-1: 150ms`, `--dur-2: 250ms`, `--dur-3: 450ms`, `--dur-4: 700ms`
- Animate only `transform`, `opacity`, `clip-path` and `filter` (never layout properties).

1. **Links**: an underline grows from the left on hover/focus (`background-size` transition on a
   `linear-gradient(currentColor)` 1px underline). Arrows (→ ↗) nudge 3px in their direction on hover.
2. **Buttons/pills/chips**: hover tints the background, `:active` scales to .97, and the transition uses `--dur-1`.
3. **Nav**:
   - The header is transparent at the top of the page. After 8px of scroll it gets a blur, a background and a hairline
     border (toggled with a `data-scrolled` attribute).
   - It hides when scrolling down past 400px and reappears on any upward scroll (translateY, `--dur-3`). It is never
     hidden while focus is inside it.
   - The current page's link has `aria-current="page"` and an accent dot.
4. **Hero entrance** (on load only):
   - The headline animates word by word: each word slides up from a clipped line box (`translateY(100%)` → 0) with
     a 60ms stagger.
   - The real text stays in the DOM: wrap the visible words in `aria-hidden` spans and keep the full sentence in a
     visually hidden span inside the h1.
   - The intro fades in after the headline, and the portrait reveals with `clip-path: inset(100% 0 0 0)` → `inset(0)`.
5. **Portrait**: starts at 15% grayscale. On hover it goes to full color with a slight 1.02 scale. The pointer
   position adds a ±4° 3D tilt (rAF-throttled, desktop and fine pointers only).
6. **Intent picker**: the active pill is a single sliding highlight that moves between tabs (measure the active tab's
   offset, then animate `transform` and `width`). The answer panel crossfades and rises 6px when it changes.
7. **Work cards**:
   - On hover/focus-visible: the card lifts `translateY(-4px)`, the image scales to 1.04, the border warms to accent
     at 40% alpha, and a soft radial "spotlight" follows the pointer inside the card (CSS vars `--mx`/`--my` set in
     `pointermove`).
   - The ↗ arrow in the corner slides in.
8. **Scroll-driven effects** (CSS `animation-timeline: view()` inside `@supports (animation-timeline: view())`; with
   no support, show the static final state):
   - The featured image gets a subtle parallax (−6% → 6%).
   - The timeline gets a vertical progress line that draws as it scrolls past, and each item's dot fills when its row
     is centered.
   - Case-study images fade and scale in from .98.
9. **Platforms**: an infinite horizontal marquee of the pills that pauses on hover/focus. Under reduced motion it's a
   static wrapped list. The duplicated set for looping is `aria-hidden`.
10. **Case study**:
    - A 2px accent reading-progress bar sits under the nav (`animation-timeline: scroll(root)`).
    - The TOC highlights the section in view (an IntersectionObserver scrollspy, plus `aria-current="true"` on the
      active link).
    - Video and iframe frames show a shimmer skeleton until they load.
11. **Theme toggle**: the sun/moon icon morphs (rotate plus scale crossfade). The theme change uses
    `document.startViewTransition` with a circular `clip-path` reveal from the button's center when supported, and
    an instant change otherwise.
12. **Copy email**: next to the email in the footer, a button copies it to the clipboard. The icon swaps to a check
    and a "Copied" label appears for 2s (announced via an `aria-live="polite"` region).
13. **Images**: fade in from `opacity:0` on load (via an `onLoad` class swap in a small client component). They're
    visible by default when JavaScript is off.

---

# v3: navigation and visual blocks (supersedes anything above that conflicts)

## N. Information architecture and navigation
The site should be easy to move around, like voigt.work. Short pages with clear jumps, not one endless scroll.

**Routes**
- `/`: home, a short overview.
- `/work/`: index of all projects.
- `/work/<slug>/`: case studies.
- `/about/`: the story.
- `/404`.

**Home** (`/`), only these sections, in order:
1. Hero.
2. "What brings you here?" (IntentPicker).
3. Featured (Woven).
4. "Selected work": the first 4 entries of `site.work` as cards, plus a prominent "All projects (9) →" link to `/work/`.
5. "About" teaser: 2 lines from `site.hero.intro`, the 3 most recent timeline rows, and a "The long way here →" link to `/about/`.
6. Footer CTA.

How I work, the full Timeline and Platforms move to `/about/`. The home page must be at most about 4 screen heights at 1440×900.

**Work index** (`/work/`):
- h1 "Work".
- A filter bar of domain chips: All · Automotive · Spatial · Health. These are real `<button aria-pressed>` elements.
  The URL hash updates (`#automotive`) so a filtered view is linkable, and the initial hash is respected.
- The grid of all 9 `WorkCard`s, filtered client-side. Filtered-out cards animate out using the FLIP technique
  (opacity/transform only).
- An `aria-live="polite"` line announces "Showing N projects".
- Domains come from `site.work[].domain`.

**Global nav**:
- Name/logo on the left.
- Work, About, Contact (mailto) and LinkedIn on the right, plus a ⌘K button and the theme toggle.
- The current section is marked with `aria-current="page"` (`/work/*` counts as Work).
- Mobile: a full-height sheet menu with large links, opened by a button with `aria-expanded`. It closes on Escape
  and on route change, and focus is trapped inside while it's open.

**Command palette (⌘K / Ctrl+K, and `/`)**:
- A modal `<dialog>` with a search input and a listbox of every page: Home, Work, About, each case study (with its
  domain), each case-study section (`Study › Section` → `/work/slug/#section-n`), Email (copies the address) and
  LinkedIn.
- Fuzzy-ish matching: case-insensitive substring match on title and keywords.
- Full keyboard support: ↑/↓, Enter, Esc. Uses `aria-activedescendant`. Focus returns to the trigger on close.
- The nav shows a visible ⌘K hint button.

**Case-study navigation**:
- A breadcrumb (`nav aria-label="Breadcrumb"` > `ol`): Work › Study title.
- The sticky TOC rail stays on desktop, with the chip row below `lg`.
- At the end of the article, a large "Next project" card (cover image, title, blurb) linking to the next study,
  plus a smaller "Previous" link and "All work".
- The `j`/`k` keys jump to the next/previous section when focus isn't in a text field. Mention this in the TOC
  footer as a small hint.

**Back to top**: a small floating button appears after scrolling 1.5 screens. It is keyboard-accessible and
labelled.

## V. Visual case-study blocks
Case-study JSON can contain these block types in addition to the existing ones (see content/types.ts):
- `figure`: `{ type: "figure", image: Img, caption?: string, wide?: boolean }`. A single large image, such as a
  design-system spec card captured from Framer. `wide: true` lets it break out to the full container width on
  `lg`+. It renders in a `<figure>`, with a `<figcaption>` when there's a caption. On white-background captures in
  dark mode, give it a rounded frame and a 1px border so it doesn't glare.
- `metrics`: `{ type: "metrics", items: { value: string; label: string }[] }`. Render as a `<dl>` grid of stat tiles
  (big display-font value, small muted label): 2 columns on mobile, 4 from `md`. Values count up when scrolled into
  view, but only when the value is a plain number (strip it to digits for the animation and keep the original
  string as the final text). Reduced motion: no count-up.
- `widgets`: `{ type: "widgets", items: { title; subtitle; preview: Img; code: { swiftui; flutter; tailwind } }[] }`.
  Each item is an `<article>`:
  - The left column has the title, subtitle and the preview image on a dark stage.
  - The right column is a tablist (SwiftUI / Flutter / Tailwind) whose panel is a `<pre><code>` block with the code.
    It has a "Copy" button with "Copied" feedback, uses a monospace font, scrolls horizontally on overflow, and never
    wraps.
  - The last-chosen language syncs across all widgets on the page.
  - Two columns on `lg`+, stacked below.
