# Backlog

The single live index of all Units. Maintained continuously — every status change updates this file.

## Status Legend

| Status | Meaning |
|---|---|
| `Open` | In the backlog, not yet selected for a Bolt |
| `Planned` | Selected for a Bolt, not yet started |
| `In Progress` | Active in a Bolt |
| `Done` | Code merged, ACs verified, review checklist passed |
| `Deferred` | Pulled — see Notes column for reason |

## Bolts Currently In Play

| Bolt | Outcome | Status | Units | Source |
|---|---|---|---|---|
| [bolt-01 UI Foundation](bolts/bolt-01-ui-foundation.md) | Working PWA shell on mocks typed against Bolt 2 contracts | **Active** (7/7 Units Done; awaiting retro) | 7 | TFD + DFD + Foundation Cluster (frontend slice) |
| [bolt-02 Backend Foundation](bolts/bolt-02-backend-foundation.md) | Makes Bolt 1's mocks real — persistence, auth, isolation | **Planned** (refined by Bolt 1 retro) | 8 | TFD + Foundation Cluster (backend slice) |

## Units

### Bolt 1 — UI Foundation

| Unit | Name | Owning Artifact | Priority | Status |
|---|---|---|---|---|
| [U-T01](units/u-t01-monorepo-workspace-structure.md) | Monorepo + workspace structure | TFD §3 | MVP-H | `Done` |
| [U-T04](units/u-t04-lint-format-typecheck-baseline.md) | Lint / format / typecheck baseline + pre-commit | TFD §6 | MVP-H | `Done` |
| [U-T06](units/u-t06-supabase-provisioning-secrets.md) | Secrets infrastructure (.env.example, rotation runbook) | TFD §7 + §8 | MVP-H | `Done` |
| [U-D01](units/u-d01-design-tokens.md) | Design tokens scaffolding | DFD §2 + §4 | MVP-H | `Done` |
| [U-D02](units/u-d02-component-library.md) | shadcn/ui + Tailwind v4 install + theme wiring | DFD §3 | MVP-H | `Done` |
| [U-009](units/u-009-i18n-framework-wiring.md) | i18n framework wiring (react-i18next + locale bundles) | CI-14 | MVP-H | `Done` |
| [U-007](units/u-007-pwa-shell-service-worker.md) | PWA shell + service worker scaffold | CI-13 | MVP-H | `Done` |

### Bolt 2 — Backend Foundation

| Unit | Name | Owning Artifact | Priority | Status |
|---|---|---|---|---|
| [U-T02](units/u-t02-cicd-pipeline.md) | CI / CD pipeline (GitHub Actions) | TFD §4 | MVP-H | `Planned` |
| [U-T03](units/u-t03-dev-environment.md) | Dev environment (Docker + Supabase local) | TFD §5 | MVP-H | `Planned` |
| [U-T05](units/u-t05-database-migration-tooling.md) | Database + migration tooling (Supabase CLI) | TFD §7 | MVP-H | `Planned` |
| [U-001](units/u-001-tenant-data-model.md) | Tenant data model — `communities` table + `community_id` discipline | CI-01 | MVP-H | `Planned` |
| [U-002](units/u-002-rls-policy-template.md) | RLS policy template + migration helper | CI-01 | MVP-H | `Planned` |
| [U-004](units/u-004-supabase-auth-wiring.md) | Supabase Auth wiring (sign-up, sign-in, reset) | CI-02 | MVP-H | `Planned` |
| [U-005](units/u-005-user-profile-membership-model.md) | User profile + Community membership data model | CI-02 | MVP-H | `Planned` |
| [U-006](units/u-006-jwt-validation-middleware.md) | JWT validation middleware + auth-by-default routing | CI-02 | MVP-H | `Planned` |

### Deferred to Bolt 3+

| Unit | Name | Owning Artifact | Why deferred |
|---|---|---|---|
| [U-003](units/u-003-api-community-scope-middleware.md) | API Community-scope middleware + isolation harness | CI-01 | Needs U-001/002/006 from Bolt 2 first; cleaner as own integration Bolt |
| [U-008](units/u-008-critical-read-cache-strategy.md) | Critical-read cache strategy | CI-13 | Needs real backend + X-Cabin-Cache-Profile contract |
| [U-010](units/u-010-locale-resolution-chain.md) | Locale resolution chain | CI-14 | Needs U-005/U-006 from Bolt 2 |
| [U-D03](units/u-d03-a11y-ci-gate.md) | Accessibility CI gate (axe-core) | DFD §5 | Needs U-T02 (CI/CD) from Bolt 2 |
| [U-D04](units/u-d04-component-docs.md) | Component documentation (Storybook) | DFD §3 + §7 | Designer-staffing-gated; optional |

## Summary

| Status | Count |
|---|---|
| `Open` | 0 |
| `Planned` | 8 |
| `In Progress` | 0 |
| `Done` | 7 |
| `Deferred` | 5 |

Total: 20 Units.

## Source Artifacts Currently In Play

| Artifact | Status | Units Extracted | Feeds |
|---|---|---|---|
| [PRD](../inception/prd/PRD.md) | Draft v0.2 | 15 Candidate Intents listed; 4 fully elaborated (Foundation Cluster) | Bolt 1 + Bolt 2 |
| [TFD](../inception/tfd/TFD.md) | Draft v0.2 | U-T01..U-T06 | Bolt 1 + Bolt 2 |
| [DFD](../inception/dfd/DFD.md) | Draft v0.1 (mock-quality) | U-D01..U-D04 | Bolt 1 (+ deferred) |
| [CI-01 Community Boundary & Data Isolation](../inception/intents/2026-05-19-community-boundary.md) | Elaborated | U-001, U-002, U-003 | Bolt 2 + deferred |
| [CI-02 Cabin Owner Registration & Authentication](../inception/intents/2026-05-19-cabin-owner-auth.md) | Elaborated | U-004, U-005, U-006 | Bolt 2 |
| [CI-13 Offline-First Caching](../inception/intents/2026-05-19-offline-caching.md) | Elaborated | U-007, U-008 | Bolt 1 + deferred |
| [CI-14 Localization](../inception/intents/2026-05-19-localization.md) | Elaborated | U-009, U-010 | Bolt 1 + deferred |
