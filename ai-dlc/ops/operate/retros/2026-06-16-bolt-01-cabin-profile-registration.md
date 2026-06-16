# Retrospective: Bolt 01 — Cabin Profile Registration

**Bolt:** [Bolt 01 — Cabin Profile Registration](../../build/bolts/2026-06-16-bolt-01-cabin-profile-registration.md)
**Date:** 2026-06-16
**Participants:** HarshanaB
**Facilitator:** AI (Cursor)

---

## What Went Well

- **Full lifecycle delivered in one session.** All five units (Amenity Catalog → Register Cabin → View Host Cabin Profile → Update Cabin Profile → Deactivate Cabin) completed on the same day the intent was written, including mob elaboration and bolt planning.
- **Sequential dependency order held.** Building the amenity catalog first meant catalog validation was available immediately when Register Cabin needed it. No rework was required because of ordering.
- **30 integration tests, zero failures.** Each unit added tests covering all its ACs before moving on. The test suite acted as a reliable regression net — catching issues with `FakeCabinRepository` seed injection early.
- **Shared validation helper emerged naturally.** Extracting `ValidateFields` out of `ValidateRequest` when Update Cabin Profile was implemented kept the two endpoints consistent without duplication.
- **Frontend scaffolded alongside backend.** Vite + React 18 + TypeScript strict + Supabase Auth + Tailwind CSS v4 was stood up in the same bolt, giving an immediately runnable UI for all five units.
- **EC-011, EC-012, EC-013 all addressed.** Deactivation is safe (no booking cancellation), capacity is bounded 1–50, and cross-host access returns 404 not 403 — all documented and tested.

---

## What Didn't Go Well

- **Connection string format confusion caused repeated restarts.** The Supabase URL-format connection string (`postgresql://user:pass@host`) broke silently when the password contained `@`. Three separate incidents occurred before switching to Npgsql key-value format.
- **Direct host vs. pooler confusion.** Newer Supabase projects expose `db.<project>.supabase.co` on IPv6 only. This wasn't documented in the dev setup guide, causing two DNS failures before switching to the session pooler (`aws-1-ap-northeast-1.pooler.supabase.com`).
- **Running process not killed between config changes.** On three occasions the API was still running from a previous launch, loading the stale connection string from memory while the config file on disk was already correct. This wasted time diagnosing a non-existent DNS issue.
- **Source file vs. bin/ copy misalignment.** The debugger rebuild cycle overwrote `bin/appsettings.Development.json` with the source version. Fixing only the `bin/` copy twice didn't stick — only fixing the source file resolved the issue permanently.
- **`dev-setup.md` was not followed / not complete enough.** The guide did not mention the pooler requirement for new Supabase projects or warn about `@` in passwords with URL-format connection strings.

---

## AI-Specific Observations

### Prompts that worked as expected

- **"Execute unit \<Name\>"** — providing the unit name alone was sufficient context because the unit file contained ACs, scope, and dependencies. Resulted in complete, test-covered implementations each time.
- **"Plan a bolt from the open units in the backlog"** — produced a well-ordered bolt with correct dependency sequencing and risk documentation without further clarification.
- **"Run a mob elaboration for Cabin Profile Registration and update required docs"** — correctly triggered the one-unit-per-turn elaboration protocol, surfaced all five units, and updated intent, elaboration session, units, backlog, and prompt log.

### Prompts that needed revision before output was usable

- **"create a frontend also with the given tech stack and Execute unit Update Cabin Profile"** — compound request. The AI handled both in sequence correctly, but the implicit frontend spec (React 18, TypeScript strict, Supabase Auth, Tailwind) relied on context from the `.cursorrules` and `code-standards.md` rather than an explicit frontend unit. A frontend unit should have been defined first.

### Quality gate failures caught

- None raised by the gate explicitly. All four code generation prompts passed all four gate components (Context, Constraints, Acceptance Criteria, Output Format) on first attempt because the unit files provided the required information.

### Cases where AI output was accepted without enough review

- **CORS wildcard check not explicitly verified.** The CORS fix was accepted based on reading the code diff; no manual test confirmed that `AllowCredentials()` + `WithOrigins()` correctly rejects requests from non-allowlisted origins.
- **RLS policies not run or verified in Supabase.** The SQL scripts in `Database/` were generated and reviewed but not executed against the live database during this bolt. Functional verification against a real Supabase instance is still outstanding.

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Update `dev-setup.md` to document Supabase pooler requirement and warn against URL-format connection strings with special characters in passwords | HarshanaB | 2026-06-17 | [2026-06-16-dev-setup-connection-string.md](../improvements/2026-06-16-dev-setup-connection-string.md) |
| Run `amenities.sql` and `cabins.sql` against the live Supabase database and verify RLS policies | HarshanaB | 2026-06-17 | — |
| Define a frontend unit template for React pages so UI work goes through the same AC-driven process | HarshanaB | next bolt | — |
| Add a step to the dev-setup guide: always stop running API processes before rebuilding | HarshanaB | 2026-06-17 | [2026-06-16-dev-setup-connection-string.md](../improvements/2026-06-16-dev-setup-connection-string.md) |

## Improvements Triggered

- [x] [operate/improvements/2026-06-16-dev-setup-connection-string.md](../improvements/2026-06-16-dev-setup-connection-string.md) — `dev-setup.md` updated to cover Supabase pooler hostname, key-value connection string format, and process management before rebuild.

## New Intents Triggered

- [ ] Frontend cabin profile UI is delivered but not backed by a formal intent or unit. Consider creating `inception/intents/YYYY-MM-DD-cabin-profile-ui.md` before the next bolt that extends the frontend.
- None for backend — all Cabin Profile Registration backend behaviour is fully covered by Bolt 01 units.
