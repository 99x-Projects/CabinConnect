# Prompts — cabin-profile-mvp Wave 3 implementation

**Date:** 2026-05-28
**Bolt:** [cabin-profile-mvp](../ops/build/bolts/cabin-profile-mvp.md)
**Units impacted:** [cabin-view-edit](../ops/build/units/cabin-view-edit.md), [cabin-operational](../ops/build/units/cabin-operational.md)
**Operator:** Hiran (mob with Copilot)

---

## Session: Wave 3 backend + frontend delivery pass

**Context:** Continue remaining waves by implementing cabin profile edit and operational details end to end.
**Constraints:**
- Keep auth and owner scoping server-authoritative
- Keep public cabin DTO free of operational fields
- Preserve existing route/feature-flag patterns in frontend
**Acceptance Criteria:**
- `/api/cabins/me` GET/PUT implemented with create-equivalent validation
- `/api/cabins/me/operational` GET/PUT implemented with validation + upsert behavior
- DB migrations and RLS migration added
- Backend + frontend tests pass
**Output Format:** Code changes + migration artifacts + test run evidence.

### Backend API changes
- Added Wave 3 endpoints and validation helpers in:
  - `src/backend/CabinConnect.Api/Cabins/CabinsEndpoints.cs`
- New request/DTO contracts:
  - `src/backend/CabinConnect.Api/Cabins/UpdateCabinRequest.cs`
  - `src/backend/CabinConnect.Api/Cabins/CabinOperationalDto.cs`
  - `src/backend/CabinConnect.Api/Cabins/UpsertCabinOperationalRequest.cs`
- New domain model + EF config:
  - `src/backend/CabinConnect.Domain/Cabins/CabinOperationalDetails.cs`
  - `src/backend/CabinConnect.Infrastructure/Persistence/Configurations/CabinOperationalDetailsConfiguration.cs`
  - `src/backend/CabinConnect.Infrastructure/Persistence/CabinConnectDbContext.cs` (DbSet)

### DB and RLS artifacts
- EF migration generated:
  - `src/backend/CabinConnect.Infrastructure/Migrations/20260528081139_CabinViewEditOperational.cs`
  - designer/snapshot updates generated with it
- Supabase RLS migration added:
  - `supabase/migrations/20260528130000_cabin_operational_details.sql`
- RLS policy pattern: operational rows are owner-scoped by parent cabin ownership (`cabins.owner_id = auth.uid()`).

### Backend tests
- Added endpoint coverage in:
  - `src/backend/CabinConnect.Api.Tests/CabinProfileEndpointsTests.cs`
- Includes cases for:
  - 401/404 behavior
  - successful profile update
  - immutable-field ignore behavior
  - inactive community validation
  - concurrent PUT tolerance
  - operational defaults/upsert and no-secret echo in validation response
- Test evidence:
  - `dotnet test CabinConnect.sln` passed (`49` total, `48` passed, `1` skipped).

### Frontend integration
- API client additions:
  - `getOwnCabin`, `updateOwnCabin`, `getOwnCabinOperational`, `upsertOwnCabinOperational`
  - `src/frontend/src/api/client.ts`
- New pages:
  - `src/frontend/src/pages/edit-cabin-page.tsx`
  - `src/frontend/src/pages/cabin-operational-page.tsx`
- Route wiring:
  - `src/frontend/src/app.tsx` adds `/my-cabin/edit` and `/my-cabin/operational` (feature-flag gated)
- Dashboard links updated:
  - `src/frontend/src/pages/owner-home-page.tsx`
- Styling extensions:
  - `src/frontend/src/styles.css`

### Frontend tests/build
- Added API client tests for Wave 3 endpoints in:
  - `src/frontend/src/api/client.test.ts`
- Test evidence:
  - `npm run test -- --run` passed (`26/26`)
- Build evidence:
  - `npm run build` passed (`tsc --noEmit && vite build`).

---

## Notes
- Backlog and unit statuses moved from Planned/Open to In Progress pending final Wave 3 closeout checks.

---

## Session: Wave 3 closeout + log-scrubbing hardening

**Context:** Complete closeout checklist and satisfy explicit log-scrubbing DoD requirement before marking Wave 3 units done.
**Acceptance Criteria:**
- App logs never include submitted access-code values or emergency contact phone values
- Backend + frontend validation remains green after test harness changes

### Additional test infrastructure
- Added in-memory log capture provider for integration tests:
  - `src/backend/CabinConnect.Api.Tests/Helpers/InMemoryLogCollector.cs`
  - `src/backend/CabinConnect.Api.Tests/Helpers/JwtAndDbTestFactory.cs`

### New security test
- Added explicit app-log scrubbing assertion:
  - `PUT_operational_logs_do_not_include_secret_values`
  - file: `src/backend/CabinConnect.Api.Tests/CabinProfileEndpointsTests.cs`

### Verification evidence
- `dotnet test CabinConnect.sln`: passed (`50` total, `49` passed, `1` skipped)
- `npm run test -- --run`: passed (`26/26`)
- `npm run build`: passed

### Artifact status updates
- Unit files marked `Done`:
  - `ai-dlc/ops/build/units/cabin-view-edit.md`
  - `ai-dlc/ops/build/units/cabin-operational.md`
- Backlog updated: Wave 3 units moved into Done table.

---

## Session: Start next remaining closeout wave (bolt-level E2E)

**Context:** After unit-level closeout, begin the next remaining bolt work item from the DoD list.

### Added test
- New end-to-end happy-path integration test:
  - `src/backend/CabinConnect.Api.Tests/CabinProfileMvpE2eTests.cs`
  - test: `End_to_end_owner_happy_path_profile_and_operational_workflow`

### Flow covered
- `GET /api/users/me` (owner bootstrap)
- `GET /api/communities`
- `POST /api/cabins`
- `GET/PUT /api/cabins/me`
- `PUT /api/cabins/me/operational`
- final `GET /api/cabins/me` asserts operational fields are absent

### Verification evidence
- `dotnet test CabinConnect.sln`: passed (`51` total, `50` passed, `1` skipped)

---

## Session: Final bolt closeout verification

**Context:** Complete remaining bolt-level checklist items and close the `cabin-profile-mvp` bolt.

### Added verification artifact
- New executable RLS policy audit tests:
  - `src/backend/CabinConnect.Api.Tests/SupabaseRlsPolicyAuditTests.cs`
  - Covers positive/negative policy assertions for `users`, `cabins`, and `cabin_operational_details`.

### Commands and outcomes
- `dotnet test CabinConnect.sln` → passed (`54` total, `53` passed, `1` skipped)
- `./scripts/check-migrations.ps1` → clean
- `dotnet ef database update --project CabinConnect.Infrastructure --startup-project CabinConnect.Api --context CabinConnectDbContext` → applied migration `20260528081139_CabinViewEditOperational`

### Closeout status
- `ai-dlc/ops/build/bolts/cabin-profile-mvp.md` marked `Done`, with closed date `2026-05-28`.
- `ai-dlc/ops/build/backlog.md` bolt table updated to `Done`.
