# Unit Template Reference

This document describes how to write a unit file. Copy the template below into `ai-dlc/ops/build/units/YYYY-MM-DD-<slug>.md`.

---

## What is a Unit?

A unit is the smallest independently deployable piece of behavior. It should:
- Correspond to one or two acceptance criteria
- Be completable in a single AI session (under 2 hours of generation + review)
- Have a clear "done" state that can be verified by running tests

If a unit requires touching more than three files or producing more than ~150 lines of new code, consider splitting it.

---

## Template

```markdown
# Unit: [Name]

**Status:** Draft | Ready | In Progress | Done | Blocked
**Intent:** [link to intent file]
**Elaboration:** [link to elaboration session file]
**Bolt:** [link to bolt file — fill in after bolt is planned]
**Priority:** High | Medium | Low
**Feature flag:** VITE_FF_<NAME>=true / FeatureFlags:<Name> / None

---

## Context

[One paragraph: what problem this unit solves and why it matters. Include which layer(s) are touched — controller, service, repository, frontend component, etc.]

---

## Acceptance Criteria

1. Given [actor], when [action], then [outcome].
2. Given [actor], when [invalid/edge action], then [failure outcome].
[At least one unhappy path required per unit.]

---

## Scope

**In scope:**
- [specific file or behavior included]

**Out of scope:**
- [related things explicitly excluded — prevents scope creep]

---

## Dependencies

- Depends on: [other unit or intent slugs, if any]
- Blocks: [other units that cannot start until this is Done, if any]

---

## Pre-generation Checks

[For wrapper or layout components: list grep patterns to run before generating to detect duplication.]
[ ] `grep -r "ComponentName" src/frontend/src/` — confirm no existing version
[ ] Check `ai-dlc/guidelines/forbidden-zones.md` — confirm scope is not in a forbidden zone

---

## Edge Cases to Handle

[List IDs from `ai-dlc/guidelines/edge-cases.md` that apply, or describe new edge cases to be considered.]
- EC-001: Concurrent booking — [how handled or out of scope with reason]

---

## Observability

**Success signal:** [what confirms this is working in production — e.g., "HTTP 201 returned, record visible in DB"]
**Failure signal:** [log entry or error that signals a failure — e.g., "DuplicateCabinNameException logged at WARN"]
**Alert threshold:** [metric to alert on, or "Not applicable"]

---

## Definition of Done

- [ ] All ACs have passing tests
- [ ] Feature verified in the running application (not tests alone)
- [ ] No secrets or hardcoded values
- [ ] Review checklist passed (`ai-dlc/skills/review-checklist.md`)
- [ ] Prompt log entry written in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md`
- [ ] Backlog status updated to Done

---

## Prompt Log

[Link to the prompt log entry for this unit after session completes.]

---

## Notes

[Any implementation notes, decisions made during generation, or warnings for the next engineer.]
```

---

## Naming Convention

File name: `YYYY-MM-DD-<intent-slug>-<unit-slug>.md`

Example: `2026-06-10-blackout-dates-create-blackout-date.md`

The date should be when the unit was created (elaboration sign-off), not when it was executed.
