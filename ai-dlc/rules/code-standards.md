# Code Standards

All patterns on this page are extracted from the CabinConnect codebase (archaeology June 2026). Every AI session must match these conventions exactly.

---

## Languages & Runtimes

| Layer | Language | Runtime | Key Libraries |
|---|---|---|---|
| Backend | C# 12+ | .NET 10 | EF Core 10, Npgsql, Swashbuckle, JwtBearer |
| Frontend | TypeScript 5 (strict) | Node 20 / Vite | React 19, Tanstack React Query 5, react-hook-form 7, Zod 4, Tailwind CSS 4, Radix UI |
| Database | SQL / PostgreSQL | Supabase (hosted Postgres) | pgcrypto, RLS |
| Tests | C# | .NET 10 | xUnit, NSubstitute, FluentAssertions |

---

## C# Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Namespaces | `CabinConnect.{Layer}.{Feature}` | `CabinConnect.Api.Controllers` |
| Classes | PascalCase, descriptive nouns | `CabinService`, `CabinRepository` |
| Interfaces | `I` prefix + PascalCase | `ICabinRepository`, `ICabinService` |
| Methods | PascalCase; async methods suffixed `Async` | `GetByHostIdAsync`, `UpdateAsync` |
| Properties | PascalCase, auto-properties | `Cabin.Name`, `Booking.CheckIn` |
| Exceptions | `{Scenario}Exception` | `CabinNotFoundException`, `DuplicateCabinNameException` |
| Constants | Static classes with `const` strings | `AuthConstants.AppRoleClaimName` |
| Private fields | Not used — prefer auto-properties or locals | — |

---

## C# / .NET Patterns

### DTOs
- Use C# `record` types for all DTOs — immutable by default
- Separate request from response DTOs (`CreateCabinRequest` vs `CabinDto`)
- No computed properties or methods on DTOs
- Domain entities never leave the service layer — always map to DTOs at the controller boundary

```csharp
// Correct
public record CabinDto(Guid Id, string Name, string? Location, int Capacity, decimal BaseRate, int Version);

// Wrong — mutable class, or domain entity returned directly from controller
```

### Repository Pattern
- One repository per domain entity (or tightly coupled group)
- Every repository method calls `SaveChangesAsync()` internally (auto-save pattern)
- Never call `SaveChangesAsync()` from a service — it belongs in the repository
- Methods return `T?` (nullable) or collections, not exceptions on not-found — let the service throw

```csharp
public async Task<Cabin?> GetByIdAsync(Guid id, CancellationToken ct = default)
    => await db.Cabins.FirstOrDefaultAsync(c => c.Id == id, ct);

public async Task AddAsync(Cabin cabin, CancellationToken ct = default)
{
    db.Cabins.Add(cabin);
    await db.SaveChangesAsync(ct);
}
```

### Exception Handling
- Services throw domain-specific exceptions — never `InvalidOperationException` or raw `Exception`
- Controllers catch specific exceptions and map to HTTP status — no catch-all handlers
- Repositories catch `DbUpdateException` and translate to domain exceptions before rethrowing
- Catch only specific exception types — never bare `catch { }` or `catch (Exception)`

```csharp
// Repository: translate DB exception to domain exception
catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
{
    throw new DuplicateCabinNameException(cabin.Name);
}
catch (DbUpdateConcurrencyException)
{
    throw new CabinVersionConflictException(cabin.Id, cabin.Version);
}
```

### Ownership Verification
- Ownership checks happen at the **controller level** — extract host ID from claims, load resource, compare
- Services do not re-verify ownership — they trust the host ID passed in by the controller
- Pattern: load entity, check `entity.HostId == hostId`, throw 403 if mismatch

```csharp
// Controller
var hostId = Guid.Parse(User.FindFirstValue("sub")!);
var cabin = await _cabinService.GetByIdAsync(id, ct)
    ?? throw new CabinNotFoundException(id);  // → 404
if (cabin.HostId != hostId)
    return Forbid();  // → 403
```

### Async / Await
- All I/O is async — no blocking calls
- `CancellationToken ct = default` parameter on every repository and service method
- Pass `ct` through to all EF Core calls
- Never use `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`

### Dependency Injection
- `AddScoped` for repositories and services (per-request lifetime)
- `AddHttpClient<TClient, TImpl>` for typed HTTP clients
- Constructor injection only — no service locator, no property injection

### Constants
- Claim names, status strings, and role values must be in a constants class — never inline
- Required classes: `AuthConstants` (claim names, role values), `UserRoleStatus` (status strings)

```csharp
public static class AuthConstants
{
    public const string SubClaimName = "sub";
    public const string AppRoleClaimName = "app_role";
    public const string SuperAdminRole = "super_admin";
}

public static class UserRoleStatus
{
    public const string Pending = "pending";
    public const string Active = "active";
}
```

### EF Core Configuration
- One `IEntityTypeConfiguration<T>` file per entity
- Explicit column mapping: `.HasColumnName("snake_case_name")`
- Unique indices declared in configuration, not via Data Annotations
- Concurrency tokens: `.IsConcurrencyToken()` on version fields
- `ApplyConfigurationsFromAssembly()` in `OnModelCreating` — no manual entity registration

### Validation
- Model validation via Data Annotations on request DTOs — always check `ModelState.IsValid`
- Add `[MaxLength]` on all string fields — no unbounded strings
- Custom business rules validated in the service layer, not the controller

---

## TypeScript / React Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase | `CabinCard.tsx`, `CreateCabinModal.tsx` |
| Hook files | kebab-case | `use-toast.ts` |
| Utility files | kebab-case | `utils.ts` |
| Components | PascalCase function exports | `export function CabinCard(...)` |
| Types / Interfaces | PascalCase | `Cabin`, `CabinDetail`, `FormValues` |
| Variables / Functions | camelCase | `setCreateOpen`, `handleSubmit` |
| Constants | UPPER_SNAKE_CASE | `TOAST_LIMIT`, `STALE_TIME_MS` |
| Query keys | Centralized factory in `queryKeys.ts` | `queryKeys.cabins.detail(id)` |

---

## React / TypeScript Patterns

### State Management
- Local component state: `useState`
- Global auth state: React Context (`AuthProvider`)
- Server state: Tanstack React Query — do not use `useState` for data fetched from the API
- No Redux, no Zustand — current scale does not require it

### Query Keys
- All query keys must be defined in `src/queryKeys.ts` — never inline strings in `useQuery`

```typescript
// src/queryKeys.ts
export const queryKeys = {
  cabins: {
    all: ['cabins'] as const,
    detail: (id: string) => ['cabins', id] as const,
  },
  amenityTags: {
    all: ['amenity-tags'] as const,
  },
} as const;

// Usage
const { data } = useQuery({ queryKey: queryKeys.cabins.detail(id), queryFn: ... });
```

### API Calls
- Use the `apiFetch()` wrapper in `services/api.ts` — never call `fetch()` directly in components
- API methods live in service modules (`services/cabins.ts`, `services/invitations.ts`)
- Components consume services via React Query — no direct service calls outside `queryFn`/`mutationFn`

```typescript
// service layer
export const cabinsApi = {
  list: () => apiFetch<Cabin[]>('/api/cabins'),
  get: (id: string) => apiFetch<CabinDetail>(`/api/cabins/${id}`),
};

// component
const { data: cabins } = useQuery({
  queryKey: queryKeys.cabins.all,
  queryFn: cabinsApi.list,
});
```

### Form Handling
- react-hook-form + Zod for all forms
- Define Zod schema first, infer `FormValues` type from it
- At least 1 amenity tag required on cabin creation (matches edit behavior)

```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(512),
  amenityTagIds: z.array(z.string()).min(1, 'At least one amenity tag is required'),
});
type FormValues = z.infer<typeof schema>;
```

### Error Handling
- Use `ApiError` from `services/api.ts` for all API errors — check `error.status` for specific handling
- Centralize error message extraction in a shared utility — do not inline parsing in every component

### TypeScript
- Strict mode — no `any` without an explanatory comment
- Prefer explicit `interface` for component props; `type` for unions and inferred form values
- No implicit `any` — all generics must be typed explicitly

### Reveal / Sensitive Data Pattern
- Business logic for revealing sensitive fields (key info) must live in a custom hook, not in components
- Components call the hook; the hook calls the service and updates state

### Error Boundary
- A React Error Boundary must wrap all protected routes to prevent full app unmount on crash

---

## Database Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Tables | snake_case plural | `cabins`, `cabin_amenity_tags` |
| Columns | snake_case | `host_id`, `check_in`, `created_at` |
| Constraints | Descriptive human-readable | `bookings_check_out_after_check_in` |
| RLS Policies | Intent description | `"Hosts manage their own cabins"` |

- RLS enabled by default on all application tables (deny-all by default; explicit allow policies)
- Public lookup tables (e.g., `amenity_tags`) may omit RLS
- All new tables must have RLS enabled and policies defined before the first Bolt executes

---

## Testing Standards

### Backend (xUnit + NSubstitute + FluentAssertions)
- One test class per controller or major service
- Test method naming: `{MethodName}_{Scenario}_{ExpectedOutcome}`
- Each test maps to one or more numbered acceptance criteria (add AC comment)
- Use `Substitute.For<T>()` for dependencies — never construct real repositories in unit tests
- Assertions: `result.Should().Be(...)`, `list.Should().HaveCount(...)`, `action.Should().ThrowAsync<T>()`
- All exception translation paths (e.g., `DbUpdateException` → domain exception) must have a test

### Frontend (Vitest + React Testing Library — to be established)
- Unit tests for: API service layer (`apiFetch`, service modules), Zod schemas, custom hooks
- Integration tests for: auth flow, critical form submissions
- No tests for styling or Tailwind classes

---

## Default AC for Existing-Code Bolts

Every Bolt that modifies existing code must carry this AC — it cannot be removed during elaboration:

**Standard form** (Enhancement Bolts):
> "All integration tests for [affected module] pass without modification."

**Contract-change form** (Migration and Remediation Bolts that explicitly change API shapes, data schemas, or inter-module interfaces):
> "All integration tests for [affected module] pass without modification, except for tests covering the contract boundaries listed as breaking changes below. Each breaking change must be detailed and approved in the elaboration session before any code is generated."

When the contract-change form applies, the unit file must include a **Breaking Changes Register** — a table listing every changed contract boundary, the reason, and the approving engineer. No unit using the contract-change form may execute without a completed register.

### Contract Change Check — Run Before Every Unit That Touches a DTO or Interface

Before executing any unit that modifies a DTO, controller action signature, or service interface, explicitly ask:

1. Does this change alter the shape of any API endpoint (request body, response body, route, or HTTP method)?
2. Does this change alter the interface between two internal modules (service method signature, repository return type, event payload)?

If yes to either: the **contract-change form** applies. A Breaking Changes Register must be completed in the unit file before any code is generated.

If unsure: ask the engineer. "It's a small change" does not exempt a unit from this check.

---

## Anti-Patterns — Never Do These

| Anti-pattern | Why prohibited |
|---|---|
| Bare `catch { }` in C# | Swallows unexpected exceptions; hides bugs |
| Magic strings for claims or status values | Typo-prone; breaks silently on refactor |
| Returning domain entities from controllers | Breaks layer isolation; leaks internal model |
| Calling `SaveChangesAsync()` in a service | Violates auto-save repository contract |
| Ownership check in service layer | Ownership is a controller-level concern |
| Inline `useQuery` key strings | Cache invalidation becomes unreliable |
| Direct `fetch()` call in React component | Bypasses auth token injection and error handling |
| `any` in TypeScript without comment | Defeats type safety |
| Unbounded string fields in DTOs | DoS vector via large payloads |
| `.Result` or `.Wait()` in async C# | Deadlock risk; violates async-all-the-way principle |
