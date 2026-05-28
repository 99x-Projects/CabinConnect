# Prompt Log: Cabin Profile Registration

**Unit:** _not yet — intent only; units to be extracted during mob elaboration_
**Intent:** [cabin-profile-registration.md](../ops/inception/intents/cabin-profile-registration.md)
**Date started:** 2026-05-28
**Contributors:** HL (engineer), GitHub Copilot (Claude Opus 4.7)

---

## Session 2026-05-28 — Draft first intent

### Prompt
Multi-turn conversation in GitHub Copilot Chat:
1. "Let's write first intent"
2. "u can write a one" (delegating selection of the first intent to the assistant)
3. "First resort are add by admin" (answering open question on community/resort sourcing)
4. "log the session"

### Output Summary
Assistant identified a mismatch between `CLAUDE.md` (booking-platform framing) and `docs/solution/Requirements.md` (four-module community app: MyCabin, Events, Groceries, ToolShare) and treated Requirements.md as the source of truth. It selected **MC-01 + MC-02 (cabin owner registers and manages cabin profile)** as the most foundational first intent because every other module depends on a cabin record existing. It drafted the intent inline for review, then — after the user confirmed admin-managed resorts — wrote the final file to `ai-dlc/ops/inception/intents/cabin-profile-registration.md` using the intent template.

### Quality Gate Result
Not strictly applicable — no code was generated this session. Intent-authoring gate (per `rules/prompt-quality-gate.md` spirit):
- Context (who/what system): Pass — anchored in Requirements.md modules and CLAUDE.md project identity.
- Constraints (what not to do / rules): Pass — out-of-scope section explicitly excludes MC-03/04/05/06, co-ownership, marketplace/booking flows; assumptions call out Supabase Auth and admin-managed communities.
- Acceptance criteria (testable success): Deferred — acceptance criteria will be defined per-unit during mob elaboration. Intent-level "Success Looks Like" is observable but not yet test-shaped.
- Output format: Pass — followed `ops/inception/intents/_template.md` exactly.

### Changes Made to Output
- Added admin-managed communities/resorts as an explicit assumption (from user answer in turn 3) and removed the corresponding open question.
- Added a new open question about whether admin community CRUD UI is in scope vs. seed-script-only for MVP.
- Added "Admin-facing community/resort management UI" to Out of Scope to keep this intent focused.
- Kept slug as `cabin-profile-registration` (not yet confirmed by user but matches naming convention; rename cheap if needed).

### Decision Notes
- **Source-of-truth conflict surfaced, not silently resolved.** `CLAUDE.md` describes a booking domain (Guest/Host/Booking/Hold) that does not match `Requirements.md`. Flagged to the user; recommended a future improvement to reconcile the glossary and CLAUDE.md §1/§4 against the actual MVP. Did not edit CLAUDE.md in this session.
- **Did not expand scope to cover the admin Community entity.** Treated it as a prerequisite/assumption rather than folding admin CRUD into this intent — keeps the intent one-page and focused on the cabin owner's capability. Will be revisited during elaboration to decide: precursor unit vs. seed script.
- **Prompt quality gate was applied informally to an intent-authoring task,** which the gate is not literally written for. Worth considering an improvement to extend the gate's framing to inception artifacts, or to explicitly scope it to code generation only.
- No code generated; no tests; no review checklist run. Next ceremony is mob elaboration.

### Next Action
User to either answer remaining open questions or invoke: *"Run a mob elaboration for cabin profile registration"*.

---

## Session 2026-05-28 — Mob elaboration

### Prompt
Multi-turn interactive ceremony in GitHub Copilot Chat following the turn-by-turn protocol from `.github/copilot-instructions.md` §6 (one unit per turn: propose name → confirm → propose ACs → confirm → propose edge cases & open questions → confirm → next unit).
1. "Run a mob elaboration for cabin profile registration"
2. "yes" (proceed)
3. Repeated "Accept" / "Accept all" through five units (community-registry, owner-signup, cabin-register, cabin-view-edit, cabin-operational)
4. "one owner can have one cabin in mvp" (scope constraint, mid-elaboration)
5. "Sign off — write the files"

### Output Summary
Assistant decomposed the intent into five units with full Given/When/Then acceptance criteria, dependencies, scope boundaries, and unit-local edge cases. On sign-off it created seven new files (five unit files, one elaboration session record, the build backlog) and updated the intent file (status → Elaborated, multi-cabin assumption corrected to one-cabin-per-owner, admin-CRUD open question resolved, units and sessions tables populated). All files used the established templates.

Files created:
- `ai-dlc/ops/build/units/community-registry.md`
- `ai-dlc/ops/build/units/owner-signup.md`
- `ai-dlc/ops/build/units/cabin-register.md`
- `ai-dlc/ops/build/units/cabin-view-edit.md`
- `ai-dlc/ops/build/units/cabin-operational.md`
- `ai-dlc/ops/inception/elaborations/cabin-profile-registration/2026-05-28-session-1.md`
- `ai-dlc/ops/build/backlog.md`

File updated:
- `ai-dlc/ops/inception/intents/cabin-profile-registration.md`

### Quality Gate Result
Not strictly applicable — no code generated. Elaboration-ceremony gate (informal):
- Context: Pass — intent file, Requirements.md, CLAUDE.md rules, edge-cases.md, and templates all loaded.
- Constraints: Pass — turn-by-turn protocol enforced; assistant never decomposed multiple units in one response; no files written before sign-off.
- Acceptance criteria: Pass — every unit has Given/When/Then ACs traceable to the intent.
- Output format: Pass — followed `skills/unit-template.md` and elaboration `_template.md` exactly.

### Changes Made to Output
- Mid-elaboration scope change: `UNIQUE(owner_id)` constraint added to `cabin-register` and `/me` endpoints used throughout `cabin-view-edit` / `cabin-operational` (instead of `/cabins/{id}`) once user constrained MVP to one cabin per owner.
- Sensitive operational data carved into its own unit + table (rather than fields on `cabins`) so the public profile DTO can never leak them — verified by contract test in Unit 5 ACs.
- Generic `users` table with `role` enum (default `owner`) instead of an `owners` table, to avoid a future rename migration for resident/volunteer/admin roles surfaced in Requirements.md.
- Email verification explicitly disabled for MVP; flagged to revisit before public launch.

### Decision Notes
- **CLAUDE.md vs Requirements.md mismatch** still unresolved at the project level; this session continued to treat Requirements.md as source of truth. Candidate improvement file.
- **No new global edge cases** were added to `guidelines/edge-cases.md`. EC-007 (client-supplied id) and EC-008 (expired JWT) were reinforced inside unit ACs; the rest of the unit-local edge cases stayed unit-local.
- **Five units fit inside the bolt guideline (3–8).** Did not artificially split or merge.
- Two cross-cutting concerns deferred to future improvements: (a) reconcile CLAUDE.md/glossary with Requirements.md, (b) scope the prompt quality gate so it doesn't awkwardly apply to ceremony artifacts.

### Next Action
User to invoke: *"Plan a bolt from the open units in the backlog"*.

---

## Session 2026-05-28 — Bolt planning

### Prompt
Two-turn ceremony in GitHub Copilot Chat:
1. "Plan a bolt from the open units in the backlog"
2. "Sign off — write the bolt files"

### Output Summary
Assistant proposed a single bolt `cabin-profile-mvp` containing all five Planned units, with a three-wave execution order (Wave 1: community-registry ‖ owner-signup; Wave 2: cabin-register; Wave 3: cabin-view-edit ‖ cabin-operational), a bolt-level Definition of Done, an explicit Out of Scope list, five risks with mitigations, and two pre-kickoff open questions (feature-flag mechanism, log-scrubbing implementation locality). On sign-off it created the bolt template, the bolt file, and reorganised the backlog (units moved Open → Planned, new Bolts section).

Files created:
- `ai-dlc/ops/build/bolts/_template.md`
- `ai-dlc/ops/build/bolts/cabin-profile-mvp.md`

File updated:
- `ai-dlc/ops/build/backlog.md` (Open → Planned, Bolts section added)

### Quality Gate Result
Not strictly applicable — no code generated. Planning-ceremony gate (informal):
- Context: Pass — backlog, all five unit files, intent file, and Instructions2FDE.md bolt guidance loaded.
- Constraints: Pass — kept within the 3–8 unit guideline; respected unit dependencies in wave ordering; flagged scope-creep risk (R5) explicitly.
- Acceptance criteria: Pass — bolt-level DoD is concrete and testable (E2E happy path, contract test, log-scrubbing test, RLS positive+negative tests, feature flag default).
- Output format: Pass — used `_template.md` (which the assistant created in the same step because none existed yet).

### Changes Made to Output
- All five units grouped into a single bolt rather than splitting (e.g. "foundations" + "cabin"). Splitting would leave a half-shipped capability and require holding the feature flag open across two bolts.
- Wave ordering chosen over strict serial: Units 1+2 and Units 4+5 are independent.
- Pre-kickoff defaults proposed (env-var feature flag; log-scrubbing local to Unit 5) instead of leaving the questions open and blocking kickoff. Both are reversible if assumptions break.

### Decision Notes
- **R1 (JWT validation) gates Wave 2 kickoff.** This isn't just a risk note — the bolt explicitly requires Unit 2's JWT integration test to be green before Unit 3 starts. Without it, all later API work risks being silently miswired.
- **R4 (`UNIQUE(owner_id)` blocks future multi-cabin).** Acknowledged as accepted technical debt; the migration cost when multi-cabin lands is bounded and known.
- **Owners are TBD** on every unit. This is the only piece a human must fill in before kickoff; the bolt does not unblock without it.
- Bolt and template were created in the same session because `ops/build/bolts/` did not exist yet. Template was written first against the project's established artifact-template style (matches `units/_template.md` and `intents/_template.md` shape).

### Next Action
1. Human assigns owners to each unit in the bolt file.
2. Invoke: *"Execute unit owner-signup from bolt cabin-profile-mvp"* and *"Execute unit community-registry from bolt cabin-profile-mvp"* (Wave 1, in parallel chats or sequentially).


