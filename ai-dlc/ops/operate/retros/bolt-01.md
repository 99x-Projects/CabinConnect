# Retrospective: Bolt 01 — Cabin Profile

**Bolt:** [Bolt 01](../../build/bolts/bolt-01-cabin-profile.md)
**Date:** 2026-05-15
**Participants:** Sachith Perera
**Facilitator:** Claude (AI-DLC agent)

---

## What Went Well

- All 6 units completed in a single session with 50/50 tests passing — no regressions across units.
- Interactive mob elaboration protocol worked as intended: one-unit-at-a-time turns with human sign-off at each step produced well-scoped units with clear ACs.
- Domain exception pattern (`CabinNotFoundException`, `CabinOwnershipException`, etc.) kept controller actions readable — each catch maps to one HTTP status with no conditional logic.
- EF Core change-tracking approach (mutate tracked entity, call `SaveAsync`) was consistent across Update and Key Info units, avoiding repeated `db.Update()` calls on already-tracked entities.
- `GetByHostIdAsync` correctly filters by host and orders DESC without any controller logic — ordering responsibility stayed in the repository.
- `CabinDetailDto` as a separate type (not inheritance from `CabinDto`) kept the response contract explicit and avoided record-inheritance complexity.

## What Didn't Go Well

- `CabinsController` constructor grew to three parameters (`ICabinRepository`, `ICabinService`, `ICabinKeyInfoService`) by the end of the bolt. Every prior test file had to be updated when `ICabinKeyInfoService` was added. This caused three build errors that needed fixing before tests could run.
- First mob elaboration session (prior bolt) was run as a monologue — all units dumped at once. Required a full re-run and a protocol fix in `CLAUDE.md` and `mob-elab-prompts.md`. Not repeated this session, but it cost time.
- `ValidationProblem(ModelState)` was used initially for model validation errors; it silently returns a null status code in unit tests because `ProblemDetailsFactory` is unavailable outside the ASP.NET Core pipeline. Caught during the first test run for unit ②; replaced with `BadRequest(ModelState)`.

## AI-Specific Observations

### Prompts that worked as expected

- **"lets go"** as a continuation prompt after context restore: sufficient because context was fully summarised and the next step was unambiguous (continue building unit ②).
- **Unit-file-first pattern**: reading the unit file before any code generation was reliable — the ACs, scope, and edge cases were all present in the file, so no additional clarification was needed before coding.
- **"log the prompts"** after each unit or pair of units: kept the audit trail current without needing to reconstruct decisions later.

### Prompts that needed revision before output was usable

- Initial mob elaboration: the first attempt ran all units at once without human checkpoints. The user had to explicitly correct this and request a protocol update before rerunning. Root cause: the elaboration prompt didn't enforce the one-unit-per-turn rule — fixed by rewriting `mob-elab-prompts.md`.
- Unit ②: `ValidationProblem` vs `BadRequest` — first output used `ValidationProblem` which isn't unit-testable without the full DI pipeline. Required a one-line fix.

### Quality gate failures caught

- None during this bolt — all four quality gate components (Context, Constraints, ACs, Output Format) were present before code generation for every unit.

### Cases where AI output was accepted without enough review

- Unit ⑤ partial-update semantics: null in the request means "don't change" — this means a host cannot explicitly clear a field once set. This trade-off was noted in the prompt log but was not explicitly discussed with the engineer before accepting. Worth confirming this is acceptable before the next intent that touches key info.
- `GetAllActiveAsync` was retained on `ICabinRepository` even though it is no longer called by any controller action. It was kept "for future guest-browsing use" — but that intent doesn't exist yet. Could be removed now and re-added when needed.

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Decide whether `null` in `UpsertKeyInfoRequest` should mean "don't change" or "clear the field" — document the decision in the key info unit | Sachith Perera | Next key-info-touching unit | — |
| Consider extracting a `GetHostIdFromJwt` helper method to avoid repeating the `sub` claim extraction in every controller action | Sachith Perera | Next bolt | — |
| Remove `GetAllActiveAsync` from `ICabinRepository` or document its future use explicitly | Sachith Perera | Next bolt planning | — |

## Improvements Triggered

- [ ] None triggered at this time.

## New Intents Triggered

- [ ] None triggered at this time — Guest-facing cabin browsing and booking are already planned as separate intents.
