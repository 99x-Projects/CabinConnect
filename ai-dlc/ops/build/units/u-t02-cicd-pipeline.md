# Unit: U-T02 — CI / CD pipeline (GitHub Actions)

**Owning artifact:** [TFD §4 CI / CD Pipeline](../../inception/tfd/TFD.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20 from Bolt 0)*
**Dependencies:** U-T01

---

## Context

GitHub Actions workflows for PR validation and manual-approval deploy. Branch protection enforces required checks. Secrets flow from GitHub Environments, never from repo-level secrets, so dev/staging/prod credentials cannot bleed across environments.

## Acceptance Criteria

- Given a PR is opened against `main`, when the workflow runs, then the following jobs execute and report status: `lint`, `typecheck`, `test-api`, `test-web`, `migration-lint`, `locale-parity-check`, `lighthouse-pwa-audit`.
- Given a PR passes all required checks plus one reviewer approval, when merge is attempted, then it succeeds; given any required check fails, when merge is attempted, then it is blocked.
- Given a maintainer triggers the staging deploy workflow with a release tag, when it runs, then the artifact is deployed to the Supabase + container target and a smoke test passes.
- Given a maintainer triggers the production deploy workflow, when initiated, then GitHub Environments enforces a manual approval gate before the deploy proceeds.
- Given a force-push is attempted to `main`, when initiated, then branch protection blocks it.
- Given a workflow references a secret in a specific environment, when the workflow runs in that environment, then it pulls the correct environment-scoped secret (verified by an audit on each workflow's `env:` resolution).

## Scope

**In scope:**
- PR validation workflow (the 7 jobs above)
- Branch protection rules on `main` (required checks + 1 approval + no force-push + conversations resolved)
- Staging deploy workflow + smoke test
- Production deploy workflow with GitHub Environments approval gate
- Secret scoping per environment (dev / staging / prod)

**Out of scope:**
- The lint, typecheck, and test configurations themselves (U-T04)
- The migration-lint check's implementation (U-T05)
- The locale-parity check (delivered by U-009)
- Supabase secret values (U-T06)

## Definition of Done

- [ ] All ACs verified, including the "intentionally broken PR" verification of branch protection
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] At least one successful staging deploy from this workflow before sign-off
