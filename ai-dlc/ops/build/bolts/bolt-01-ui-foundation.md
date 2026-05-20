# Bolt: Bolt 1 — UI Foundation (on mocks)

**Bolt ID:** bolt-01
**Status:** Active (Units complete, awaiting retro)
**Type:** Outcome-scoped foundation Bolt
**Date opened:** 2026-05-19
**Date closed:** —
**Lead:** Asitha (FDE)

> **Bolt definition reminder.** Short, intense build cycle (hours/days, not weeks) packaging 3–8 related Units. Outcome-scoped. Ends with a human-led review gate. AI cannot move past the gate. Scope is human-controlled — cannot be expanded mid-Bolt; a scope change creates a new Unit. *(CLAUDE.md §3 + §5.2; 99x Guardrails.)*

---

## Goal

A runnable PWA shell with the design system, locale switcher, accessibility plumbing, and a sample MyCabin screen rendering against **mocked data typed from `platform/shared/`** — where the mock types are exactly what Bolt 2 will fulfil. Demoable end-to-end: `clone → pnpm install → pnpm dev → open browser → see CabinConnect's shell + a designed CabinProfile screen + locale switcher working`.

No real backend, no real persistence, no real auth. Mocks deliberately typed against Bolt 2's planned contracts.

## Included Units

| Order | Unit | Source | Status |
|---|---|---|---|
| 1 | [U-T01 Monorepo + workspace structure](../units/u-t01-monorepo-workspace-structure.md) | TFD §3 | **Done** |
| 2 | [U-T04 Lint / format / typecheck baseline](../units/u-t04-lint-format-typecheck-baseline.md) | TFD §6 | **Done** |
| 3 | [U-T06 Secrets infrastructure](../units/u-t06-supabase-provisioning-secrets.md) | TFD §7 + §8 | **Done** |
| 4 | [U-D01 Design tokens scaffolding](../units/u-d01-design-tokens.md) | DFD §2, §4 | **Done** |
| 5 | [U-D02 shadcn/ui + Tailwind v4 install + theme wiring](../units/u-d02-component-library.md) | DFD §3 | **Done** |
| 6 | [U-009 i18n framework wiring](../units/u-009-i18n-framework-wiring.md) | CI-14 | **Done** |
| 7 | [U-007 PWA shell + service worker](../units/u-007-pwa-shell-service-worker.md) | CI-13 | **Done** |

7 Units. Within Bolt sizing cap (3–8).

## Execution Order Rationale

```
U-T01 (Monorepo) ──┬─► U-T04 (Tooling)
                   │
                   └─► U-T06 (Secrets infra)
                            │
                            ▼
                   U-D01 (Design tokens) ──► U-D02 (shadcn/Tailwind)
                            │                       │
                            ▼                       ▼
                   U-009 (i18n wiring) ──► U-007 (PWA shell)
                                            │
                                            ▼
                         Demonstrable: CabinProfile mock screen
                         (consumes types from platform/shared/, mocked
                          against Bolt 2's planned contracts)
```

## Cross-Unit Decisions

| # | Decision | Affects Units | Promotes to ADR |
|---|---|---|---|
| BD-UF-1 | **Mocks are typed against Bolt 2's planned contracts in `platform/shared/`** — the handoff surface between Bolts | All UI Units | New sub-principle in notes.md Principle 3 |
| BD-UF-2 | Design tokens delivered as JSON → CSS vars + Tailwind config (CSS-vars-first) so locale and theme switches are runtime, not build-time | U-D01, U-D02 | TFD ADR-D03 (already accepted in DFD v0.1) |
| BD-UF-3 | PWA *shell* installable; *offline-first read cache* (U-008) deferred to Bolt 3 — Bolt 1 needs the install + service worker, not the full cache contract (cache contract requires real backend) | U-007 | TFD ADR-D03 |
| BD-UF-4 | i18n is loaded from JSON locale bundles in `platform/frontend/src/locales/` (per-key fallback to default Bokmål) — no remote translation service at MVP | U-009 | TFD §6 |

## Definition of Done — Bolt Level

- [x] Every Unit is `Done` per its own DoD checklist
- [x] CabinProfile mock screen renders on local dev server
- [x] Locale switch (Bokmål ↔ English) works at runtime against the rendered screen
- [x] PWA install criteria met (manifest + service worker registered)
- [x] All ACs traced to code (or to mocks deliberately typed against Bolt 2 contracts)
- [x] No new lint or type errors
- [x] Prompt log entry exists for every Unit (`ai-dlc/prompts/`)
- [x] No Unit had its scope expanded during construction without a new Unit being created (99x Guardrail)
- [ ] **Bolt 1 retro written in `ai-dlc/ops/operate/retros/bolt-01.md`** — *this is also Bolt 2's elaboration session; see notes.md Principle 3*

## Retro

Link to retro file once closed: [bolt-01 retro](../../operate/retros/bolt-01.md) — *to be written after user review.*

**Important:** Per Principle 3 sub-principle ("Plan Bolt 2 just enough to make Bolt 1 honest"), the Bolt 1 retro is where Bolt 2's Unit ACs get refined from their current Plan-quality baselines into full Construction-ready ACs. Don't skip the retro.

## Notes

- The mocks live at `platform/frontend/src/mocks/` and are typed via `platform/shared/src/api/`. When Bolt 2 ships real handlers, swapping the mocks for real fetch calls should be mechanical — the contracts are already agreed.
- `U-T06` was reassigned from earlier Bolt 0 framing to Bolt 1 because the .env.example pattern + rotation runbook are foundation infrastructure both Bolts depend on. Supabase project provisioning itself is still deferred to Bolt 2 execution.
- The deliberate-mocks trade-off is acceptable because Bolt 2 is **planned in writing** (Unit files exist with Plan-quality content). The mocks aren't speculative — they implement the same contract types Bolt 2 will fulfil.
