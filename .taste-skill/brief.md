# Redesign brief (tasteskill run, 2026-10-30)

Direction dealt: **split-stage** (seed 314991949). Full sheet: `node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`.
Before-measurements: `.taste-skill/before/` (12 FAIL, 8 WARN; lint 119 FAIL).

## Idea
On this page, **the car's centre screen, which a driver may glance at for 2 seconds**, becomes **the sticky stage**: the fixed half always shows the work in view (real screenshots and footage), and the reading column beside it is short enough to take in at a glance.
Live thing: keep the existing **Ask** box (answers only from site content). Restyle it flat. It is the one interactive moment, not the hero's decoration.

## What the references taught (apply, don't copy)
- Aashish Methani: every project carries a **one-line outcome claim** next to company, role and years. Case studies are short and follow one fixed template: hero visual → meta row (company · role · years · one-line claim) → 2–3 sentence overview with outcome figures (only where real) → role → 2–3 **decision blocks** whose h2 states the problem or insight, followed by 2–3 sentences and one large visual with a one-sentence caption → closing "Let's talk" action. Quiet dark ground. On phones the layout is recomposed as a stack, not shrunk.
- Rebecca Yang: **one positioning line in the largest type on the page**. One easing curve site-wide: `cubic-bezier(0.2, 0.7, 0.2, 1)`, durations 200 / 300 / 600 / 900 ms.

## Palette (dealt proportions, colours taken from the subject: a test car at night)
```
--bg: #1b1a17 (asphalt)  --surface: #25231f  --ink: #ece7da  --muted: #a69e8d
--accent: #e0a030 (sodium streetlight / turn signal, on the main action + active index item only)
--field-1: #e0a030 / ink #1b1a17 (one band, once)   --field-2: #4f5a1c / ink #ece7da (optional, once)
```
Light theme: drop it (one theme; remove the theme toggle) unless removal breaks something.

## Type
One face: **Clash Grotesk** 400/500 (fontshare CSS link from the sheet, or self-host). Remove Geist, Bricolage, Newsreader, Mona Sans, Instrument Serif. Five steps only: small 13–14, body 17–19, lead 20–26, head 32–64, display (hero line ~6–8vw, two lines max). Display tracking -0.03em, leading 0.95.

## House rules (inspector-enforced)
No eyebrows / pill badges, no monospace, no 01/02/03, no hairlines or 1px outlined boxes, no gradients (incl. gradient text, the orb, glow ring), no shadows at rest, no glass/backdrop blur, no italic accent word, no tiny caps labels, no card grids, ≤5 font sizes, ≥13px text, paragraphs ≤ 60ch, equal margins, h1 on first screen, heading on every section, no empty screens.

## Pages
- **Home**: hero = left column: name as h1 + positioning line (largest type), one sentence, one action ("See the work"), then Ask box; right = sticky stage photo/video of Drive Coach. Then **work: small index, large picture** — project rows (company · role · years · one-line claim) on the left; the sticky picture on the right crossfades (1.6s) to the project in view. Then about (letter), contact (one field / email), footer (photo half, menu half). Break the split once with a full-width section.
- **Case study**: the Aashish template above, built from existing content/study-meta (tldr, claim, facts). Keep all real content reachable; long sections may move under a "Full notes" disclosure. Honesty: Fleet Console has no metrics; SynCare numbers are targets; Reach has no numbers; 70/40/80% belong to Drive Coach only.
- Nav: plain bar — wordmark, Work, Side projects, About, Résumé, one action (Email me). No pill, no blur.

## Keep
Routes, basePath, Ask logic + tests (56), résumé PDF, reduced-motion support, sitemap/SEO, View Transitions if harmless.
