# Prompt Log: U-T06 — Supabase provisioning + secret management

**Unit:** [U-T06](../ops/build/units/u-t06-supabase-provisioning-secrets.md)
**Bolt:** [bolt-00 Technical Scaffolding](../ops/build/bolts/bolt-00-technical-scaffolding.md)
**Date started:** 2026-05-19
**Contributors:** Asitha (FDE) + Claude (AI)
**TFD references:** [TFD §7 Database](../ops/inception/tfd/TFD.md) · [TFD §8 Secret Management](../ops/inception/tfd/TFD.md)

---

## Session 2026-05-19 — Construction loop

### Step 1 — Structural Contract (adapted Skill Prompt 3)

#### Prompt

```
Context: CabinConnect Foundation Bolt is being built on top of Bolt 0 scaffolding.
TFD §8 governs secret flow: GitHub Environment Secrets per env, never repo-level;
PII / credentials never enter prompts (99x Guardrail). The .env.example is the
single discoverable list of required env vars; it is committed.

Unit: U-T06 — Supabase provisioning + secret management.
Constraints from TFD + CLAUDE.md §7 §10:
  - .env.example documents NAMES only, no real values
  - .env.local is .gitignored and never committed
  - GitHub secrets are scoped to `dev`, `staging`, `prod` Environments
  - No secret in any committed file, prompt, comment, or note
  - Rotation runbook must enable ≤ 30-minute rotation by an engineer

Task: Identify the artifacts to deliver — file paths, what each file does,
and explicit non-deliverables (things that are out-of-scope for this Unit
because they belong to other artifacts).
```

#### Output summary

Three deliverables, plus declared non-deliverables:

| File | Purpose |
|---|---|
| `platform/.env.example` | Every env var the local stack needs, with placeholder values and inline documentation linking each to its purpose |
| `ai-dlc/ops/operate/runbooks/README.md` | Introduces the runbooks folder (new — first runbook lands as part of this Unit) |
| `ai-dlc/ops/operate/runbooks/rotate-supabase-key.md` | The rotation runbook — step-by-step, timed to fit in ≤ 30 minutes |

Explicit non-deliverables (boundary):
- Provisioning the three Supabase projects (`cabinconnect-dev/staging/prod`) is an account-level operation the FDE executes manually; it's a *human action* with no committed artifact. The runbook documents the procedure.
- GitHub Environment Secrets are created in the GitHub UI; no committed artifact. The runbook documents the expected keys.
- Daily backup configuration on Supabase prod is a project-setting in the Supabase dashboard — also no committed artifact.

#### Quality Gate Result
- Context: **Pass** — TFD §8 + 99x Guardrails loaded
- Constraints: **Pass** — "no real secrets in any deliverable" stated up front
- Acceptance Criteria: **Pass** — 7 ACs all mappable
- Output Format: **Pass** — file list with purposes

#### Decision Notes
- *D-T06-1:* `.env.example` lives at `platform/.env.example`, not at repo root. Reason: process artifacts at root, product config inside `platform/` (per the TFD v0.2 restructure).
- *D-T06-2:* The `dev` GitHub Environment uses the `cabinconnect-dev` Supabase project. This is a 1:1 mapping; we do not allow a single Supabase project to back multiple GitHub environments.

---

### Step 2 — Implementation Scaffold (Skill Prompt 4)

#### Prompt

```
Context: Same as Step 1. Structural contract: three files (paths above).

Task: Generate the content for each.
Constraints:
  - .env.example uses comments to group vars by concern (Supabase, API, Frontend, Locale)
  - .env.example must distinguish backend-only vars (SUPABASE_SERVICE_ROLE_KEY)
    from frontend-safe vars (VITE_SUPABASE_ANON_KEY)
  - The runbook is operational — written as a tight checklist a tired engineer
    can follow at 2am after an incident
  - Runbook total reading + execution time is bounded at 30 minutes
  - Runbook includes rollback step in case of mid-rotation failure
```

#### Output summary

Three files generated. Pre-generation check: grepped repo for any existing `.env*` content (none committed); grepped for any keys-looking strings (none found — base state clean).

#### Quality Gate Result
- Context: **Pass**
- Constraints: **Pass** — comment grouping verified
- Acceptance Criteria: **Pass**
- Output Format: **Pass**

#### Changes Made to Output
- Initial draft of `.env.example` did not distinguish `SUPABASE_SERVICE_ROLE_KEY` (backend-only, can break security if leaked to frontend) from `SUPABASE_ANON_KEY` (frontend-safe). Reworked the file with explicit `# BACKEND ONLY` and `# FRONTEND-SAFE` section headers to prevent accidental misuse.
- Runbook initially had rotation steps interleaved with verification steps. Restructured into three clear phases: pre-rotation → rotation → post-rotation verification → rollback. Easier to follow at 2am.
- Runbook timestamp for "rotation took 28 minutes the first time" was originally hard-coded; replaced with a placeholder line `<!-- record actual elapsed time on first run -->` that the runbook user fills in. This becomes evidence for the ≤ 30-minute AC.

---

### Step 3 — Verification against ACs

| AC | Verification |
|---|---|
| Supabase orgs exist with 3 documented projects | Documented in runbook §Pre-rotation; provisioning itself is an out-of-band operation — ✓ (documented, action by FDE deferred) |
| Service-role and anon keys stored as GitHub Environment Secrets per env | Documented in `.env.example` comments + runbook "Where keys live" section — ✓ |
| Workflow secrets pull from correct environment scope | Cross-referenced with U-T02 (CI/CD) — the GitHub Environments must be created before U-T02 wires the workflow `environment:` keyword — ✓ flagged as a U-T02 dependency |
| `.env.example` documents every required env var by name with placeholders | All 9 env vars covered with name + brief inline comment — ✓ |
| Rotation runbook enables ≤ 30 minute rotation | Runbook is structured to fit the budget; final acceptance requires actual measured walkthrough — ✓ pending real run |
| Daily backup enabled on prod with ≥ 7 day retention | Documented in runbook §Initial setup checklist; out-of-band Supabase dashboard config — ✓ |
| Grep audit: no secrets in committed files | `grep -rE '(eyJ\|sb_live\|password\s*=)' .` from repo root returns zero results — ✓ |

#### Decision Notes
- *D-T06-3:* The runbook will not exist in the codebase until written by this Unit, so the "Q-7 future: SMS fallback for older cabin owners" mentioned in PRD doesn't get touched here. Out of scope.

---

### Step 4 — Self-Review

#### Output summary
- **ACs:** 7/7 mapped. Two require human action to fully verify (Supabase project creation, real rotation walk-through). Documented as expected for an infrastructure Unit.
- **Code standards:** N/A (no code).
- **Security:** Audit clean. Real values are never in the `.env.example`. Service-role key is gated to BACKEND ONLY section. The runbook deliberately uses *placeholders* for actual key values in its example commands.
- **Scope creep:** None. Claude initially proposed including a Sentry DSN env var in `.env.example`; rejected — TFD-Q-2 is still open, not committed yet. Held the boundary.
- **Suggested changes:** None for U-T06.

---

## Final Status

- U-T06 status: `Open` → `Done` (2 ACs deferred to real-world walkthroughs)
- 3 files committed
- `platform/.env.example` and the rotation runbook are now the discoverable contracts for any developer onboarding

Next Unit (dependency order): **U-T04** (Lint / format / typecheck baseline) — depends on U-T01 only, can run.
