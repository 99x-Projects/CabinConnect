# Intent: Cabin Owner Registration & Cabin Profile Creation

**Status:** Ready
**Date:** 2026-06-04
**Owner:** JH

---

## What

A cabin owner can sign up, log in, and create their first cabin profile with basic information (name, location, capacity, amenities). This is the foundational capability that all other MyCabin features build upon.

## Why

Without authentication and a cabin entity, no other feature can function. This intent delivers the minimum viable loop: register → log in → create cabin → view cabin. It validates the full tech stack (React → .NET API → Supabase) end-to-end.

## Success Looks Like

- A new user can register an account and receive confirmation
- A returning user can log in and see their dashboard
- A logged-in user can create a cabin profile with name, location, capacity, and amenities
- A logged-in user can view their cabin(s) on a dashboard
- No unauthenticated user can create or view cabin data

## Assumptions

- Supabase project exists with Auth enabled (email/password provider)
- Single community/resort scope for MVP (no multi-tenancy filtering yet)
- No email verification flow required for MVP — users can log in immediately after registration
- Amenities are stored as a simple list of strings (no master amenity catalog)

## Open Questions

- Should cabin location be a free-text address or lat/lng coordinates? → Decision: free-text address for MVP
- Maximum number of cabins per owner? → Decision: no limit for MVP

## Out of Scope

- Email verification / password reset flows
- Cabin image uploads
- Visitor instructions (MC-05, MC-06)
- Maintenance tracking (MC-03)
- Cost calculator (MC-04)
- Multi-community isolation (NF-03)
- Admin roles or Host vs Guest distinction

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/cabin-owner-registration/2026-06-04-session-1.md) | 2026-06-04 | 5 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| User Registration | `build/units/user-registration.md` | Open |
| User Login | `build/units/user-login.md` | Open |
| Protected Route Shell | `build/units/protected-route-shell.md` | Open |
| Create Cabin Profile | `build/units/create-cabin-profile.md` | Open |
| View Cabin Dashboard | `build/units/view-cabin-dashboard.md` | Open |
