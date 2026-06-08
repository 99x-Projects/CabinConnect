# Prompt log — Cabin Profile MVP Bolt

**Date:** 2026-06-08
**Bolt:** [bolt-cabin-profile-mvp](../ops/build/bolts/2026-06-08-bolt-cabin-profile-mvp.md)
**Engineer:** Savindu Bandara

> Backfilled at end of bolt. Prompts were not logged per-unit during execution — see retro [§What Didn't Go Well](../ops/operate/retros/2026-06-08-bolt-cabin-profile-mvp.md#what-didnt-go-well).

---

## Conventions used

- Working agent: GitHub Copilot (Claude Opus 4.x)
- Mode: Agent (multi-tool, full workspace access)
- Quality Gate: applied to all code-generating prompts (Context / Constraints / AC / Output Format header)

---

## Unit 1 — `cabin-create`

**Goal:** Implement `POST /api/cabins` end-to-end with all 8 ACs from the unit file.

**Effective prompts (paraphrased):**
1. "Scaffold .NET 8 Web API + React Vite TS app with the structure called out in CLAUDE.md."
2. "Build the Supabase migration for `communities`, `amenities`, `cabins`, `cabin_amenities` from the elaboration session, including RLS policies and DB-level constraints."
3. "Implement Cabin entity, repository, service, controller, DTOs to satisfy all 8 ACs in [units/cabin-create.md](../ops/build/units/cabin-create.md). Include xUnit tests for each AC plus EC-001 (cap), soft-delete exclusion, and owner-from-JWT."

**Issues encountered & fixes:**
- EF Core InMemory transaction warning → `.ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))`
- `IReadOnlyCollection` navigation property failed at materialisation → switched to `List<CabinAmenity>` with private setter
- `with` expression on sealed class → refactored test helpers to named parameter constructors

**Outcome:** 9/9 tests passing. End-to-end verified via the React UI on 2026-06-08.

---

## Unit 2 — `cabin-list-mine`

**Goal:** `GET /api/cabins` returns only the caller's non-deleted cabins.

**Effective prompts (paraphrased):**
1. "Add `ListByOwnerAsync` to repository, `ListByOwnerAsync` to service, and `[HttpGet]` action on CabinsController. Return `IReadOnlyList<CabinResponse>`. Order by `CreatedAt desc, Id`."

**Outcome:** Verified via UI — created cabin appears in list, soft-deleted one does not.

---

## Unit 3 — `cabin-view-detail`

**Goal:** `GET /api/cabins/{id}` returns the cabin if owned by caller; otherwise 404 (not 403, to avoid leaking existence).

**Effective prompts (paraphrased):**
1. "Add `[HttpGet(\"{id:guid}\")]` action that calls `GetByIdAndOwnerAsync`. 404 on null. Reuse `MapToResponse`."

**Outcome:** Reused for edit form pre-fill on the React side.

---

## Unit 4 — `cabin-edit`

**Goal:** `PUT /api/cabins/{id}` full-replace including amenity set.

**Effective prompts (paraphrased):**
1. "Implement `UpdateCabinRequest` (same shape as create), service `UpdateAsync` with community + amenity validation, and controller `[HttpPut(\"{id:guid}\")]`. Amenities should be replaced wholesale (clear-and-add)."

**Concerns surfaced & resolved:**
- AC required `Cabin.Update(...)` mutator method on the entity — added to keep persistence concerns inside the domain.
- `ClearAmenities()` plus `RemoveRange` is the simplest correct strategy; preserves the join-table FK without orphans.

**Outcome:** Verified via UI — edited capacity, amenity additions and removals all persist correctly.

---

## Unit 5 — `cabin-soft-delete`

**Goal:** `DELETE /api/cabins/{id}` → 204; subsequent reads exclude the row.

**Effective prompts (paraphrased):**
1. "Add `SoftDelete(deletedBy)` mutator on `Cabin`, service `DeleteAsync`, controller `[HttpDelete(\"{id:guid}\")]`. Idempotent: deleting twice returns 404 the second time."

**Outcome:** Verified via UI — deleted cabin disappears from the list.

---

## Cross-cutting prompts

- "Reference data: build a public `[AllowAnonymous]` controller exposing `GET /api/reference/communities` and `GET /api/reference/amenities` so the React form can populate dropdowns."
- "Build a React login page that uses `supabase.auth.signInWithPassword` and an auth context that listens to `onAuthStateChange` to handle EC-008."
- "Build cabin list, create form, and edit form pages. Use plain inline styles (no UI library). Use state-based page switching for the bolt MVP — defer router until next bolt."

---

## Lessons captured for future bolts

- Always pin EF Core navigation properties as `List<>` not `IReadOnlyCollection<>` if EF needs to populate them.
- Scaffold user-secrets at scaffold time, not after secrets land in tracked files.
- Disable `UseHttpsRedirection()` in Development or run the API on HTTPS in dev — CORS preflight cannot follow redirects.
- Verify outbound network reachability to all third-party services *before* spending time on code-side debugging.
