# Portfolio review, 2026-10-30

Overall: **7.0 / 10**. Strong craft and honest framing. The 390px mobile home page is broken, the case studies are too long to scan, and the SynCare numbers read as results.

| Lens | Score | Note |
|---|---|---|
| UX research (honesty, evidence) | 7 | Fleet Console's "what's real, what's assumed" section is exemplary. SynCare shows unlabeled targets as if they were results. |
| UX design (IA, story) | 6.5 | The 30-second test passes for Woven and Fleet Console and fails for SynCare. No TL;DR. Headings name phases instead of decisions. |
| Visual and motion | 8 | Distinctive type, motion that holds back, and reduced motion is respected. |
| Web development | 6.5 | Home overflows on mobile. Images are oversized and have no srcset. One prototype link is dead. |
| Copy | 7 | Clear first-person voice. One typo, a weak hero title, and the wrong location. |

## P0: fix first
1. **Mobile home is 790px wide on a 390 phone.** `.shelf-track` (globals.css ~L1915) blows its parent out. The back-to-top button sits off-screen and kickers are clipped. Fix: `min-width:0` on `.shelves`/`.shelf`, or `overflow-x:clip` on the wrapper.
2. **"New York, NY"** in content/site.ts:25, seo.ts:10 and :42, and ask.ts:260 (plus structured data).
3. **SynCare metrics read as results** (syncare-ai-health.json: 167, 179, 281, 332, 336, 383, 387). Label each "Target, not measured" or delete it. They also contradict study-meta.ts:102.
4. **Typo** "prescriptioins" (syncare json:387).

## P1
5. The Drive Coach live prototype (`apoorvsm01.github.io/hmi_ui/drive_coach`) returns 404. Source: woven.json:27-28.
6. The 70/40/80% figures sit next to Fleet Console links on the engineer and researcher entry points (site.ts:46-67). Remove those links or add "(Drive Coach)" to the figures.
7. Hero and `site.role`: change "UX Engineer" to "Senior Product Designer and UX Engineer", show the AI, health and B2B range, and split the dense intro into Problem / Role / Result.
8. Case studies are too long to scan. Adopt the Aashish template (below).
9. Tap targets under 44px on mobile: nav, carousel dots, work-index cards, chapter links, "Show full notes".
10. Nav: rename "Personal" to "Side projects" and add an "Email me" CTA.

## P2
11. Images are 2.4k–8.6k px wide (up to 13x their display width). Generate 1x and 2x WebP with srcset.
12. Some images are soft on 2x displays: woven/04 and 06-08, sitelens/03, 05 and 07, syncare/08, 10 and 12, good-roommate process images, and the headset photos.
13. The Ask input has no visible focus ring.
14. Vimeo embeds return 401 and there's a CSP "data:" warning, both seen in headless only. Check them in a real browser.
15. Small copy fixes: "More work" becomes "More case studies"; the SynCare description is empty; shorten the SynCare HMW; make the NDA disclaimer explicit; remove the DRAFT comments.

## Learned from the references
**Aashish Methani**, the case-study template to adopt:
- Each case study runs about 200–300 words, in this order: hero visual → meta row (role, years, one-line claim) → 2–3 sentence overview with outcome stat tiles → role → 2–3 decision blocks (each h2 is the problem or insight, followed by 2–3 sentences and a big visual) → a one-sentence caption per image → "Let's chat" CTA.
- Every project on the home page carries a one-line outcome claim.

**Rebecca Yang:**
- One positioning line in the largest type on the page.
- One easing curve, cubic-bezier(0.2,0.7,0.2,1), with durations of 0.2, 0.3, 0.6 and 0.9s.
- One distinctive device on the home page, with everything else quiet.
- Say plainly what's under NDA and offer to talk through the rest.

Both sites also design the mobile layout separately instead of shrinking the desktop one.

## Verified OK
- No content stays hidden in either motion mode, after a slow scroll or the End key.
- Internal links and the résumé PDF return 200.
- Alt text is present.
- The mobile menu opens and closes on Escape.
- The Ask box answers.
- The carousel works.
- Tab order is correct.
