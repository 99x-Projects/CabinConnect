# Retrospective: bolt-cabin-profile-mvp

**Bolt:** [ops/build/bolts/2026-06-08-bolt-cabin-profile-mvp.md](../../build/bolts/2026-06-08-bolt-cabin-profile-mvp.md)
**Date:** 2026-06-08
**Participants:** Savindu Bandara

---

## What Went Well

- The Intent → Mob Elaboration → Unit decomposition gave the AI an unambiguous spec; once the units were written, code generation was nearly mechanical and rarely missed an AC.
- Domain glossary (`Cabin`, `Owner`, `Hold`, etc.) prevented vocabulary drift across .NET and React layers.
- Repository + Service split caught EC-001 (concurrency) cleanly via a serializable transaction in `CabinRepository.CreateAsync` — surfaced naturally because the unit ACs called for it.
- 9/9 xUnit tests for `cabin-create` covered all 8 ACs and three edge cases (cap, soft-delete, owner-from-JWT).
- DB-level constraints (capacity range, name length, address length) plus DTO `[Range]`/`[StringLength]` provided defence-in-depth — invalid input is rejected at three layers.
- IPv4 Session Pooler made Supabase Postgres reachable from a network where direct Supabase HTTPS was blocked. Architecture decoupling (.NET API as the only DB consumer) meant the frontend code never had to change.

---

## What Didn't Go Well

- **EF Core InMemory transaction warning** wasted ~10 minutes on the first xUnit run. The provider throws on `BeginTransactionAsync` unless you configure the warning to be ignored. This isn't called out anywhere in code-standards.
- **`IReadOnlyCollection<>` for an EF Core navigation property** silently failed: EF tries to mutate the collection during materialisation and throws "Collection was of a fixed size" because the empty-array initialiser produces a fixed-length array. Fix was to use `List<>`. This is a non-obvious gotcha.
- **Sealed class vs `with` expression** in test helpers: `with` requires `record`, not `sealed class`. Wasted a few minutes before refactoring to named-parameter helpers.
- **Secrets briefly landed in `appsettings.Development.json`**. The file was never committed, but the AI should have proactively created the user-secrets entries from the start instead of letting the engineer paste real values.
- **The .NET API redirected HTTP→HTTPS in dev, breaking CORS preflight**. The default ASP.NET Core template enables `UseHttpsRedirection()` which silently breaks SPA→API calls when the API is hosted on plain HTTP. Caught only at end-to-end testing.
- **A network-layer block (SentinelOne) at the destination-IP level** is invisible to the code and consumed real time before being identified. The AI initially assumed code/config issues before checking machine-level connectivity.
- **One `replace_string_in_file` operation appended a duplicated `return` block** instead of replacing — caused a Vite parse error. Lesson: tools that match by string can fail in surprising ways when the new content contains the old context.
- **Prompt logs were never created** during the bolt despite the rule in CLAUDE.md §6 stating they should be written after each unit's code generation.

---

## AI-Specific Observations

**Prompts that worked well:**
- Explicit unit ACs in numbered Given/When/Then form — the AI generated code, tests, and error responses that mapped 1:1 to the criteria.
- Architecture rules in CLAUDE.md (e.g. "React app calls the .NET API only — never Supabase directly for data mutations") meant the agent did not propose shortcuts that violated the architecture, even under network pressure.

**Prompts that needed revision:**
- The very first prompt was vague ("set me up to start the experience"). The AI had to reverse-engineer the goal. A short structured intro from the engineer ("create the intent, then plan the bolt") would have saved a turn.

**Quality gate failures:**
- The AI generated code without a Quality Gate header on several turns where the engineer's instruction was conversational ("can we try this", "what is the command for…"). The gate is currently described as applying to "every code response" but isn't enforced for purely operational instructions; this needs a clearer rule.

**Output accepted without sufficient review:**
- The first cut of `Cabin.cs` used `IReadOnlyCollection<CabinAmenity>` for the navigation; tests passed for entity construction but failed at EF materialisation. Reviewing the EF patterns *before* committing the entity shape would have caught this.
- `appsettings.Development.json` was edited with real secrets and only flagged after the fact. The AI should have refused that edit and routed the engineer to user-secrets immediately.

---

## Actions

| # | Action | Owner | Target date | Status |
|---|---|---|---|---|
| 1 | Backfill prompt logs for all 5 cabin units | Savindu | 2026-06-09 | Open |
| 2 | Add Vitest + React Testing Library setup and at least one component test for `CabinFormPage` | Savindu | Next bolt | Open |
| 3 | Add an integration test that exercises RLS end-to-end (cross-owner GET should return 404, not 403, and not leak any rows) | Savindu | Next bolt | Open |

---

## Improvements Triggered

| # | Improvement file | Target rule/guideline | Status |
|---|---|---|---|
| 1 | [2026-06-08-scaffold-secret-store-first.md](../improvements/2026-06-08-scaffold-secret-store-first.md) | `ai-dlc/setup-guide.md` (new Step 0) | Applied |
| 2 | [2026-06-08-aspnet-spa-dev-checklist.md](../improvements/2026-06-08-aspnet-spa-dev-checklist.md) | `ai-dlc/skills/aspnet-dev-checklist.md` (new) | Applied |

---

## New Intents Triggered

| Intent | Reason |
|---|---|
| `cabin-photos` | Bolt's out-of-scope list confirms photos are a clear next slice. |
| `host-self-onboarding` | Sign-up was done manually via the Supabase dashboard; a real product needs a sign-up flow with email confirmation. |
| `dashboard-shell` | The current React UI is page-state only; a proper dashboard with routing (React Router) and persistent navigation will be needed before the next feature slice. |

---

## Notes for the next Bolt

- Replace state-based page switching with React Router so URLs are bookmarkable and the back button works.
- Add a `cabin-detail` page that's distinct from the edit form (currently the same component does both).
- Wire `react-hook-form` + `zod` for client-side validation matching the API DTO rules — currently each `<input>` does its own.
- Set up Vitest + RTL with at least one component test before adding new UI.
- Consider migrating EF Core test setup to Testcontainers (real Postgres) so transaction isolation behaviour matches production.
