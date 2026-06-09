# Intent: Frontend Application with Supabase Authentication

**Status:** Elaborated
**Date:** 2026-06-09
**Owner:** —

---

## What

Create the CabinConnect React 18 + TypeScript frontend application, configured with Supabase Auth so that Guests can register for an account, log in, and log out. Registration requires email verification before login is permitted. After login, the Guest lands on a `/dashboard` route showing a personalised welcome message. The authenticated session makes the Guest's JWT available for all subsequent calls to the .NET API. This is the foundational frontend capability — all other frontend features depend on it.

## Why

CabinConnect has no frontend yet. Before Guests can search cabins or make bookings, they need a working application with a reliable authentication layer. Supabase Auth is the chosen auth provider; this intent establishes the project scaffold, the Supabase client configuration, and the auth flows that every other frontend feature will build on.

## Success Looks Like

- A new Guest can register with an email and password; they receive a verification email and cannot log in until their email is verified
- A verified Guest can log in and land on `/dashboard` showing a welcome message that includes their name or email
- A logged-in Guest can log out and be returned to the login screen
- The .NET API is reachable from the frontend using the Guest's JWT as a Bearer token
- An unauthenticated user who navigates to a protected route is redirected to login
- All auth errors (wrong password, unverified email, email already in use, network failure) are shown as clear, human-readable messages — no raw error codes or stack traces visible to the user

## Assumptions

- Supabase project is already created and credentials are available (URL + anon key)
- Supabase email verification is enabled in the Supabase project settings
- The .NET API already validates Supabase-issued JWTs (or will be configured to do so)
- Email + password is the only auth method in scope; social/OAuth providers are not required now
- The app will run on Vite as the build tool
- No specific design system is mandated for this intent — minimal working UI is acceptable
- The dashboard welcome message uses the email address from the Supabase session if no display name is set

## Open Questions

- None. All questions resolved before elaboration.

## Out of Scope

- Password reset / forgot password flow
- Social login (Google, GitHub, etc.)
- User profile editing
- Any cabin, booking, or Host-facing features
- Backend .NET changes (those belong in a separate backend setup intent)
- Mobile / native app
- Dashboard content beyond the welcome message (no booking history, no cabin listings)

---

## Elaboration Sessions

| Session | Date | File |
|---|---|---|
| 1 | 2026-06-09 | [elaborations/2026-06-09-frontend-auth-setup-session-1.md](../elaborations/2026-06-09-frontend-auth-setup-session-1.md) |

---

## Extracted Units

| Unit | Status | Bolt |
|---|---|---|
| [Project Scaffold](../../build/units/2026-06-09-project-scaffold.md) | Open | — |
| [Auth Context Provider](../../build/units/2026-06-09-auth-context-provider.md) | Open | — |
| [Guest Registration](../../build/units/2026-06-09-guest-registration.md) | Open | — |
| [Guest Login](../../build/units/2026-06-09-guest-login.md) | Open | — |
| [Protected Route Guard](../../build/units/2026-06-09-protected-route-guard.md) | Open | — |
| [Guest Logout](../../build/units/2026-06-09-guest-logout.md) | Open | — |
| [Dashboard Page](../../build/units/2026-06-09-dashboard-page.md) | Open | — |
| [API HTTP Client](../../build/units/2026-06-09-api-http-client.md) | Open | — |

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
