# Retrospective: Bolt — Repo Scaffold

**Bolt:** [repo-scaffold](../../build/bolts/repo-scaffold.md)
**Date:** 2026-05-28
**Participants:** Hiran
**Facilitator:** Hiran (with GitHub Copilot)

---

## What Went Well

- **Two-wave parallel structure held up cleanly.** Wave 1 (`dotnet-api-scaffold`, `react-app-scaffold`) had no cross-coupling and shipped without rework. Wave 2 (`feature-flag-plumbing`, `db-migration-tooling`, `supabase-project-and-auth`) had to share `Program.cs` wiring but the dependency surface was small enough to merge in one pass.
- **End-to-end verification against live Supabase succeeded.** `dotnet ef database update` applied the Initial migration to the cloud DB; `/health` returned 200; `/_auth-ping` returned 401 without a token. The full test suite went 14/14 with the live DB attached.
- **JWT validation matrix.** Six tests (no-token / valid / expired / wrong-audience / wrong-issuer / anon-`/health`) cover all the obvious failure modes and run in <1 s using an in-process RSA key. Far cheaper than a WireMock-based fake JWKS and gives identical coverage.
- **Guardrail script** [scripts/check-migrations.ps1](../../../../scripts/check-migrations.ps1) **was written before the first real migration.** It already catches RLS/policy/trigger/function statements leaking into EF migrations. Cost: ~20 lines of regex. Payoff: future units can't accidentally put security-critical SQL in the wrong place.
- **`.env.example` + `.env.local` split with strict gitignore.** Both files are confirmed-ignored via `git check-ignore`. New engineers get a clear path: copy `.env.example` → `.env.local` → fill in secrets.
- **Feature-flag plumbing is symmetric and minimal.** One known-flag whitelist on each side, `cabin_profile_mvp` registered in exactly three places (backend `KnownFeatureFlags`, frontend `FLAG_ENV_KEYS`, [docs/feature-flags.md](../../../../docs/feature-flags.md)).

## What Didn't Go Well

- **Docker assumption baked into multiple ACs.** Original units for `db-migration-tooling` and `supabase-project-and-auth` required Testcontainers, WireMock, and `npx supabase start` — all of which need Docker. None of these were caught during mob elaboration because we never asked "do we actually have Docker on the dev box?". Cost: mid-bolt AC renegotiation and three logged deviations.
- **Direct Supabase DB host is IPv6-only.** `db.<ref>.supabase.co` resolves only to AAAA records; the dev box has no IPv6 path. Wasted ~15 min running `dotnet test` with a working credential set and getting a useless `CanConnectAsync returned false`. The pooler host (`aws-1-ap-south-1.pooler.supabase.com`) works and is what Supabase actually recommends — we just didn't know that going in.
- **`CanConnectAsync` swallows the real error.** Smoke test reported "returned false" with no inner exception. Had to spin up a one-off `tools/db-probe` console app just to surface the actual Npgsql error (`tenant/user … not found`, then `OPEN OK`).
- **Pooler region guessing.** Settled on `ap-south-1` from project metadata, but the host prefix is `aws-1-`, not the documented `aws-0-`. Required brute-force probing 13 regions before getting the correct hostname from the user's dashboard `Connect` panel.
- **DB password leaked in chat.** User pasted the live `postgresql://` URL into the conversation. Treated as compromised, asked for rotation, and the rotated password is now in `appsettings.Local.json` only. Highlighted that we have no chat-side input sanitiser — relies on operator discipline.
- **Naming-collision rename mid-build.** The original `FeatureFlags` class inside the `CabinConnect.Api.FeatureFlags` namespace produced `CS0118` everywhere a test referenced it. Renamed to `ConfigurationFeatureFlags` after the fact, which is a bit lossy (Program.cs now reads `AddSingleton<IFeatureFlags, ConfigurationFeatureFlags>` instead of just `FeatureFlags`).
- **`AddCabinConnectPersistence` originally threw when the connection string was missing.** Broke the JWT test factory, which doesn't need a DB. Silently downgraded it to a skip-and-DI-fail-on-resolve. Works, but it's the kind of "test convenience" change that can hide real misconfiguration later. Documented in `docs/migrations.md`.
- **`CabinConnectDbContextFactory` initially didn't load `appsettings.Local.json`.** First `dotnet ef database update` ran with the empty connection string from base settings and threw `Host can't be null`. Fixed by adding the optional Local file to the factory's `ConfigurationBuilder` chain.
- **Backlog updates lagged behind the code.** Wave 2 units sat in "code complete, awaiting sign-off" in the **In Progress** column for the entire build session because we didn't move them to **Done** until after sign-off. Two-step move (Planned → In Progress → Done) is correct per AI-DLC, but doing it after each AC is closed rather than at end-of-bolt would surface stragglers faster.

## AI-Specific Observations

### Prompts that worked as expected

- **"Kick off Wave 2"** — a single short directive that succeeded because the wave was already fully scoped in [bolts/repo-scaffold.md](../../build/bolts/repo-scaffold.md). The Quality Gate had already been satisfied during mob elaboration; the build prompt didn't need to repeat Context/Constraints/AC.
- **"Probe a few regions"** — Copilot wrote the brute-force PowerShell loop against the throwaway `tools/db-probe` app and surfaced the real Npgsql error in one shot.
- **Quality-gate preambles in prompt logs.** Including the four-line Context/Constraints/AC/Output summary at the top of every log made it trivial to trace what was asked vs. what was delivered when writing this retro.

### Prompts that needed revision before output was usable

- **Initial Testcontainers AC.** Worded as "Postgres connectivity smoke test must run automatically via Testcontainers." Once Docker was off the table, we couldn't drop the AC — we had to renegotiate it on the fly. A better Wave 1 question would have been "What's the runtime environment?" before writing infrastructure ACs.
- **Initial JWKS test plan.** First draft used WireMock + a real Authority HTTP server. Re-prompted with "use an in-process RSA key via `WebApplicationFactory<Program>` instead" and got a cleaner solution in one round.
- **Test mocks for Vitest.** The first `vi.mock(...)` call referenced top-level `getSessionMock` and `refreshSessionMock` consts. Vitest hoists `vi.mock` above the file, so those references were undefined at hoist time. Required a `vi.hoisted(() => ({...}))` rewrite — a known footgun, worth recording.

### Quality gate failures caught

- **No JWT secret in repo.** When wiring `SupabaseAuth`, Copilot proposed putting `Authority` and `JwksUrl` in `appsettings.json` and the rotated password in `appsettings.Development.json`. Caught at gate review — moved DB credentials to gitignored `appsettings.Local.json` and kept only structural keys in tracked files.
- **CORS wildcard + credentials.** The first cut of `CorsServiceCollectionExtensions` allowed `*` origins with `AllowCredentials=true`. Quality gate failed it (CLAUDE.md §3 explicitly forbids that combo). Replaced with a startup-time `InvalidOperationException` and 3 unit tests in `CorsStartupValidationTests`.

### Cases where AI output was accepted without enough review

- **`tools/db-probe` directory was committed by default.** Created with `create_file` during debugging; not yet added to `.gitignore` or removed. Action item below.
- **NU1603 warning on `tools/db-probe`** (Npgsql 8.0.10 → 9.0.0 resolved). Throwaway tool, accepted, but the same warning would be a real problem in production code.
- **Frontend stub pages (`sign-in-page.tsx`, `sign-up-page.tsx`).** Empty placeholder components landed without tests. Acceptable because the next bolt (`owner-signup`) will overwrite them, but worth flagging — if `owner-signup` slips, these dead pages stay on `/sign-in` indefinitely.

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Add "Runtime environment audit" question to the mob elaboration prompt list (Docker? IPv6? Region?) | Hiran | 2026-06-02 | [improvements/2026-05-28-elaborate-runtime-env.md](../improvements/2026-05-28-elaborate-runtime-env.md) |
| Update [guidelines/edge-cases.md](../../../guidelines/edge-cases.md) with EC-011 (Supabase direct-DB host is IPv6-only — always use pooler) | Hiran | 2026-06-02 | [improvements/2026-05-28-supabase-pooler-default.md](../improvements/2026-05-28-supabase-pooler-default.md) |
| Either delete `tools/db-probe/` or move it under `tools/` with a README and a `.gitignore` exemption rule | Hiran | 2026-06-04 | — (one-off cleanup, no rule change) |
| Add a secret-rotation reminder block to [rules/security.md](../../../rules/security.md): "If any credential appears in chat/PR/screenshot, rotate immediately before continuing" | Hiran | 2026-06-02 | [improvements/2026-05-28-secret-rotation-on-leak.md](../improvements/2026-05-28-secret-rotation-on-leak.md) |
| Wrap `CanConnectAsync` in the smoke test with an explicit `try/catch` that surfaces the inner exception message in the `Assert.True` failure | Hiran | 2026-06-04 | — (test-only ergonomic fix, no rule change) |

## Improvements Triggered

- [x] [operate/improvements/2026-05-28-elaborate-runtime-env.md](../improvements/2026-05-28-elaborate-runtime-env.md) — add a "runtime environment audit" gate to mob elaboration so Docker / IPv6 / managed-service assumptions surface before ACs are written
- [x] [operate/improvements/2026-05-28-supabase-pooler-default.md](../improvements/2026-05-28-supabase-pooler-default.md) — document the Supavisor pooler as the default connection path and capture as EC-011 in [guidelines/edge-cases.md](../../../guidelines/edge-cases.md)
- [x] [operate/improvements/2026-05-28-secret-rotation-on-leak.md](../improvements/2026-05-28-secret-rotation-on-leak.md) — codify "rotate first, ask questions later" when a credential leaks via chat/PR/screenshot
- The naming-collision rename, the `AddCabinConnectPersistence` throw→skip, and the `appsettings.Local.json` load-order fix are deliberately **not** raising improvements — they're one-off code fixes already absorbed into the codebase, not process gaps.

## New Intents Triggered

- None identified — every issue surfaced was either a process improvement (above) or a code fix already applied. The `cabin-profile-mvp` bolt is already planned and gated only on this retro, so no new capability emerged.
