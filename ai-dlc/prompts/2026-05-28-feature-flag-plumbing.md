# Prompt log — feature-flag-plumbing

**Date:** 2026-05-28
**Unit:** [feature-flag-plumbing](../ops/build/units/feature-flag-plumbing.md)
**Bolt:** [repo-scaffold](../ops/build/bolts/repo-scaffold.md)
**Operator:** Hiran (with GitHub Copilot)

---

## Prompt (verbatim)

> Kick off Wave 2

Wave 2 of the `repo-scaffold` bolt comprises three parallel units: `feature-flag-plumbing`, `db-migration-tooling`, `supabase-project-and-auth`. This log covers the feature-flag unit.

## Quality Gate

- **Context:** add a thin, symmetric feature-flag mechanism on both backend (.NET 8) and frontend (React/Vite) so future units can gate behaviour behind named flags without touching infra.
- **Constraints:** CLAUDE.md §3 (env vars only, no secrets, kebab-case React files, PascalCase .NET files). No external feature-flag SaaS. No database storage for flags in this unit. Out of scope: per-user/percentage rollouts.
- **Acceptance Criteria:** the ACs in the unit file — backend `IFeatureFlags.IsEnabled(string)` reads `FeatureFlags:<name>` from configuration; known-flag whitelist (`KnownFeatureFlags`) throws on unknown name; React side reads `import.meta.env.VITE_FF_<NAME>` with a strict-`"true"` parse; `cabin_profile_mvp` flag registered in three places (backend whitelist, frontend keys map, docs); zero warnings on lint and unit tests on both sides.
- **Output Format:** code in `src/backend/CabinConnect.Api/FeatureFlags/` and `src/frontend/src/lib/feature-flags.ts`, plus tests, plus [docs/feature-flags.md](../../docs/feature-flags.md).

## Generated artifacts

Backend:
- [src/backend/CabinConnect.Api/FeatureFlags/IFeatureFlags.cs](../../src/backend/CabinConnect.Api/FeatureFlags/IFeatureFlags.cs)
- [src/backend/CabinConnect.Api/FeatureFlags/ConfigurationFeatureFlags.cs](../../src/backend/CabinConnect.Api/FeatureFlags/ConfigurationFeatureFlags.cs)
- [src/backend/CabinConnect.Api/FeatureFlags/KnownFeatureFlags.cs](../../src/backend/CabinConnect.Api/FeatureFlags/KnownFeatureFlags.cs)
- [src/backend/CabinConnect.Api.Tests/FeatureFlagsTests.cs](../../src/backend/CabinConnect.Api.Tests/FeatureFlagsTests.cs)
- Wiring in [Program.cs](../../src/backend/CabinConnect.Api/Program.cs) (`builder.Services.AddSingleton<IFeatureFlags, ConfigurationFeatureFlags>()`)
- `FeatureFlags:cabin_profile_mvp = false` defaulted in [appsettings.json](../../src/backend/CabinConnect.Api/appsettings.json)

Frontend:
- [src/frontend/src/lib/feature-flags.ts](../../src/frontend/src/lib/feature-flags.ts)
- [src/frontend/src/lib/feature-flags.test.ts](../../src/frontend/src/lib/feature-flags.test.ts)
- `VITE_FF_CABIN_PROFILE_MVP` typed in [vite-env.d.ts](../../src/frontend/src/vite-env.d.ts) and defaulted in `.env.example` / `.env.development`

Docs:
- [docs/feature-flags.md](../../docs/feature-flags.md)

## Acceptance verification

| AC | Result |
|---|---|
| Backend `IFeatureFlags.IsEnabled` reads `FeatureFlags:<name>` | ✅ via `IConfiguration.GetSection("FeatureFlags")[name]` |
| Unknown flag throws | ✅ `ArgumentException` when `KnownFeatureFlags.IsKnown(name) == false` |
| Frontend strict-`"true"` parse | ✅ `raw === 'true'`; `"TRUE"` / `"1"` / `"yes"` / unset → `false` (covered by 7 vitest cases) |
| `cabin_profile_mvp` registered in 3 places | ✅ Backend `KnownFeatureFlags.CabinProfileMvp`, frontend `FLAG_ENV_KEYS`, [docs/feature-flags.md](../../docs/feature-flags.md) |
| `npm test` zero warnings | ✅ 8 passed (7 FF + 1 Health) |
| `dotnet test` green | ✅ 4 passed (3 FF + 1 Health) |
| EC-006/EC-008/EC-009 review | n/a — pure config plumbing, no booking/auth/date logic |

## Deviations / decisions

- **Naming collision.** Initial class was `CabinConnect.Api.FeatureFlags.FeatureFlags` — C# complained because the type name matched the parent namespace segment, breaking unqualified usage in tests. Renamed type to `ConfigurationFeatureFlags`; namespace unchanged.
- **Asymmetric truthy-parse rationale.** .NET `IConfiguration` is permissive (`"true"`, `"True"`, `"TRUE"` all parse). React side is strict: only the literal `"true"`. Documented in [docs/feature-flags.md](../../docs/feature-flags.md) as a deliberate trade-off: env-string parsing on the browser is footgun-prone (`Boolean("false") === true`), so we lock it down. Backend benefits from the BCL helper.
- **`FeatureFlags:` section persists per-environment.** `appsettings.Development.json` does not override; the dev default is whatever the base `appsettings.json` declares (`false`).
