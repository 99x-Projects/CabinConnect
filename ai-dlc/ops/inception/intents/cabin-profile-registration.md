# Intent: Cabin Owner Registers and Manages a Cabin Profile

**Status:** Elaborated
**Date:** 2026-05-28
**Owner:** HL

---

## What
A cabin owner can create an account, register one or more cabins they own, and maintain each cabin's core profile information (identity, location within a known community/resort, capacity, amenities) and key operational details (access codes, emergency contacts, house rules). The cabin profile becomes the anchor record that every other CabinConnect module attaches to.

## Why
Every downstream module — Events (community scoping per NF-03), Groceries (delivery address and journey timing), ToolShare (locality), and visitor instructions — assumes a registered cabin exists with a known owner and a known community. Without this foundation, no other module can be scoped, secured, or personalised. It also delivers immediate standalone value: owners get a single trusted place to keep cabin info that today lives in notebooks, WhatsApp threads, and memory.

## Success Looks Like
- A new cabin owner can sign up, register a cabin against an existing community/resort, and have a complete usable profile within ~5 minutes without contacting support.
- An owner can update any field on their cabin profile and the change is visible immediately on next view.
- Sensitive fields (access codes, emergency contacts) are visible only to the owner and explicitly invited guests — never to other community members or unauthenticated users.
- A cabin record can be uniquely referenced by other modules (Events, Groceries, ToolShare) via a stable identifier and is reliably associated with exactly one community.

## Assumptions
- Authentication is handled by Supabase Auth; we are not building custom sign-up.
- **One owner owns exactly one cabin in MVP** (`UNIQUE(owner_id)` on the cabins table); multi-cabin support is a future intent. One cabin has exactly one primary owner (co-ownership is out of scope).
- **Communities/resorts are seeded and managed by an administrator** — owners select from a predefined list and cannot free-text a community. The admin-managed Community entity is a prerequisite and will be handled either as a small precursor unit during elaboration or as a manual seed for MVP.
- "Location" means a human-readable address plus a community/resort selection — not GPS coordinates in this intent.
- Amenities are a curated fixed enum (e.g. sauna, wifi, woodstove), not free text.

## Open Questions
- Should access codes be encrypted at rest beyond standard Supabase column protection? **Deferred** to a future security-hardening unit (decided 2026-05-28).
- Is there a verification step (proof of ownership) before a cabin becomes "active", or is self-declaration sufficient for MVP? **Self-declaration for MVP** (decided 2026-05-28).
- Can an owner delete a cabin, and what happens to historical data when they do? Still open — to be resolved when a deletion unit is elaborated.
- Photos / images of the cabin — in scope for the profile, or deferred? **Deferred**.
- ~~For the admin-managed Community entity: is admin-side CRUD in scope here, or do we ship MVP with a seed script and defer the admin UI?~~ **Resolved 2026-05-28:** ship MVP with a seed file in the repo; admin CRUD UI is a future unit.

## Out of Scope
- Maintenance task tracking (MC-03) — separate intent.
- Cost calculation (MC-04) — separate intent.
- Visitor instructions and guest access (MC-05, MC-06) — separate intent.
- Admin-facing community/resort management UI (assumed seeded for MVP; revisit in elaboration).
- Co-ownership, ownership transfer, and multi-owner permissions.
- Public discovery / listing of cabins to non-owners (this is not a marketplace).
- Booking, availability, or rental flows (not part of the MVP per Requirements.md).

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/cabin-profile-registration/2026-05-28-session-1.md) | 2026-05-28 | 5 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| Admin-Managed Community Registry | [community-registry](../../build/units/community-registry.md) | Open |
| Cabin Owner Account Sign-Up | [owner-signup](../../build/units/owner-signup.md) | Open |
| Register a Cabin | [cabin-register](../../build/units/cabin-register.md) | Open |
| View and Edit Own Cabin Profile | [cabin-view-edit](../../build/units/cabin-view-edit.md) | Open |
| Manage Cabin Operational Details | [cabin-operational](../../build/units/cabin-operational.md) | Open |
