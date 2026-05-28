# Prompts — cabin-profile-mvp Wave 2

**Date:** 2026-05-28
**Bolt:** [cabin-profile-mvp](../ops/build/bolts/cabin-profile-mvp.md)
**Unit shipped:** [cabin-register](../ops/build/units/cabin-register.md)
**Operator:** Hiran (mob with Copilot)

---

## Session: Wave 2 implementation

**Context:** Unit 3 `cabin-register` — write side of cabin profile; the anchor record other modules will attach to.
**Constraints:**
- `owner_id` from JWT only (EC-007 / EC-F); request body cannot override
- `UNIQUE(owner_id)` — one cabin per owner for MVP
- Re-check `community.active` at insert (EC-B)
- Amenities validated against curated seeded reference table (EC-C); de-duplicate, lowercase, reject empties/unknowns
- Trim name/address; reject control chars; length caps (100 / 250); capacity int 1–50 (no silent coercion of float/string — EC-E)
- DTO excludes sensitive operational fields (AC8)
- RLS on `cabins` (owner-scoped); read-all on `amenities` for authenticated
- UTC `created_at` + `updated_at` from day one
**Acceptance Criteria:** All 8 ACs in [cabin-register.md](../ops/build/units/cabin-register.md).
**Output Format:** Domain + EF config + EF migration + Supabase SQL migration + amenities seed + endpoint + tests.

### Backend artefacts
- Domain: `Cabin` (Id, OwnerId, CommunityId, Name, Address, Capacity, Amenities List<string>, CreatedAt, UpdatedAt); `Amenity` (Code PK, Name, Active)
- EF config: `cabins` table with `UNIQUE(owner_id)`, index on `community_id`, `text[]` for amenities, timestamptz for both timestamps; `amenities` table with Code PK
- Migration `20260528065828_CabinRegistration` + manually-appended raw SQL `ck_cabins_capacity CHECK (capacity BETWEEN 1 AND 50)` for defence-in-depth
- API: `POST /api/cabins` with full validation pipeline:
  - Trim name/address; control-char regex `[\u0000-\u001F\u007F]`
  - Capacity nullable int (rejects JSON float/string via System.Text.Json default)
  - Amenity de-dup via `HashSet<string>(OrdinalIgnoreCase)` preserving order; lowercase normalization
  - Pre-flight community existence + `Active` check
  - Pre-flight `AnyAsync(c => c.OwnerId == ownerId)` for clean 409; `DbUpdateException` catch as race fallback (EC-A)
  - `Results.Created($"/api/cabins/{id}", dto)`

### Supabase artefacts
- `supabase/migrations/20260528120000_cabin_registration.sql` — RLS on `cabins` (4 policies: select/insert/update/delete with `auth.uid() = owner_id`) + RLS on `amenities` (select-all-authenticated)
- `supabase/seed.sql` — 15 amenities: wifi, parking, kitchen, washer, dryer, heating, air_conditioning, fireplace, hot_tub, sauna, bbq, deck, lake_access, ski_storage, pet_friendly. `ON CONFLICT (code) DO NOTHING`.

### Tests (14 cases covering all 8 ACs)
- AC1+AC2+AC8: valid create returns 201 with DTO; owner_id from JWT; UTC timestamps within 1 min; DTO JSON does not contain `access_code`/`emergency`/`house_rules`
- AC2/EC-F: client-supplied `owner_id` + `id` in body ignored
- AC3: no token → 401, no record
- AC4: unknown community → 400
- AC4/EC-B: inactive community → 400
- AC5: empty/whitespace name, oversize name, out-of-range capacity (0, -1, 51), unknown amenity → 400
- AC5/EC-C: duplicate amenities de-duplicated (case-insensitive)
- AC6: second create by same owner → 409
- EC-D: trim whitespace on name/address

### Live DB verification
| Check | Result |
|---|---|
| `dotnet ef database update` (live pooler) | `Applying migration '20260528065828_CabinRegistration'. Done.` |
| `20260528120000_cabin_registration.sql` applied | OK |
| seed.sql applied | `affected=15` (5 communities already on conflict + 15 amenities inserted) |
| `pg_tables.rowsecurity` for `cabins`, `amenities` | both `True` |
| `pg_policies` on cabins | `cabins_select_own`, `cabins_insert_own`, `cabins_update_own`, `cabins_delete_own` |
| `pg_policies` on amenities | `amenities_select_all_authenticated` |
| `pg_constraint` on cabins | `ck_cabins_capacity` present |
| 15 amenities query | all 15 returned in alphabetical order |

### Pitfalls captured
- **Locked DLLs from a stuck `dotnet run`:** A previous API process (PID 28760) held `CabinConnect.Domain.dll` and `.Infrastructure.dll` open during build, producing MSB3027 errors after 10 retries. Fix: `Get-Process -Id <pid> | Stop-Process -Force` then rebuild. Avoid by killing dev servers before `dotnet build` / `dotnet ef`.
- **EF InMemory + `HasColumnType("text[]")`:** The Npgsql-specific column type is silently ignored by InMemory but `List<string>` round-trips natively, so tests pass without provider-specific shims.
- **`Results.ValidationProblem` dictionary type:** wants `Dictionary<string, string[]>`, not `Dictionary<string, List<string>>` — internal accumulator uses the latter for ergonomic `Add`, converted once via `ToDictionary`.

---

## Outstanding
- Wave 3 (`cabin-view-edit` + `cabin-operational`) is unblocked.
- Bolt-level DoD items remaining: end-to-end happy path test, contract test (operational fields excluded from profile DTO), log-scrubbing test, retro.
