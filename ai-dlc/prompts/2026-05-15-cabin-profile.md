# Prompt Log: Cabin Profile — Bolt 01

**Unit(s):** [List Amenity Tags](../ops/build/units/cabin-amenity-tags-list.md) · [Create Cabin](../ops/build/units/cabin-profile-create.md) · [Update Cabin Profile](../ops/build/units/cabin-profile-update.md) · [List Host Cabins](../ops/build/units/cabin-list-host.md)
**Date started:** 2026-05-15
**Contributors:** Sachith Perera

---

## Session 2026-05-15 — Unit ①: List Amenity Tags

### Prompt
> Build unit ① List Amenity Tags: GET /api/amenity-tags, public endpoint, returns all tags ordered by name. Tags are pre-seeded in the database.

### Output Summary
Created `AmenityTag` entity, `IAmenityTagRepository` interface with `GetAllOrderedByNameAsync`, `AmenityTagRepository` implementation, `AmenityTagConfiguration` EF Core mapping, `AmenityTagsController` with `[AllowAnonymous]` GET endpoint, `AmenityTagDto` record, and 3 tests covering all ACs.

### Quality Gate Result
- Context: Pass — authenticated vs. public endpoint distinction was clear; pre-seeded tags system specified
- Constraints: Pass — `[AllowAnonymous]` required; ordering delegated to repository
- Acceptance Criteria: Pass — 3 ACs, all covered by tests
- Output Format: Pass — C# files specified

### Changes Made to Output
None — output accepted as generated.

### Decision Notes
- `GetAllOrderedByNameAsync` naming encodes the ordering contract in the method name, making the controller trivially simple.
- Caching was explicitly deferred by the engineer ("leave it out") — not in scope for this unit.

---

## Session 2026-05-15 — Unit ②: Create Cabin

### Prompt
> Build unit ② Create Cabin: POST /api/cabins. Host must be authenticated (JWT). host_id derived from JWT `sub` claim (never request body). Fields: name (max 512, unique per host), location, capacity (≥ 1), description (uncapped, optional), amenity_tag_ids (optional list validated against predefined list). Returns full CabinDto on success. Reject with 400 for invalid input, 409 for duplicate name per host, 400 with invalid IDs listed for unknown amenity tags.

### Output Summary
Created `CreateCabinRequest` DTO (data annotations), `CabinDto` record, `ICabinService` + `CabinService` (tag ID validation, entity construction, delegates to `ICabinRepository.AddAsync`), updated `CabinsController` with POST endpoint extracting `sub` claim as `Guid hostId`, and 8 controller tests covering all ACs. Also created `DuplicateCabinNameException`, `InvalidAmenityTagsException`, updated `CabinRepository` to catch Postgres `23505` → `DuplicateCabinNameException`, updated `CabinConfiguration` with concurrency token, unique index on `(host_id, name)`, and many-to-many `cabin_amenity_tags`.

### Quality Gate Result
- Context: Pass — Host creating a cabin; spans Domain, Infrastructure, Api layers
- Constraints: Pass — EC-007 (host_id from JWT only), EC-013 (unique per host), EC-012 (invalid tags → 400)
- Acceptance Criteria: Pass — 8 ACs all covered by tests (12/12 passing)
- Output Format: Pass — C# files with xUnit tests specified

### Changes Made to Output
- `ValidationProblem(ModelState)` → `BadRequest(ModelState)`: `ProblemDetailsFactory` is null in unit tests without the full ASP.NET Core DI pipeline; `BadRequest` returns a concrete `BadRequestObjectResult` that is testable without the factory.
- Test assertions for ACs 2, 3, 7 changed from `ObjectResult` → `BadRequestObjectResult` to match the updated controller response type.

### Decision Notes
- `CabinService.ToDto` is `internal static` so the controller can call it for the GET endpoints without duplicating mapping logic; avoids a separate mapper class for now.
- `BaseRate` defaults to `0` on creation — rate management is a separate unit; the field exists on the entity to satisfy the DB schema.
- Optimistic concurrency (`version` field) was a deliberate design from elaboration: client reads `version` on GET and must supply it on future PUT requests; 409 on mismatch.
- Empty `amenity_tag_ids` (or null) creates the cabin with no tags — AC5 explicitly confirmed this is valid.

---

## Session 2026-05-15 — Unit ③: Update Cabin Profile

### Prompt
> Build unit ③ Update Cabin Profile: PUT /api/cabins/{id}. Full replacement semantics — all fields required. Amenity tags replace the full existing set. host_id ownership verified from JWT. Optimistic concurrency via `version` field: client submits version they read; server rejects with 409 if stale. Return updated CabinDto on success.

### Output Summary
Created `UpdateCabinRequest` DTO, three new domain exceptions (`CabinNotFoundException`, `CabinOwnershipException`, `CabinVersionConflictException`), added `UpdateAsync` to `ICabinService` and implemented it in `CabinService` (ownership check → version check → tag validation → in-place mutation → version increment), added PUT endpoint to `CabinsController` mapping each exception to its HTTP status, updated `CabinRepository.UpdateAsync` to rely on EF change tracking (removed explicit `db.Cabins.Update` call) and catch unique constraint violation. 9 controller tests covering all ACs (21/21 passing).

### Quality Gate Result
- Context: Pass — Host updating their own cabin; optimistic concurrency pattern specified from elaboration
- Constraints: Pass — EC-007 (ownership from JWT), EC-013 (unique name per host), version must match server value
- Acceptance Criteria: Pass — 9 ACs all covered by tests
- Output Format: Pass — C# files with xUnit tests specified

### Changes Made to Output
- Removed `db.Cabins.Update(cabin)` from `UpdateAsync` in the repository: the entity is already tracked (loaded via `GetByIdAsync` on the same scoped `AppDbContext`), so calling `Update` again on a tracked entity with a mutated navigation collection risked confusing the EF change tracker. Relying on change tracking directly is cleaner and correct.

### Decision Notes
- Version check is manual (`cabin.Version != request.Version`) rather than relying on EF Core's concurrency token mechanism. The client submits an explicit version number, making a manual comparison simpler and the 409 response body more informative (includes `currentVersion`).
- `CabinVersionConflictException` carries `CurrentVersion` so the client can update their local state without issuing another GET.
- `CabinOwnershipException` maps to 403, not 404 — the resource exists but the caller doesn't own it. A 404 would hide that the cabin exists, which is acceptable for some APIs, but 403 is more useful for the Host dashboard context.

---

## Session 2026-05-15 — Unit ④: List Host Cabins

### Prompt
> Build unit ④ List Host Cabins: GET /api/cabins (replace the existing all-active stub). Returns all cabins (active and inactive) owned by the authenticated Host, ordered by created_at DESC. host_id derived from JWT only — never from query parameters. No pagination.

### Output Summary
Added `GetByHostIdAsync` to `ICabinRepository` and `CabinRepository` (filters by `HostId`, includes AmenityTags, orders `CreatedAt` DESC, includes inactive), added `GetByHostAsync` to `ICabinService` and `CabinService`, replaced the stub `GetAll` action in `CabinsController` (previously `GetAllActiveAsync` with no auth scoping) with a host-scoped version that extracts `hostId` from JWT and delegates to the service. 7 controller tests covering all ACs (28/28 passing).

### Quality Gate Result
- Context: Pass — Host dashboard list; includes inactive cabins for full visibility
- Constraints: Pass — EC-007 (host filter from JWT only); no pagination in scope
- Acceptance Criteria: Pass — 7 ACs all covered by tests
- Output Format: Pass — C# files with xUnit tests specified

### Changes Made to Output
None — output accepted as generated.

### Decision Notes
- AC4 (no key info fields in response) is tested via reflection on `CabinDto` property names — guarantees the DTO type never exposes key info regardless of future mapping changes.
- AC7 (ordering) is tested by having the service mock return items in DESC order and asserting the controller preserves that order — ordering responsibility is correctly in the repository, not the controller.
- `GetAllActiveAsync` is retained on the interface and repository for potential future guest-browsing use; it is no longer called by any controller action.
