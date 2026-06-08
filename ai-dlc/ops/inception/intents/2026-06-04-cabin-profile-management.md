# Intent: Cabin Profile Management

**Status:** Elaborated
**Date:** 2026-06-04
**Owner:** Savindu Bandara

---

## What

A cabin owner can register a cabin in CabinConnect and maintain its profile over time. The profile captures the identifying details of the cabin — name, location, capacity, and amenities — so it can serve as the anchor record that every other MyCabin capability (maintenance, costs, visitor instructions) attaches to. The owner can create the cabin, view it, edit any field, and remove it if they no longer own it.

## Why

MyCabin is the foundation of the CabinConnect platform — every other module (Events, Groceries, ToolShare) is scoped to a community and, for an owner, anchored on the cabins they manage. Without a reliable cabin profile, owners cannot share visitor instructions, track maintenance, or order groceries against a known address. Establishing this capability first unblocks all downstream MyCabin work and gives the team an end-to-end vertical slice through the stack (React → .NET API → Supabase) that future intents can build on.

## Success Looks Like

A cabin owner who signs in to CabinConnect can add their cabin in under two minutes, see it listed on their dashboard, edit any field at any time, and trust that the data they entered is the data shown. Each cabin record clearly belongs to its owner — no other user can see or modify it. When subsequent MyCabin features ship, they read from this profile rather than asking the owner to re-enter the same information.

## Assumptions

- The owner is already authenticated via Supabase Auth before reaching any cabin profile screen.
- One owner may own more than one cabin; one cabin has exactly one owner for the MVP (co-ownership is out of scope).
- Location is captured as a structured address plus a community/resort identifier (community scoping is required by NF-03).
- Capacity is the maximum number of overnight guests the cabin can accommodate.
- **Amenities** are selected from a fixed controlled list for MVP: Wi-Fi, Electricity, Running water, Heating, Kitchen, Parking, Sauna, Fireplace. The list is extensible in a later intent.
- **Community/resort** is selected from a fixed list seeded and maintained by platform admins. Seeding the initial list is a prerequisite for this intent but is itself out of scope (handled as platform configuration, not user-facing functionality).
- **Delete behaviour** is a soft delete: a deleted cabin is hidden from the owner's UI and excluded from all queries, but the underlying record is retained so future MyCabin features (maintenance, costs, visitor instructions) can keep their referential integrity. Restore is not part of MVP UI but the data shape supports it.
- **Cabin limit per owner**: a soft cap of 10 cabins per owner. Attempting to create an 11th returns a clear error directing the owner to contact support. The cap is configurable, not hardcoded into business logic.

## Open Questions

- _All initial open questions have been resolved during intent review (2026-06-04). New questions will be raised during the mob elaboration session._

## Out of Scope

- Cabin photos, gallery, and media uploads (separate intent later)
- Co-ownership or transferring ownership between users
- Maintenance task tracking (MC-03)
- Ownership cost tracking (MC-04)
- Visitor instructions and guest-link sharing (MC-05, MC-06)
- Public discoverability of cabins — profiles are private to the owner only
- Admin tooling to manage cabins on behalf of owners

---

## Elaboration Sessions

| Session | Date | File |
|---|---|---|
| 1 | 2026-06-04 | [session-1](../elaborations/2026-06-04-cabin-profile-management/session-1.md) |

---

## Extracted Units

| Unit | Status | Bolt |
|---|---|---|
| [cabin-create](../../build/units/cabin-create.md) | Open | — |
| [cabin-list-mine](../../build/units/cabin-list-mine.md) | Open | — |
| [cabin-view-detail](../../build/units/cabin-view-detail.md) | Open | — |
| [cabin-edit](../../build/units/cabin-edit.md) | Open | — |
| [cabin-soft-delete](../../build/units/cabin-soft-delete.md) | Open | — |

---

## Implementation Summary

> **Complete this section when all units under this intent have been delivered and merged. Do not fill it in until the intent status is set to Implemented.**

### What Was Built

_TBD_

### How It Works (Key Design Decisions)

_TBD_

### Scope Delivered vs. Original Intent

_TBD_

### Known Limitations and Future Considerations

_TBD_

### Bolts That Delivered This Intent

| Bolt | Completed | Retro |
|---|---|---|
| _TBD_ | — | — |
