# Unit: U-T05 — Database + migration tooling (Supabase CLI)

**Owning artifact:** [TFD §7 Database & Migrations](../../inception/tfd/TFD.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20 from Bolt 0)*
**Dependencies:** U-T01, U-T02, U-T06

---

## Context

Supabase CLI is the migration tool (TFD ADR-005). All schema changes go through versioned SQL files in `platform/data-layer/migrations/`. The **migration-lint CI check** enforces that every Community-scoped table has called `cabinconnect.apply_community_rls(...)` — this is the structural check that makes NFR-ISO a build-time concern, not a runtime concern.

The actual `apply_community_rls` helper is delivered by U-002. This Unit delivers the *tooling and CI check*; the helper function comes later in Bolt 1.

## Acceptance Criteria

- Given Supabase CLI is installed, when a developer runs `supabase migration new <slug>` from `platform/data-layer/`, then a new SQL migration file is created in `platform/data-layer/migrations/` with the timestamp naming convention.
- Given migrations exist in `platform/data-layer/migrations/`, when `supabase db push` runs against the dev or staging Supabase project, then all unapplied migrations execute in order and the schema is updated.
- Given the migration-lint CI check runs against a PR that adds a Community-scoped table WITHOUT calling `apply_community_rls('table_name')`, when the check executes, then the build fails with a clear error citing the missing call AND the table name.
- Given a deploy workflow runs to staging or production, when it executes, then `supabase db push` is invoked as a step in the workflow (never manual SQL in production — per TFD §7).
- Given the migration-lint check exists, when it runs against the scaffolded repo with no scoped tables yet, then it reports green (no false positives).
- Given a developer creates a migration that is later determined to be incorrect (before deploy), when they re-create the migration via Supabase CLI, then the local dev Supabase can be reset cleanly via `supabase db reset`.

## Scope

**In scope:**
- Supabase CLI installation in the dev environment AND CI (referenced by U-T02)
- `platform/data-layer/supabase/config.toml` baseline configuration
- The migration-lint CI check (script + workflow job declaration)
- Documented list of Community-scoped tables that the lint check enforces against (initially empty; grows as Bolt 1+ adds tables)
- `supabase db push` integration into the deploy workflow

**Out of scope:**
- The `apply_community_rls` helper itself (U-002)
- The actual schema migrations creating `communities`, `users`, etc. (U-001, U-005)
- Backup configuration (U-T06)

## Definition of Done

- [ ] All ACs verified
- [ ] Migration-lint check intentionally triggered by a broken PR to confirm it catches the failure case
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
