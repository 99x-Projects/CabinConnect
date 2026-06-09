# Improvement: IDesignTimeDbContextFactory required when fail-fast startup is used

**Status:** Applied
**Triggered by:** [ops/operate/retros/2026-06-09-1781002300-cabin-registration.md](../retros/2026-06-09-1781002300-cabin-registration.md)
**Applied date:** 2026-06-09

---

## Target File

`ai-dlc/rules/code-standards.md`

---

## Current Text

```
### Dependency Injection
- Register all services and repositories in `Program.cs` or dedicated extension methods
- Use constructor injection only — no service locator pattern
- Scope: repositories are Scoped; stateless services are Scoped or Singleton as appropriate
```

---

## Proposed Replacement

```
### Dependency Injection
- Register all services and repositories in `Program.cs` or dedicated extension methods
- Use constructor injection only — no service locator pattern
- Scope: repositories are Scoped; stateless services are Scoped or Singleton as appropriate

### EF Core Migrations
- When `Program.cs` uses fail-fast env var validation (`?? throw`), EF Core design-time commands (`dotnet ef migrations add`, `dotnet ef database update`) will fail because they run the application startup and throw before the DbContext can be resolved
- Always include `IDesignTimeDbContextFactory<TDbContext>` in `Data/` alongside the DbContext; this class reads `DATABASE_URL` directly from `Environment.GetEnvironmentVariable` and bypasses application startup entirely
- The factory must be present from the first migration — add it in the same unit that introduces the DbContext
```

---

## Reason

During the Cabin Registration bolt, `dotnet ef database update` failed with `CORS_ALLOWED_ORIGINS not set` because `Program.cs` threw before EF Core could resolve the DbContext. A `IDesignTimeDbContextFactory` was added reactively as a follow-up fix rather than proactively in the scaffold unit. Adding this rule ensures every future project that uses fail-fast startup includes the factory from the start, so `dotnet ef` commands work immediately without a debugging loop.

---

## Validation

- [ ] The next bolt that runs `dotnet ef` commands succeeds on the first attempt without a `CORS_ALLOWED_ORIGINS` or similar startup error
- [ ] `IDesignTimeDbContextFactory` is present in any new project that uses fail-fast `Program.cs` env var checks
