# Page & Component Review

## Real Bugs

- High | src/components/IntentPicker.tsx:61 | Inactive tab buttons set `aria-controls` to IDs of tabpanels that are not rendered in the DOM because only the active panel is mounted. Either render all tabpanels with `hidden={!isSelected}` or only apply `aria-controls` to the mounted panel.
- Medium | src/app/not-found.tsx:21 | The link text reads "All work" but the `href` points to `/` (home hero) rather than `/#work`. Update the `href` to `/#work` or change the link text to "Return home".
- Medium | src/components/WorkCard.tsx:62 | The section anchor target `id="work"` has no `scroll-mt` offset, causing the section top to be obscured behind the 64px sticky navbar when navigated to via `/#work`. Add `scroll-mt-20` or `scroll-mt-24` to the section element.
- Medium | src/components/case-study/SectionBlock.tsx:131 | The Vimeo iframe `title={`Video ${block.vimeoId}`}` uses an uninformative numeric ID rather than describing the video content. Provide a descriptive title incorporating the section label or study title.
- Medium | src/components/case-study/SectionBlock.tsx:144 | The embed iframe uses a generic placeholder `title="Interactive embed"`. Set a specific title that reflects the embedded content or case study context.

## Accessibility Problems

- High | src/components/case-study/SectionBlock.tsx:25 | In case studies where a section has an empty label (`label: ""`), no `<h2>` is rendered, causing child heading blocks (`<h3>`) to skip heading level 2 directly under the page `<h1>`. Render the first heading block in an untitled section as an `<h2>` or provide a visually hidden `<h2>`.
- High | src/components/IntentPicker.tsx:78 | The `role="tabpanel"` element is missing `tabIndex={0}`, preventing keyboard users from tabbing into the panel content as required by the WAI-ARIA tablist pattern. Add `tabIndex={0}` to the tabpanel container.
- High | src/components/Featured.tsx:44 | The featured study image is wrapped in an interactive `<Link>` that has `tabIndex={-1}` and `aria-hidden="true"`, violating ARIA rules against hiding interactive elements and blocking keyboard navigation. Remove `tabIndex={-1}` and `aria-hidden="true"` from the link element.
- Medium | src/components/Featured.tsx:65 | Link text "Read the case study" is non-descriptive out of context for screen reader users browsing link lists. Add an `aria-label={`Read the case study: ${featuredStudy?.title ?? site.featured.headline}`}` to the link.
- Medium | src/components/Featured.tsx:94 | Mini card thumbnails specify `alt={image.alt || title}` inside a link already containing `<h3>{title}</h3>`, resulting in duplicate title announcements by screen readers. Set `alt=""` on the card thumbnail image.
- Medium | src/components/WorkCard.tsx:23 | Cover image specifies `alt={cover.alt || title}` inside a link that already contains `<h3>{title}</h3>`, causing repetitive screen reader announcements. Set `alt=""` on the cover image inside the link.
- Medium | src/components/case-study/SectionBlock.tsx:58 | Case study section images fall back to empty alt text (`alt=""`) because data files omit alt text, hiding informative mockups and diagrams from screen readers. Provide a contextual fallback alt text based on the section label or study context.
- Low | src/components/Featured.tsx:19 | The logo image has `alt="Woven by Toyota"` immediately next to text rendering the exact same organization name, creating redundant announcements. Set `alt=""` on the logo image.
- Low | src/components/IntentPicker.tsx:53 | Tab `<button>` elements omit an explicit `type="button"` attribute. Add `type="button"` to each tab button element.
- Low | src/components/case-study/PrototypeEmbed.tsx:37 | Link text "Open the interactive prototype" lacks context identifying which study prototype is being opened. Add an `aria-label={`Open the interactive prototype for ${title}`}` to the link.

## SPEC Deviations

- Medium | src/components/case-study/HeroImages.tsx:43 | Multi-image horizontal scroll strip sizes items using `h-[min(60vh,560px)] max-w-[85vw]` rather than the explicit dimensions specified in SPEC.md. Apply `w-[70vw] md:w-[32rem] aspect-[16/10]` to each image card.
- Medium | src/app/work/[slug]/page.tsx:67 | The case study page flow omits `ContactCTA` adjacent to or within `StudyNav`, deviating from SPEC.md section 7. Render `<ContactCTA />` after `<StudyNav />` in the case study page layout.
- Low | src/components/case-study/SectionBlock.tsx:12 | The list item renderer wraps `{term}:` inside `<strong>`, whereas SPEC.md line 106 specifies bolding only `Term` in `Term: rest`. Move the colon outside the `<strong>` element.
- Low | src/components/case-study/index.ts:1 | `ImageGrid`, `CardGrid`, and `VimeoEmbed` are inlined in `SectionBlock.tsx` rather than implemented as separate component files listed in SPEC.md. Extract these blocks into dedicated component files under `src/components/case-study/`.
- Low | src/components/Hero.tsx:7 | Vertical section padding `py-20 md:py-28` deviates from the global section spacing token `py-24 md:py-32` specified in SPEC.md. Change padding classes to `py-24 md:py-32`.
- Low | src/components/IntentPicker.tsx:40 | Vertical section padding `py-20 md:py-28` deviates from the global section spacing token `py-24 md:py-32` specified in SPEC.md. Change padding classes to `py-24 md:py-32`.

## Invented Copy

- Low | src/components/Featured.tsx:111 | Mini cards include hard-coded "View study" link text not present in `content/site.ts` or SPEC.md line 83-84. Remove the "View study" label element.
- Low | src/components/WorkCard.tsx:65 | Heading text "Selected Work" is invented copy, whereas SPEC.md line 85 and `content/site.ts` specify "Work". Update the heading text to "Work".
- Low | src/components/IntentPicker.tsx:42 | Heading text "What brings you here?" is hard-coded into the component rather than sourced from `content/site.ts`. Move the heading copy into `content/site.ts`.
