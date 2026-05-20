# Unit: U-002 — RLS policy template + migration helper

**Owning Intent:** [CI-01 Community Boundary & Data Isolation](../../inception/intents/2026-05-19-community-boundary.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20)*
**Dependencies:** U-001

---

## Context

Hand-written RLS policies are historically a top source of bugs (Key Decision D-4 in the elaboration session). This Unit delivers a single PostgreSQL helper function — `cabinconnect.apply_community_rls('table_name')` — that every migration adding a Community-scoped table calls. The helper enables RLS and creates SELECT / INSERT / UPDATE / DELETE policies all scoped by the session variable `app.community_id` (set by U-003).

## Acceptance Criteria

- Given a developer adds a new Community-scoped table in a migration and calls `cabinconnect.apply_community_rls('table_name')`, when the migration runs, then RLS is enabled and the four policies are created scoped by `current_setting('app.community_id')::uuid`.
- Given a SELECT query runs with `app.community_id = X`, when executed against table T, then only rows where `T.community_id = X` are visible.
- Given an INSERT attempts to write `community_id = Y` while `app.community_id = X` (Y ≠ X), when executed, then RLS rejects it with `new row violates row-level security policy`.
- Given an UPDATE attempts to change `community_id` from X to Y for a row, when executed, then RLS rejects it.
- Given a developer adds a scoped table but omits the helper call, when the migration runs, then a separate CI check fails the build (cross-checked against the expected list of scoped tables).
- Given a service-role connection (Supabase admin client) executes a query, when it runs, then RLS is bypassed AND an audit log entry is written tagging the operation as service-role.

## Scope

**In scope:**
- `apply_community_rls` helper function
- CI check enforcing the helper has been applied to every scoped table
- Service-role audit-logging entry pattern
- Tests verifying SELECT / INSERT / UPDATE / DELETE policy behaviour

**Out of scope:**
- Per-feature roles within a Community (Member vs Administrator etc.) — module Intents handle these
- API-layer scoping (U-003)
- Membership-based access (U-005)

## Definition of Done

- [ ] AC covered by tests (pgTAP or equivalent — policy tests run on every PR)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off — N/A
