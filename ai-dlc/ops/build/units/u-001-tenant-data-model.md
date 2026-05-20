# Unit: U-001 — Tenant data model (`communities` and `community_id` discipline)

**Owning Intent:** [CI-01 Community Boundary & Data Isolation](../../inception/intents/2026-05-19-community-boundary.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20)*
**Dependencies:** none — foundational

---

## Context

The database-level foundation for Community isolation. The `communities` table is the single tenant root. Every Community-scoped table carries a `community_id` FK that is `NOT NULL`. Per Key Decision D-1 in the elaboration session: nullable scoping leaks data on faulty joins; forced-NOT-NULL turns "I forgot to scope" into a migration-time error.

## Acceptance Criteria

- Given a fresh database, when migrations run, then a `communities` table exists with columns: `id` (UUID PK), `name` (text NOT NULL), `slug` (text UNIQUE NOT NULL), `created_at` (timestamptz NOT NULL DEFAULT now()).
- Given a developer attempts to create a Community-scoped table without a `community_id` FK column, when the migration runs in CI, then a lint step fails the build with a clear error pointing at the missing column.
- Given a row insert attempts to set `community_id = NULL` on a scoped table, when the insert executes, then PostgreSQL rejects it with a NOT NULL violation.
- Given the database is seeded for the pilot, when seed runs, then exactly one Community ("Hemsedal Pilot Resort") exists with a stable slug.
- Given a Community is the target of a DELETE while scoped rows still reference it, when the delete is attempted, then it is blocked by ON DELETE RESTRICT.

## Scope

**In scope:**
- `communities` table definition and migration
- CI lint check enforcing `community_id NOT NULL` on every scoped table
- Pilot Community seed
- ON DELETE RESTRICT FK policy

**Out of scope:**
- `users`, `user_communities`, `community_invitations` tables (U-005)
- RLS policy generation (U-002)
- API-layer enforcement of community scoping (U-003)
- Self-service Community creation flow (OQ-1, deferred)

## Definition of Done

- [ ] AC covered by tests (DB schema test + migration lint check)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off — N/A (data model only)
