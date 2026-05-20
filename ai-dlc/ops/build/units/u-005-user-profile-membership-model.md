# Unit: U-005 — User profile + Community membership data model

**Owning Intent:** [CI-02 Cabin Owner Registration & Authentication](../../inception/intents/2026-05-19-cabin-owner-auth.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20)*
**Dependencies:** U-001, U-004

---

## Context

Provide the `users` table (one row per Supabase Auth identity, with locale stored here per Key Decision D-6), the `user_communities` join table (a user belongs to N ≥ 0 Communities, with a per-membership role), and the `community_invitations` table (codes that grant membership). A Supabase trigger keeps `public.users` in sync with `auth.users`.

## Acceptance Criteria

- Given a fresh database with `communities` seeded, when migrations run, then `users`, `user_communities`, and `community_invitations` tables exist.
- Given the `users` table is inspected, when its schema is checked, then it has columns: `id` (UUID PK matching `auth.users.id`), `display_name` (text NOT NULL), `email` (text NOT NULL UNIQUE), `locale` (text NOT NULL DEFAULT `'nb-NO'`), `contact_phone` (text NULL), `created_at`, `updated_at`.
- Given the `user_communities` table is inspected, when its schema is checked, then it has columns: `user_id` (FK users), `community_id` (FK communities), `role` (enum `Member` | `Administrator` DEFAULT `Member`), `joined_at`, with composite PK `(user_id, community_id)`.
- Given the `community_invitations` table is inspected, when its schema is checked, then it has columns: `code` (text PK), `community_id` (FK communities NOT NULL), `created_by` (FK users), `expires_at`, `consumed_at`, `consumed_by`.
- Given a Supabase Auth user is created via `auth.users` insert, when the insert commits, then a `public.users` row is auto-created via a Supabase trigger with `display_name` defaulting to the email's local part.
- Given a user accepts a Community invitation with a valid code, when the API processes it, then `user_communities` gains a row AND `community_invitations.consumed_at` is set.
- Given a user attempts to accept an *expired* invitation code, when processed, then the API returns 410 (Gone) with a clear localized message.
- Given a user attempts to accept a *previously-consumed* code, when processed, then the API returns 409 (Conflict).
- Given a user updates their locale via the profile endpoint, when persisted, then the next JWT issued for this user carries `locale = <new value>` (locale is a JWT claim per Key Decision D-6).

## Scope

**In scope:**
- Data model for `users`, `user_communities`, `community_invitations`
- Supabase trigger from `auth.users` → `public.users`
- Invitation acceptance flow logic and status codes (410, 409)
- Profile update endpoint (display_name, locale, contact_phone)

**Out of scope:**
- Auth flows themselves (U-004)
- Self-service Community creation (OQ-1, deferred)
- Per-feature roles beyond Member / Administrator
- Account deletion

## Definition of Done

- [ ] AC covered by tests (integration tests for invitation flows, schema tests, trigger test)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
