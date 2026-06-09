# Prompt Log: Cabins Database Migration

**Unit:** [ops/build/units/2026-06-09-1781001102-cabins-database-migration.md](../ops/build/units/2026-06-09-1781001102-cabins-database-migration.md)
**Date:** 2026-06-09
**Model:** claude-sonnet-4-6
**Engineer:** Chinthaka

---

## Prompt Used

> proceed with unit 1

---

## Quality Gate Check

| Component | Source | Present? |
|---|---|---|
| Context | Unit file — `cabins` table, FK to `auth.users`, RLS policies, EF Core Cabin entity | Yes |
| Constraints | No DB CHECK on max_guests; `numeric` without scale; cross-schema FK via raw SQL only; no EF Core model for auth schema | Yes |
| Acceptance Criteria | 5 Given/When/Then ACs from unit file | Yes |
| Output Format | C# entity, updated DbContext, EF Core migration + snapshot, updated csproj | Yes |

---

## What Was Generated

**Files created/modified:**
- `backend/CabinConnect.Api/Domain/Cabin.cs` — entity with all 8 columns
- `backend/CabinConnect.Api/Data/CabinConnectDbContext.cs` — added `DbSet<Cabin>`, full `OnModelCreating` column config
- `backend/CabinConnect.Api/CabinConnect.Api.csproj` — added `Microsoft.EntityFrameworkCore.Design` (PrivateAssets=all)
- `backend/CabinConnect.Api/Migrations/20260609120000_CreateCabinsTable.cs` — `CreateTable` + 4 raw SQL calls
- `backend/CabinConnect.Api/Migrations/CabinConnectDbContextModelSnapshot.cs` — model snapshot
- `backend/CabinConnect.Api/Data/CabinConnectDbContextFactory.cs` — added as follow-up fix (see below)

Key decisions:
- `host_id` FK via `migrationBuilder.Sql("ALTER TABLE cabins ADD CONSTRAINT ...")` — EF Core cannot scaffold cross-schema FK
- RLS `ENABLE`, INSERT policy, SELECT policy all added via `migrationBuilder.Sql()` in `Up()`; `Down()` drops in reverse
- `created_at` uses `timestamp with time zone` (not `timestamptz`) — Npgsql canonical form
- `IDesignTimeDbContextFactory` added after initial `dotnet ef database update` failed because `Program.cs` fail-fast pattern threw `CORS_ALLOWED_ORIGINS not set` before EF Core could resolve the DbContext
- `.env` quoting fix: connection string value `Host=...;SSL Mode=Require` requires double-quotes in `.env` — `source .env` without quotes treats `;` as command separator

---

## ACs Verified

| AC | Status |
|---|---|
| AC-1: All columns present with correct types | Implemented in migration CreateTable |
| AC-2: RLS INSERT — auth.uid() = host_id | Policy created via migrationBuilder.Sql |
| AC-3: RLS INSERT rejects mismatched host_id | Policy enforced at DB level |
| AC-4: SELECT public reads | `USING (true)` policy created |
| AC-5: NOT NULL constraint violations on missing fields | NOT NULL on all columns in migration |

---

## Issues Encountered

1. **`dotnet ef database update` failed** — `CORS_ALLOWED_ORIGINS not set`. Root cause: EF Core design-time tools run `Program.cs` startup; fail-fast env var checks threw before DbContext could be resolved. Fix: added `IDesignTimeDbContextFactory<CabinConnectDbContext>`.

2. **`.env` connection string truncated** — `export $(cat .env | xargs)` and even `source .env` without quoting split the value at `;`. Fix: wrap `DATABASE_URL` value in double-quotes in `.env`.
