# Intent: Frontend UI Revamp — Auth Pages and Dashboard

**Status:** Elaborated
**Date:** 2026-06-09
**Owner:** Chinthaka

---

## What

Apply the Stitch-generated visual design to the CabinConnect frontend — replacing the bare, unstyled Login, Registration, and Dashboard pages with the full Nordic-themed UI. The revamp introduces Tailwind CSS with the project design-system token set, Inter and Manrope fonts, and Material Symbols icons. Auth pages use a split-panel layout (cabin imagery on the left, form on the right). The dashboard gains a styled shell with a top navigation bar and the existing welcome message — a foundation that future feature bolts will build on.

## Why

The Frontend Auth Foundation bolt delivered working auth logic with placeholder HTML. No user would trust or enjoy the bare unstyled pages. The Stitch files provide a production-quality Nordic design that matches the CabinConnect brand identity. Applying it now, before the next feature bolt, ensures all future pages build on a consistent design system from the start.

## Success Looks Like

- The `/login` page matches the Stitch `login.html` reference: split layout, cabin hero image on the left, form card on the right with email, password, remember-me checkbox, sign-in button, and a "Create Account" link
- The `/register` page matches `registration_view.html`: benefits panel on the left, registration form on the right with first name, last name, email, password, password confirmation, a password-strength indicator, Terms of Service checkbox, and a "Sign In" link; first and last name are combined as `full_name` in Supabase `signUp` user metadata
- The `/dashboard` page is a styled shell: fixed top nav bar with the CabinConnect brand, the existing personalised welcome message, and the logout button — visual layout matches the `dashboard.html` reference without the setup wizard content
- All three pages are responsive — collapse to a single column on mobile
- The Tailwind design-system tokens (colors, spacing, typography) from the Stitch config are defined in `tailwind.config.js` and shared across all pages
- All existing auth behaviour — error messages, loading states, redirect logic, protected route guard — is unchanged

## Assumptions

- Tailwind CSS v3 will be installed as a dev dependency; the PostCSS + Autoprefixer pipeline will be configured via Vite
- Material Symbols Outlined icons will be loaded via Google Fonts CDN `<link>` in `index.html`
- Inter and Manrope fonts will be loaded via Google Fonts CDN `<link>` in `index.html`
- Stitch cabin images use external Google-hosted CDN URLs — acceptable for now; image hosting strategy is deferred
- Social login buttons (Google / Apple) visible in the Stitch login reference are rendered as visual-only UI elements; they are not wired to any auth action since social auth is out of scope
- First and last name on the registration form are combined client-side into a single `full_name` string (`"First Last"`) passed to Supabase `signUp` `data.full_name` — no backend change required
- Confirm password is validated client-side only (passwords-match check); no backend change needed
- Password strength indicator on registration is purely client-side visual feedback
- The dashboard setup wizard section from the Stitch reference is deferred to a future intent

## Open Questions

- None. All questions resolved before intent creation.

## Out of Scope

- Social login (Google, Apple) auth wiring
- Password reset / forgot password flow
- Any backend `.NET` changes
- New auth logic — all existing error handling and redirect behaviour remains unchanged
- Real cabin image hosting (Stitch CDN URLs used as-is)
- Dark mode (design-system tokens support it but Stitch references are light-only)
- Dashboard setup wizard / cabin onboarding flow (deferred to a future intent)
- Navigation menu, sidebar, or any content beyond the welcome message and logout button on the dashboard

---

## Elaboration Sessions

| Session | Date | File |
|---|---|---|
| 1 | 2026-06-09 | [elaborations/2026-06-09-ui-revamp-auth-and-dashboard-session-1.md](../elaborations/2026-06-09-ui-revamp-auth-and-dashboard-session-1.md) |

---

## Extracted Units

| Unit | Status | Bolt |
|---|---|---|
| [Tailwind CSS and Design System Setup](../../build/units/2026-06-09-tailwind-design-system-setup.md) | Open | — |
| [Login Page UI](../../build/units/2026-06-09-login-page-ui.md) | Open | — |
| [Registration Page UI](../../build/units/2026-06-09-registration-page-ui.md) | Open | — |
| [Dashboard Page UI](../../build/units/2026-06-09-dashboard-page-ui.md) | Open | — |

---

## Implementation Summary

> **Complete this section when all units under this intent have been delivered and merged. Do not fill it in until the intent status is set to Implemented.**

### What Was Built

*(not yet)*

### How It Works (Key Design Decisions)

*(not yet)*

### Scope Delivered vs. Original Intent

*(not yet)*

### Known Limitations and Future Considerations

*(not yet)*

### Bolts That Delivered This Intent

| Bolt | Completed | Retro |
|---|---|---|
| *(not yet)* | | |
