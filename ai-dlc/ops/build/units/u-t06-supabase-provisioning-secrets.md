# Unit: U-T06 — Supabase provisioning + secret management

**Owning artifact:** [TFD §7 + §8](../../inception/tfd/TFD.md)
**Status:** Done — 2026-05-19 (2 ACs deferred to real-world walkthroughs: Supabase project provisioning + first rotation walk-through)
**Bolt:** Bolt 1 — UI Foundation *(re-scoped 2026-05-20 from Bolt 0; .env.example pattern + runbook are foundation infra used by both Bolts. Supabase project provisioning itself is deferred to Bolt 2 execution.)*
**Dependencies:** none
**Prompt log:** [2026-05-19-u-t06-supabase-secrets.md](../../../prompts/2026-05-19-u-t06-supabase-secrets.md)
**Files delivered:** `platform/.env.example`, `ai-dlc/ops/operate/runbooks/README.md`, `ai-dlc/ops/operate/runbooks/rotate-supabase-key.md`

---

## Context

The Supabase projects (one per environment) and the secret-flow that connects local dev, CI, and production. This is the Unit where credentials become real — and therefore the Unit most subject to the 99x Guardrails "Data & credential boundaries" and "Secrets in code".

## Acceptance Criteria

- Given Supabase organization access, when the FDE creates the three project instances, then `cabinconnect-dev`, `cabinconnect-staging`, and `cabinconnect-prod` exist as distinct Supabase projects with documented connect strings.
- Given each Supabase project, when the service-role and anon keys are issued, then they are stored as GitHub Environment Secrets keyed by environment name (`dev`, `staging`, `prod`) — never as repo-level secrets.
- Given a CI workflow runs in a specific GitHub Environment, when it references a secret, then it pulls the secret scoped to that environment only (verified by deliberate audit on each workflow's `env:` resolution).
- Given the `platform/.env.example` file, when reviewed, then it documents every required environment variable by name with placeholder values — never real secret values.
- Given a developer needs to rotate the service-role key, when they follow the runbook at `ai-dlc/ops/operate/runbooks/rotate-supabase-key.md`, then they complete rotation in ≤ 30 minutes including updating GitHub secrets and verifying the next deploy succeeds.
- Given the production Supabase project, when configured, then daily backup is enabled with at least 7-day retention.
- Given a future engineer searches the repo for any of the issued keys, when grep is run, then zero results are returned (no secrets in code, comments, prompts, or notes — per 99x Guardrail).

## Scope

**In scope:**
- Supabase project provisioning across dev / staging / prod (3 projects)
- GitHub Environment Secrets structure (`dev`, `staging`, `prod` environments + their secrets)
- `platform/.env.example` content (placeholders only)
- Rotation runbook at `ai-dlc/ops/operate/runbooks/rotate-supabase-key.md` (this Unit also creates the runbook)
- Daily backup configuration on the production project
- The grep-audit that confirms no secrets are committed

**Out of scope:**
- Application-level secret values beyond Supabase keys (per-feature additions)
- Other observability tooling secrets (Sentry, UptimeRobot) — TFD-Q-2 and TFD-Q-3 remain open

## Definition of Done

- [ ] All ACs verified
- [ ] Rotation runbook walked through end-to-end at least once (verifies the ≤ 30 minutes AC honestly)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No secrets in any committed file (grep-audit clean)
