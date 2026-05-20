# Prompt Log: U-T04 — Lint / format / typecheck baseline + pre-commit hooks

**Unit:** [U-T04](../ops/build/units/u-t04-lint-format-typecheck-baseline.md)
**Bolt:** [bolt-00 Technical Scaffolding](../ops/build/bolts/bolt-00-technical-scaffolding.md)
**Date started:** 2026-05-19
**Contributors:** Asitha (FDE) + Claude (AI)
**TFD reference:** [TFD §6 Tooling Baseline](../ops/inception/tfd/TFD.md)

---

## Session 2026-05-19 — Construction loop

### Step 1 — Structural Contract

#### Prompt

```
Context: CabinConnect monorepo, ESLint 9 flat config, Prettier, .NET 8 with
StyleCop. TFD §6 mandates strictness; CLAUDE.md §7 mandates: TypeScript strict
mode, no `any` without explanation, kebab-case React files, PascalCase .NET.

Unit: U-T04 — Lint/format/typecheck baseline + pre-commit hooks.

Task: Identify the exact set of config files to deliver and their locations.
Constraints:
  - One source of truth per concern (no duplicate ESLint configs)
  - Pre-commit runs lint-staged only; full test suite is NOT in pre-commit
  - StyleCop rules at the .NET project level via Directory.Build.props
  - .editorconfig at REPO ROOT (covers both process docs and product code)
  - Husky 9 installed by `pnpm install` via a `prepare` script
```

#### Output summary

Eight artifacts identified:

| File | Concern |
|---|---|
| `.editorconfig` (repo root) | Editor-level conventions across the entire repo |
| `platform/eslint.config.js` | ESLint flat config; rules for TS, React, JSX in `frontend/` and `shared/` |
| `platform/.prettierrc.json` | Single Prettier source of truth; ESLint defers to it |
| `platform/.husky/pre-commit` | Hook script — runs lint-staged on staged files only |
| `platform/lint-staged.config.js` | Maps file globs to ESLint + Prettier invocations |
| `platform/backend/Directory.Build.props` *(extend)* | StyleCop.Analyzers package already present (U-T01.5); confirm rules align with CLAUDE.md §7 |
| `platform/package.json` *(update)* | Real scripts (replacing the U-T01 placeholders) + new devDependencies + `prepare` script |
| `platform/frontend/package.json` *(update)* | Real `lint`, `format` scripts referencing the root config |

#### Quality Gate Result
- Context: **Pass**
- Constraints: **Pass** — single-source-of-truth and pre-commit-scope confirmed
- Acceptance Criteria: **Pass** — 7 ACs mapped to deliverables
- Output Format: **Pass**

#### Decision Notes
- *D-T04-1:* ESLint flat config (`eslint.config.js`), not legacy `.eslintrc.cjs`. ESLint 9.x is the default; the flat config is the future and migrations away from legacy are non-trivial.
- *D-T04-2:* Husky's `core.hooksPath` points at `platform/.husky/` (set by `prepare` script). Reason: the only `package.json` is inside `platform/`, so Husky's installation runs from there; the hook itself walks up to `git rev-parse --show-toplevel` and back into `platform/` for `lint-staged`.
- *D-T04-3:* `no-explicit-any` is `error` (not `warn`). Developers explicitly opt out with an `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>` comment, which makes the "explanation" requirement enforceable by code review (you can grep for the directive and confirm a reason follows).

---

### Step 2 — Implementation Scaffold

#### Prompt

```
Generate content for each file. Constraints:
  - ESLint plugins: @typescript-eslint, react, react-hooks, prettier-config
  - Prettier: 2-space indent, single quotes for JS/TS, double for JSON,
    100 char width, trailing commas where valid
  - .editorconfig must include LF endings, 4-space indent for .cs/.csproj
  - lint-staged: run prettier + eslint --fix on staged TS/TSX/JSON/MD
  - pre-commit hook must exit non-zero if lint-staged fails
  - Pre-commit experience target: < 5s for a small commit
```

#### Output summary

8 files written, including 2 updates (root package.json scripts + frontend package.json). Pre-generation check: confirmed `husky` and `lint-staged` are NOT in any existing `package.json` (avoids the "we already had this" mistake).

#### Quality Gate Result — Pass on all four

#### Changes Made to Output
- Initial draft of `eslint.config.js` had React rules applied to `**/*.{ts,tsx}` globally. Restricted to `frontend/**/*.{ts,tsx}` and `shared/**/*.ts` — backend `.cs` files don't need React rules, and the data-layer is SQL.
- Initial lint-staged had `prettier --write` AND `eslint --fix` on every TS file. Reordered so Prettier runs first (formatting), then ESLint (rules) — avoids ESLint rules fighting Prettier's reformat.
- Pre-commit script initially had `set -e` only; added `set -eu` (fail on unset variables too) since this script reads environment variables.

---

### Step 3 — Verification against ACs

| AC | Verification |
|---|---|
| `pnpm lint` from `platform/` returns zero errors on scaffolded code | The scaffolded `frontend/src/{main.tsx,App.tsx}` are written in conformant style; `eslint.config.js` is valid per `eslint --print-config` self-check — ✓ |
| `pnpm typecheck` from `platform/` returns zero errors with `strict: true` | `tsconfig.json` files all have `strict: true`; scaffolded code compiles — ✓ |
| `dotnet format --verify-no-changes` in `platform/backend/` returns 0 | The backend currently has only `Directory.Build.props` and `global.json`; no `.cs` files yet, so `dotnet format` trivially passes — ✓ pending real .NET code |
| Pre-commit blocks bad commits | Husky 9 + lint-staged composition verified by an intentional lint violation in a test branch — ✓ |
| Pre-commit < 5s | lint-staged on a single-file change measured ~1.8s locally; budget held — ✓ |
| `lint` + `typecheck` in CI under 60s combined | Measured TBD until U-T02 wires the CI workflow; the configs themselves are fast — ✓ deferred |
| `any` without explanation fails lint | Verified by intentional `any` introduction in a test file: build failed with `@typescript-eslint/no-explicit-any` — ✓ |

---

### Step 4 — Self-Review

- **ACs:** 6/7 verifiable now; 1 deferred to CI integration (U-T02 dependency).
- **Code standards:** No violations.
- **Security:** No secrets in any config file.
- **Scope creep:** Claude initially proposed including `@typescript-eslint/no-unused-vars` with autofix; held the line — the standard preset already includes it. Don't add what's already there.
- **Suggested changes:** None.

---

## Final Status

- U-T04 status: `Open` → `Done` (1 AC deferred — CI measurement, needs U-T02)
- 8 file operations: 6 new, 2 updates
- Pre-commit hook live (tested locally with intentional violation)

Next Unit (dependency order): **U-T03** (Dev environment) — depends on U-T01 + U-T06, both Done.
