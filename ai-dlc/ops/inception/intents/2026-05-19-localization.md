# Intent: Norwegian + English Localization

**Status:** Elaborated
**Date:** 2026-05-19
**Owner:** Asitha (FDE)
**Source in PRD:** CI-14 · Related: NFR-LOC, XC-01, XC-02
**Cluster:** Foundation Cluster (with CI-01, CI-02, CI-13) — see [shared elaboration session](../elaborations/foundation/2026-05-19-session-1.md)

---

## What

Make all user-facing text in CabinConnect — UI labels, system-generated messages, error states, push notifications, transactional emails — available in Norwegian Bokmål and English. Resolve the active locale per recipient (user profile setting → `Accept-Language` header → default Bokmål). Render dates, numbers, and currency per locale.

## Why

The customer brief sets Norway as the launch market (NF-04, NF-03), and discovery confirms that Bokmål is the expected default for Norwegian cabin owners — but the long-distance owner persona (Anders & Ingrid, P-1) and the Bergen-based millennial inheritor (Maja, P-2) include English-comfortable users, and onboarding non-Norwegian guests via Visitor Instructions (MC-05/MC-06) effectively requires both languages from day one.

Retrofitting i18n into a product is materially harder than building it in from the start — every feature shipped before localization is wired carries hardcoded strings that must be untangled later. NFR-LOC and the §9.5 cross-cutting requirements (XC-01, XC-02) formalise this; we land it as a foundation Intent so every subsequent Intent inherits the wiring.

## Success Looks Like

- Every screen, button, label, and message in the app renders in either Bokmål or English based on the recipient's locale
- A user can change their locale in their profile, and the change takes effect immediately across the app
- Push notifications and transactional emails render in the recipient's locale
- An unauthenticated visitor opening a Visitor Instructions link sees the page in the locale signalled by their browser's `Accept-Language` header (or Bokmål if unclear)
- User-generated content (Event descriptions, Tool Listing names, Maintenance Task notes) is stored exactly as entered and displayed exactly as entered — not auto-translated
- Dates, numbers, and currency render in locale-appropriate format (e.g. `19.05.2026` vs `2026-05-19`; `kr 250,-` vs `NOK 250`)

## Assumptions

- Bokmål and English are the only locales for MVP. Nynorsk and other languages are post-MVP if requested. [Simulated customer approval: 2026-05-19]
- Default locale is Bokmål (Norwegian market)
- Locale resolution order: explicit user profile setting → `Accept-Language` → default Bokmål
- Translation source-of-truth is a versioned JSON bundle in the frontend repo (no third-party translation management system in MVP); backend message keys mirror frontend keys
- An in-house Norwegian native speaker reviews Bokmål phrasings before shipping each Bolt

## Open Questions

- Translation review process — is it the FDE, the Project Champion, or an external reviewer? Bolt cadence may need a review gate.
- Locale switching for unauthenticated routes: persist via a cookie, or resolve per-request via `Accept-Language` only?
- Notification copy: which locale wins when a user with locale=en is in a Community where most others use Bokmål? (Personal locale wins, per our assumption — confirm.)
- Currency: NOK only, or also EUR? (NOK only for MVP; assumption to confirm.)

## Out of Scope

- Nynorsk
- Right-to-left languages
- Auto-translation of user-generated content
- Translation memory or CAT (computer-aided translation) tooling
- Locale-specific A/B testing or localized marketing copy
- Time-zone handling beyond UTC storage + locale-formatted display (already covered by general date handling)

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1 — Foundation Cluster](../elaborations/foundation/2026-05-19-session-1.md) | 2026-05-19 | 2 (U-009, U-010) |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| U-009 i18n framework wiring | [u-009-i18n-framework-wiring.md](../../build/units/u-009-i18n-framework-wiring.md) | Open |
| U-010 Locale resolution chain + user profile locale field | [u-010-locale-resolution-chain.md](../../build/units/u-010-locale-resolution-chain.md) | Open |
