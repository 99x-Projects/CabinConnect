# Database migrations

CabinConnect uses a **dual-tool** migration workflow. Get this wrong and environments will drift.

## The split — which tool owns what

| What | Owner | Where it lives |
|---|---|---|
| Table & column DDL (`CREATE TABLE`, `ALTER TABLE`, indexes, foreign keys) | **EF Core** | [`src/backend/CabinConnect.Infrastructure/Migrations/`](../src/backend/CabinConnect.Infrastructure/Migrations) |
| Row-Level Security policies (`CREATE POLICY`, `ENABLE ROW LEVEL SECURITY`) | **Supabase SQL** | [`supabase/migrations/`](../supabase/migrations) |
| Functions, triggers, materialised views | **Supabase SQL** | [`supabase/migrations/`](../supabase/migrations) |
| Seed data (`INSERT INTO …`) | **Supabase SQL** | [`supabase/seed.sql`](../supabase/seed.sql) |

This split is enforced by [`scripts/check-migrations.ps1`](../scripts/check-migrations.ps1), which runs in the test pipeline and fails the build if an EF migration contains `CREATE POLICY`, `ENABLE ROW LEVEL SECURITY`, `CREATE TRIGGER`, `CREATE FUNCTION`, or `InsertData(...)`. It also flags Postgres reserved-word identifiers.

## Connection-string roles

Two connection strings, two roles, never one:

| Name | Role | Used by | RLS applies? |
|---|---|---|---|
| `ConnectionStrings:CabinConnect` | App role (limited privileges) | Runtime API | **Yes** |
| `ConnectionStrings:CabinConnectMigrations` | `postgres` superuser | `dotnet ef database update` only | No (bypass) |

The runtime API never sees the migration role. The design-time `DbContext` factory ([`CabinConnectDbContextFactory.cs`](../src/backend/CabinConnect.Infrastructure/CabinConnectDbContextFactory.cs)) picks `CabinConnectMigrations` first and falls back to `CabinConnect` if unset.

Set them via `dotnet user-secrets` (preferred) or env vars; never commit real values:

```pwsh
cd src/backend/CabinConnect.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:CabinConnect" "Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=app_role;Password=...;SslMode=Require"
dotnet user-secrets set "ConnectionStrings:CabinConnectMigrations" "Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=...;SslMode=Require"
```

## Commands — exact, in order

### Add a new EF Core migration (schema change)

```pwsh
dotnet ef migrations add <Pascal_Name> `
  --project src/backend/CabinConnect.Infrastructure `
  --startup-project src/backend/CabinConnect.Api `
  --output-dir Migrations
```

Review the generated `.cs` file. If it contains anything in the forbidden list (RLS, triggers, seed `InsertData`), **move it to a Supabase SQL migration instead**.

### Apply EF migrations

```pwsh
dotnet ef database update `
  --project src/backend/CabinConnect.Infrastructure `
  --startup-project src/backend/CabinConnect.Api
```

The API **does not** auto-apply migrations on boot — `Database.Migrate()` is intentionally not called in `Program.cs`. Migrations are an explicit deployment step.

### Add a new Supabase SQL migration (RLS / triggers / seed)

1. Create `supabase/migrations/<UTC_timestamp>_<short_name>.sql` (e.g. `20260601120000_cabins_rls.sql`).
2. Write idempotent SQL (`CREATE POLICY IF NOT EXISTS …`, `ON CONFLICT DO NOTHING`).
3. Apply locally via `npx supabase db reset` (requires Docker) **or** via the Supabase Studio SQL editor / `psql` against dev-cloud.

### Rebuild local DB from scratch

```pwsh
./scripts/db-reset-local.ps1            # Docker required (npx supabase db reset + dotnet ef update)
./scripts/db-reset-local.ps1 -SkipSupabaseReset   # No Docker: skips the Supabase reset step
```

## Order of operations per environment

| Step | Local (Docker) | Local (no Docker, dev-cloud DB) | CI / Prod |
|---|---|---|---|
| 1 | `npx supabase start` | n/a | n/a |
| 2 | `npx supabase db reset` (applies SQL migrations + seed) | Apply SQL via Studio / psql | Apply SQL via Studio / psql |
| 3 | `dotnet ef database update` | `dotnet ef database update` | `dotnet ef database update` (release step) |

**Always apply EF Core migrations AFTER Supabase SQL migrations for a given change** — RLS policies are written against tables that EF created.

## Migration history tables — both coexist

| Tool | History table |
|---|---|
| EF Core | `__EFMigrationsHistory` (default schema) |
| Supabase CLI | `supabase_migrations.schema_migrations` |

They are independent. Neither tool touches the other's history.

## Local dev without Docker

The Supabase CLI's local stack requires Docker. If you don't have Docker:

- Point both connection strings at the **dev-cloud** Supabase instance.
- Skip `npx supabase start` / `npx supabase db reset`.
- Apply SQL migrations manually via the Supabase Studio SQL editor or `psql` (`psql $env:CC_DEV_URL -f supabase/migrations/<file>.sql`).
- Run `dotnet ef database update` as usual.
- The DB connectivity smoke test ([`DbContextConnectivitySmokeTests`](../src/backend/CabinConnect.Api.Tests/DbContextConnectivitySmokeTests.cs)) is opt-in via `ConnectionStrings__CabinConnectTest` and is **skipped by default**.

## Pre-commit / CI checks

- `pwsh ./scripts/check-migrations.ps1` runs first in the test pipeline. It fails the build on EF/Supabase split violations and on Postgres reserved-word identifiers.
- Run it manually before pushing migration changes:
  ```pwsh
  pwsh ./scripts/check-migrations.ps1
  ```

## Reserved-word identifiers

The snake-case naming convention (`UseSnakeCaseNamingConvention()`) is not enough to prevent collisions with Postgres reserved words (`user`, `order`, `group`, etc.). The guardrail script flags these. Fix by renaming the entity property or applying `[Table("users")]` / `[Column("ordr")]` explicitly, then regenerate the migration.
