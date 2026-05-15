# Intent: Cabin Profile Management

**Status:** Elaborated
**Date:** 2026-05-15
**Owner:** Sachith

---

## What
A Host can create and manage their cabin's profile — name, location, capacity, amenities, and key information (access codes, emergency contacts, house rules) — through the CabinConnect application.

## Why
Without a cabin profile, no other module works: bookings, events, and tool sharing all require a cabin as the anchor. This is the single most foundational capability in the MVP.

## Success Looks Like
- A Host can create a new cabin and see it appear in their dashboard
- A Host can update name, location, capacity, and amenities and have the changes persist
- A Host can store and update sensitive key information (access codes, emergency contacts, house rules) visible only to themselves
- A Host cannot see or modify another Host's cabin

## Assumptions
- Authentication is handled by Supabase Auth — the Host already has an account
- Amenities are selected from a predefined tag list (e.g. WiFi, sauna, fireplace); no free-text or custom tags for MVP
- A Host can have an unlimited number of cabins
- Access codes and emergency contacts are RLS-protected and never returned to the frontend in bulk; they are masked in the UI and revealed only on explicit Host interaction (click to reveal)

## Open Questions
_(none — all resolved before elaboration)_

## Out of Scope
- Visitor instructions (MC-05/MC-06) — separate intent
- Maintenance task tracking (MC-03) — separate intent
- Cost calculator (MC-04) — separate intent
- Public-facing cabin listing page — belongs to a booking intent
- Photo/image upload — explicitly deferred for MVP

---

## Elaboration Sessions
<!-- Filled in as sessions are run. -->

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/cabin-profile/2026-05-15-session-1.md) | 2026-05-15 | 6 |

## Extracted Units
<!-- Summary list. Canonical definitions live in build/units/. -->

| Unit | File | Status |
|---|---|---|
| Create Cabin | [cabin-profile-create.md](../../build/units/cabin-profile-create.md) | Open |
| Update Cabin Profile | [cabin-profile-update.md](../../build/units/cabin-profile-update.md) | Open |
| List Host Cabins | [cabin-list-host.md](../../build/units/cabin-list-host.md) | Open |
| Manage Cabin Key Information | [cabin-key-info-manage.md](../../build/units/cabin-key-info-manage.md) | Open |
| Get Cabin Detail (Host) | [cabin-detail-host.md](../../build/units/cabin-detail-host.md) | Open |
| List Amenity Tags | [cabin-amenity-tags-list.md](../../build/units/cabin-amenity-tags-list.md) | Open |
