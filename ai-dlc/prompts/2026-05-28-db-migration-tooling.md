# Prompt log — db-migration-tooling

**Date:** 2026-05-28
**Unit:** [db-migration-tooling](../ops/build/units/db-migration-tooling.md)
**Bolt:** [repo-scaffold](../ops/build/bolts/repo-scaffold.md)
**Operator:** Hiran (with GitHub Copilot)

---

## Prompt (verbatim)

> Kick off Wave 2

Followed by:

> can we do it without using docker?

(User selected via the clarification dialog: **Option A — adjust ACs as proposed (skip Testcontainers + drop local Supabase stack); log as deviations.**)

## Quality Gate

- **Context:** establish EF Core 8 migration tooling alongside Supabase CLI for schema management, with a clean split of responsibilities (EF = app-level DDL, Supabase = RLS/triggers/policies). Repository has no entities yet; this unit produces the plumbing only.
- **Constraints:** CLAUDE.md §3 (no raw SQL, parameterized only; snake_case DB identifiers; UTC dates), CLAUDE.md §6 RLS on every table (enforced via Supabase migrations, not EF). Docker is not available on the dev box (per user) — workflows must remain runnable without it. Out of scope: real entities, RLS policies, seed data, CI pipeline.
- **Acceptance Criteria:** the ACs in the unit file — EF Core 8 + Npgsql + snake_case naming convention wired; `CabinConnectDbContext` registered via `AddCabinConnectPersistence`; design-time factory present so `dotnet ef migrations add` works without booting the app; initial empty migration generated and clean; `scripts/check-migrations.ps1` guardrail blocks RLS/policy/trigger/function constructs in EF migrations; supabase CLI config committed (`supabase/config.toml`, `supabase/migrations/`, `supabase/seed.sql`); local-reset script committed; docs/migrations.md explains the EF/Supabase split and order of operations.
- **Output Format:** packages in `Directory.Packages.props`, code in `CabinConnect.Infrastructure`, scripts in `scripts/`, configs in `supabase/`, docs in `docs/`.

## Generated artifacts

Backend:
- [src/backend/Directory.Packages.props](../../src/backend/Directory.Packages.props) — added EF Core 8.0.10, Npgsql.EFCore 8.0.10, EFCore.NamingConventions 8.0.3, Microsoft.EntityFrameworkCore.Design 8.0.10
- [src/backend/CabinConnect.Infrastructure/Persistence/CabinConnectDbContext.cs](../../src/backend/CabinConnect.Infrastructure/Persistence/CabinConnectDbContext.cs)
- [src/backend/CabinConnect.Infrastructure/CabinConnectDbContextFactory.cs](../../src/backend/CabinConnect.Infrastructure/CabinConnectDbContextFactory.cs) (design-time)
- [src/backend/CabinConnect.Infrastructure/InfrastructureServiceCollectionExtensions.cs](../../src/backend/CabinConnect.Infrastructure/InfrastructureServiceCollectionExtensions.cs) (`AddCabinConnectPersistence`)
- [src/backend/CabinConnect.Infrastructure/Migrations/](../../src/backend/CabinConnect.Infrastructure/Migrations/) — `20260528052017_Initial.cs` + Designer + ModelSnapshot
- [src/backend/CabinConnect.Api.Tests/DbContextConnectivitySmokeTests.cs](../../src/backend/CabinConnect.Api.Tests/DbContextConnectivitySmokeTests.cs) (`[SkippableFact]`)

Supabase + scripts + docs:
- [supabase/config.toml](../../supabase/config.toml) (project_id `cabinconnect`, ports 54321/54322/54323/54324)
- [supabase/migrations/20260528000000_initial.sql](../../supabase/migrations/20260528000000_initial.sql) (header only)
- [supabase/seed.sql](../../supabase/seed.sql) (header only)
- [scripts/check-migrations.ps1](../../scripts/check-migrations.ps1)
- [scripts/db-reset-local.ps1](../../scripts/db-reset-local.ps1)
- [docs/migrations.md](../../docs/migrations.md)

## Acceptance verification

| AC | Result |
|---|---|
| Solution builds with EF packages | ✅ `dotnet build src/backend/CabinConnect.sln` 0/0 |
| `dotnet ef migrations add Initial` works without app boot | ✅ Generated `20260528052017_Initial.cs` via `CabinConnectDbContextFactory` |
| snake_case naming wired | ✅ `optionsBuilder.UseSnakeCaseNamingConvention()` in `AddCabinConnectPersistence` |
| Guardrail script blocks RLS/policy/trigger/function in EF migrations | ✅ `scripts/check-migrations.ps1` regex-matches `CREATE POLICY`, `ENABLE ROW LEVEL SECURITY`, `CREATE TRIGGER`, `CREATE FUNCTION`, `InsertData(` and exits 1; tested clean against the Initial migration |
| Supabase CLI config committed | ✅ `supabase/config.toml`, `supabase/migrations/<init>.sql`, `supabase/seed.sql` |
| Local-reset script committed | ✅ `scripts/db-reset-local.ps1` with `-SkipSupabaseReset` switch |
| docs/migrations.md explains split + order of ops | ✅ Three workflow tables (local-Docker / local-no-Docker / CI-Prod) |
| EC-006 / RLS-on-every-table review | n/a here — no entities yet; the order-of-ops doc reinforces "Supabase migration MUST add RLS for every new EF table" as a pre-merge rule |
| Tests: DB smoke test opt-in | ✅ `[SkippableFact]` skips when `ConnectionStrings__CabinConnectTest` env var is unset; full `dotnet test` reports `skipped: 1` |

Final test run: `dotnet test src/backend/CabinConnect.sln` → **total: 14, failed: 0, succeeded: 13, skipped: 1**.

## Deviations / decisions

- **Testcontainers DROPPED (user-approved AC deviation).** The original AC called for a Testcontainers-backed Postgres integration test that boots, runs `dotnet ef database update`, and asserts schema = snapshot. Testcontainers requires Docker; the dev box has no Docker. Replacement: an opt-in `[SkippableFact]` (`xunit.skippablefact 1.4.13`) that runs only when `ConnectionStrings__CabinConnectTest` env var points at any reachable Postgres. CI can supply a managed Postgres later. Net effect: zero coverage loss for the act of generating migrations (the EF tooling itself is verified by `dotnet ef migrations add` succeeding), and the schema-equivalence guarantee is deferred to when a Postgres is available.
- **`npx supabase start` not exercised.** Local Supabase stack also requires Docker. `supabase/config.toml` is still committed (treated as IaC for whoever later runs the stack in CI or a Docker-equipped workstation). `db-reset-local.ps1` exposes `-SkipSupabaseReset` so the .NET half of the workflow remains usable today.
- **`AddCabinConnectPersistence` skips DbContext registration when `ConnectionStrings:CabinConnect` is missing.** Originally it threw — but that prevented `WebApplicationFactory` from booting for unrelated tests (the auth test factory does not need a DB). Changed to a silent skip; if a consumer actually resolves `CabinConnectDbContext` without configuration, DI throws a clear "no service" error. Documented in `docs/migrations.md`.
- **`Microsoft.EntityFrameworkCore.Design` added to the API csproj too** (with `PrivateAssets="all"`). `dotnet ef migrations add` complained that the startup project didn't reference EF Design; the simplest fix was to add the dev-time reference rather than pass `--startup-project` flags.
- **`Microsoft.Extensions.UserSecrets` removed.** It clashed (NU1109 downgrade) with `Microsoft.AspNetCore.Mvc.Testing 8.0.10`'s transitive `8.0.1`. Not needed for the design-time factory; replaced by `AddJsonFile` + `AddEnvironmentVariables` chain.
- **Connection-string split.** `ConnectionStrings:CabinConnect` = runtime/app role (limited DML). `ConnectionStrings:CabinConnectMigrations` = postgres/DDL role for `dotnet ef database update`. The design-time factory prefers `CabinConnectMigrations` and falls back to `CabinConnect`. Documented in `docs/migrations.md`.
