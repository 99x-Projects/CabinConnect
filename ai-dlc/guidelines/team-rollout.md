# Team Rollout Guide

How to scale AI-DLC across multiple engineers on CabinConnect.

---

## Git Branching

- **Main branch:** `main` — production-ready; protected; requires PR review
- **Feature branches:** `<engineer-initials>-<intent-slug>` or `feat/<intent-slug>`
- **One branch per Bolt** — do not mix units from different Bolts in one branch
- **Merge strategy:** Squash merge for single-unit Bolts; regular merge for multi-unit Bolts where commit history is valuable

---

## Environment Isolation

- Each engineer runs their own local Supabase instance (`supabase start`)
- No shared development database — local Supabase is disposable and reset as needed
- Staging environment mirrors production; only CI/CD deploys to staging
- Feature flags (`VITE_FF_*` / `FeatureFlags:*`) allow code to be merged to main without activating features

---

## Secrets Management

- Local secrets live in `appsettings.Development.json` and `.env.local` — both in `.gitignore`
- Engineers get secrets from a shared password manager (not Slack, not email)
- Staging and production secrets are injected via CI/CD environment variables — never in config files
- The Supabase `service_role` key is rotated every 90 days; the rotation date is tracked in the internal secrets doc

---

## Backlog Ownership

- The backlog (`ai-dlc/ops/build/backlog.md`) is the single source of truth for unit status
- Any engineer updating a unit status must update the backlog in the same commit
- Unit status transitions: `Draft` → `Ready` (after elaboration sign-off) → `In Progress` (when execution begins) → `Done` (after retro closes)
- No unit moves to `In Progress` without a linked Bolt file

---

## Multi-Engineer Bolt Rhythm

1. **Elaboration:** Any engineer can run a mob elaboration session. Output (unit files, backlog update) must be reviewed by a second engineer before execution begins.
2. **Bolt planning:** The lead engineer assigns units to engineers. Execution order is determined by dependencies — units that block others go first.
3. **Parallel execution:** Two engineers can execute units from the same Bolt in parallel if the units have no dependencies on each other. Update the Bolt file with who owns which unit.
4. **Review:** Every unit requires a PR reviewed by an engineer who did not write it.
5. **Retro:** Run the retro after the entire Bolt is merged, not after individual units.

---

## PR Checklist

Before opening a PR, confirm:

- [ ] Review checklist passed: `ai-dlc/skills/review-checklist.md`
- [ ] All ACs have tests
- [ ] Feature flag in place if modifying an existing module
- [ ] `CLAUDE.md` updated if rules changed (and mirror files `.cursorrules`, `.github/copilot-instructions.md` updated in the same PR)
- [ ] Backlog status updated for all units in this PR
- [ ] Prompt log entry written
- [ ] No secrets in diff

---

## Merge Conflict Resolution

When two engineers modify the same file:

1. Do not use `git checkout --theirs` or `--ours` without reading both versions
2. For `CLAUDE.md` conflicts: merge both changes; the file should contain all additions from both branches
3. For backlog conflicts: take the union of status changes; do not discard either engineer's updates
4. For unit files: each engineer owns their unit — the other engineer's unit changes take precedence in their sections

For complex conflicts, ask an AI session to help synthesize: paste both versions and ask for a merged result.

---

## Team Leader Review Guidelines

In addition to the standard PR review, the team lead should:

- Verify that the unit's scope matches what was elaborated — no feature creep
- Check that the feature flag is correctly named and documented with a removal condition
- Confirm that the retro from the previous Bolt produced improvement files before this Bolt began
- Review the dependency map update if this Bolt touches shared interfaces

---

## Common Anti-Patterns in Multi-Engineer Workflows

| Anti-pattern | Why it fails |
|---|---|
| Two engineers elaborating the same intent separately | Produces divergent unit lists; causes merge conflicts in backlog |
| Merging a unit before its tests pass | Lets broken code onto main under the assumption "we'll fix it later" |
| Skipping the retro because the Bolt went well | Good Bolts still produce insights; missing retros mean no improvements file |
| Using feature flags as permanent switches | Flags accumulate; each one must have a documented removal date |
| Reviewing your own PR | Violates the second pair of eyes requirement |
