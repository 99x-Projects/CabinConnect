# Retrospective: Bolt-01 — Cabin Profile Management

**Bolt:** [Bolt-01](../../build/bolts/bolt-01-cabin-profile-management.md)
**Date:** 2026-06-04
**Participants:** Ravindu Wickramage
**Facilitator:** Claude (AI-DLC)

---

## What Went Well

- **Full AI-DLC loop completed in one session** — Intent → Mob Elaboration → Bolt Planning → 5 units executed → Retro, with no ceremony skipped.
- **Mob elaboration caught ownership concerns early** — EC-007 was identified during elaboration and consistently applied across all 5 units at both the RLS and service query layers. Never missed on any endpoint.
- **Prompt quality gate worked as designed** — Output Format was missing on every "Execute unit" request and the gate caught it each time, preventing ambiguous generation.
- **Domain-first approach paid off** — `Deactivate()` and `Reactivate()` were added to the `Cabin` entity during U2 test writing, and were available without any rework when U5 needed them.
- **Idempotency designed in from elaboration** — AC-5.3 and AC-5.4 (idempotent deactivate/reactivate) were decided during mob elaboration, not discovered during implementation.
- **`BadRequest(ModelState)` applied consistently** — The code-standards rule (never `ValidationProblem`) was followed correctly in every controller action across all 5 units.
- **21 service-layer unit tests passing at bolt close** — Each unit accumulated tests incrementally; the test suite grew without rework.
- **Supabase RLS migration written alongside the code** — The `cabins` migration with RLS policies was created as part of U1 rather than deferred.

---

## What Didn't Go Well

- **4 runtime bugs in U1 that the quality gate and review did not catch:**
  1. `System.Text.Json` deserialises enums as integers by default — not flagged as a runtime risk before generation.
  2. EF Core 10 primitive collection interception for `List<Amenity>` — `HasConversion` alone insufficient; `ValueComparer` required.
  3. Supabase connection string format — Supabase dashboard shows URI format; Npgsql requires `Host=...;Port=...` key-value format.
  4. Supabase direct DB host (`db.<ref>.supabase.co`) unreachable on newer projects — session pooler required.

- **Initial project structure placed at wrong paths** — Files scaffolded to `src/CabinConnect.Api/` instead of `src/backend/CabinConnect.Api/` per dev-setup guide, requiring a restructure.

- **Target framework mismatch** — CLAUDE.md specifies .NET 8 but .NET 10 SDK was installed; caused package incompatibility that required changing the target framework.

- **`@supabase/auth-helpers-react` was deprecated** — Used in the initial scaffold; caught during package install but not before the component was written.

- **No frontend tests produced** — Vitest/RTL tests were in the Definition of Done but not generated for any unit. All 5 TODO entries remain open.

- **Integration tests for controller-level ACs not written** — AC-x.2 (missing fields), AC-x.3 (invalid capacity), AC-x.5 (unauthenticated) all remain as TODOs requiring the full ASP.NET Core pipeline.

---

## AI-Specific Observations

### Prompts that worked as expected

- **`"Run a mob elaboration for [intent]"`** — Turn-by-turn unit confirmation with AC proposals worked well. The conversational protocol was natural and produced precise ACs without over-specification.
- **`"Execute unit [name] from Bolt-01"`** — Generated coherent full-stack output (API contract, backend scaffold, frontend component, test stubs) in one pass. Response shape was consistent across all 5 units.
- **`"Plan a bolt from the open units in the backlog"`** — Correctly selected all Open units, inferred execution order from dependencies, and created the bolt file with rationale.

### Prompts that needed revision before output was usable

- **Initial project structure** — `"Execute unit Register Cabin from Bolt-01"` generated files at `src/CabinConnect.Api/` rather than `src/backend/`. The dev-setup guide path was in context but not applied. A more explicit constraint ("place files under `src/backend/` per the dev-setup guide") would have avoided the restructure.

### Quality gate failures caught

- Output Format was correctly identified as missing on every `"Execute unit"` invocation (5 times). The gate stopped generation each time until confirmed.

### Cases where AI output was accepted without enough review

- **U1 runtime setup** — The `AppDbContext` amenity converter, `JsonStringEnumConverter`, and Supabase connection string format were all TODOs or implicit assumptions in the scaffold. Accepting the output without a specific dev-environment checklist review meant 4 bugs were only caught at runtime.
- **Framework version** — `net8.0` target was accepted without verifying whether the installed SDK supported it. Should have checked `dotnet --version` before choosing the target framework.

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Update dev-setup guide with Supabase session pooler instructions and warning about URI vs key-value connection string format | Ravindu | 2026-06-11 | [improvement: dev-setup-supabase-pooler](../improvements/2026-06-04-dev-setup-supabase-pooler.md) |
| Add `JsonStringEnumConverter` and EF Core `ValueConverter`+`ValueComparer` for enum collections to code-standards or a setup checklist | Ravindu | 2026-06-11 | [improvement: efcore-enum-collection-setup](../improvements/2026-06-04-efcore-enum-collection-setup.md) |
| Write integration tests covering AC-x.3 (capacity = 0), AC-x.5 (unauthenticated) and AC-3.2/4.5/5.5 (wrong owner at HTTP layer) — next bolt | Ravindu | Next bolt | — |
| Write frontend Vitest/RTL tests for at least the happy-path AC on each component — next bolt | Ravindu | Next bolt | — |

---

## Improvements Triggered

- [ ] [operate/improvements/2026-06-04-dev-setup-supabase-pooler.md](../improvements/2026-06-04-dev-setup-supabase-pooler.md) — Dev-setup guide missing Supabase pooler instructions; caused 2 runtime failures (Bug 3 + Bug 4) that a better setup guide would have prevented.
- [ ] [operate/improvements/2026-06-04-efcore-enum-collection-setup.md](../improvements/2026-06-04-efcore-enum-collection-setup.md) — EF Core `List<Enum>` column mapping requires explicit `ValueConverter` + `ValueComparer`; this is a non-obvious setup step that should be in the code-standards or a backend setup note.

---

## New Intents Triggered

None identified from this bolt — Cabin Profile Management is the foundational entity. The natural next intents when the team is ready are:

- Cabin Pricing (Base Rate + Seasonal Rate)
- Public Cabin Browsing (unauthenticated read path for guests)
- Booking Creation (Guest flow — depends on Cabin entity being stable)
