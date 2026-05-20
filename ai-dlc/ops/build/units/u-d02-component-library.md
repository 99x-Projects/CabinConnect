# Unit: U-D02 — shadcn/ui + Tailwind v4 install + theme wiring

**Owning artifact:** [DFD §3 Component approach](../../inception/dfd/DFD.md)
**Status:** Done — 2026-05-20 (mock-quality scaffold — one Button as proof; designer to grow the component set)
**Bolt:** Bolt 1 — UI Foundation
**Dependencies:** U-T01, U-D01
**Prompt log:** [2026-05-20-bolt-01-ui-finishing.md](../../../prompts/2026-05-20-bolt-01-ui-finishing.md)
**Files delivered:** `platform/frontend/tailwind.config.ts`, `platform/frontend/src/styles/globals.css`, `platform/frontend/components.json`, `platform/frontend/src/components/ui/Button.tsx`, updates to `platform/frontend/package.json`

---

## Context

Install Tailwind CSS v4 as the styling layer. Configure shadcn/ui CLI so future components are added by the team and owned by the codebase. Wire the design tokens (U-D01) into Tailwind's theme so utility classes resolve to token values.

## Acceptance Criteria

- Given Tailwind v4 is installed and the globals.css imports it, when a component uses `className="bg-primary text-primary-fg"`, then it renders in the DFD's primary palette colours.
- Given shadcn/ui CLI is configured via `components.json`, when a developer runs `pnpm dlx shadcn add <component>`, then a new component file lands in `platform/frontend/src/components/ui/` and is owned by the repo.
- Given the Button component is the proof, when imported and rendered, then it inherits the design tokens (colour, radius, typography).
- Given the design tokens change in `tokens.json`, when the CSS vars rebuild, then the Button visually reflects the change with no JS rebuild.

## Scope

**In scope:**
- Tailwind v4 install + config
- `components.json` (shadcn/ui CLI config)
- One sample component (`Button.tsx`) as proof
- `globals.css` with Tailwind directives + base reset + design-token CSS vars import

**Out of scope:**
- Full component library (added per-feature by features that need them)
- Storybook (U-D04, deferred)

## Definition of Done

- [x] ACs verified — Button renders on the dev server with token-driven colours
- [x] Prompt quality gate passed
- [x] Code review complete
- [x] No new lint or type errors
