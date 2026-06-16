# Intent: Cabin Profile Registration

**Status:** Elaborated
**Date:** 2026-06-16
**Owner:** HarshsnaB

---

## What

A Host can register a new Cabin on CabinConnect and manage its profile — including name, description, street address, capacity (max guests), and amenities — so the property is represented accurately in the system and ready for downstream capabilities such as availability and booking.

## Why

CabinConnect cannot offer discovery or reservations without Cabins in the system. Hosts need a straightforward way to onboard their property and keep listing details up to date. Accurate profile data (especially location, capacity, and amenities) helps Guests find suitable Cabins and reduces mismatched expectations.

## Success Looks Like

- A Host can create a new Cabin by providing the required profile fields: name, description, street address, capacity, and amenities
- Capacity is validated against defined minimum and maximum bounds; out-of-range values are rejected
- A newly registered Cabin is immediately visible to Guests (active listing; no draft or approval step)
- A Host can view the current profile for any Cabin they own
- A Host can update name, description, street address, capacity, and amenities on an existing Cabin they own
- A Host can deactivate a Cabin they own; deactivated Cabins are not visible to Guests
- Profile changes are persisted and retrievable via the API; invalid or incomplete data is rejected with clear feedback
- A Host cannot view or modify another Host's Cabin profile

## Assumptions

- Hosts authenticate via Supabase Auth; the API enforces ownership on every read and write
- A Host may own one or more Cabins (multi-cabin ownership is in scope for profile management)
- Capacity means maximum number of Guests the Cabin can accommodate (per domain glossary); values must satisfy defined min/max validation rules (minimum at least 1)
- Description is a required field at registration and on profile updates
- Location is captured as a street address (no coordinates or map UI assumed in this intent)
- Amenities support both a predefined catalog (e.g. Wi‑Fi, fireplace, pet-friendly) and Host-entered custom amenities
- A newly registered Cabin is active and visible to Guests immediately; no moderation or draft state
- Hosts cannot permanently delete a Cabin; deactivation is the supported way to take a listing offline
- Deactivated Cabins are hidden from Guest visibility; impact on existing Bookings when deactivating will be defined during elaboration

## Open Questions

- _(none — ready for elaboration; specific min/max capacity bounds and deactivation behaviour with existing Bookings to be defined in units)_

## Out of Scope

- Pricing (Base Rate, Seasonal Rates) and Total Price calculation
- Availability, Holds, Blackout Dates, and booking lifecycle
- Guest-facing search, browse, or cabin discovery UI
- Photo or media uploads for Cabin listings
- Maintenance logs, cost tracking, or visitor instructions (broader MyCabin-style features)
- Admin workflows for approving or moderating new listings

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/cabin-profile-registration/2026-06-16-session-1.md) | 2026-06-16 | 5 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| Amenity Catalog | [amenity-catalog.md](../../build/units/amenity-catalog.md) | Done |
| Register Cabin | [register-cabin.md](../../build/units/register-cabin.md) | Done |
| View Host Cabin Profile | [view-host-cabin-profile.md](../../build/units/view-host-cabin-profile.md) | Done |
| Update Cabin Profile | [update-cabin-profile.md](../../build/units/update-cabin-profile.md) | Done |
| Deactivate Cabin | [deactivate-cabin.md](../../build/units/deactivate-cabin.md) | Done |
