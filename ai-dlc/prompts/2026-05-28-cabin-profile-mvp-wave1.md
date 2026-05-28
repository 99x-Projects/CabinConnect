# Prompts — cabin-profile-mvp Wave 1

**Date:** 2026-05-28
**Bolt:** [cabin-profile-mvp](../ops/build/bolts/cabin-profile-mvp.md)
**Units shipped:** [community-registry](../ops/build/units/community-registry.md), [owner-signup](../ops/build/units/owner-signup.md)
**Operator:** Hiran (mob with Copilot)

---

## Session: Prompt 0 — Runtime environment audit

**Context:** Starting cabin-profile-mvp bolt; need to lock runtime constraints before writing code (per improvement IMP-2026-05-28-prompt-0-runtime-audit).
**Constraints:** No Docker, no IPv6, EF migrations + Supabase SQL go to live DB only, no Testcontainers.
**Acceptance Criteria:** Decisions captured in this log; subsequent prompts cite them.
**Output Format:** Markdown checklist.

**Decisions:**
- Backend tests use EF Core InMemory (`Microsoft.EntityFrameworkCore.InMemory 8.0.10`) — no PostgreSQL test container.
- Live-DB integration tests stay opt-in via `ConnectionStrings__CabinConnectTest` env var (SkippableFact).
- JWT in tests minted in-process via RSA (existing pattern from supabase-project-and-auth).
- Migrations applied to live Supabase via `dotnet ef database update` against pooler `aws-1-ap-south-1.pooler.supabase.com:5432`.
- Supabase SQL migrations applied via `tools/db-probe --apply <file>` (no psql installed locally).
- RLS policies authored but dormant for now — API connects as `postgres` role (bypasses RLS). Role cutover deferred to security-hardening bolt.

---

## Session: Wave 1 implementation (interleaved)

**Context:** community-registry + owner-signup, single pass, both delivered together.
**Constraints:**
- C# PascalCase / TS camelCase / DB snake_case
- All endpoints authenticated (EC-007); identity from JWT only, never request body
- UTC dates; emails stored lowercase per validation
- DTOs at API boundary; domain models internal
- `Hold`/`Booking` semantics N/A this wave
**Acceptance Criteria:** All ACs in both unit files green; 23/23 backend + 24/24 frontend tests; live DB has both tables with RLS and seeded communities.
**Output Format:** Code files + tests + migrations.

### Backend artefacts
- Domain: `User`, `UserRole` enum (`Owner`/`Admin`/`Resident`/`Volunteer`), `Community`
- EF config: `UserConfiguration` (PK never-generated, Email unique varchar(320), Role stored as lower-case string with CHECK constraint added in migration via raw SQL), `CommunityConfiguration` (Name indexed varchar(200))
- Migration `20260528062410_OwnerSignupAndCommunities` with `ck_users_role` CHECK in Up + DROP in Down
- API: `GET /api/communities` (alphabetical, includes inactive), `GET /api/users/me` (lazy provisioning, idempotent insert with `DbUpdateException` race tolerance, write-through on email change, display name from `user_metadata.display_name` JSON claim → email local part → "Cabin Owner")
- Tests: `JwtAndDbTestFactory` (RSA JWT + EF InMemory with per-factory `_dbName` GUID); 3 communities tests + 6 users/me tests

### Supabase artefacts
- `supabase/migrations/20260528100000_owner_signup_and_communities.sql` — RLS on `users` (3 policies on `auth.uid() = id`) + RLS on `communities` (select-all-authenticated)
- `supabase/seed.sql` — 5 communities with stable UUIDs, `ON CONFLICT (id) DO NOTHING`. 4 active, 1 inactive (Evergreen Pines Reserve) to validate AC "inactive still returned".

### Frontend artefacts
- `api/client.ts` — `getUsersMe()` + `UserMeResponse` interface; preserved 401 refresh+retry via `supabaseClient.auth.refreshSession()`
- `auth/sign-up-validation.ts` — `validateSignUp`, `MIN_PASSWORD_LENGTH=8`, `MAX_DISPLAY_NAME_LENGTH=100`
- `pages/sign-up-page.tsx` — calls `supabaseClient.auth.signUp({ email, password, options: { data: { display_name } } })`; trims inputs; navigates to `/health` on success
- `pages/sign-in-page.tsx` — calls `signInWithPassword`; trims email
- Tests use `vi.hoisted` + `import * as ReactRouter from 'react-router-dom'` pattern (avoids `import()` type annotation lint warning)

### Live DB verification
| Check | Result |
|---|---|
| `dotnet ef database update` (live pooler) | `Applying migration '20260528062410_OwnerSignupAndCommunities'. Done.` |
| SQL migration `20260528100000_owner_signup_and_communities.sql` applied | OK |
| seed.sql applied | `affected=5` |
| `SELECT name, region, active FROM communities` | 5 rows; Aspen Hollow Resort, Birch Lake Community, Cedar Ridge Estates, Driftwood Bay (all active); Evergreen Pines Reserve (inactive) |
| `pg_tables.rowsecurity` for `users`, `communities` | both `True` |
| `pg_policies` | `users_select_own`, `users_insert_own`, `users_update_own`, `communities_select_all_authenticated` |

### Pitfalls captured
- **CS0853 in EF HasConversion:** `Enum.Parse<UserRole>(v, ignoreCase: true)` failed in expression tree (named args forbidden). Use `(UserRole)Enum.Parse(typeof(UserRole), v, true)`.
- **Vitest URL assertion captured at module load:** `apiBaseUrl` in `client.ts` is captured at import time, so `vi.stubEnv('VITE_API_BASE_URL', ...)` in `beforeEach` has no effect on already-imported code. Use regex matcher (`/\/api\/users\/me$/`) for path-only assertions.
- **ESLint `consistent-type-imports` with `vi.importActual`:** inline `typeof import('...')` type annotations are forbidden. Use `import * as Module from '...'` then `vi.importActual<typeof Module>('...')` — counterintuitively this is the type-aware form ESLint allows after `--fix` rewrites.

---

## Outstanding
- Manual end-to-end smoke test via running API + real Supabase JWT (deferred to Wave 2 kickoff; both endpoints already covered by integration tests).
- Bolt-level DoD items remain for Wave 2/3 (E2E happy path, contract test, log scrubbing, retro).
