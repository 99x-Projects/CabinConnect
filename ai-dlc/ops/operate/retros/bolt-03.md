# Retrospective: Bolt 03 — Summer Theme

**Bolt:** [Bolt 03](../../build/bolts/bolt-03-summer-theme.md)
**Date:** 2026-05-18
**Participants:** Sachith Perera
**Facilitator:** Claude (AI-DLC)

---

## What Went Well

- All 3 units executed in a single session with no structural rework
- Palette agreed upfront before any code was written — palette-first approach prevented mid-implementation colour debates
- `AuthenticatedLayout` cleanly isolated the shared shell without touching `ProtectedRoute` auth logic
- Tailwind `@theme` token approach meant palette changes cascaded across all components automatically with zero per-component edits
- Split-layout login page (60/40) solved the stretching issue elegantly and improved the overall design

## What Didn't Go Well

- **Duplicate header/sign-out in existing pages** — `DashboardPage` and `InvitePage` had their own `<header>` elements with sign-out buttons that were not removed when `AuthenticatedLayout` was introduced; caught in visual review, not at code generation time
- **Login image stretch** — initial full-bleed `object-cover` implementation was visually acceptable technically but felt stretched to the user; required a follow-up layout change to a split design
- **Vite cache** required a manual `rm -rf node_modules/.vite` to clear a stale import resolution error unrelated to the theme work

## AI-Specific Observations

### Prompts that worked as expected

- Palette proposal before implementation: presenting the full HSL table for approval before touching any file produced zero colour revision cycles
- Unit-by-unit execution with explicit quality gate header kept each output tightly scoped

### Prompts that needed revision before output was usable

- Site Shell unit did not automatically account for existing page-level headers — a pre-execution grep of pages for `<header` and `signOut` patterns would have surfaced the cleanup needed before generating `AuthenticatedLayout`

### Quality gate failures caught

- None — all prompts entered with full quality gate components

### Cases where AI output was accepted without enough review

- `AuthenticatedLayout` was accepted without checking whether existing pages had their own headers; the duplicate was only caught during browser testing

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Before generating a layout wrapper, grep existing pages for patterns it will duplicate (header, signOut, min-h-screen) | Sachith | 2026-05-25 | |

## Improvements Triggered

- None filed at this time

## New Intents Triggered

- None identified
