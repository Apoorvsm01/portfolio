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
- A modal `<dialog>` with a search input and a listbox of the top-level destinations only: Home, Work, About,
  each case study (with its domain), Email (copies the address) and LinkedIn. Case-study sections are not listed
  (the chapter bar and ↑/↓ cover in-page navigation).
- Fuzzy-ish matching: case-insensitive substring match on title and keywords.
- Full keyboard support: ↑/↓, Enter, Esc. Uses `aria-activedescendant`. Focus returns to the trigger on close.
- The nav shows a visible ⌘K hint button.

**Case-study navigation**:
- A breadcrumb (`nav aria-label="Breadcrumb"` > `ol`): Work › Study title.
- The sticky TOC rail stays on desktop, with the chip row below `lg`.
- At the end of the article, a large "Next project" card (cover image, title, blurb) linking to the next study,
  plus a smaller "Previous" link and "All work".
- The ↓/↑ arrow keys (no modifiers) jump to the next/previous section. They do nothing when focus is in a
  text field, a tablist, a listbox, an open dialog, or a code block. With no section to jump to, the arrows scroll
  normally. Mention this in the TOC footer as a small hint.

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

---

# v4: editorial design language (supersedes anything above that conflicts)
Modelled on the *approach* of voigt.work. Never copy its text, images or code. Copy now lives in
`content/site.ts` (new fields: `hero.display`, intent `flag`/`headline`/`bullets`, `featured.lede`/`chapters`,
`howIWorkIntro`, `timelineIntro`, timeline `flag`, `flags`) and `content/study-meta.ts` (claim, band, flag, facts,
outcomes per study). Use those fields; the old ones stay only for compatibility.

## C. Colour
These replace the earlier palette. Dark is the default. A light theme still exists, but its "paper" values are
the same ones the paper bands use.
- `--ground #12110f` (warm ink), `--surface #1b1916`, `--surface-2 #26231f`, `--rule #2b2823`, `--fg #f1ece3`,
  `--fg-2 #c9c2b5`, `--muted #a39c8f`, `--focus #9ad0ff`.
- **Paper band**: `--paper #ede7db`, `--paper-ink #171513`, `--paper-muted #5c564c`, `--paper-rule #d6cfc1`.
- **Accent** = `flags.amber` (`#f5a524`), used for primary buttons, the nav current-page marker and link underlines.
- **Flags** (`site.flags`) colour the intent doors, org chips in the timeline, and the per-study accent.
- **Bands**: full-bleed sections can be `ink` (the default), `paper` (light: How I work and the About teaser), or
  a study `band` colour (the Featured section uses `studyMeta.woven.band`; every case-study page uses its study's
  band for the hero and facts area).
- Band changes are hard edges, with no gradients between bands.

## T. Type
- **Display/headlines**: Mona Sans, weight 900, `font-variation-settings: "wdth" 112`, tracking −0.025em,
  line-height 0.95–1.05. Load Mona_Sans with `axes: ["wdth"]`.
  - `hero.display` ("I’m Apoorv") is huge: `clamp(4rem, 12vw, 11.5rem)`.
  - h2 is `clamp(2rem, 1.4rem + 2.2vw, 2.75rem)`.
- **Subheads, tagline, UI, buttons, labels**: Bricolage Grotesque 500–700.
  - The tagline (`hero.headline`) is `clamp(1.375rem, 1.1rem + 1vw, 1.75rem)`, weight 500.
  - Section intro lines are the same size.
- **Body paragraphs**: Newsreader (serif), 400, `clamp(1.0625rem, 1rem + .3vw, 1.1875rem)`, line-height 1.6,
  colour `--fg-2` on ink and `--paper-ink` on paper.
- **Labels** (facts table, timeline years, captions): Bricolage at 13–14px, colour `--muted`, sentence case. No
  uppercase tracking labels any more.
- **Links in prose**: underlined, `text-decoration-color: var(--flag or accent)`, thickness .08em → .22em on hover,
  `text-underline-offset: .18em`.

## L. Layout and shape
- Max width 110rem (1760px). Gutter `clamp(1.25rem, 5vw, 6rem)`. Section rhythm `--step: clamp(4.5rem, 9vw, 8.5rem)`
  of vertical padding.
- Radius 6px everywhere: cards, images, buttons. The only exception is pill buttons (intent doors, ghost buttons),
  which are fully round.
- Rows are separated by 1px `--rule` hairlines, not boxed cards: facts tables, timeline rows, chapter rows, how-I-work
  steps.
- Cards (team-style or project cards) are `--surface` with a 3px top border in the item's flag colour, and no
  shadow.

## H. Home
1. **Hero** (ink band, 2 columns from lg):
   - The left column has `hero.display` (giant), then the tagline (`hero.headline`), then `hero.intro` in serif
     (max 36rem).
   - The right column has the portrait (aspect 4:5, radius 6px).
   - Below both: "What brings you here?" and the three **doors**, which are pill buttons with a 1px border.
   - Hover on a door: the border turns `--fg`.
   - Selected door: it fills with its flag colour and the text turns the flag's ink. `aria-pressed` reflects this
     and selection toggles.
   - **Signature effect when a door is selected:**
     1. The portrait takes a duotone of that flag (CSS: grayscale + a `mix-blend-mode: multiply` overlay in the flag
        colour, cross-fading at 320ms).
     2. The giant name becomes a window onto the portrait: `background-clip: text` with the portrait image as the
        background, positioned to align with the photo. It cross-fades in over ~320ms with `--ease-settle`.
     3. With no door selected, the name is solid `--fg`.
   - **Panel**: below the doors, a 2-column panel with a 3px top rule in the flag colour. The left side has the
     intent `headline` (h3, Mona Sans 900), the `bullets` as an unordered list with 10px square markers in the flag
     colour, then links to `links` studies (underline in the flag colour). The right side shows the first linked
     study's cover image with a caption of that study's `claim`. The panel animates in with the settle keyframe.
   - With no door selected, no panel shows (this keeps the hero short).
2. **Featured** (band = `studyMeta.woven.band`, full-bleed):
   - The left side has the org label plus logo, the h2 `featured.headline`, the `featured.lede` paragraphs (serif),
     then the `chapters` as hairline-separated rows (bold underlined `term` link on the left, `line` on the right),
     then a solid amber button "Open the case study" and a text link "All projects".
   - The right side has the featured image (radius 6px).
3. **Selected work** (ink): a 2×2 grid of cards (cover 4:3, title in Mona Sans 900 ~1.5rem, the study's `claim` as
   the blurb, org label). Each card has a 3px top border in its study flag. Hover: the border goes to `--fg` and the
   image brightens slightly. No lift, no spotlight.
4. **How I work** (paper band):
   - The left side has the h2 plus `howIWorkIntro`, then an ol of the 4 steps. Each step has a 28px filled circle in
     the accent with its number in ink, a title in Bricolage 700, and the body in serif. Rows are separated by
     paper-rule hairlines.
   - The right side has a photo with a caption (use `/work/woven/01.jpg`, caption = `studyMeta.woven.claim`).
5. **About teaser** (ink): "The long way here" h2, `timelineIntro`, the 3 newest timeline rows (see the timeline
   style below), and a "The long way here →" link to /about/.
6. **Footer CTA** (ink): the `cta.headline` h2 big, `cta.body` in serif, a solid amber "Email me" button (mailto) and
   a ghost "LinkedIn" button. Then a hairline, then a bottom row with © year · location · GitHub · disclaimer
   (small).

## Timeline style (about page and teaser)
Each row is a hairline-separated grid with three parts:
- years (muted, small, left)
- role (Mona Sans 900, ~1.75rem)
- org chips on the right: a 10px square in the org's flag plus the org name, muted
The `note` sits below the role in serif, muted. Newest first.

## K. Case study
- **Band**: the hero area (breadcrumb, title, claim, facts, outcomes, chapter links) sits on the study's `band`
  colour, full-bleed. The article body below returns to ink.
- **Hero**:
  - The left side has the title (Mona Sans 900, h1 size), `claim` as the tagline, and the **facts table**
    (`studyMeta.facts`): a `dl` of hairline rows, with the label in a 7rem muted column and the value in serif.
  - The right side has the first hero image with a caption.
  - The old Framer facts and tags render below as a small muted line, or not at all if they duplicate.
- **Outcomes** (if present): the `outcomes.title` h2, then a 4-column row. Each item shows a big Mona Sans 900 value,
  with "from → to" rendered as `from` + " → " + `value`, and the label below in small muted text. Then `note` in
  small muted text. Count-up is removed; the numbers are static.
- **Chapters**: replace the sticky TOC rail with an inline wrap of underlined chapter links (in the study flag
  colour) under the hero, plus a compact sticky "chapter bar" that appears under the nav after scrolling past the
  hero.
  - The chapter bar is a single horizontal row: the current chapter name plus prev/next arrow buttons plus a
    "Chapters" disclosure that opens the full list. It keeps the scrollspy and the ↑/↓ keyboard behaviour.
- **Section headlines** stay as they are (Framer copy). Body paragraphs switch to serif.
- **End**: the "Next project" card and the CTA, as before.

## M2. Motion: restrained and quick (replaces section M where they conflict)
Remove: the hero word-by-word animation, the portrait tilt, the card pointer spotlight, the card lift, the platform
marquee (it becomes a static wrapped list), featured parallax, metric count-up, and the image fade-in on scroll
(keep only the load fade).

Keep and standardise:
- Tokens: `--ease-settle: cubic-bezier(.2,.7,.2,1)`. Hovers run 120–160ms (colour, border-color, background-color,
  `text-decoration-thickness`).
- **Settle**: a single entrance keyframe `settle { from { opacity:0; transform: translateY(6px) } }`, 260ms,
  ease-out. Apply it to Reveal (replacing the 12px/600ms version), panels and the chapter bar. No stagger longer
  than 40ms.
- Buttons: `:active { transform: translateY(1px) }`. No scale.
- Nav: keep the scrolled state and hide-on-scroll-down, but use the new colours.
- Theme toggle: keep the circular view transition.
- Door selection effects as described in H. The name window and duotone cross-fade at 320ms `--ease-settle`.
- Focus ring: `outline: 3px solid var(--focus); outline-offset: 3px; box-shadow: 0 0 0 6px var(--ground)` (use
  `--paper` for the shadow on paper bands).
- Reduced motion: no settle, instant states.

---

# v5: process bento, prototype frame, logo (supersedes earlier sections where they conflict)

## Motion vocabulary (borrowed from samsara.design's approach, not its code)
- `--ease-out-expo: cubic-bezier(.22,1,.36,1)` for physical motion (flips, lifts, wipes). `--ease-settle` stays
  for small UI changes.
- **Buttons**: background transitions over 350ms `--ease-out-expo`. The arrow (→ ↗) inside slides 4px over 500ms,
  so it trails the background slightly.
- **Underline wipe** for primary text links: a 1px underline drawn with `clip-path: inset(0 100% 0 0)` →
  `inset(0)` over 600ms on hover/focus. On leave it wipes out to the right.
- **Lift**: interactive tiles go `translateY(-4px)` with a long soft shadow
  `0 30px 50px -30px rgb(0 0 0 / .55)` over 600ms `--ease-out-expo`.
- **Staggered entrance**: grid items rise 12px and fade in, with `--beat: 60ms` per item (index via `--i`).
- Reduced motion: none of the above. States change instantly.

## B. Process bento (`bento` block, see content/types.ts BentoTile)
- **Grid**: 5 tiles. On lg+: a 6-column grid, where tile 1 spans 3 columns × 2 rows (the lead), tiles 2–3 span
  3 columns × 1 row, and tiles 4–5 span 3 columns × 1 row on a second row (or, if it reads better, 2/2/2 for the last
  three). On md: 2 columns, with the lead spanning 2. Mobile: 1 column. Gap 12px. Tiles are at least 180px tall
  (the lead at least 372px).
- **Each tile is a sticky note**: a `<li>` containing a `<button aria-expanded>` (so it works with touch and the
  keyboard, not just hover).
  - The **base** (underneath) is a paper-coloured card (`--paper`, `--paper-ink`) with the tile's `condensed`
    text in serif, plus the number "01"–"05" in small mono.
  - The **cover** (on top) is a note in the study's flag colour (with ink text from `site.flags[flag].ink`). It
    shows the number, the `title` in Mona Sans 900, and a small "↻" or "Peek" hint at the bottom right.
  - The cover sits on the base with a 1–2° rotation (alternating sign per tile) and a soft shadow, like a sticky note.
- **Opening** on hover (fine pointers), focus-visible, or click/tap (toggles `aria-expanded`):
  - The cover peels up from its **top edge**: `transform-origin: top center`,
    `transform: perspective(1200px) rotateX(-180deg)` over 800ms `--ease-out-expo`, with `backface-visibility:
    hidden`.
  - The cover's back face is a slightly darker tint of the flag, so you see the back of the note mid-flip.
  - The shadow deepens while it lifts.
  - The base content does a small settle (opacity .6 → 1, 4px) after 200ms.
  - Closing reverses the motion.
  - Only one tile is open at a time when opened by click. Hover opens independently.
- **Accessibility**:
  - The `title` lives inside the button.
  - The `condensed` text is in the DOM, linked with `aria-controls`/`id`, and read by screen readers whether or not
    the note is open (`aria-hidden` is never set on it).
  - Each full `source` text is available in a visually hidden element after the condensed text, so nothing is lost
    to assistive tech.
  - Below the grid, a "Show full notes" disclosure (`<details>`) lists every tile's title plus its full `source`
    blocks for sighted readers who want the long version.
- Reduced motion: no flip. Opening crossfades the cover's opacity to 0 over 150ms.

## P. Prototype frame
- The iframe wrapper uses `aspect-ratio: var(prototype.aspect, 16/10)`, with no padding and no letterbox bars. The
  background is `#000` (the prototype's own). It has a radius of 6px and a 1px `--rule` border, at full container
  width.
- Above the frame, a header row has a small "Interactive prototype" label on the left. On the right is a **prominent
  solid button**: accent background, flag ink, Bricolage 600 at 1rem, min height 48px, padding 0 20px, the label
  "Open the interactive prototype" plus a ↗ arrow that slides on hover, and an sr-only "(opens in a new tab)". It
  links to `prototype.link ?? prototype.embed`.
- The shimmer skeleton stays until the iframe loads.

## Logo
The Woven logo PNG has a white background baked in. Never apply a CSS filter to it. Show it on a white plate:
`background: #fff`, radius 4px, padding 4px 8px, height ~28px, in both themes.
