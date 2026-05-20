---
name: AI-DLC Unit
about: Open this when a Unit moves from `Open` to `Planned` (i.e., enters a Bolt). The canonical Unit file in `ai-dlc/ops/build/units/` is the contract; this Issue is the live work surface.
title: "U-XXX — <short name>"
labels: ["unit"]
---

## Unit contract — see the file

**Canonical Unit file:** `ai-dlc/ops/build/units/u-XXX-<slug>.md`

> Open the file for the full contract: Context, Acceptance Criteria, Scope (In / Out), Dependencies, Definition of Done. **Do not duplicate that content here** — if an AC needs refinement, edit the file via PR; this Issue stays as the work surface.

## Metadata

- **Owning Intent:** `CI-NN`
- **Bolt:** `bolt-NN` *(also the GitHub Milestone for this Unit)*
- **Priority:** `MVP-H` | `MVP-M` | `POST`
- **Owner (Human side of the Human + AI pair):** @<username>
- **Dependencies:** `U-XXX`, `U-YYY` *(open Issues / files that must close first)*

## Status

Move this Issue through the labels below as work progresses. The Unit file's `Status:` line stays at `Planned` until the closing PR flips it to `Done`.

- [ ] `Planned` (selected for a Bolt; not yet started)
- [ ] `In Progress` (assignee actively working)
- [ ] `Awaiting review` (PR open; reviewer assigned)
- [ ] `Done` (DoD verified; Unit file `Status` flipped to `Done` by the closing PR)

## Work log

Use this thread for daily progress, blockers, and decisions that come up during construction.

> **Discipline (99x AI-DLC Suggestion 4 — see `project-review/notes.md`):** decisions land in the file. When a comment thread here surfaces a decision (refined AC, new dependency, deferred sub-task), the Project Champion is responsible for writing it into the Unit file via PR **before this Issue closes.**

## Closing checklist

- [ ] All ACs in the Unit file traceable to code
- [ ] Tests for each AC passing in CI
- [ ] Review checklist (`ai-dlc/skills/review-checklist.md`) ticked
- [ ] Prompt log entry exists in `ai-dlc/prompts/`
- [ ] No scope expanded mid-Bolt without a new Unit being opened (99x Guardrail)
- [ ] PR that closes this Issue also flips `Status:` in the Unit file to `Done`
