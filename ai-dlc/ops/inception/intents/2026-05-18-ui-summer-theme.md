# Intent: Summer Theme UI

**Status:** Elaborated
**Date:** 2026-05-18
**Owner:** Sachith Perera

---

## What

Apply a summer-inspired visual theme across the CabinConnect frontend. The login screen gets a full-bleed summer cabin hero image. The site shell (header and footer) uses a darker shade of orange, with the main content area in a lighter complementary shade, creating a warm, seasonal feel consistent with the peak cabin booking season.

## Why

CabinConnect's primary booking season is summer. The current UI uses a generic neutral palette that does not reflect the warmth and outdoor character of the product. A summer theme reinforces the brand at the moment guests are most likely to be browsing and booking, improving first impressions and setting the right emotional tone.

## Success Looks Like

- A guest landing on the login page sees a full-bleed summer cabin photograph behind the sign-in card
- The header and footer are rendered in a consistent dark orange that is readable and accessible
- All content pages (dashboard, cabin detail, invite page) use the lighter orange mid-tone as their background
- The existing shadcn/ui components (buttons, cards, inputs, badges) are re-tinted to harmonise with the new palette without losing their utility
- No layout regressions — all pages remain usable at mobile and desktop widths

## Assumptions

- The summer cabin image will be a free-license photograph (e.g. Unsplash) selected during elaboration; no custom photography is required
- The color palette will be defined as CSS custom properties in `index.css` so the entire theme is controlled from one place
- Accessibility contrast ratios (WCAG AA) must be maintained for all text on colored backgrounds
- Header and footer text uses a dark orange (not white/cream) on the dark orange background — exact shade to be determined during elaboration
- The orange anchor color will be proposed and agreed during elaboration; no existing brand color to anchor from
- Dark mode is not in scope — the summer theme applies to light mode only

## Open Questions

- None

## Out of Scope

- Adding new UI components, pages, or features — this intent is visual changes only
- Cabin listing images or photo upload functionality
- Animations or motion design
- Changes to the backend or API layer
- Dark mode

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/ui-summer-theme/2026-05-18-session-1.md) | 2026-05-18 | 3 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| Summer Color Palette | [ui-summer-color-palette.md](../../build/units/ui-summer-color-palette.md) | Open |
| Login Hero Image | [ui-login-hero-image.md](../../build/units/ui-login-hero-image.md) | Open |
| Site Shell | [ui-site-shell.md](../../build/units/ui-site-shell.md) | Open |
