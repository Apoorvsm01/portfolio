# Code Review: Foundation & Layout Shell

## Real Bugs

- **high** `src/components/Nav.tsx:33`: The navigation links to `/about/`, but `src/app/about/page.tsx` does not exist in the repository, resulting in a 404 broken link. Create `src/app/about/page.tsx` to satisfy the route.
- **medium** `src/components/Nav.tsx:27`: The navigation links to `/#work`, but `src/app/page.tsx` contains no element with `id="work"`, leaving the anchor link without a scroll target. Add `id="work"` to the work section container on `src/app/page.tsx`.
- **medium** `src/components/ThemeToggle.tsx:36`: `getServerSnapshot` unconditionally returns `"dark"`, which forces the server-rendered HTML to output dark-mode button attributes and an icon that flashes upon hydration for users with light mode stored in `localStorage`. Defer rendering theme-specific markup until mounted on the client or supply a neutral placeholder during SSR.
- **low** `src/components/ThemeToggle.tsx:22`: The `storage` event listener notifies subscribers but never updates `document.documentElement`'s `data-theme` attribute, causing cross-tab theme changes to be ignored by `getSnapshot`. Update `document.documentElement.setAttribute("data-theme", event.newValue)` inside the storage event listener before triggering subscribers.

## Accessibility Problems

- **medium** `src/app/layout.tsx:74`: The document body omits a skip-to-content link, preventing keyboard and screen reader users from bypassing the persistent navigation header. Add a visually hidden, focusable skip link pointing to `#main` as the first child of `<body>`.
- **medium** `src/components/Nav.tsx:62`: The mobile menu toggle references `aria-controls="mobile-nav"`, but the target element is conditionally unmounted when closed, creating an invalid ARIA reference to a non-existent DOM node. Render `<nav id="mobile-nav">` unconditionally using the HTML `hidden={!isOpen}` attribute.
- **medium** `src/components/Nav.tsx:8`: The mobile disclosure menu lacks an `Escape` key listener, focus trapping, and focus restoration to the toggle button upon closing. Add keyboard dismissal on `Escape` and restore focus to the toggle button when closed.
- **medium** `src/components/ThemeToggle.tsx:54`: The theme toggle button lacks an `aria-pressed` attribute, preventing assistive technologies from recognizing and announcing its binary toggle state. Add `aria-pressed={theme === "dark"}` to the button.
- **low** `src/components/ContactCTA.tsx:6`: The component defines a `<section aria-label="Contact call to action">` landmark with an `<h2>` that is nested inside the global `<footer>` landmark (`Footer.tsx:10`), disrupting landmark structure. Replace the `<section>` tag with a semantic `<div>` or move `ContactCTA` out of `<footer>` into the page content flow.
- **low** `src/components/ThemeToggle.tsx:64`: The button defines an `aria-label` while also enclosing `<span className="sr-only">Toggle theme</span>`, rendering the inner text node redundant because `aria-label` overrides it. Remove the inner `<span className="sr-only">Toggle theme</span>` element.
- **low** `src/components/Nav.tsx:66`: The mobile menu toggle defines `aria-label="Toggle navigation menu"` while also enclosing an identical `<span className="sr-only">Toggle navigation menu</span>`, duplicating accessible name declarations. Remove the redundant inner `<span className="sr-only">` element.

## Deviations from SPEC.md

- **high** `src/app/page.tsx:5`: `Home` only renders an `h1` headline and omits all eight spec-mandated sections: Hero (two columns, portrait, intro), IntentPicker, Featured study, Work grid with `id="work"`, How I work, Timeline, Platforms, and Footer CTA. Implement the eight required Home sections and components in order according to SPEC.md lines 75–91.
- **medium** `src/app/page.tsx:6`: The `h1` uses discrete Tailwind breakpoint classes `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` instead of the spec-mandated fluid scale `clamp(2.5rem, 6vw, 4.75rem)`. Replace the discrete classes with `text-[clamp(2.5rem,6vw,4.75rem)]`.
- **medium** `src/components/ContactCTA.tsx:10`: The `h2` uses discrete Tailwind classes `text-2xl sm:text-3xl md:text-4xl` instead of the spec-mandated fluid scale `clamp(1.75rem, 3.5vw, 2.75rem)`. Replace the discrete classes with `text-[clamp(1.75rem,3.5vw,2.75rem)]`.
- **low** `src/components/ContactCTA.tsx:8`: The component uses vertical padding `py-16 md:py-20` instead of the spec-mandated section vertical spacing of `py-24 md:py-32`. Update padding to `py-24 md:py-32`.
- **low** `src/components/Nav.tsx:56`: On mobile viewports, `ThemeToggle` is rendered outside the disclosure menu in the header bar rather than collapsing inside the disclosure menu as specified in SPEC.md. Move `ThemeToggle` inside the mobile disclosure menu.
