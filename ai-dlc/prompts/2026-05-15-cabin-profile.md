# Prompt Log: Cabin Profile — Bolt 01

**Unit(s):** [List Amenity Tags](../ops/build/units/cabin-amenity-tags-list.md) · [Create Cabin](../ops/build/units/cabin-profile-create.md)
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
