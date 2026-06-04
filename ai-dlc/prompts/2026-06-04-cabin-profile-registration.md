# Prompt Log: Cabin Profile Registration

**Unit:** [U1 — Register Cabin](../ops/build/units/u1-register-cabin.md)
**Date started:** 2026-06-04
**Contributors:** Ravindu Wickramage

---

## Session 2026-06-04 — Intent Writing

### Prompt
```
Help me write my first intent for Cabin Profile Registration — a cabin owner should be able
to register their cabin and manage its profile including name, location, capacity, and amenities.
```

### Output Summary
AI drafted the full intent file at `ai-dlc/ops/inception/intents/2026-06-04-cabin-profile-registration.md`
including What, Why, Success Looks Like, Assumptions, Open Questions, and Out of Scope sections.
Updated the intents README index. Intent set to status `Ready`.

### Quality Gate Result
- Context: Pass — CabinConnect cabin profile feature, Host actor
- Constraints: N/A — intent writing is not code generation; gate does not apply
- Acceptance Criteria: N/A
- Output Format: N/A

### Changes Made to Output
None — intent accepted as drafted.

### Decision Notes
- Decided to keep intent scope tight: pricing, booking, visitor instructions, maintenance, and cost estimation all deferred as separate future intents.
- Location scoped to plain text for MVP (no map/geocoding).
- Amenities scoped to a predefined enumerable set (free-text deferred).

---

## Session 2026-06-04 — Mob Elaboration

### Prompt
```
Run a mob elaboration for the Cabin Profile Registration intent
```

### Output Summary
AI ran a turn-by-turn conversational elaboration, proposing 5 units one at a time with
acceptance criteria for each. Each unit was confirmed interactively before moving on.
All 5 unit files created in `build/units/`, backlog initialised, elaboration session
record written, and intent status updated to `Elaborated`.

### Quality Gate Result
- Context: N/A — elaboration ceremony, not code generation
- Constraints: N/A
- Acceptance Criteria: N/A
- Output Format: N/A

### Changes Made to Output
None — all 5 units and their ACs accepted as proposed.

### Decision Notes
- **Amenity list confirmed:** WiFi, Sauna, Fireplace, HotTub, Parking.
- **Wrong-owner response code:** `403 Forbidden` chosen (over `404`) to make ownership enforcement explicitly testable. Note: team may prefer `404` to avoid leaking ID existence — record this preference in future sessions if revisited.
- **5 units extracted:** Register (U1), List (U2), View (U3), Edit (U4), Deactivate/Reactivate (U5).
- U2 and U3 kept as separate units despite sharing a dependency — different endpoints, different logic.
- U5 marked idempotent by design to handle UI retry on network error cleanly.

---

## Session 2026-06-04 — Bolt Planning

### Prompt
```
Plan a bolt from the open units in the backlog
```

### Output Summary
AI created Bolt-01 (Cabin Profile Management) containing all 5 units with execution order
and rationale. Bolt template file also created (no template existed). All 5 units moved
from `Open` to `Planned` in the backlog.

### Quality Gate Result
- Context: N/A — bolt planning ceremony, not code generation
- Constraints: N/A
- Acceptance Criteria: N/A
- Output Format: N/A

### Changes Made to Output
None.

### Decision Notes
- All 5 units fit within the 3–8 unit limit for a single bolt.
- Execution order: U1 → U2 → U3 → U4 → U5, with U2 and U3 parallelisable after U1.

---

## Session 2026-06-04 — Unit Execution: Register Cabin (U1)

### Prompt
```
Execute unit Register Cabin from Bolt-01
```

### Output Summary
AI generated a full-stack scaffold for U1: domain model (`Cabin`, `Amenity`, `CabinStatus`),
DTOs (`CreateCabinRequest`, `CabinDto`), repository interface and EF Core stub, service
(`CabinService`), controller (`CabinsController` — `POST /api/cabins`), React form component
(`register-cabin-form.tsx`), TypeScript types, API client, and xUnit test stubs.

### Quality Gate Result
- Context: Pass — U1, CabinConnect .NET 8 + React + Supabase, Host actor
- Constraints: Pass — EC-007 enforced (owner from JWT); `BadRequest(ModelState)` used; no `.Result`/`.Wait()`; DTOs at boundary; RLS TODO flagged
- Acceptance Criteria: Pass — AC-1.1 through AC-1.5 all traceable to generated code
- Output Format: Pass — full stack confirmed by engineer before generation

### Changes Made to Output
None — scaffold accepted as generated. TODOs remain for AppDbContext, EF Core entity config, RLS migration, integration tests, and DI registration.

### Decision Notes
- **Validation strategy:** DataAnnotations on DTO (`[Required]`, `[Range]`, `[MinLength]`) + `ModelState.IsValid` guard in controller. Business logic in service trusts pre-validated input.
- **`ValidationProblem` avoided** per code-standards rule — `BadRequest(ModelState)` used instead.
- **AC-1.2–1.5 test coverage:** service-layer unit tests cover AC-1.1 and ownership. Integration tests for the remaining ACs are TODOs, as they require the full ASP.NET Core pipeline (ModelState binding, `[Authorize]`).
- **Supabase JWT claim:** `ClaimTypes.NameIdentifier` used to extract `sub` claim — aligns with ADR-005 (JWKS-based validation maps `sub` → `NameIdentifier` automatically).
- **Frontend auth:** `useSession` from `@supabase/auth-helpers-react` used to retrieve `access_token` — does not call `navigate()` imperatively (per code-standards auth redirect rule).

---

## Dev Test — 2026-06-04 (U1: Register Cabin)

**Result:** Passed after 4 bugs found and fixed during testing.

### Bug 1 — Enum deserialisation (Logic error that looked correct)
**Symptom:** `400 Bad Request` — `"The JSON value could not be converted to CabinConnect.Api.Domain.Enums.Amenity"`
**Cause:** `System.Text.Json` deserialises enums as integers by default; the TypeScript client sends string names (`"WiFi"`, `"Fireplace"`).
**Fix:** Added `JsonStringEnumConverter` to `AddJsonOptions` in `Program.cs`.

### Bug 2 — EF Core primitive collection interception
**Symptom:** `InvalidOperationException: The type 'List<Amenity>' cannot be used as a primitive collection`
**Cause:** EF Core 8+ has built-in primitive collection handling that intercepts `List<Amenity>` before the `HasConversion` value converter runs. Without an explicit `ValueComparer`, EF Core falls back to its primitive path and rejects the non-string enum collection.
**Fix:** Added explicit `ValueConverter<List<Amenity>, string[]>` and `ValueComparer<List<Amenity>>` in `AppDbContext.cs`.

### Bug 3 — Connection string format
**Symptom:** `ArgumentException: Format of the initialization string does not conform to specification starting at index 0`
**Cause:** Supabase dashboard shows connection strings in URI format (`postgresql://...`); Npgsql requires key-value format (`Host=...;Port=...`).
**Fix:** Converted to `Host=...;Port=5432;Database=postgres;Username=postgres;Password=...;SSL Mode=Require`.

### Bug 4 — Direct DB host not reachable
**Symptom:** `SocketException (11004): The requested name is valid, but no data of the requested type was found`
**Cause:** Newer Supabase projects do not expose the direct `db.<ref>.supabase.co` hostname by default.
**Fix:** Switched to the Session Pooler connection string (`aws-0-<region>.pooler.supabase.com:5432`, username `postgres.<project-ref>`).
