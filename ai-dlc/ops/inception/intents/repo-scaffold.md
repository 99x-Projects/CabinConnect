# Intent: Repository Scaffold for CabinConnect

**Status:** Elaborated
**Slug:** `repo-scaffold`
**Date:** 2026-05-28
**Owner:** HL
**Note:** Backfilled intent — this was identified during `cabin-profile-mvp` bolt kickoff when the Prompt Quality Gate failed on Context (no .NET solution, no React app, no Supabase wiring). The mob elaboration was run directly; this intent records the rationale for completeness.

---

## Outcome
The CabinConnect repository becomes ready to execute domain bolts. After this intent: backend + frontend solutions exist with strict builds; Supabase Auth is wired end-to-end with JWT validation; database migration tooling distinguishes EF Core (schema) from Supabase SQL (RLS/seed); a typed feature-flag mechanism exists with `cabin_profile_mvp` registered.

## Why Now
The `cabin-profile-mvp` bolt cannot start without this plumbing. Generating domain code against an imagined structure produces non-compiling files and breaks the audit trail. AI-DLC discipline: no orphan code.

## In Scope
- .NET 8 Web API solution scaffold (Api / Domain / Infrastructure).
- React 18 + TypeScript (Vite) frontend scaffold.
- Supabase project setup (local + dev-cloud) and full JWT auth wiring on both stacks.
- Database migration tooling and conventions (EF Core for schema; Supabase SQL for RLS/seed).
- Env-var-driven, typed feature-flag plumbing with `cabin_profile_mvp` registered.

## Out of Scope
- Any domain entity, endpoint, UI, or RLS policy specific to cabins / users / communities / amenities.
- CI pipeline (GitHub Actions) — separate intent.
- E2E / Playwright — separate unit.
- Observability stack (logging, metrics, tracing beyond defaults) — separate intent.
- Runtime feature-flag service (LaunchDarkly, Unleash) — flagged as a future decision if env-var-only proves insufficient.
- Admin debug endpoints.

## Assumptions
- Repo target structure: `src/backend/` (.NET solution), `src/frontend/` (Vite app), `supabase/` (migrations + seed SQL).
- Supabase Auth is the auth provider; CLAUDE.md rule "do not implement custom auth" stands.
- Node 20 LTS, .NET 8 SDK.
- Windows-first dev environment; shell scripts are PowerShell.

## Success Looks Like
- `dotnet build src/backend/CabinConnect.sln` is green with zero warnings.
- `npm run build`, `npm run lint`, `npm test` in `src/frontend/` are all green.
- `dotnet test` includes JWT validation tests against a local JWKS server.
- `npx supabase start` brings up the local stack; `supabase db reset` + `dotnet ef database update` rebuild the database cleanly.
- `IFeatureFlags.IsEnabled("cabin_profile_mvp")` returns `false` by default on both stacks.

## Open Questions
- Runtime flag service vs env-var-only — deferred until env-var-only proves insufficient.
- CI pipeline scope and provider — separate intent.
- Cross-platform shell scripts (PowerShell + bash) — deferred until first non-Windows contributor.

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/repo-scaffold/2026-05-28-session-1.md) | 2026-05-28 | 5 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| .NET 8 API solution scaffold | [dotnet-api-scaffold](../../build/units/dotnet-api-scaffold.md) | Planned |
| React + Vite app scaffold | [react-app-scaffold](../../build/units/react-app-scaffold.md) | Planned |
| Supabase project & auth wiring | [supabase-project-and-auth](../../build/units/supabase-project-and-auth.md) | Planned |
| DB migration tooling | [db-migration-tooling](../../build/units/db-migration-tooling.md) | Planned |
| Feature-flag plumbing | [feature-flag-plumbing](../../build/units/feature-flag-plumbing.md) | Planned |
