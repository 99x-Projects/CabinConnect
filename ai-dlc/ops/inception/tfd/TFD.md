# Technical Foundation Document — CabinConnect

| Field | Value |
|---|---|
| **Status** | `Draft` |
| **Version** | 0.2 |
| **Owner** | Asitha (FDE) |
| **Last updated** | 2026-05-19 |
| **Approval mode** | Simulation — decisions marked `[FDE-decided]` are treated as signed off after Technical Foundation Review |
| **Linked artifacts** | [PRD](../prd/PRD.md) · [CLAUDE.md §1](../../../../CLAUDE.md) · [architecture.md (ADR log)](../../../rules/architecture.md) |

---

## 1. Purpose

This document is the platform-level decision record for CabinConnect. It is the source of truth for *how* we build — the technical counterpart to the PRD's *what*. Bolt 0 (Technical Scaffolding) is planned directly from this document.

---

## 2. Stack & Runtime

Decisions about languages, frameworks, and runtime versions.

| Area | Decision | Rationale | ADR |
|---|---|---|---|
| Backend language | C# / .NET 8 | LTS until Nov 2026; ecosystem fit for repository + DDD patterns the PRD scope warrants | ADR-001 |
| Frontend language | TypeScript 5.x (strict mode) | Type safety at the API boundary is non-negotiable per CLAUDE.md §7; strict mode catches most hallucinated method calls at compile time | ADR-001 |
| Frontend framework | React 18 (functional components only) | Aligns with hiring market in Norway and 99x; mature PWA tooling | ADR-001 |
| Build tool (frontend) | Vite 5.x | Fast HMR, first-class PWA plugin support, simple config vs Webpack | ADR-007 |
| Runtime targets | iOS Safari (last 2), Android Chrome (last 2), desktop Chrome/Edge/Safari (last 2) | Per NFR-BROWSER | — |

---

## 3. Repo Shape

| Area | Decision |
|---|---|
| Topology | **Monorepo with process / product split** (single Git repo). Root holds AI-DLC process artifacts (`ai-dlc/`, `docs/`, `project-review/`, `CLAUDE.md`). Product code lives under `platform/`. |
| Product layout (under `platform/`) | `backend/` (.NET 8 Web API) · `frontend/` (React 18 + Vite + TS strict, PWA) · `data-layer/` (Supabase migrations + RLS helpers + seed) · `shared/` (TypeScript types shared backend ↔ frontend) · `infra/` (IaC) |
| Reasoning | Cross-cutting changes (API contract + UI) span backend + frontend; one PR keeps them in lockstep. Splitting product (`platform/`) from process (root) at the folder level makes navigation clean for each audience — engineers stay inside `platform/`, AI-DLC practitioners stay inside `ai-dlc/`. ADR-003 (v2). |
| Shared types | Generated from .NET DTOs into `platform/shared/`; imported by the React app under the package name `@cabinconnect/shared-types`. No hand-typed duplicate definitions. |
| Data layer | Separate top-level peer (`platform/data-layer/`) under `platform/`, **not** nested under `backend/`. Migrations are deployment artifacts, not API code, and may be consumed by future services besides the API. |

---

## 4. CI / CD Pipeline

| Stage | Decision |
|---|---|
| Provider | **GitHub Actions** — standard for 99x; no additional vendor onboarding ADR-004 |
| Trigger | Push to any branch + PR open/update |
| Required checks (PR merge gate) | `lint` · `typecheck` · `test-api` · `test-web` · `migration-lint` (NFR-ISO check — every scoped table has RLS) · `cross-community-isolation-harness` · `lighthouse-pwa-audit` (NFR-OFF baseline) · `locale-parity-check` |
| Branch protection | `main` requires all checks + 1 reviewer approval; force-push disabled; conversations resolved |
| Build artifacts | API: container image to GHCR · Web: static bundle to GHCR |
| Deployment | Manual approval to staging; manual approval to production; both via GitHub Environments. No auto-deploy on main in MVP. |
| Rollback | Re-deploy previous tagged image — single command via GHA workflow_dispatch |

---

## 5. Dev Environment

| Area | Decision |
|---|---|
| Approach | **Docker Compose** for local stack (Postgres + Supabase emulator + API + Web); committed `docker-compose.yml` and `.env.example` |
| Onboarding target | New engineer has running stack in ≤ 30 minutes from `git clone` to first request hitting their local API |
| `.env` management | `.env.example` committed (template only) · `.env.local` git-ignored · README quickstart references both |
| Supabase local dev | Supabase CLI (`supabase start`) provides a local Postgres + Studio; matches production schema via shared migrations |
| Hot reload | API: `dotnet watch` · Web: Vite HMR |

---

## 6. Tooling Baseline

| Concern | Decision |
|---|---|
| Lint (TS) | ESLint + `@typescript-eslint` strict config + Prettier; both run in CI and pre-commit |
| Lint (.NET) | `dotnet format` + StyleCop rules tuned to CLAUDE.md §7 conventions |
| Typecheck | TypeScript `strict: true` in `tsconfig.json` (no opt-outs); CI failure on type errors |
| Test framework — API | xUnit + FluentAssertions; integration tests via WebApplicationFactory + Testcontainers (Postgres) |
| Test framework — Web | Vitest for unit + integration; Playwright for E2E (auth flows, offline scenarios) |
| Test coverage target | ≥ 80% on the .NET domain layer; ≥ 70% on the React app's domain/business logic. Coverage is *measured* in CI but is a warning, not a hard gate. |
| Pre-commit hooks | Husky + lint-staged on the web side; .NET formats on `dotnet build`. Pre-commit runs the affected linters and the typecheck — not the full test suite. |

---

## 7. Database & Migrations

| Area | Decision |
|---|---|
| Database | PostgreSQL via Supabase (CLAUDE.md §1) — managed Postgres + RLS + Auth in one product |
| Migration tool | **Supabase CLI** (`supabase migration new` / `supabase db push`) — keeps the schema in version-controlled SQL files in `platform/data-layer/migrations/` ADR-005 |
| Naming | `YYYYMMDDHHMMSS_<slug>.sql` (Supabase CLI default) |
| Migration runtime | Applied via Supabase CLI in CI on every deploy; never via manual SQL in production |
| Seed data | Pilot Community seeded by an idempotent migration (per U-001 AC) |
| RLS enforcement | All Community-scoped tables go through `cabinconnect.apply_community_rls('table_name')` (defined by U-002). Migration-lint check enforces this. |
| Backup | Supabase managed daily backups (retention 7 days on the Supabase free tier; revisit if customer needs longer) |

---

## 8. Secret Management

| Area | Decision |
|---|---|
| Local dev | `.env.local` (git-ignored) populated from `.env.example` |
| CI | GitHub Actions Secrets, scoped per environment (staging vs production) |
| Production runtime | Supabase environment variables + the API's container env (set by the deployment workflow from GitHub Secrets) |
| Rotation | Supabase service-role key rotated every 90 days; rotation runbook lives in `ai-dlc/ops/operate/runbooks/` (to be created) |
| Never | Secrets in code, in CLAUDE.md, in prompts, in retro notes (per 99x Guardrail "Data & credential boundaries") |

---

## 9. Observability Baseline

Minimum-viable observability for MVP. Refined over time as Operations phase produces real incident data.

| Concern | Decision |
|---|---|
| Structured logging | Both API and Web emit JSON-formatted logs with `correlation_id`, `user_id` (when available), `community_id` (when in scope) |
| Error tracking | Sentry on both API and Web; PRs gated by `no-new-errors` budget per environment |
| Metrics | Supabase built-in dashboard for DB metrics; API exposes `/metrics` in Prometheus format (not scraped in MVP but ready for it) |
| Uptime monitoring | UptimeRobot or similar on the public API health endpoint and the web app root |
| Alert routing | PagerDuty when customer-paid; in MVP, GitHub issue auto-created from Sentry threshold alerts |

---

## 10. Architecture Decision Records (inline summary)

Full ADR entries live in [`ai-dlc/rules/architecture.md`](../../../rules/architecture.md). The list here is the index.

| ID | Decision | Status |
|---|---|---|
| **ADR-001** | .NET 8 + React 18 + TypeScript stack with Supabase as DB & Auth | Accepted |
| **ADR-002** | Supabase Auth — do not implement custom auth; do not call Supabase directly from React for data mutations | Accepted |
| **ADR-003 (v2)** | Monorepo with **process / product split** — root holds process artifacts (`ai-dlc/`, `docs/`, `project-review/`); `platform/` holds the product monorepo (`backend/`, `frontend/`, `data-layer/`, `shared/`, `infra/`). Revised from v1 (flat `/apps/*` + `/packages/*` at root) post Bolt 0 / U-T01 — see Change Log 2026-05-19 v0.2. | Accepted |
| **ADR-004** | GitHub Actions for CI/CD; manual-approval deploys to staging and production | Accepted |
| **ADR-005** | Supabase CLI for schema migrations; SQL files versioned in `/apps/api/supabase/migrations/` | Accepted |
| **ADR-006** | PWA (responsive web installable as a home-screen app) for MVP — not native iOS/Android | Accepted |
| **ADR-007** | Vite 5.x for the frontend build (vs Webpack / Next.js); justified by PWA tooling fit and HMR speed | Accepted |
| **ADR-008** | Community boundary enforced at two layers — DB (RLS via `apply_community_rls` template) AND API (Community-scope middleware reading JWT claim). Defence in depth for NFR-ISO. | Accepted |

ADR-008 was promoted from the Foundation Cluster elaboration session's Key Decisions D-1, D-2, D-4, D-5. (The TFD captures *cumulative* architectural decisions regardless of where they originated.)

---

## 11. Open Questions

| ID | Question | Owner | Affects |
|---|---|---|---|
| TFD-Q-1 | Cloud hosting target for the API container — Azure Container Apps, AWS Fargate, Fly.io, Render? | Customer / commercial | Bolt 0 — deployment config |
| TFD-Q-2 | Sentry vs free-tier alternative for MVP error tracking | Engineering | Bolt 0 — observability wiring |
| TFD-Q-3 | UptimeRobot vs Better Stack for uptime monitoring | Engineering | Bolt 0 — uptime monitoring |
| TFD-Q-4 | Whether to add Renovate / Dependabot for dependency updates from day one | Engineering | Bolt 0 — repo policy |

---

## 12. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-19 | 0.1 | Initial draft from CLAUDE.md §1 + Foundation Cluster elaboration outputs; promoted Key Decisions D-1/2/4/5 into ADR-008; added Vite (ADR-007) and Monorepo (ADR-003) explicitly | Asitha + Claude |
| 2026-05-19 | 0.2 | **Process / product split** — root holds AI-DLC process artifacts, product code moves under `platform/`. ADR-003 revised to v2. §3 Repo Shape and §7 Database migration path updated. Data layer promoted to top-level peer (`platform/data-layer/`) — was previously nested under `/apps/api/supabase/`. Decision surfaced after Bolt 0 / U-T01 had completed; flagged as a Bolt 0 retro item: *"TFD §3 should have addressed process-vs-product folder separation before Bolt 0 began."* | Asitha + Claude |
