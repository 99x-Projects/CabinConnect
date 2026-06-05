# Architecture Decision Records

Add an ADR whenever a cross-cutting architectural decision is made. These decisions govern how Claude operates in this codebase — without them, the AI may make different choices if not told.

---

### ADR-001 — Clean Architecture (Api → Domain ← Infrastructure)

**Decision:** The backend follows Clean Architecture with three projects:
- `CabinConnect.Api` — controllers, DTOs, services, HTTP concerns
- `CabinConnect.Domain` — entities, interfaces, exceptions (no framework dependencies)
- `CabinConnect.Infrastructure` — repositories, DbContext, EF Core configuration

**Why:** Isolates domain logic from infrastructure; entities can be tested without a database; interfaces in Domain allow Infrastructure to be swapped.

**Trade-off:** More projects and interfaces than a simple two-layer API. The boilerplate is worth it for long-term testability.

**Rule for AI:** New entities go in Domain. New repository interfaces go in Domain. Implementations go in Infrastructure. HTTP-specific logic (controllers, DTOs, service orchestration) goes in Api. Never put EF Core directly in Api.

---

### ADR-002 — Supabase Auth via JWT (No Custom Auth)

**Decision:** Authentication is fully delegated to Supabase Auth. The .NET API validates Supabase-issued JWTs. No custom token issuance, no custom user table for credentials.

**Why:** Avoids building and maintaining auth infrastructure. Supabase handles password hashing, token refresh, and session management.

**Trade-off:** Dependency on Supabase as an auth provider. Migration away from Supabase requires replacing JWT validation and the invitation flow.

**Rule for AI:** Do not implement custom JWT issuance, password hashing, or session management. Do not add a `users` table for credentials — use `user_roles` for app-level role tracking only.

---

### ADR-003 — Repository Pattern with Auto-Save

**Decision:** One repository per domain entity. Every repository method calls `SaveChangesAsync()` internally (auto-save). Services never call `SaveChangesAsync()` directly.

**Why:** Consistent, predictable persistence behaviour. Callers don't need to manage save calls. Simpler than a Unit-of-Work pattern for the current scale.

**Trade-off:** Cannot batch multiple entity saves in a single database transaction via the repository layer. If transactional multi-entity saves are needed, add a dedicated service method that uses `AppDbContext` directly (and document it as an exception).

**Rule for AI:** All new repository methods must call `SaveChangesAsync()` before returning. Never add `SaveAsync()` as a separate public method on a repository.

---

### ADR-004 — Frontend Data via .NET API Only

**Decision:** The React frontend calls the .NET API for all data operations. It never queries Supabase Postgres directly.

**Why:** Keeps business rules in one place (the .NET service layer). Prevents logic duplication between frontend and backend. RLS alone is insufficient as a business rule enforcer.

**Trade-off:** All reads go through the API, adding a network hop. Direct Supabase real-time subscriptions are not used.

**Rule for AI:** Never generate frontend code that uses `supabase.from(...)` for data queries or mutations. Supabase client in the frontend is for `supabase.auth.*` only.

---

### ADR-005 — Immutable DTOs as C# Records

**Decision:** All request and response DTOs are C# `record` types.

**Why:** Records are immutable by default, which prevents accidental mutation during request handling. They provide structural equality, which simplifies test assertions.

**Trade-off:** Records are slightly more verbose for complex nested structures with optional fields.

**Rule for AI:** All new DTOs must be `record` types. Do not use `class` for DTOs.

---

### ADR-006 — Domain Exception-Based Error Handling

**Decision:** Services throw named domain exceptions (e.g., `CabinNotFoundException`, `DuplicateCabinNameException`). Controllers catch specific exception types and map to HTTP status codes.

**Why:** Makes error paths explicit and testable. Avoids stringly-typed error checking. Controllers remain thin and declarative.

**Trade-off:** More exception classes to maintain than a result-type approach (e.g., `Result<T>`).

**Rule for AI:** When adding a new error path, create a domain exception class in `CabinConnect.Domain/Exceptions/`. Add a catch clause in the relevant controller mapping it to the correct HTTP status.

---

### ADR-007 — EF Core with Npgsql (No Raw SQL, No Dapper)

**Decision:** All database access uses EF Core 10 with the Npgsql PostgreSQL provider. Fluent API configuration in `IEntityTypeConfiguration<T>` classes.

**Why:** Type-safe queries, migration support, and automatic concurrency handling via `IsConcurrencyToken()`.

**Trade-off:** EF Core adds overhead compared to Dapper for complex read queries. For the current scale this is acceptable.

**Rule for AI:** Never generate Dapper or raw ADO.NET code. Use EF Core LINQ queries. For complex read-only queries, use `AsNoTracking()`. For raw SQL, use `FromSqlRaw` with parameterized inputs only.

---

### ADR-008 — Ownership Checks at the Controller Level

**Decision:** Resource ownership verification (`entity.HostId == hostId`) happens in controllers, not in services. Services receive the verified `hostId` and trust it.

**Why:** Keeps ownership enforcement in one visible, testable layer. Services remain reusable without being coupled to HTTP context.

**Trade-off:** A service method called outside of a controller context (e.g., a background job) must implement its own ownership verification if needed.

**Rule for AI:** Ownership checks go in controllers. Services do not check `HostId` against the caller.

---

### ADR-009 — Feature Flags via Environment Variables

**Decision:** New behaviour introduced into existing modules is wrapped in environment variable flags. Frontend: `VITE_FF_<FEATURE>=true`. Backend: `FeatureFlags:<Feature>` in `IConfiguration`.

**Why:** Enables rollback without redeployment. Limits blast radius of AI-generated changes to existing modules.

**Trade-off:** Feature flags accumulate technical debt if not removed after full rollout. Each flag must have a documented removal condition.

**Rule for AI:** Any new unit that modifies an existing module must use a feature flag. Fresh modules and greenfield endpoints do not require flags. Document the flag name and removal condition in the unit file.

---

### ADR-010 — Tanstack React Query for Server State

**Decision:** All server-fetched data is managed by Tanstack React Query. No `useState` for data from the API.

**Why:** Provides automatic caching, background refetch, stale-time management, and loading/error state without boilerplate.

**Trade-off:** Adds a dependency and requires learning React Query patterns. Mutations and cache invalidation patterns must be followed consistently.

**Rule for AI:** New data-fetching code must use `useQuery`. New write operations must use `useMutation`. Do not use `useEffect` + `useState` to fetch data. All query keys must use the `queryKeys` factory in `src/queryKeys.ts`.

---

### ADR-011 — Supabase Admin API Calls from InvitationService Only

**Decision:** The Supabase Admin API (user invite, user delete) is called only from `InvitationService` via `ISupabaseAdminClient`. No other service or controller may use the Supabase admin client.

**Why:** Centralizes privileged Supabase operations. Makes it easy to audit, rate-limit, and log all admin actions.

**Trade-off:** Future user management features must extend `ISupabaseAdminClient` rather than creating new admin clients.

**Rule for AI:** Do not inject `ISupabaseAdminClient` into any class other than `InvitationService`. If a new feature needs Supabase admin operations, add it to the existing interface.
