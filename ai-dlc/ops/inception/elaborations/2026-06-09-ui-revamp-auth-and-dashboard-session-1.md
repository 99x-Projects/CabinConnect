# Elaboration Session: Frontend UI Revamp — Auth Pages and Dashboard — Session 1

**Intent:** [intents/2026-06-09-ui-revamp-auth-and-dashboard.md](../intents/2026-06-09-ui-revamp-auth-and-dashboard.md)
**Date:** 2026-06-09
**Participants:** Chinthaka
**Session goal:** Decompose the UI revamp intent into atomic units with agreed acceptance criteria and edge case coverage.

---

## Units Agreed This Session

| # | Unit name | Purpose | ACs agreed? | Edge cases surfaced? |
|---|---|---|---|---|
| 1 | Tailwind CSS and Design System Setup | Install Tailwind v3 and configure shared design-system tokens | Yes | Yes |
| 2 | Login Page UI | Restyle `/login` to match the Stitch split-panel reference | Yes | Yes |
| 3 | Registration Page UI | Restyle `/register` with first/last name fields and Stitch design | Yes | Yes |
| 4 | Dashboard Page UI | Restyle `/dashboard` as a styled shell with nav bar and welcome message | Yes | Yes |

---

## Unit Detail

### Unit: Tailwind CSS and Design System Setup

**Purpose:** Install Tailwind CSS v3 and configure the shared design-system tokens — colors, spacing, typography, fonts, and icons — so every page in the revamp can reference them consistently.

**Acceptance Criteria:**
1. Given the frontend dev server is running, when any page is loaded, then Inter and Manrope fonts render correctly (sourced from Google Fonts CDN via `index.html`).
2. Given the Tailwind config is in place, when a component uses a design-system color token (e.g. `bg-primary`, `text-on-surface`), then the correct hex value from the stitch palette is applied.
3. Given the Tailwind config is in place, when a component uses a design-system spacing token (e.g. `p-md`, `gap-gutter`), then the correct pixel value from the stitch spacing scale is applied.
4. Given the Tailwind config is in place, when a component uses a design-system typography token (e.g. `text-headline-lg`, `font-headline-lg`), then the correct font size, line height, and weight are applied.
5. Given a component references a Material Symbols icon class, when the page loads, then the icon renders correctly via the Google Fonts CDN.
6. Given the Google Fonts CDN is unavailable, when the page loads, then text falls back to the system sans-serif font and the layout does not break.

**Edge cases surfaced:**
- Tailwind content paths must include `./src/**/*.{ts,tsx}` to prevent class purging in production builds
- Tailwind v3 pinned explicitly — v4 config format is incompatible with the stitch token structure
- PostCSS config required (`tailwindcss` + `autoprefixer` plugins)
- Existing global styles in `index.css` may conflict with Tailwind preflight reset; must be reviewed and cleaned up

**Open questions:**
- None

---

### Unit: Login Page UI

**Purpose:** Restyle the `/login` page to match the Stitch reference — split layout with cabin hero image on the left and sign-in form card on the right — while keeping all existing auth logic and error handling intact.

**Acceptance Criteria:**
1. Given a desktop viewport (≥ 1024px), when the `/login` page loads, then a two-column split layout renders — left column shows the cabin hero image with gradient overlay and CabinConnect headline, right column shows the sign-in form card.
2. Given a mobile viewport (< 1024px), when the `/login` page loads, then the left column is hidden and the form renders as a single full-width column.
3. Given the page renders, when the form card is displayed, then it contains an email field, a password field, a "Remember me" checkbox, a "Sign In" submit button, a "Forgot password?" link, and a "Don't have an account? Create Account" link navigating to `/register`.
4. Given the page renders, when the social login buttons (Google, Apple) are visible, then they are rendered as UI-only elements — clicking them performs no action.
5. Given the "Forgot password?" link is clicked, when the page responds, then no navigation occurs (link is a visual placeholder).
6. Given email or password fields are empty, when the form is submitted, then field-level error messages render correctly within the new styled layout.
7. Given incorrect credentials are submitted, when the server responds, then the form-level error message renders inside the form card with the correct styling.
8. Given the cabin hero image fails to load, when the page renders, then the left panel still displays with the background colour, gradient, and text — no broken image state.
9. Given an already-authenticated user navigates to `/login`, when the page loads, then they are redirected to `/dashboard` (existing behaviour unchanged).

**Edge cases surfaced:**
- "Remember me" checkbox is visual-only — no Supabase session persistence wiring in this unit
- Long error messages must not overflow the form card at narrow widths
- Existing `submitting` state must still disable the button and change its label in the new styled component

**Open questions:**
- None

---

### Unit: Registration Page UI

**Purpose:** Restyle the `/register` page to match the Stitch reference — split layout with a benefits panel on the left and the registration form on the right — adding first name and last name fields that combine into `full_name` on submit, while keeping all existing auth logic intact.

**Acceptance Criteria:**
1. Given a desktop viewport (≥ 768px), when the `/register` page loads, then a two-column split layout renders — left column shows the benefits panel with icons and descriptions, right column shows the registration form.
2. Given a mobile viewport (< 768px), when the `/register` page loads, then the left column is hidden and the form renders as a single full-width column.
3. Given the form renders, when displayed, then it contains: first name field, last name field, email field, password field with a show/hide toggle, confirm password field, a password strength indicator, a required Terms of Service checkbox, and a "Create Account" button.
4. Given first name and last name are both provided, when the form is submitted successfully, then they are combined as `"First Last"` (trimmed) and passed as `data.full_name` to Supabase `signUp` user metadata.
5. Given the password and confirm password values do not match, when the form is submitted, then a client-side error message is shown and `signUp` is not called.
6. Given the Terms of Service checkbox is unchecked, when the form is submitted, then the form is not submitted and the checkbox is marked invalid.
7. Given a valid registration completes, when the confirmation screen displays, then it is styled consistently with the new design system.
8. Given server-side errors occur (email in use, password too weak), when the response is received, then error messages render correctly within the new styled form card.
9. Given an already-authenticated user navigates to `/register`, when the page loads, then they are redirected to `/dashboard` (existing behaviour unchanged).
10. Given primary action buttons render across the Login, Registration, and Dashboard pages, when any page is displayed, then all primary buttons share the same color, typography, and shape tokens — no page uses a different button style.

**Edge cases surfaced:**
- If last name is blank, `full_name` must equal just the first name with no trailing space (trim applied)
- Password show/hide toggle state is independent per field
- Confirm password mismatch error appears on submit only — not while typing
- Existing confirmation screen "Resend" and "Log out" buttons must retain their click handlers after restyling

**Open questions:**
- None

---

### Unit: Dashboard Page UI

**Purpose:** Restyle the `/dashboard` page to match the Stitch reference — a fixed top navigation bar with the CabinConnect brand, the existing personalised welcome message, and the logout button — as a styled shell that future feature bolts will build on.

**Acceptance Criteria:**
1. Given an authenticated Guest is on `/dashboard`, when the page loads, then a fixed top navigation bar renders with the CabinConnect brand on the left and the logout button on the right.
2. Given an authenticated Guest is on `/dashboard`, when the page loads, then the personalised welcome message displays in the main content area below the nav bar — existing `getWelcomeName` logic is unchanged.
3. Given the logout button is clicked and sign-out succeeds, when auth state updates, then the user is redirected to `/login` (existing `LogoutButton` behaviour unchanged).
4. Given `user.user_metadata.full_name` is not set, when the page loads, then the welcome message falls back to the user's email, or "Welcome!" if both are absent (existing fallback logic unchanged).
5. Given the Auth Context is still loading, when the page renders, then a loading state displays and the welcome message is not shown until loading is false.
6. Given an unauthenticated user navigates directly to `/dashboard`, when the page loads, then the Protected Route Guard redirects them to `/login` before dashboard content renders (existing behaviour unchanged).
7. Given a mobile viewport, when the `/dashboard` page loads, then the top navigation bar and welcome message render correctly without overflow or layout breaks.

**Edge cases surfaced:**
- Fixed top nav height (h-16) requires matching top padding on the main content area to prevent welcome message being hidden behind the nav
- LogoutButton error state must have space to render within the new layout without breaking the nav
- Long email addresses used as the welcome name must wrap or truncate cleanly

**Open questions:**
- None

---

## Session Notes

- Tailwind v3 explicitly pinned — v4 is incompatible with the stitch token config format
- Button style consistency (AC-10 on Registration) is a cross-cutting constraint applying to all four pages; the same primary button token set must be used on Login, Registration, and Dashboard
- Social login buttons (Google, Apple) on the Login page are rendered as visual-only UI elements; no auth wiring in scope
- Dashboard setup wizard content from the Stitch reference is explicitly deferred — this unit delivers a styled shell only
- First name + last name combined client-side as `[firstName, lastName].filter(Boolean).join(' ')` passed to Supabase `signUp` `data.full_name`; no backend change required

---

## Next Session

**Goal:** Not required — all units for this intent agreed in this session.
**Prerequisite:** None.
