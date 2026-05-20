# Intent: Cabin Owner Registration & Authentication

**Status:** Elaborated
**Date:** 2026-05-19
**Owner:** Asitha (FDE)
**Source in PRD:** CI-02 · Related: NFR-AUTH, EC-002, EC-003, MC-07 (multi-owner)
**Cluster:** Foundation Cluster (with CI-01, CI-13, CI-14) — see [shared elaboration session](../elaborations/foundation/2026-05-19-session-1.md)

---

## What

Enable users to register, authenticate, manage a profile (display name, locale, contact info), and become members of one or more Communities. Provide the identity primitives that every other Intent depends on.

## Why

No feature is buildable until users exist and can be identified. Every API request in CabinConnect is authenticated; every record is owned by a user; every Community membership decision flows through identity. Building auth as a foundational Intent — alongside Community boundary (CI-01) — lets us co-design the JWT shape, profile schema, and Community-link mechanics so they fit together cleanly.

Using Supabase Auth (per CLAUDE.md §1 and customer brief NF-05) means we do not implement password storage, session management, or password-reset flows ourselves — we wire them up correctly.

## Success Looks Like

- A new user can register with email/password, verify their email, and sign in
- A signed-in user can view and update their display name, contact info, and locale
- A user can join a Community via a community-code shared by an Administrator (link or code entry), and after acceptance is a Community member
- Every API endpoint validates the user's JWT before processing; unauthenticated requests to non-public routes return 401
- An expired JWT on a long mobile session is handled gracefully — the frontend uses `onAuthStateChange` to refresh and the user does not see a forced sign-out
- Sign-in and sign-up work on both desktop and mobile responsive web

## Assumptions

- Supabase Auth handles all auth primitives (sign-up, sign-in, password reset, email verification, session management, refresh) — we do not build our own [Customer brief: NF-05; CLAUDE.md §1]
- BankID integration is post-MVP per PRD Q-2 [Simulated customer approval: 2026-05-19]
- MVP sign-up is open (any email can register); a Community membership is a separate step (invite/code)
- A user without any Community membership can still sign in but lands on a "join a Community" empty state
- Default locale at sign-up is Bokmål (matches CI-14 default)

## Open Questions

- **PRD Q-2** — BankID timing: confirmed post-MVP only?
- Community-code distribution mechanism: Administrator-shared link, QR code at the resort, code entry on profile screen, or all of the above?
- Self-service Community creation in MVP, or is creating a Community an out-of-band 99x setup step per pilot?

## Out of Scope

- BankID integration
- Social sign-in (Google, Apple, Microsoft) — defer until customer demands
- Multi-factor auth — Supabase supports it; defer enabling until phase 2
- Per-Community roles beyond `Member` and `Administrator` (handled in module-specific Intents)
- Account deletion / GDPR right-to-be-forgotten workflow (phase 2; flagged for compliance review)

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1 — Foundation Cluster](../elaborations/foundation/2026-05-19-session-1.md) | 2026-05-19 | 3 (U-004, U-005, U-006) |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| U-004 Supabase Auth wiring | [u-004-supabase-auth-wiring.md](../../build/units/u-004-supabase-auth-wiring.md) | Open |
| U-005 User profile + Community membership data model | [u-005-user-profile-membership-model.md](../../build/units/u-005-user-profile-membership-model.md) | Open |
| U-006 JWT validation middleware + auth-required-by-default routing | [u-006-jwt-validation-middleware.md](../../build/units/u-006-jwt-validation-middleware.md) | Open |
