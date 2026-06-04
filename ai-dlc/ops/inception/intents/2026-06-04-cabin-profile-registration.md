# Intent: Cabin Profile Registration

**Status:** Ready
**Date:** 2026-06-04
**Owner:** Ravindu Wickramage

---

## What

A cabin owner (Host) can register a new cabin in CabinConnect and manage its profile — including name, location, capacity, and amenities. The Cabin entity is the foundational record from which all other modules (Events, Groceries, ToolShare) operate.

## Why

Without a cabin profile, no other capability in CabinConnect is meaningful. Hosts need a way to onboard their property, define its characteristics, and keep that information accurate over time. This gives the platform its core data model and enables the Host to maintain a single source of truth for their cabin.

## Success Looks Like

- A Host can register a new cabin with a name, location, capacity, and at least one amenity, and the cabin appears in their cabin list immediately after saving
- A Host can edit any field on their cabin profile and see the updated values reflected without a page reload
- A Host cannot view or modify another Host's cabin profile
- A Host can mark a cabin as inactive; inactive cabins are excluded from public-facing listings but the record is preserved
- A Host with multiple cabins can see all of them listed and navigate to each profile independently

## Assumptions

- Authentication is handled by Supabase Auth — the currently authenticated user is the cabin's owner
- Location for MVP is a text field (resort name + address string); no map or geocoding integration is required
- Amenities are selected from a predefined enumerable set (e.g., WiFi, Sauna, Fireplace, Hot Tub, Parking); free-text amenities are out of scope for MVP
- Capacity refers to the maximum number of guests; bedroom/bed counts are not required for MVP
- One Host may own multiple cabins

## Open Questions

- What is the agreed MVP amenity list? (A working set is needed before units can be built)
- Should inactive cabins be visible to the Host in their dashboard, or fully hidden?
- Is there a minimum capacity value (e.g., must be at least 1), and is there a maximum the platform should enforce?

## Out of Scope

- Cabin pricing (Base Rate, Seasonal Rate) — separate intent
- Booking and availability management — separate intent
- Visitor instructions (MC-05, MC-06) — separate intent
- Maintenance task tracking (MC-03) — separate intent
- Ownership cost estimation (MC-04) — separate intent
- Photo or image uploads for cabin profiles

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| _(none yet)_ | | |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| _(none yet — run mob elaboration to extract)_ | | |
