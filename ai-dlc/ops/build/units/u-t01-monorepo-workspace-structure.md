# Unit: U-T01 — Monorepo + workspace structure

**Owning artifact:** [TFD §3 Repo Shape](../../inception/tfd/TFD.md) (not an Intent — scaffolding Unit)
**Status:** Done — 2026-05-19 (1 AC deferred to Bolt 0 close-out: outside-engineer onboarding smoke test)
**Bolt:** Bolt 1 — UI Foundation *(re-scoped 2026-05-20 from Bolt 0)*
**Dependencies:** none
**Prompt log:** [2026-05-19-u-t01-monorepo-scaffolding.md](../../../prompts/2026-05-19-u-t01-monorepo-scaffolding.md)
**Files delivered:** `platform/pnpm-workspace.yaml`, `platform/package.json`, `platform/backend/README.md` (handoff), `platform/frontend/package.json`, `platform/frontend/tsconfig.json`, `platform/shared/{package.json,tsconfig.json,src/index.ts}`, `platform/infra/README.md`, `platform/data-layer/README.md`, `platform/README.md` Quickstart, root `README.md` (thin pointer)
**Post-execution restructure:** Original delivery used a flat `apps/` + `packages/` layout at the repo root. Restructured post-execution into the `platform/` subdir with `backend/ frontend/ data-layer/ shared/ infra/` peers — see prompt log [Post-execution structural decision](../../../prompts/2026-05-19-u-t01-monorepo-scaffolding.md) and TFD ADR-003 (v2). Flagged for Bolt 0 retro.

---

## Context

Initialize the monorepo layout. One Git repo, one PR pipeline per change. Workspaces wired so cross-cutting changes (API contract + UI) live in one PR. No application code in this Unit beyond the scaffolds that the tooling generates by default.

## Acceptance Criteria

- Given a fresh clone of the repo, when `pnpm install` runs from `platform/`, then all workspaces resolve and no errors are emitted.
- Given the workspace layout is inspected, when checked against TFD §3, then `platform/` contains exactly: `backend/`, `frontend/`, `data-layer/`, `shared/`, `infra/`; and the repo root contains the process artifacts (`ai-dlc/`, `docs/`, `project-review/`, `CLAUDE.md`).
- Given the .NET solution is initialized in `platform/backend/`, when `dotnet build` runs there, then build succeeds with zero warnings on the scaffolded code.
- Given the React + Vite app is initialized in `platform/frontend/`, when `pnpm dev` runs there, then the Vite dev server starts and serves a default page.
- Given `platform/shared/` is initialized, when imported from `platform/frontend/` under the package name `@cabinconnect/shared-types`, then TypeScript resolves the package without path-alias errors.
- Given a developer follows the [`platform/README.md`](../../../../platform/README.md) Quickstart, when they complete the steps, then they reach a running local stack in ≤ 30 minutes (measured by self-report on an onboarding checklist).

## Scope

**In scope:**
- pnpm workspace config (`platform/pnpm-workspace.yaml`)
- `platform/backend/` .NET 8 solution scaffold (engineer handoff via `dotnet new sln`)
- `platform/frontend/` React + Vite scaffold
- `platform/shared/` TypeScript package skeleton + tsconfig path mapping from `platform/frontend/`
- `platform/data-layer/` placeholder with `README.md` (populated by U-T05 + Bolt 1 Units U-001/U-002/U-005)
- `platform/infra/` placeholder with `README.md`
- `platform/README.md` with Quickstart (developer-facing)
- Repo root `README.md` (thin pointer that splits readers between `platform/` and `ai-dlc/`)
- Repo root `.gitignore` covering all standard exclusions for .NET and Node

**Out of scope:**
- CI pipeline (U-T02)
- Env management (U-T03)
- Lint / format / typecheck configuration (U-T04)
- Database + migrations (U-T05)
- Any application code beyond what the framework scaffolds emit by default

## Definition of Done

- [ ] All ACs verified
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Quickstart timed by a colleague who didn't author the Unit (verifies the ≤ 30 minutes AC honestly)
