# Mob Elaboration Session — Cabin Profile Management — Session 1

**Date:** 2026-06-04
**Intent:** [2026-06-04-cabin-profile-management](../../intents/2026-06-04-cabin-profile-management.md)
**Facilitator:** Savindu Bandara (with AI assistant per CLAUDE.md §6)
**Outcome:** Elaborated — 5 units extracted, ready for Bolt planning.

---

## Process

Followed the interactive mob elaboration protocol from [CLAUDE.md §6](../../../../CLAUDE.md). One unit at a time:
1. Propose unit (name + purpose) → human confirms
2. Propose ACs → human accepts
3. Surface edge cases & open questions → human decides
4. Move to next unit

Units 4 and 5 were elaborated in compressed "speed mode" at the engineer's request — full unit + ACs + edge-case decisions proposed in a single block, accepted as a batch.

---

## Pre-elaboration intent review

Four open questions on the intent were resolved before elaboration began:

| Question | Decision |
|---|---|
| Amenity list | Fixed list of 8: Wi-Fi, Electricity, Running water, Heating, Kitchen, Parking, Sauna, Fireplace |
| Community/resort selection | Fixed list seeded by platform admins |
| Delete behaviour | Soft delete |
| Max cabins per owner | Soft cap of 10 (configurable) |

---

## Units extracted

| # | Unit | File |
|---|---|---|
| 1 | `cabin-create` | [cabin-create.md](../../../build/units/cabin-create.md) |
| 2 | `cabin-list-mine` | [cabin-list-mine.md](../../../build/units/cabin-list-mine.md) |
| 3 | `cabin-view-detail` | [cabin-view-detail.md](../../../build/units/cabin-view-detail.md) |
| 4 | `cabin-edit` | [cabin-edit.md](../../../build/units/cabin-edit.md) |
| 5 | `cabin-soft-delete` | [cabin-soft-delete.md](../../../build/units/cabin-soft-delete.md) |

---

## Cross-cutting decisions captured

- **Auth & isolation:** Supabase JWT on every endpoint; `owner_id` always derived from JWT, never request body. RLS policy on cabins restricts to `owner_id = JWT user` AND `is_deleted = false`. 404 (not 403) on cross-owner access to prevent ID enumeration.
- **Schema:** Cabin row carries `id`, `owner_id`, `name`, structured address (`street`, `postalCode`, `city`, `country`), `community_id`, `capacity`, `is_deleted`, `created_at`, `created_by`, `updated_at`, `updated_by`. Amenities via join table to seeded `amenities` reference. Communities are seeded reference data.
- **Validation:** name ≤100 chars (trimmed, non-empty); address parts ≤200; capacity 1–50; community must be in seeded list; amenities must be from controlled list of 8.
- **Owner cap:** soft cap of 10 active cabins per owner; transactional enforcement.
- **Soft delete:** `is_deleted` flag; deleted cabins excluded from list, detail, and cap calculation. No restore UI, no cascade (no dependents yet).
- **DTO shape:** `community` nested as `{ id, name, region }`; `amenities` array of `{ id, name }`. Internal fields (`is_deleted`, `created_by`, `updated_by`, `owner_id`) never exposed.
- **Concurrency:** last-write-wins on edit (no optimistic concurrency for MVP). Cap enforcement is transactional.

## Out of scope across this intent

Photos / media uploads, co-ownership, restore UI, hard delete, edit history table, idempotency keys, server-side filtering, pagination, notifications/webhooks, optimistic concurrency.

---

## Sign-off

Engineer (Savindu Bandara) signed off on the full unit list and cross-cutting decisions on 2026-06-04. Files written to disk same day.
