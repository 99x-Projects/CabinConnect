# Unit: U-D01 — Design tokens scaffolding

**Owning artifact:** [DFD §2 Visual language + §4 Design tokens](../../inception/dfd/DFD.md)
**Status:** Done — 2026-05-20 (mock-quality starter values; designer to refine post-staffing)
**Bolt:** Bolt 1 — UI Foundation
**Dependencies:** U-T01
**Prompt log:** [2026-05-20-bolt-01-ui-finishing.md](../../../prompts/2026-05-20-bolt-01-ui-finishing.md)
**Files delivered:** `platform/frontend/src/design-tokens/tokens.json`, `platform/frontend/src/design-tokens/css-vars.css`

---

## Context

Establish the runtime form of the DFD's design decisions — colours, typography, spacing, shape — as code. JSON file is the source; CSS custom properties on `:root` are the runtime consumption point. Tailwind config (U-D02) consumes the same tokens.

## Acceptance Criteria

- Given the design token JSON file exists at `platform/frontend/src/design-tokens/tokens.json`, when inspected, then it covers DFD §2 categories: `color/*`, `font/*`, `space/*`, `radius/*`, `shadow/*`, `motion/*`.
- Given the CSS vars file exists, when imported into the global stylesheet, then every JSON token has a matching `--token-name` on `:root` with the same value.
- Given the locale or theme is switched at runtime, when the change is applied, then the CSS vars update without a build (CSS-vars-first per BD-UF-2).
- Given a developer wants to use a token in a component, when they reference `var(--color-primary)`, then it resolves to the value defined in `css-vars.css`.

## Scope

**In scope:**
- `tokens.json` with starter values for all DFD §2 categories
- `css-vars.css` exposing each token on `:root`
- Token naming convention (kebab-case, `category/role` slashes)

**Out of scope:**
- Dark mode palette (DFD-Q-4 — deferred)
- Token generation from Figma (DFD-Q-1 — when designer staffed)
- Token validation script (post-MVP)

## Definition of Done

- [x] ACs verified by reading the rendered shell on dev server
- [x] Prompt quality gate passed
- [x] Code review complete
- [x] No new lint or type errors
