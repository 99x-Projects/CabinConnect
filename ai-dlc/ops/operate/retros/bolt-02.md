# Retrospective: Bolt 02 — Cabin Profile UI

**Bolt:** [Bolt 02](../../build/bolts/bolt-02-cabin-profile-ui.md)
**Date:** 2026-05-18
**Participants:** Sachith Perera
**Facilitator:** Claude (AI-DLC)

---

## What Went Well

- All 7 units generated and passing in a single session with no structural rework
- Tailwind v4 + shadcn/ui scaffold produced working components without CLI tooling
- JWT `OnTokenValidated` hook for extracting `app_metadata.role` kept controller code clean
- Database connectivity (IPv6 Supabase free-tier issue) diagnosed and resolved without data loss
- CORS, auth, and RLS all worked end-to-end after connectivity was established

## What Didn't Go Well

- **JWT authentication took multiple iterations** — three separate issues stacked: symmetric vs asymmetric algorithm, kid matching, and finally discovering Supabase Cloud uses ES256 (JWKS) rather than HS256. Root cause was an incorrect assumption about Supabase's signing algorithm; the fix (Authority-based JWKS discovery) was simple once the actual algorithm was identified.
- **Frontend `VITE_API_BASE_URL` mismatch** — `.env.local` was set to `https://localhost:5001` (default ASP.NET dev cert port) instead of the actual launch profile port `5283`. Caught quickly but avoidable with a dev setup checklist.
- **Login redirect loop** — `LoginPage` called `navigate()` immediately after `signInWithPassword`, before `onAuthStateChange` had updated the session. Fixed by removing the imperative `navigate` and relying on reactive auth state.
- **npm install silent failure** — background scaffold task had not persisted packages to `package.json`; caught only when the dev server failed to start.

## AI-Specific Observations

### Prompts that worked as expected

- Unit-level prompts with full Context / Constraints / AC / Output Format produced complete, compilable output in one pass
- "Add a startup diagnostic to verify DB connectivity" — scoped, concrete, produced exactly what was needed

### Prompts that needed revision before output was usable

- Initial JWT setup assumed HS256 symmetric key without checking Supabase Cloud's actual signing algorithm; required iterative debugging across three sessions

### Quality gate failures caught

- None triggered (all prompts entered the session with full quality gate components)

### Cases where AI output was accepted without enough review

- JWT secret encoding choice (`Encoding.UTF8.GetBytes` vs `Convert.FromBase64String`) was iterated in production rather than verified with a local script upfront — a verification script before the first `dotnet run` would have saved multiple restart cycles

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Add Supabase algorithm note to auth setup docs | Sachith | 2026-05-25 | |
| Add dev setup checklist (env vars, API port, Supabase local vs cloud) | Sachith | 2026-05-25 | |

## Improvements Triggered

- None filed at this time

## New Intents Triggered

- None identified
